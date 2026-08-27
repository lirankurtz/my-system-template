export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
}

export interface ApiError {
  code: string             // machine-readable e.g. "AUTH_EXPIRED", "NOT_FOUND"
  message: string          // human-readable
  status: number           // HTTP status code
}
