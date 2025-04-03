export interface ConsultationError extends Error {
  code?: string;
  details?: {
    required: number;
    current: number;
    shortfall: number;
  };
}

export function isConsultationError(error: unknown): error is ConsultationError {
  return error instanceof Error && 'code' in error;
} 