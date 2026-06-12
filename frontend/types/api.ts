export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  details?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  details?: Record<string, string>;

  constructor(message: string, status: number, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}
