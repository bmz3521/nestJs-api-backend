import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Insert statuses
  const status = await prisma.status.createMany({
    data: [
        {
            id: 1,
            key: 'ACTIVE',
            name: 'Active',
        },
        {
            id: 2,
            key: 'INACTIVE',
            name: 'Inactive',
        },
    ],
});
const role = await prisma.role.createManyAndReturn({
    data: [
        {
            name: 'Administrator',
            roleStatusId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: 'Employee',
            roleStatusId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: 'HR',
            roleStatusId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: 'PM',
            roleStatusId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: 'Sales',
            roleStatusId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ],
});

const menu = await prisma.menu.createManyAndReturn({
    data: [
        // {
        //     name: 'Customer Management',
        //     menuStatusId: 1,
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        // },
        {
            name: 'Project Management',
            menuStatusId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        // {
        //     name: 'Project Dashboard',
        //     menuStatusId: 1,
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        // },
        // {
        //     name: 'Project Insights',
        //     menuStatusId: 1,
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        // },
        // {
        //     name: 'Resource Allocation',
        //     menuStatusId: 1,
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        // },
        {
            name: 'Employee Timesheet',
            menuStatusId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        // {
        //     name: 'Employee Timesheet Report',
        //     menuStatusId: 1,
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        // },
        // {
        //     name: 'Project Timesheet Report',
        //     menuStatusId: 1,
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        // },
        // {
        //     name: 'Timesheet Log Alert',
        //     menuStatusId: 1,
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        // },
        {
            name: 'User Management',
            menuStatusId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        // {
        //     name: 'Role Management',
        //     menuStatusId: 1,
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        // },
    ],
});

const projectManagement = menu.find((menu) => menu.name === 'Project Management');
    const userManagement = menu.find((menu) => menu.name === 'User Management');
    const exportTimesheet = menu.find((menu) => menu.name === 'Export Timesheet');
    const employeeTimesheet = menu.find((menu) => menu.name === 'Employee Timesheet');

    //role
    const admin = role.find((role) => role.name === 'Administrator')!;
    const employee = role.find((role) => role.name === 'Employee');
    const hr = role.find((role) => role.name === 'HR');
    const pm = role.find((role) => role.name === 'PM');
    const sales = role.find((role) => role.name === 'Sales');

    //userManagement
    if (userManagement) {
        // Create permissions for admin and HR roles with full access
        const fullAccessRoles = [admin, hr];
        await Promise.all(
            fullAccessRoles.map(async (role) => {
                if (role) {
                    await prisma.roleMenuAccess.create({
                        data: {
                            roleId: role.id,
                            menuId: userManagement.id,
                            canCreate: false,
                            canEdit: true,
                            canRead: true,
                            canApprove: false,
                            canExport: false,
                            canDelete: false,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    });
                }
            }),
        );

        // The existing code for regular roles with no access can remain as is
        const regularRoles = [sales, employee, pm];
        await Promise.all(
            regularRoles.map(async (role) => {
                if (role) {
                    await prisma.roleMenuAccess.create({
                        data: {
                            roleId: role.id,
                            menuId: userManagement.id,
                            canCreate: false,
                            canEdit: false,
                            canRead: false,
                            canApprove: false,
                            canExport: false,
                            canDelete: false,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    });
                }
            }),
        );

    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

