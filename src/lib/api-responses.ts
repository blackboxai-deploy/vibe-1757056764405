// Standard API response utilities

import { NextResponse } from 'next/server';
import { ApiResponse } from './types';

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({
    success: true,
    data
  } as ApiResponse<T>, { status });
}

export function errorResponse(error: string, status = 400): NextResponse {
  return NextResponse.json({
    success: false,
    error
  } as ApiResponse, { status });
}

export function validationErrorResponse(errors: Record<string, string[]>): NextResponse {
  return NextResponse.json({
    success: false,
    error: 'Validation failed',
    errors
  } as ApiResponse, { status: 400 });
}

export function notFoundResponse(message = 'Resource not found'): NextResponse {
  return NextResponse.json({
    success: false,
    error: message
  } as ApiResponse, { status: 404 });
}

export function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({
    success: false,
    error: message
  } as ApiResponse, { status: 401 });
}

export function serverErrorResponse(message = 'Internal server error'): NextResponse {
  return NextResponse.json({
    success: false,
    error: message
  } as ApiResponse, { status: 500 });
}