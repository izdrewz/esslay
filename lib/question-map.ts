import type { QuestionBreakdown } from "./types";

const COMMANDS = [
  "critically evaluate",
  "compare and contrast",
  "to what extent",
  "critically assess",
  "discuss",
  "evaluate",
  "analyse",
  "analyze",
  "compare",
  "explain",
  "assess",
  "examine",
  "argue",
  "describe",
];

export function mapQuestion(question: string): QuestionBreakdown {
  const clean = question.replace(/\s+/g, " ").trim();
  const lowered = clean.toLowerCase();
  const command = COMMANDS.find((item) => lowered.includes(item)) ?? "respond to";
  const withoutCommand = clean.replace(new RegExp(escapeRegExp(command), "i"), "").trim();
  const parts = withoutCommand
    .replace(/[?.!]$/, "")
    .split(/\b(?:with reference to|in relation to|using|drawing on)\b/i)
    .map((item) => item.trim())
    .filter(Boolean);
  const constraints = [
    ...clean.matchAll(/\b(?:between|from|during|since|before|after)\s+[^,.;?]+/gi),
  ]
    .map((match) => match[0].trim())
    .slice(0, 4);

  return {
    command: titleCase(command),
    subject: parts[0] || clean || "Add the main subject",
    focus: parts[1] || "Define the angle, case, or material you must focus on",
    output: outputForCommand(command),
    constraints,
    evidenceNeeds: [
      "Evidence that supports the central claim",
      "Evidence that complicates or challenges it",
    ],
  };
}

function outputForCommand(command: string) {
  if (command.includes("compare")) return "A comparison built around clear criteria";
  if (command.includes("evaluate") || command.includes("assess")) {
    return "A reasoned judgement supported by evidence";
  }
  if (command.includes("analyse") || command.includes("analyze")) {
    return "An explanation of how and why the parts relate";
  }
  if (command.includes("to what extent")) return "A qualified judgement about degree";
  return "A direct answer with a defensible central claim";
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
