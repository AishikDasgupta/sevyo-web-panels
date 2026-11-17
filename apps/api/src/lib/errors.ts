export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(message: string, status: number, code: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(message, 400, 'BAD_REQUEST', details);

export const unauthorized = (message = 'Authentication required') =>
  new AppError(message, 401, 'UNAUTHORIZED');

export const forbidden = (message = 'You do not have permission to do that') =>
  new AppError(message, 403, 'FORBIDDEN');

export const notFound = (message = 'Resource not found') => new AppError(message, 404, 'NOT_FOUND');

export const conflict = (message: string) => new AppError(message, 409, 'CONFLICT');

export const unprocessable = (message: string, details?: unknown) =>
  new AppError(message, 422, 'VALIDATION_ERROR', details);
