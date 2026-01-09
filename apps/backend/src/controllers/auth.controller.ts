import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/response';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import crypto from 'crypto';
import { UserRole } from '@prisma/client';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      errorResponse(res, 'User already exists', 409);
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate email verification token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        role: UserRole.CUSTOMER,
        emailVerifyToken,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, emailVerifyToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    successResponse(
      res,
      {
        user,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    errorResponse(res, 'Failed to register user', 500);
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      errorResponse(res, 'Invalid credentials', 401);
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      errorResponse(res, 'Account is inactive', 403);
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      errorResponse(res, 'Invalid credentials', 401);
      return;
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user;

    successResponse(res, {
      user: userWithoutSensitiveData,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, 'Failed to login', 500);
  }
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      errorResponse(res, 'Refresh token required', 400);
      return;
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Find user and verify stored refresh token
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      errorResponse(res, 'Invalid refresh token', 401);
      return;
    }

    if (!user.isActive) {
      errorResponse(res, 'Account is inactive', 403);
      return;
    }

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Update refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    successResponse(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    errorResponse(res, 'Invalid or expired refresh token', 401);
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    // Clear refresh token
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { refreshToken: null },
    });

    successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    errorResponse(res, 'Failed to logout', 500);
  }
};

export const verifyEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      errorResponse(res, 'Invalid verification token', 400);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
      },
    });

    successResponse(res, null, 'Email verified successfully');
  } catch (error) {
    console.error('Email verification error:', error);
    errorResponse(res, 'Failed to verify email', 500);
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      successResponse(res, null, 'If the email exists, a reset link has been sent');
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Send reset email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
    }

    successResponse(res, null, 'If the email exists, a reset link has been sent');
  } catch (error) {
    console.error('Forgot password error:', error);
    errorResponse(res, 'Failed to process request', 500);
  }
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      errorResponse(res, 'Invalid or expired reset token', 400);
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        refreshToken: null, // Invalidate all sessions
      },
    });

    successResponse(res, null, 'Password reset successfully');
  } catch (error) {
    console.error('Reset password error:', error);
    errorResponse(res, 'Failed to reset password', 500);
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        avatar: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    successResponse(res, user);
  } catch (error) {
    console.error('Get profile error:', error);
    errorResponse(res, 'Failed to get profile', 500);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    const { firstName, lastName, phoneNumber } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        firstName,
        lastName,
        phoneNumber,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        avatar: true,
        isEmailVerified: true,
        updatedAt: true,
      },
    });

    successResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    errorResponse(res, 'Failed to update profile', 500);
  }
};
