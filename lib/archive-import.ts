"use client";

import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  classifyFeedback,
  classifyTone,
  extractWordDocument,
  extractWordFeedback,
  normalizeInlineText,
  normalizePlainText,
} from "./archive-feedback";
import type {
  ArchiveRole,
  FeedbackCategory,
  FeedbackTone,
} from "./types";

export type PendingSection = {
  pageNumber: number | null;
  textContent: string;
};

export type PendingFeedback = {
  anchorText: string;
  commentText: string;
  category: FeedbackCategory;
  tone: FeedbackTone;
  locationLabel: string;
};

export type PendingArtifact = {
  key: string;
  file: File;
  filename: string;
  contentType: string;
  role: ArchiveRole;
  moduleCode: string;
  assessmentCode: string;
  score: number | null;
  sections: PendingSection[];
  feedback: PendingFeedback[];
};

export type PendingBundle = {
  key: string;
  title: string;
  moduleCode: string;
  assessmentCode: string;
  score: number | null;
  artifacts: PendingArtifact[];
};

type Progress = (message: string) => void;

const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".htm", ".html"];

export async function prepareArchiveBundles(
  inputFiles: File[],
  onProgress: Progress,
): Promise<PendingBundle[]> {
  const files = await expandBundles(inputFiles, onProgress);
  const artifacts: PendingArtifact[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    onProgress(`Reading ${index + 1} of ${files.length}: ${file.name}`);
    artifacts.push(await inspectFile(file, onProgress));
  }

  const bundles = groupArtifacts(artifacts);
  for (const bundle of bundles) markLikelyRevisions(bundle.artifacts);
  return bundles;
}

async function expandBundles(inputFiles: File[], onProgress: Progress) {
  const expanded: File[] = [];
  for (const file of inputFiles) {
    if (!file.name.toLowerCase().endsWith(".zip")) {
      if (isSupported(file.name)) expanded.push(file);
      continue;
    }

    onProgress(`Opening bundle: ${file.name}`);
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(file);
    const entries = Object.values(zip.files).filter(
      (entry) =>
        !entry.dir &&
        !entry.name.startsWith("__MACOSX/") &&
        !entry.name.split("/").pop()?.startsWith("._") &&
        isSupported(entry.name),
    );
    for (const entry of entries) {
      const filename = entry.name.split("/").pop() || entry.name;
      const bytes = await entry.async("arraybuffer");
      expanded.push(
        new File([bytes], filename, {
          type: contentTypeFor(filename),
          lastModified: file.lastModified,
        }),
      );
    }
  }
  if (!expanded.length) {
    throw new Error("Choose a PDF, Word document, HTML feedback file, or ZIP bundle.");
  }
  return expanded;
}

async function inspectFile(file: File, onProgress: Progress): Promise<PendingArtifact> {
  const lower = file.name.toLowerCase();
  let sections: PendingSection[] = [];
  let feedback: PendingFeedback[] = [];
  let score: number | null = null;
  let text = "";

  if (lower.endsWith(".pdf")) {
    sections = await extractPdfPages(file, onProgress);
    text = sections.map((section) => section.textContent).join("\n\n");
  } else if (lower.endsWith(".docx")) {
    const extracted = await extractDocx(file);
    text = extracted.text;
    sections = [{ pageNumber: null, textContent: text }];
    feedback = extracted.feedback;
  } else {
    const html = await file.text();
    text = htmlToPlainText(html);
    sections = [{ pageNumber: null, textContent: text }];
    score = scoreFromFeedbackHtml(html);
    feedback = feedbackFromHtml(text);
  }

  const moduleCode = detectModule(`${file.name}\n${text}`);
  const assessmentCode = detectAssessment(`${file.name}\n${text}`);
  const role = detectRole(file.name, text, feedback.length);

  return {
    key: crypto.randomUUID(),
    file,
    filename: file.name,
    contentType: file.type || contentTypeFor(file.name),
    role,
    moduleCode,
    assessmentCode,
    score,
    sections,
    feedback,
  };
}

