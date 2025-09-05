// Authentication utilities

import { compare, hash } from 'bcryptjs';
import { User, UserRole } from './types';
import DatabaseManager from './database';

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}

// User creation utility
export async function createUser(userData: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  churchId?: string;
  phone?: string;
}): Promise<User> {
  const db = DatabaseManager.getInstance();
  const passwordHash = await hashPassword(userData.password);
  
  const result = await db.executeMain(`
    INSERT INTO users (email, password_hash, name, role, church_id, phone)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, email, name, phone, role, church_id, is_active, created_at, updated_at, two_factor_enabled
  `, [
    userData.email,
    passwordHash,
    userData.name,
    userData.role,
    userData.churchId || null,
    userData.phone || null,
  ]);
  
  const user = result.rows[0];
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    churchId: user.church_id,
    isActive: user.is_active,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    twoFactorEnabled: user.two_factor_enabled,
  };
}

// Role-based access control utilities
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.SUPER_ADMIN]: 6,
    [UserRole.CHURCH_ADMIN]: 5,
    [UserRole.PASTOR]: 4,
    [UserRole.LEADER]: 3,
    [UserRole.MEMBER]: 2,
    [UserRole.VISITOR]: 1,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canAccessChurch(userRole: UserRole, userChurchId: string | null, targetChurchId: string): boolean {
  // Super admin can access all churches
  if (userRole === UserRole.SUPER_ADMIN) {
    return true;
  }
  
  // Other users can only access their own church
  return userChurchId === targetChurchId;
}

// Tenant utility functions
export function getTenantFromSubdomain(subdomain: string): string | null {
  if (!subdomain || subdomain === 'www' || subdomain === 'admin') {
    return null;
  }
  return subdomain;
}

export async function getChurchBySubdomain(subdomain: string): Promise<any> {
  const db = DatabaseManager.getInstance();
  const result = await db.executeMain(
    'SELECT * FROM churches WHERE subdomain = $1 AND is_active = true',
    [subdomain]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Audit logging
export async function logUserActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  churchId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const db = DatabaseManager.getInstance();
  
  await db.executeMain(`
    INSERT INTO audit_logs (
      user_id, church_id, action, entity_type, entity_id, 
      old_values, new_values, ip_address, user_agent
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    userId,
    churchId || null,
    action,
    entityType,
    entityId,
    oldValues ? JSON.stringify(oldValues) : null,
    newValues ? JSON.stringify(newValues) : null,
    ipAddress || null,
    userAgent || null,
  ]);
}

// Session management
export function getServerSession() {
  // This would typically use next-auth's getServerSession
  // Implementation depends on your specific setup
}

// Two-factor authentication utilities (placeholder for future implementation)
export async function enableTwoFactor(_userId: string): Promise<string> {
  // Generate QR code and secret for 2FA
  // Implementation would use libraries like 'speakeasy' or 'otpauth'
  return 'placeholder-secret';
}

export async function verifyTwoFactor(_userId: string, _token: string): Promise<boolean> {
  // Verify 2FA token
  // Implementation would verify against stored secret
  return false; // Placeholder
}