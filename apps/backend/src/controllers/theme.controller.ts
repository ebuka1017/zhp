import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { successResponse, errorResponse } from '../utils/response';

export const getActiveTheme = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let theme = await prisma.theme.findFirst({
      where: { isActive: true },
    });

    if (!theme) {
      // Create default theme if none exists
      theme = await prisma.theme.create({
        data: {
          name: 'Default Theme',
          isActive: true,
        },
      });
    }

    successResponse(res, theme);
  } catch (error) {
    console.error('Get active theme error:', error);
    errorResponse(res, 'Failed to get active theme', 500);
  }
};

export const getAllThemes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const themes = await prisma.theme.findMany({
      orderBy: { createdAt: 'desc' },
    });

    successResponse(res, themes);
  } catch (error) {
    console.error('Get themes error:', error);
    errorResponse(res, 'Failed to get themes', 500);
  }
};

export const getThemeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const theme = await prisma.theme.findUnique({
      where: { id },
    });

    if (!theme) {
      errorResponse(res, 'Theme not found', 404);
      return;
    }

    successResponse(res, theme);
  } catch (error) {
    console.error('Get theme error:', error);
    errorResponse(res, 'Failed to get theme', 500);
  }
};

export const createTheme = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      darkPrimaryColor,
      darkSecondaryColor,
      darkAccentColor,
      darkBackgroundColor,
      darkTextColor,
      fontFamily,
      fontSize,
      borderRadius,
      spacing,
      glassBlur,
      glassOpacity,
      defaultMode,
    } = req.body;

    const theme = await prisma.theme.create({
      data: {
        name,
        isActive: false, // Don't activate by default
        primaryColor: primaryColor || '#3B82F6',
        secondaryColor: secondaryColor || '#8B5CF6',
        accentColor: accentColor || '#10B981',
        backgroundColor: backgroundColor || '#FFFFFF',
        textColor: textColor || '#1F2937',
        darkPrimaryColor: darkPrimaryColor || '#60A5FA',
        darkSecondaryColor: darkSecondaryColor || '#A78BFA',
        darkAccentColor: darkAccentColor || '#34D399',
        darkBackgroundColor: darkBackgroundColor || '#111827',
        darkTextColor: darkTextColor || '#F9FAFB',
        fontFamily: fontFamily || 'Inter',
        fontSize: fontSize || { base: 16, scale: 1.2 },
        borderRadius: borderRadius || { sm: 4, md: 8, lg: 16, xl: 24 },
        spacing: spacing || { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
        glassBlur: glassBlur || 10,
        glassOpacity: glassOpacity || 0.8,
        defaultMode: defaultMode || 'light',
      },
    });

    successResponse(res, theme, 'Theme created successfully', 201);
  } catch (error) {
    console.error('Create theme error:', error);
    errorResponse(res, 'Failed to create theme', 500);
  }
};

export const updateTheme = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating name to existing name
    if (updateData.name) {
      const existingTheme = await prisma.theme.findFirst({
        where: {
          name: updateData.name,
          id: { not: id },
        },
      });

      if (existingTheme) {
        errorResponse(res, 'Theme name already exists', 409);
        return;
      }
    }

    const theme = await prisma.theme.update({
      where: { id },
      data: updateData,
    });

    successResponse(res, theme, 'Theme updated successfully');
  } catch (error) {
    console.error('Update theme error:', error);
    errorResponse(res, 'Failed to update theme', 500);
  }
};

export const activateTheme = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Deactivate all themes
    await prisma.theme.updateMany({
      data: { isActive: false },
    });

    // Activate the selected theme
    const theme = await prisma.theme.update({
      where: { id },
      data: { isActive: true },
    });

    successResponse(res, theme, 'Theme activated successfully');
  } catch (error) {
    console.error('Activate theme error:', error);
    errorResponse(res, 'Failed to activate theme', 500);
  }
};

export const deleteTheme = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const theme = await prisma.theme.findUnique({
      where: { id },
    });

    if (!theme) {
      errorResponse(res, 'Theme not found', 404);
      return;
    }

    if (theme.isActive) {
      errorResponse(res, 'Cannot delete active theme', 400);
      return;
    }

    await prisma.theme.delete({
      where: { id },
    });

    successResponse(res, null, 'Theme deleted successfully');
  } catch (error) {
    console.error('Delete theme error:', error);
    errorResponse(res, 'Failed to delete theme', 500);
  }
};

export const duplicateTheme = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const originalTheme = await prisma.theme.findUnique({
      where: { id },
    });

    if (!originalTheme) {
      errorResponse(res, 'Theme not found', 404);
      return;
    }

    const { id: _, createdAt, updatedAt, isActive, ...themeData } = originalTheme;

    const newTheme = await prisma.theme.create({
      data: {
        ...themeData,
        name: name || `${originalTheme.name} (Copy)`,
        isActive: false,
      },
    });

    successResponse(res, newTheme, 'Theme duplicated successfully', 201);
  } catch (error) {
    console.error('Duplicate theme error:', error);
    errorResponse(res, 'Failed to duplicate theme', 500);
  }
};
