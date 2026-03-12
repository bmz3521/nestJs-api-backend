import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

const defaultAdminEmail =
  process.env.BOOTSTRAP_ADMIN_EMAIL ?? 'admin@example.com';
const defaultAdminPassword =
  process.env.BOOTSTRAP_ADMIN_PASSWORD ?? 'Admin1234!';

function generatePublicId() {
  return randomBytes(16).toString('hex');
}

async function main() {
  const activeStatus = await prisma.status.upsert({
    where: { id: 1 },
    update: {
      key: 'ACTIVE',
      name: 'Active',
    },
    create: {
      id: 1,
      key: 'ACTIVE',
      name: 'Active',
    },
  });

  await prisma.status.upsert({
    where: { id: 2 },
    update: {
      key: 'INACTIVE',
      name: 'Inactive',
    },
    create: {
      id: 2,
      key: 'INACTIVE',
      name: 'Inactive',
    },
  });

  const roles = await Promise.all(
    ['Administrator', 'Employee', 'HR', 'PM', 'Sales'].map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {
          roleStatusId: activeStatus.id,
        },
        create: {
          name,
          roleStatusId: activeStatus.id,
        },
      }),
    ),
  );

  const menus = await Promise.all(
    ['Project Management', 'Employee Timesheet', 'User Management'].map(
      (name) =>
        prisma.menu.upsert({
          where: { name },
          update: {
            menuStatusId: activeStatus.id,
          },
          create: {
            name,
            menuStatusId: activeStatus.id,
          },
        }),
    ),
  );

  const userManagementMenu = menus.find(
    (menu) => menu.name === 'User Management',
  );
  const administratorRole = roles.find((role) => role.name === 'Administrator');
  const hrRole = roles.find((role) => role.name === 'HR');

  if (!userManagementMenu || !administratorRole) {
    throw new Error('Required seed data is missing');
  }

  await prisma.roleMenuAccess.deleteMany({
    where: {
      menuId: userManagementMenu.id,
    },
  });

  await prisma.roleMenuAccess.createMany({
    data: roles.map((role) => {
      const hasUserManagementAccess =
        role.id === administratorRole.id || role.id === hrRole?.id;

      return {
        roleId: role.id,
        menuId: userManagementMenu.id,
        canCreate: hasUserManagementAccess,
        canEdit: hasUserManagementAccess,
        canRead: hasUserManagementAccess,
        canApprove: false,
        canExport: false,
        canDelete: hasUserManagementAccess,
      };
    }),
  });

  const passwordHash = await bcrypt.hash(defaultAdminPassword, 10);
  await prisma.user.upsert({
    where: { email: defaultAdminEmail.toLowerCase() },
    update: {
      passwordHash,
      roleId: administratorRole.id,
      userStatusId: activeStatus.id,
      firstnameTh: 'System',
      lastnameTh: 'Administrator',
      firstnameEn: 'System',
      lastnameEn: 'Administrator',
      position: 'Administrator',
    },
    create: {
      publicId: generatePublicId(),
      email: defaultAdminEmail.toLowerCase(),
      passwordHash,
      firstnameTh: 'System',
      lastnameTh: 'Administrator',
      firstnameEn: 'System',
      lastnameEn: 'Administrator',
      position: 'Administrator',
      userStatusId: activeStatus.id,
      roleId: administratorRole.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
