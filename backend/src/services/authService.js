const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateTokens } = require('../config/auth');

const prisma = new PrismaClient();

class AuthService {
  
  static async authenticateUser(email, password) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          student: {
            include: {
              class: true
            }
          }
        }
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid credentials or inactive account');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const { password: _, ...userWithoutPassword } = user;
      const tokens = generateTokens(user);

      return {
        user: userWithoutPassword,
        tokens
      };
    } catch (error) {
      throw error;
    }
  }

  static async createUser(userData) {
    try {
      const { email, password, role = 'STUDENT', ...otherData } = userData;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          ...otherData
        }
      });

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async resetPassword(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedTempPassword }
      });

      // In production, you would send this via email
      return {
        message: 'Password reset successfully',
        temporaryPassword: tempPassword // Only return this in development
      };
    } catch (error) {
      throw error;
    }
  }

  static async deactivateUser(userId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
      });

      return { message: 'User deactivated successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async activateUser(userId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: true }
      });

      return { message: 'User activated successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async getUserProfile(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          student: {
            include: {
              class: true
            }
          }
        },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          student: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  static async updateUserProfile(userId, updateData) {
    try {
      const { email, ...otherData } = updateData;

      // If email is being updated, check for conflicts
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            NOT: { id: userId }
          }
        });

        if (existingUser) {
          throw new Error('Email is already in use by another user');
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { email, ...otherData },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          updatedAt: true
        }
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;