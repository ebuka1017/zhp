import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { errorResponse } from '../utils/response';
import prisma from '../config/database';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: TokenPayload & { id: string };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponse(res, 'No token provided', 401);
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      errorResponse(res, 'User not found or inactive', 401);
      return;
    }

    req.user = {
      ...payload,
      id: user.id,
    };

    next();
  } catch (error) {
    errorResponse(res, 'Invalid or expired token', 401);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      errorResponse(res, 'Forbidden: Insufficient permissions', 403);
      return;
    }

    next();
  };
};

// Helper to check if user is at least a store admin
export const isAdmin = authorize(
  UserRole.SUPER_ADMIN,
  UserRole.STORE_ADMIN
);

// Helper to check if user is super admin
export const isSuperAdmin = authorize(UserRole.SUPER_ADMIN);
