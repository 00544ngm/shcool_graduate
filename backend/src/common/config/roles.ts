export const ROLE_HIERARCHY: Record<string, number> = {
  VISITOR: 0,
  MEMBER: 1,
  MODERATOR: 2,
  ADMIN: 3,
};

export const ROLE_LEVELS = Object.entries(ROLE_HIERARCHY).sort(([, a], [, b]) => b - a);

export function hasMinRole(userRole: string | undefined, minRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole ?? ''] ?? -1;
  const requiredLevel = ROLE_HIERARCHY[minRole] ?? 99;
  return userLevel >= requiredLevel;
}
