import { Injectable } from '@nestjs/common'
import { Prisma, User, Role, Status } from '@prisma/client'
import {
    GetUserListParams,
    IUserManagementRepository,
    UserWithRelations,
} from '../../domain/repositories/user-management/user-management.repository.interface'
import { PrismaService } from '../../../prisma/prisma.service'

@Injectable()
export class UserManagementRepositoryImpl implements IUserManagementRepository {
    constructor(private _prisma: PrismaService) {}

    async findAll(params: GetUserListParams): Promise<{ data: UserWithRelations[]; total: number }> {
        const { page = 1, limit = 10, search } = params

        const where: Prisma.UserWhereInput = search
            ? {
                  OR: [
                      {
                          firstnameEn: {
                              contains: search,
                          },
                      },
                      {
                          lastnameEn: {
                              contains: search,
                          },
                      },
                      {
                          email: {
                              contains: search,
                          },
                      },
                      {
                          position: {
                              contains: search,
                          },
                      },
                      {
                          role: {
                              is: {
                                  name: {
                                      contains: search,
                                  },
                              },
                          },
                      },
                      {
                          status: {
                              is: {
                                  name: {
                                      contains: search,
                                  },
                              },
                          },
                      },
                  ],
              }
            : {}

        const [users, total] = await Promise.all([
            this._prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    role: true,
                    status: true,
                },
                orderBy: [
                    { firstnameEn: 'asc' },
                    { lastnameEn: 'asc' },
                ],
            }),
            this._prisma.user.count({ where }),
        ])

        return {
            data: users as UserWithRelations[],
            total,
        }
    }

    async findById(userId: number): Promise<UserWithRelations | null> {
        return this._prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: true,
                status: true,
            },
        }) as Promise<UserWithRelations | null>
    }

    async update(userId: number, data: Partial<User>): Promise<User> {
        return this._prisma.user.update({
            where: { id: userId },
            data,
        })
    }

    async findRoleById(roleId: number): Promise<Role | null> {
        return this._prisma.role.findUnique({
            where: { id: roleId },
        })
    }

    async updateRole(userId: number, roleId: number): Promise<void> {
        await this._prisma.user.update({
            where: { id: userId },
            data: { roleId },
        })
    }

    async findByEmail(email: string): Promise<User | null> {
        return this._prisma.user.findFirst({
            where: { email },
        })
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        return this._prisma.user.findFirst({
            where: { googleId },
        })
    }

    async create(data: Partial<User>): Promise<User> {
        return this._prisma.user.create({
            data: data as Prisma.UserCreateInput,
        })
    }
}
