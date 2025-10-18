import { NextResponse } from 'next/server';

type ErrorResponse = {
  error: string;
  details?: any;
};

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }

  toResponse() {
    return NextResponse.json(
      { 
        error: this.message,
        ...(this.details && { details: this.details }) 
      },
      { status: this.statusCode }
    );
  }
}

export const handleApiError = (error: unknown) => {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return error.toResponse();
  }
  
  if (error instanceof Error) {
    return new ApiError(
      'An unexpected error occurred', 
      500, 
      process.env.NODE_ENV === 'development' ? error.stack : undefined
    ).toResponse();
  }
  
  return new ApiError('An unknown error occurred', 500).toResponse();
};

export const withApiErrorHandling = (
  handler: (request: Request) => Promise<NextResponse>
) => {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      return handleApiError(error);
    }
  };
};
