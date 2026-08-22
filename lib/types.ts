export type RoomId = "archive" | "question" | "sources" | "draft" | "review";

export type ArchiveRole =
  | "question"
  | "plan"
  | "draft"
  | "submission"
  | "revision"
  | "feedback"
  | "source"
  | "other";

export type FeedbackCategory =
  | "task_focus"
  | "analysis"
  | "evidence"
  | "structure"
  | "writing"
  | "referencing"
  | "reflection"
  | "other";

export type FeedbackTone = "strength" | "improve" | "neutral";

export type QuestionBreakdown = {
  command: string;
  subject: string;
  focus: string;
  output: string;
  constraints: string[];
  evidenceNeeds: string[];
};

export type Assignment = {
  id: string;
  title: string;
  question: string;
  breakdown: QuestionBreakdown;
  breakdownConfirmedAt: string | null;
  activeRoom: RoomId;
  createdAt: string;
  updatedAt: string;
};

export type SourceDocument = {
  id: string;
  assignmentId: string;
  filename: string;
  contentType: string;
  byteSize: number;
  pageCount: number;
  createdAt: string;
};

export type SourcePage = {
  documentId: string;
  pageNumber: number;
  textContent: string;
};

export type EvidenceSpan = {
  id: string;
  assignmentId: string;
  documentId: string;
  pageNumber: number;
  startOffset: number;
  endOffset: number;
  quote: string;
  note: string;
  createdAt: string;
};

export type Draft = {
  id: string;
  assignmentId: string;
  contentJson: Record<string, unknown>;
  plainText: string;
  createdAt: string;
  updatedAt: string;
};

export type ArchiveBundle = {
  id: string;
  title: string;
  moduleCode: string;
  assessmentCode: string;
  score: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ArchiveArtifact = {
  id: string;
  bundleId: string;
  role: ArchiveRole;
  filename: string;
  contentType: string;
  byteSize: number;
  pageCount: number;
  commentCount: number;
  createdAt: string;
};

export type ArchiveSection = {
  artifactId: string;
  sectionNumber: number;
  pageNumber: number | null;
  textContent: string;
};

export type FeedbackNote = {
  id: string;
  bundleId: string;
  artifactId: string;
  anchorText: string;
  commentText: string;
  category: FeedbackCategory;
  tone: FeedbackTone;
  locationLabel: string;
  createdAt: string;
};

export type WorkspacePayload = {
  assignments: Assignment[];
  sources: SourceDocument[];
  evidence: EvidenceSpan[];
  drafts: Draft[];
  archiveBundles: ArchiveBundle[];
  archiveArtifacts: ArchiveArtifact[];
  feedbackNotes: FeedbackNote[];
};
