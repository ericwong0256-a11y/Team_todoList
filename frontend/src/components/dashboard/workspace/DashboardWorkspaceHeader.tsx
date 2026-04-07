import type { FormEvent } from "react";
import type { WorkspaceSummary, WorkspaceVisibility } from "@/types/domain";
import { AppLogo } from "@/components/ui/AppLogo";
import { StatCard } from "@/components/ui/StatCard";
import { WorkspaceAdminPanel } from "./WorkspaceAdminPanel";

type Stats = { total: number; inProgress: number; done: number };

type Props = {
  userName: string;
  workspaces: WorkspaceSummary[];
  workspaceId: string;
  onWorkspaceIdChange: (workspaceId: string) => void;
  currentWorkspace: WorkspaceSummary | undefined;
  onVisibilityChange: (visibility: WorkspaceVisibility) => void | Promise<void>;
  onRegenerateInvite: () => void | Promise<void>;
  stats: Stats;
  newTaskTitle: string;
  onNewTaskTitleChange: (value: string) => void;
  onCreateTask: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
};

export function DashboardWorkspaceHeader({
  userName,
  workspaces,
  workspaceId,
  onWorkspaceIdChange,
  currentWorkspace,
  onVisibilityChange,
  onRegenerateInvite,
  stats,
  newTaskTitle,
  onNewTaskTitleChange,
  onCreateTask
}: Props) {
  const dashboardSubtitle = (() => {
    if (!currentWorkspace) return "Professional collaborative workspace";
    if (currentWorkspace.isSandbox) return "Personal sandbox — tasks stay private to you.";
    if (currentWorkspace.role === "ADMIN") {
      return "Team management — you're the team manager for this workspace. Manage visibility, invites, and tasks below.";
    }
    return "Professional collaborative workspace";
  })();

  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "U";

  return (
    <header className="app-card-elevated overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <AppLogo size="sm" />
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="workspace-switcher">
            Active workspace
          </label>
          <select
            id="workspace-switcher"
            value={workspaceId}
            onChange={(event) => onWorkspaceIdChange(event.target.value)}
            className="app-select min-w-[min(100%,220px)] max-w-full"
          >
            {workspaces.map((workspace) => (
              <option key={workspace.workspaceId} value={workspace.workspaceId}>
                {workspace.name}
              </option>
            ))}
          </select>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-950/60 text-xs font-semibold text-zinc-200"
            title={userName}
          >
            {initials}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">Welcome, {userName}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{dashboardSubtitle}</p>
      </div>

      {currentWorkspace ? (
        <WorkspaceAdminPanel
          workspace={currentWorkspace}
          onVisibilityChange={onVisibilityChange}
          onRegenerateInvite={onRegenerateInvite}
        />
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Tasks Due" value={stats.total} accent="cyan" />
        <StatCard label="In Progress" value={stats.inProgress} accent="violet" />
        <StatCard label="Completed" value={stats.done} accent="emerald" />
      </div>

      <form className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center" onSubmit={(e) => void onCreateTask(e)}>
        <input
          value={newTaskTitle}
          onChange={(event) => onNewTaskTitleChange(event.target.value)}
          placeholder="Create a new task…"
          className="app-input min-w-0 flex-1 sm:py-3"
        />
        <button type="submit" className="app-btn-primary w-full shrink-0 sm:w-auto sm:min-w-[120px] sm:px-6">
          Add task
        </button>
      </form>
    </header>
  );
}
