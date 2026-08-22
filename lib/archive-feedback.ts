import type { FeedbackCategory, FeedbackTone } from "./types";

export type ExtractedFeedback = {
  anchorText: string;
  commentText: string;
  category: FeedbackCategory;
  tone: FeedbackTone;
  locationLabel: string;
};

export function extractWordDocument(xml: string) {
  const active = new Set<string>();
  const anchors = new Map<string, string>();
  const text: string[] = [];
  const tokenPattern =
    /<w:commentRangeStart\b[^>]*w:id="([^"]+)"[^>]*\/?\s*>|<w:commentRangeEnd\b[^>]*w:id="([^"]+)"[^>]*\/?\s*>|<w:(?:t|delText)\b[^>]*>([\s\S]*?)<\/w:(?:t|delText)>|<w:tab\b[^>]*\/?\s*>|<w:br\b[^>]*\/?\s*>|<\/w:p>/g;
  let match: RegExpExecArray | null;

  function append(value: string) {
    text.push(value);
    for (const id of active) anchors.set(id, `${anchors.get(id) || ""}${value}`);
  }

  while ((match = tokenPattern.exec(xml))) {
    const token = match[0];
    if (match[1] !== undefined) {
      active.add(match[1]);
      if (!anchors.has(match[1])) anchors.set(match[1], "");
    } else if (match[2] !== undefined) {
      active.delete(match[2]);
    } else if (match[3] !== undefined) {
      append(decodeXml(match[3]));
    } else if (token.startsWith("<w:tab")) {
      append("\t");
    } else if (token.startsWith("<w:br")) {
      append("\n");
    } else {
      append("\n\n");
    }
  }

  return {
    text: normalizePlainText(text.join("")),
    anchors: new Map(
      Array.from(anchors, ([id, value]) => [id, normalizeInlineText(value)]),
    ),
  };
}

export function extractWordFeedback(
  commentsXml: string,
  anchors: Map<string, string>,
): ExtractedFeedback[] {
  const feedback: ExtractedFeedback[] = [];
  const commentPattern = /<w:comment\b([^>]*)>([\s\S]*?)<\/w:comment>/g;
  let match: RegExpExecArray | null;
  while ((match = commentPattern.exec(commentsXml))) {
    const id = attributeValue(match[1], "w:id");
    const author = attributeValue(match[1], "w:author");
    const commentText = wordFragmentText(match[2]);
    if (!commentText) continue;
    feedback.push({
      anchorText: anchors.get(id) || "",
      commentText,
      category: classifyFeedback(commentText),
      tone: classifyTone(commentText),
      locationLabel: author ? `Word comment by ${author}` : "Word comment",
    });
  }
  return feedback;
}

export function classifyFeedback(value: string): FeedbackCategory {
  const text = value.toLowerCase();
  if (/referenc|citation|reference list|in-text/.test(text)) return "referencing";
  if (/source|evidence|research|module material|case stud|example/.test(text)) return "evidence";
  if (/question|task|focus|challenge/.test(text)) return "task_focus";
  if (/structure|paragraph|introduction|conclusion|peel|flow|plan|signpost/.test(text)) {
    return "structure";
  }
  if (/evaluat|analys|argument|claim|contrast|linkage|point|perspective/.test(text)) {
    return "analysis";
  }
  if (/writing|clear|concise|fluent|expression|lucid|cogent|ambigu/.test(text)) {
    return "writing";
  }
  if (/reflection/.test(text)) return "reflection";
  return "other";
}

export function classifyTone(value: string): FeedbackTone {
  const text = value.toLowerCase();
  if (
    /point[s]? for improvement|could|might|would have preferred|more focus|more evidence|a little more|unclear|incomplete|who do you think|maybe|not fully|losing them|myleination/.test(
      text,
    )
  ) {
    return "improve";
  }
  if (
    /excellent|very good|good |well |clear|fluent|cogent|lucid|helpful|balanced|purposeful|effective|exemplary|strong|useful|sound|thoughtful|competent|great/.test(
      text,
    )
  ) {
    return "strength";
  }
  return "neutral";
}

function wordFragmentText(fragment: string) {
  return normalizePlainText(
    fragment
      .replace(/<w:tab\b[^>]*\/?\s*>/g, "\t")
      .replace(/<w:br\b[^>]*\/?\s*>/g, "\n")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<w:(?:t|delText)\b[^>]*>([\s\S]*?)<\/w:(?:t|delText)>/g, "$1")
      .replace(/<[^>]+>/g, ""),
  );
}

function attributeValue(attributes: string, name: string) {
  return decodeXml(
    attributes.match(new RegExp(`${name.replace(":", "\\:")}="([^"]*)"`))?.[1] || "",
  );
}

function decodeXml(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal: string) => String.fromCodePoint(Number(decimal)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

export function normalizePlainText(value: string) {
  return decodeXml(value)
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeInlineText(value: string) {
  return decodeXml(value).replace(/\s+/g, " ").trim();
}
