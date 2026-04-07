"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { DiscoverableTeam, TaskItem, WorkspaceSummary, WorkspaceVisibility } from "@/types/domain";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { CalendarView } from "@/components/calendar/CalendarView";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { getSocket } from "@/lib/realtime";
import { normalizeApiError } from "@/lib/api-errors";
import { CreateTeamDialog } from "@/components/dashboard/onboarding/CreateTeamDialog";
import { OnboardingView } from "@/components/dashboard/onboarding/OnboardingView";
import { DashboardWorkspaceHeader } from "@/components/dashboard/workspace/DashboardWorkspaceHeader";

/** Stable options so effects don’t need to depend on a new object each render */
const apiFetch: RequestInit = { credentials: "include", cache: "no-store" };

export function DashboardClient({ userName }: { userName: string }) {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [discoverTeams, setDiscoverTeams] = useState<DiscoverableTeam[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamVisibility, setNewTeamVisibility] = useState<WorkspaceVisibility>("PUBLIC");
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [createTeamBusy, setCreateTeamBusy] = useState(false);
  const [createTeamError, setCreateTeamError] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [lastCreatedInvite, setLastCreatedInvite] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workspaces", apiFetch)
      .then((res) => res.json())
      .then((data: WorkspaceSummary[]) => {
        const normalized = (Array.isArray(data) ? data : []).map((w) => ({
          ...w,
          visibility: w.visibility ?? "PUBLIC",
          isSandbox: w.isSandbox ?? false
        }));
        setWorkspaces(normalized);
        if (normalized[0]) setWorkspaceId(normalized[0].workspaceId);
      })
      .catch(() => setWorkspaces([]));
  }, []);

  useEffect(() => {
    if (workspaces.length > 0) return;
    fetch("/api/workspaces/discover", apiFetch)
      .then((res) => res.json())
      .then((data) => setDiscoverTeams(Array.isArray(data) ? data : []))
      .catch(() => setDiscoverTeams([]));
  }, [workspaces.length]);

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/tasks?workspaceId=${workspaceId}`, apiFetch)
      .then((res) => res.json())
      .then((data: TaskItem[]) => setTasks(data))
      .catch(() => setTasks([]));
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    const socket = getSocket();
    socket.emit("workspace:join", workspaceId);
    const onUpdated = (task: TaskItem) => {
      setTasks((prev) => prev.map((item) => (item.id === task.id ? task : item)));
    };
    socket.on("task:updated", onUpdated);
    return () => {
      socket.off("task:updated", onUpdated);
    };
  }, [workspaceId]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS").length;
    const done = tasks.filter((task) => task.status === "DONE").length;
    return { total, inProgress, done };
  }, [tasks]);

  async function refreshMemberships(preferredWorkspaceId?: string) {
    const res = await fetch("/api/workspaces", apiFetch);
    const data = await res.json();
    if (!Array.isArray(data)) return;
    const normalized = data.map((w) => ({
      ...w,
      visibility: w.visibility ?? "PUBLIC",
      isSandbox: w.isSandbox ?? false
    }));
    setWorkspaces(normalized);
    if (preferredWorkspaceId && normalized.some((w) => w.workspaceId === preferredWorkspaceId)) {
      setWorkspaceId(preferredWorkspaceId);
    } else if (normalized[0]) {
      setWorkspaceId(normalized[0].workspaceId);
    }
  }

  async function handleCreateTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newTeamName.trim();
    if (!name) {
      setCreateTeamError("Team name is required.");
      return;
    }
    if (name.length < 2) {
      setCreateTeamError("Team name must be at least 2 characters.");
      return;
    }
    setCreateTeamBusy(true);
    setCreateTeamError("");
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, visibility: newTeamVisibility })
      });
      const payload: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err =
          typeof payload === "object" && payload !== null && "error" in payload
            ? (payload as { error: unknown }).error
            : payload;
        const details =
          typeof payload === "object" && payload !== null && "details" in payload
            ? String((payload as { details: unknown }).details ?? "")
            : "";
        const base = normalizeApiError(err, "Could not create team. Please try again.");
        setCreateTeamError(details ? `${base} (${details})` : base);
        return;
      }
      const body = payload as {
        workspaceId: string;
        role: string;
        name: string;
        slug: string;
        visibility: string;
        isSandbox: boolean;
        inviteCode?: string | null;
      };
      setLastCreatedInvite(newTeamVisibility === "PRIVATE" && body.inviteCode ? String(body.inviteCode) : null);
      setNewTeamName("");
      setNewTeamVisibility("PUBLIC");
      setIsCreateTeamDialogOpen(false);

      const createdSummary: WorkspaceSummary = {
        workspaceId: body.workspaceId,
        name: body.name,
        slug: body.slug,
        role: body.role === "ADMIN" ? "ADMIN" : "MEMBER",
        visibility: (body.visibility === "PRIVATE" ? "PRIVATE" : "PUBLIC") as WorkspaceVisibility,
        isSandbox: Boolean(body.isSandbox),
        inviteCode:
          body.role === "ADMIN" && body.visibility === "PRIVATE" && body.inviteCode
            ? String(body.inviteCode)
            : undefined
      };
      setWorkspaces((prev) => {
        const rest = prev.filter((w) => w.workspaceId !== createdSummary.workspaceId);
        return [createdSummary, ...rest];
      });
      setWorkspaceId(body.workspaceId);
      setTasks([]);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      await refreshMemberships(body.workspaceId);
    } catch {
      setCreateTeamError("Network error. Please try again.");
    } finally {
      setCreateTeamBusy(false);
    }
  }

  const currentWorkspace = useMemo(
    () => workspaces.find((w) => w.workspaceId === workspaceId),
    [workspaces, workspaceId]
  );

  function closeCreateTeamDialog() {
    setIsCreateTeamDialogOpen(false);
    setCreateTeamError("");
  }

  return (
    <main className="app-page min-h-screen">
      <div className="app-backdrop" aria-hidden />
      <div className="app-grid-bg" aria-hidden />
      <section className="relative mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {workspaces.length === 0 ? (
          <OnboardingView
            userName={userName}
            inviteCodeInput={inviteCodeInput}
            onInviteCodeChange={setInviteCodeInput}
            onJoinWithInviteCode={async () => {
              const code = inviteCodeInput.trim();
              if (!code) return;
              const res = await fetch("/api/workspaces/join-invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inviteCode: code })
              });
              if (!res.ok) return;
              setInviteCodeInput("");
              await refreshMemberships();
            }}
            discoverTeams={discoverTeams}
            onJoinPublicTeam={async (id) => {
              const res = await fetch("/api/workspaces/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workspaceId: id })
              });
              if (!res.ok) return;
              await refreshMemberships();
            }}
            onOpenCreateTeam={() => {
              setCreateTeamError("");
              setIsCreateTeamDialogOpen(true);
            }}
            lastCreatedInvite={lastCreatedInvite}
            onCreateSandbox={async () => {
              const res = await fetch("/api/workspaces/sandbox", { method: "POST" });
              if (!res.ok) return;
              await refreshMemberships();
            }}
          />
        ) : null}

        {workspaces.length > 0 ? (
          <>
            <DashboardWorkspaceHeader
              userName={userName}
              workspaces={workspaces}
              workspaceId={workspaceId}
              onWorkspaceIdChange={setWorkspaceId}
              currentWorkspace={currentWorkspace}
              onVisibilityChange={async (visibility) => {
                const res = await fetch(`/api/workspaces/${workspaceId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ visibility })
                });
                if (!res.ok) return;
                await refreshMemberships();
              }}
              onRegenerateInvite={async () => {
                const res = await fetch(`/api/workspaces/${workspaceId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ regenerateInvite: true })
                });
                if (!res.ok) return;
                await refreshMemberships();
              }}
              stats={stats}
              newTaskTitle={newTaskTitle}
              onNewTaskTitleChange={setNewTaskTitle}
              onCreateTask={async (event) => {
                event.preventDefault();
                if (!workspaceId || !newTaskTitle.trim()) return;
                const response = await fetch("/api/tasks", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    workspaceId,
                    title: newTaskTitle.trim()
                  })
                });
                if (!response.ok) return;
                const task = (await response.json()) as TaskItem;
                setTasks((prev) => [...prev, task]);
                setNewTaskTitle("");
              }}
            />

            <KanbanBoard
              tasks={tasks}
              workspaceId={workspaceId}
              onTaskSelect={setSelectedTask}
              onTasksChange={setTasks}
            />
            <CalendarView tasks={tasks} onTaskSelect={setSelectedTask} />
          </>
        ) : null}
      </section>

      {selectedTask ? (
        <TaskDetailModal
          task={selectedTask}
          workspaceId={workspaceId}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={(updated) => {
            setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)));
            setSelectedTask(updated);
          }}
        />
      ) : null}

      {isCreateTeamDialogOpen ? (
        <CreateTeamDialog
          teamName={newTeamName}
          onTeamNameChange={setNewTeamName}
          visibility={newTeamVisibility}
          onVisibilityChange={setNewTeamVisibility}
          busy={createTeamBusy}
          error={createTeamError}
          onClose={closeCreateTeamDialog}
          onSubmit={handleCreateTeam}
        />
      ) : null}
    </main>
  );
}
