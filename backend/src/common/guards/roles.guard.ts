import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

const ROLE_HIERARCHY: Record<string, number> = {
  VISITOR: 0,
  MEMBER: 1,
  MODERATOR: 2,
  ADMIN: 3,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    const userLevel = ROLE_HIERARCHY[user?.role] ?? -1;

    // Check if user's role meets ANY of the required role levels
    const hasRole = requiredRoles.some((role) => {
      const requiredLevel = ROLE_HIERARCHY[role] ?? 99;
      return userLevel >= requiredLevel;
    });

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}

/**
 * Check if the current user can modify a resource.
 * Returns true if: user is the owner, OR user has MODERATOR or ADMIN role.
 */
export function canModify(
  resourceOwnerId: string,
  currentUser: { id: string; role: string },
): boolean {
  if (resourceOwnerId === currentUser.id) return true;
  const userLevel = ROLE_HIERARCHY[currentUser.role] ?? -1;
  return userLevel >= ROLE_HIERARCHY.MODERATOR;
}
