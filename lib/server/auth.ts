export class UnauthorizedError extends Error {}

export function ownerIdForRequest(request: Request): string {
  const email = request.headers
    .get("oai-authenticated-user-email")
    ?.trim()
    .toLowerCase();
  if (email) return email;

  const hostname = new URL(request.url).hostname;
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local")
  ) {
    return "local-preview";
  }

  throw new UnauthorizedError("Sign in with ChatGPT to open your workspace.");
}
