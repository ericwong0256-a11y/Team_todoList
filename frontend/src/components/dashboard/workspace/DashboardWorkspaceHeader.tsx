import type { FormEvent } from "react";
import type { WorkspaceSummary, WorkspaceVisibility } from "@/types/domain";
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
  return (
    <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {userName}</h1>
          <p className="mt-2 text-slate-300">Professional collaborative workspace</p>
        </div>
        <select
          value={workspaceId}
          onChange={(event) => onWorkspaceIdChange(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
        >
          {workspaces.map((workspace) => (
            <option key={workspace.workspaceId} value={workspace.workspaceId}>
              {workspace.name}
            </option>
          ))}
        </select>
      </div>

      {currentWorkspace ? (
        <WorkspaceAdminPanel
          workspace={currentWorkspace}
          onVisibilityChange={onVisibilityChange}
          onRegenerateInvite={onRegenerateInvite}
        />
      ) : null}

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <StatCard label="Tasks Due" value={stats.total} />
        <StatCard label="In Progress" value={stats.inProgress} />
        <StatCard label="Completed" value={stats.done} />
      </div>
      <form className="mt-4 flex gap-2" onSubmit={(e) => void onCreateTask(e)}>
        <input
          value={newTaskTitle}
          onChange={(event) => onNewTaskTitleChange(event.target.value)}
          placeholder="Create a new task..."
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
        />
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500">
          Add task
        </button>
      </form>
    </header>
  );
}
