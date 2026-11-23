export type ErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "CONFLICT"
  | "AI_UNAVAILABLE"
  | "INTERNAL";

export class AppError extends Error {
  code: ErrorCode;
  status: number;

  constructor(code: ErrorCode, message: string, status?: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status ?? STATUS_BY_CODE[code];
  }
}

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  CONFLICT: 409,
  AI_UNAVAILABLE: 503,
  INTERNAL: 500,
};

export function errorBody(err: unknown) {
  if (err instanceof AppError) {
    return {
      status: err.status,
      body: { error: { code: err.code, message: err.message } },
    };
  }
  console.error("[unhandled]", err);
  return {
    status: 500,
    body: {
      error: {
        code: "INTERNAL",
        message: err instanceof Error ? err.message : "Something went wrong.",
      },
    },
  };
}
