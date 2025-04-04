import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles', 
      context.getHandler()
    );
    
    // No role restrictions
    if (!requiredRoles)
      return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new UnauthorizedException(
        'Insufficient permissions'
      );
    }
    
    return true;
  }
}

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);