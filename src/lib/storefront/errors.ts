export class StorefrontResolutionError extends Error {
  readonly statusCode: number;
  readonly code: "host_not_configured" | "manifest_unavailable" | "misconfigured";

  constructor(
    message: string,
    statusCode = 404,
    code: StorefrontResolutionError["code"] = "host_not_configured",
  ) {
    super(message);
    this.name = "StorefrontResolutionError";
    this.statusCode = statusCode;
    this.code = code;
  }
}
