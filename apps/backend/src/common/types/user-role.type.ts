export const USER_ROLE_VALUES = ['TEAM_LEAD', 'EMPLOYEE'] as const;

export type UserRole = (typeof USER_ROLE_VALUES)[number];
