import { useAuth } from './useAuth';

type Role = 'user' | 'admin' | 'superadmin';

const rolePermissions: Record<Role, string[]> = {
  user: ['trade', 'viewPortfolio', 'viewDashboard', 'coinAuth'],
  admin: ['trade', 'viewPortfolio', 'viewDashboard', 'manageUsers', 'adminPanel', 'coinAuth'],
  superadmin: ['trade', 'viewPortfolio', 'viewDashboard', 'manageUsers', 'adminPanel', 'superAdminPanel', 'coinAuth'],
};

/**
 * Check if a role has a specific permission
 * @param role User role
 * @param permission Permission string
 * @returns boolean
 */
export function hasPermission(role: Role | null, permission: string): boolean {
  if (!role) return false;
  const permissions = rolePermissions[role];
  return permissions.includes(permission);
}

/**
 * React hook to check if current user has a permission
 * @param permission Permission string
 * @returns boolean
 */
export function usePermissions(permission: string): boolean {
  const { userRole } = useAuth();
  return hasPermission(userRole, permission);
}
