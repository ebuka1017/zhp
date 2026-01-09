import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

export const successResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  error: string,
  statusCode: number = 400,
  errors?: any[]
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
