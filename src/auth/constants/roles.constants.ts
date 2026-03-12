export const ROLE_NAMES = {
  ADMINISTRATOR: 'Administrator',
  EMPLOYEE: 'Employee',
  HR: 'HR',
  PM: 'PM',
  SALES: 'Sales',
} as const;

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];
