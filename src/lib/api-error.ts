export function handleError(
  error: unknown,
  defaultCode = 500,
): { status: number; body: { error: string; details?: unknown } } {
  const code =
    (error instanceof Error && "code" in error && typeof error.code === "number"
      ? error.code
      : defaultCode) || defaultCode;

  if (code >= 400 && code < 500) {
    return {
      status: code,
      body: {
        error: "Bad Request",
        details:
          error instanceof Error ? error.message : undefined,
      },
    };
  }

  return {
    status: 500,
    body: {
      error: "Internal Server Error",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    },
  };
}