async function extractPdfPages(file: File, onProgress: Progress) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  if (pdf.numPages > 500) {
    await pdf.destroy();
    throw new Error(`${file.name} has more than 500 pages.`);
  }
  const sections: PendingSection[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    onProgress(`Reading ${file.name}, page ${pageNumber} of ${pdf.numPages}`);
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const textContent = content.items
      .map((item) => {
        if (!("str" in item)) return "";
        return `${item.str}${item.hasEOL ? "\n" : " "}`;
      })
      .join("")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
    sections.push({ pageNumber, textContent });
  }
  await pdf.destroy();
  return sections;
}

async function extractDocx(file: File) {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(file);
  const documentXml = await zip.file("word/document.xml")?.async("string");
  if (!documentXml) throw new Error(`${file.name} does not contain a readable Word document.`);
  const document = extractWordDocument(documentXml);
  const commentsXml = await zip.file("word/comments.xml")?.async("string");
  const feedback = commentsXml
    ? extractWordFeedback(commentsXml, document.anchors)
    : [];
  return { text: document.text, feedback };
}

function feedbackFromHtml(text: string): PendingFeedback[] {
  const marker = "TUTOR'S COMMENTS AND ADVICE TO STUDENT:";
  const start = text.toUpperCase().indexOf(marker);
  if (start < 0) return [];
  const feedbackText = text.slice(start + marker.length);
  const stop = feedbackText.search(/\n\s*(?:CONFIDENTIALITY|DECLARATION|END OF FEEDBACK)\b/i);
  const exact = stop >= 0 ? feedbackText.slice(0, stop) : feedbackText;
  return exact
    .split(/\n+/)
    .map((line) => normalizeInlineText(line))
    .filter((line) => line.length > 1)
    .map((commentText) => ({
      anchorText: "",
      commentText,
      category: classifyFeedback(commentText),
      tone: classifyTone(commentText),
      locationLabel: "Tutor feedback summary",
    }));
}

function htmlToPlainText(html: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  document.querySelectorAll("br").forEach((element) => element.replaceWith("\n"));
  document.querySelectorAll("p, tr, li, div, h1, h2, h3, h4").forEach((element) => {
    element.append("\n");
  });
  return normalizePlainText(document.body.textContent || "");
}

function scoreFromFeedbackHtml(html: string) {
  const match = html.match(/class="MonoSpacedBold"[^>]*>\s*(\d{1,3})\s*</i);
  const score = match ? Number(match[1]) : NaN;
  return Number.isInteger(score) && score >= 0 && score <= 100 ? score : null;
}

