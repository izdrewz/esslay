import type { SourcePage, WorkspacePayload } from "./types";

export async function fetchWorkspace(): Promise<WorkspacePayload> {
  const response = await fetch("/api/workspace", { cache: "no-store" });
  const payload = (await response.json()) as {
    workspace?: WorkspacePayload;
    error?: string;
  };
  if (!response.ok || !payload.workspace) {
    throw new Error(payload.error || "Could not load the workspace.");
  }
  return payload.workspace;
}

export async function workspaceAction(
  action: Record<string, unknown>,
): Promise<WorkspacePayload> {
  const response = await fetch("/api/workspace", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(action),
  });
  const payload = (await response.json()) as {
    workspace?: WorkspacePayload;
    error?: string;
  };
  if (!response.ok || !payload.workspace) {
    throw new Error(payload.error || "The change could not be saved.");
  }
  return payload.workspace;
}

export async function fetchSourcePage(documentId: string, pageNumber: number) {
  const query = new URLSearchParams({ documentId, page: String(pageNumber) });
  const response = await fetch(`/api/sources?${query}`, { cache: "no-store" });
  const payload = (await response.json()) as { page?: SourcePage; error?: string };
  if (!response.ok || !payload.page) {
    throw new Error(payload.error || "Could not load that source page.");
  }
  return payload.page;
}
