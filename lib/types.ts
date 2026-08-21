export type RoomId = "question" | "sources" | "draft" | "review";

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

export type WorkspacePayload = {
  assignments: Assignment[];
  sources: SourceDocument[];
  evidence: EvidenceSpan[];
  drafts: Draft[];
};