function detectRole(filename: string, text: string, commentCount: number): ArchiveRole {
  const sample = `${filename}\n${text.slice(0, 12000)}`.toLowerCase();
  if (/tutor['’]s comments and advice to student|assessment summary/.test(sample)) {
    return "feedback";
  }
  if (/part\s*1[^\n]{0,30}essay plan|essay plan/.test(sample) || /part[_ -]?1/i.test(filename)) {
    return "plan";
  }
  if (/emtma\s+\d+\s+task|overall word limit|marking grid/.test(sample)) {
    return "question";
  }
  if (filename.toLowerCase().endsWith(".pdf")) return "source";
  if (commentCount > 0) return "submission";
  return "draft";
}

function detectModule(value: string) {
  return value.match(/\b([A-Z]{1,3}\d{3})\b/i)?.[1]?.toUpperCase() || "";
}

function detectAssessment(value: string) {
  const match = value.match(/\b(?:emTMA|TMA)\s*(?:No\.?\s*)?0?(\d{1,2})\b/i);
  return match ? match[1].padStart(2, "0") : "";
}

function groupArtifacts(artifacts: PendingArtifact[]) {
  const groups = new Map<string, PendingBundle>();

  function ensure(moduleCode: string, assessmentCode: string) {
    const key = `${moduleCode || "study"}:${assessmentCode || "archive"}`;
    let group = groups.get(key);
    if (!group) {
      const title = moduleCode
        ? `${moduleCode}${assessmentCode ? ` emTMA ${assessmentCode}` : " archive"}`
        : "Imported study set";
      group = {
        key,
        title,
        moduleCode,
        assessmentCode,
        score: null,
        artifacts: [],
      };
      groups.set(key, group);
    }
    return group;
  }

  const direct = artifacts.filter((artifact) => artifact.moduleCode && artifact.assessmentCode);
  for (const artifact of direct) {
    const group = ensure(artifact.moduleCode, artifact.assessmentCode);
    group.artifacts.push(artifact);
    if (artifact.score !== null) group.score = artifact.score;
  }

  for (const artifact of artifacts.filter((item) => !direct.includes(item))) {
    let target: PendingBundle | undefined;
    if (artifact.moduleCode) {
      const sameModule = Array.from(groups.values()).filter(
        (group) => group.moduleCode === artifact.moduleCode,
      );
      if (sameModule.length === 1) target = sameModule[0];
    }
    if (!target && artifact.role === "source") {
      target = bestQuestionMatch(artifact, Array.from(groups.values()));
    }
    target ||= ensure(artifact.moduleCode, artifact.assessmentCode);
    target.artifacts.push(artifact);
    if (artifact.score !== null) target.score = artifact.score;
  }

  return Array.from(groups.values()).filter((group) => group.artifacts.length);
}

function bestQuestionMatch(artifact: PendingArtifact, groups: PendingBundle[]) {
  const candidates = groups
    .map((group) => {
      const question = group.artifacts.find((item) => item.role === "question");
      if (!question) return { group, score: 0 };
      const questionText = question.sections.map((item) => item.textContent).join(" ");
      const artifactText = `${artifact.filename} ${artifact.sections
        .slice(0, 5)
        .map((item) => item.textContent)
        .join(" ")}`;
      return { group, score: tokenOverlap(questionText, artifactText) };
    })
    .sort((a, b) => b.score - a.score);
  return candidates[0]?.score > 0.02 ? candidates[0].group : undefined;
}

function markLikelyRevisions(artifacts: PendingArtifact[]) {
  const submissions = artifacts.filter((artifact) => artifact.role === "submission");
  for (const artifact of artifacts) {
    if (artifact.role !== "draft") continue;
    const text = artifact.sections.map((section) => section.textContent).join(" ");
    const closest = submissions.reduce(
      (best, submission) => {
        const submissionText = submission.sections.map((section) => section.textContent).join(" ");
        return Math.max(best, tokenOverlap(text, submissionText));
      },
      0,
    );
    if (closest > 0.45) artifact.role = "revision";
  }
}

function tokenOverlap(left: string, right: string) {
  const leftTokens = tokenSet(left);
  const rightTokens = tokenSet(right);
  if (!leftTokens.size || !rightTokens.size) return 0;
  let shared = 0;
  for (const token of leftTokens) if (rightTokens.has(token)) shared += 1;
  return shared / Math.min(leftTokens.size, rightTokens.size);
}

function tokenSet(value: string) {
  return new Set(
    value
      .toLowerCase()
      .match(/[a-z]{4,}/g)
      ?.filter((token) => !STOP_WORDS.has(token)) || [],
  );
}


function isSupported(filename: string) {
  const lower = filename.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

function contentTypeFor(filename: string) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "text/html";
}

const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "because",
  "been",
  "being",
  "between",
  "could",
  "from",
  "have",
  "into",
  "more",
  "must",
  "only",
  "should",
  "their",
  "there",
  "these",
  "they",
  "this",
  "through",
  "using",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "with",
  "would",
  "your",
]);
