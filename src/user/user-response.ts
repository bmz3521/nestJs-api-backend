import { Prisma } from '@prisma/client';

export const userWithRelationsArgs = Prisma.validator<Prisma.UserDefaultArgs>()(
  {
    include: {
      role: true,
      status: true,
    },
  },
);

export type UserWithRelations = Prisma.UserGetPayload<
  typeof userWithRelationsArgs
>;
export type SafeUser = Omit<UserWithRelations, 'id' | 'passwordHash'>;

export function sanitizeUser(user: UserWithRelations): SafeUser {
  return Object.fromEntries(
    Object.entries(user).filter(
      ([key]) => key !== 'id' && key !== 'passwordHash',
    ),
  ) as SafeUser;
}
