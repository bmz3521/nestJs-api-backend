import { Role, Status, User } from '@prisma/client'
import { PaginationRequest } from 'src/common/dtos/pagination.request'

export const USER_MANAGEMENT_REPOSITORY = 'IUserManagementRepository'

export interface UserWithRelations extends User {
    role: Role
    status: Status
}

export interface GetUserListParams extends PaginationRequest {
    search?: string
}

export interface IUserManagementRepository {
    findAll(params: GetUserListParams): Promise<{
      data: UserWithRelations[];
      total: number;
    }>;
  
    findById(userId: number): Promise<UserWithRelations | null>; // changed to number
  
    update(userId: number, data: Partial<User>): Promise<User>; // changed to number
  
    findRoleById(roleId: number): Promise<Role | null>; // changed to number
  
    updateRole(userId: number, roleId: number): Promise<void>; // changed to number
  
    findByEmail(email: string): Promise<User | null>;
  
    findByGoogleId(googleId: string): Promise<User | null>;
  
    create(data: Partial<User>): Promise<User>;
}