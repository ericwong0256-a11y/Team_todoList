export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export type WorkspaceVisibility = "PUBLIC" | "PRIVATE";

export type WorkspaceSummary = {
  workspaceId: string;
  name: string;
  slug: string;
  role: "ADMIN" | "MEMBER";
  visibility: WorkspaceVisibility;
  isSandbox: boolean;
  /** Only returned for admins on private teams */
  inviteCode?: string | null;
};

/** Public teams from GET /api/workspaces/discover */
export type DiscoverableTeam = {
  workspaceId: string;
  name: string;
  slug: string;
  members: number;
  visibility: string;
};

export type TaskItem = {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  priority: number;
  position: number;
  comments: { id: string }[];
};
