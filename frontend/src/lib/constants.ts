export const ROLES = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const TASK_STATUS = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  REVIEW: "REVIEW",
  DONE: "DONE"
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
