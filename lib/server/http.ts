import { UnauthorizedError } from "./auth";

export function apiError(error: unknown): Response {
  if (error instanceof UnauthorizedError) {
    return Response.json({ error: error.message }, { status: 401 });
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  const cause =
    error instanceof Error && error.cause instanceof Error
      ? error.cause.message
      : "";
  const combined = `${message}\n${cause}`;

  if (combined.includes("no such table")) {
    return Response.json(
      { error: "The workspace database is still being prepared. Try again shortly." },
      { status: 503 },
    );
  }

  console.error(error);
  return Response.json({ error: message }, { status: 500 });
}
