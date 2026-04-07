"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { DiscoverableTeam, TaskItem, WorkspaceSummary, WorkspaceVisibility } from "@/types/domain";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { CalendarView } from "@/components/calendar/CalendarView";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { getSocket } from "@/lib/realtime";
import { CreateTeamDialog } from "@/components/dashboard/onboarding/CreateTeamDialog";
import { OnboardingView } from "@/components/dashboard/onboarding/OnboardingView";
import { DashboardWorkspaceHeader } from "@/components/dashboard/workspace/DashboardWorkspaceHeader";

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
    fetch("/api/workspaces")
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
    fetch("/api/workspaces/discover")
      .then((res) => res.json())
      .then((data) => setDiscoverTeams(Array.isArray(data) ? data : []))
      .catch(() => setDiscoverTeams([]));
  }, [workspaces.length]);

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/tasks?workspaceId=${workspaceId}`)
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

  async function refreshMemberships() {
    const res = await fetch("/api/workspaces");
    const data = await res.json();
    if (Array.isArray(data)) {
      const normalized = data.map((w) => ({
        ...w,
        visibility: w.visibility ?? "PUBLIC",
        isSandbox: w.isSandbox ?? false
      }));
      setWorkspaces(normalized);
      if (normalized[0]) setWorkspaceId(normalized[0].workspaceId);
    }
  }

  async function handleCreateTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newTeamName.trim();
    if (!name) {
      setCreateTeamError("Team name is required.");
      return;
    }
    setCreateTeamBusy(true);
    setCreateTeamError("");
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, visibility: newTeamVisibility })
    });
    if (!res.ok) {
      setCreateTeamBusy(false);
      setCreateTeamError("Could not create team. Please try again.");
      return;
    }
    const body = await res.json();
    setLastCreatedInvite(newTeamVisibility === "PRIVATE" && body.inviteCode ? String(body.inviteCode) : null);
    setNewTeamName("");
    setNewTeamVisibility("PUBLIC");
    setCreateTeamBusy(false);
    setIsCreateTeamDialogOpen(false);
    await refreshMemberships();
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
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-8">
      <section className="mx-auto max-w-7xl space-y-6">
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
