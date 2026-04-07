"use client";

import { useEffect, useMemo, useState } from "react";
import type { TaskItem, WorkspaceSummary, WorkspaceVisibility } from "@/types/domain";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { CalendarView } from "@/components/calendar/CalendarView";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { getSocket } from "@/lib/realtime";

export function DashboardClient({ userName }: { userName: string }) {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [discoverTeams, setDiscoverTeams] = useState<
    { workspaceId: string; name: string; slug: string; members: number; visibility: string }[]
  >([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamVisibility, setNewTeamVisibility] = useState<WorkspaceVisibility>("PUBLIC");
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

  const currentWorkspace = useMemo(
    () => workspaces.find((w) => w.workspaceId === workspaceId),
    [workspaces, workspaceId]
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-8">
      <section className="mx-auto max-w-7xl space-y-6">
        {workspaces.length === 0 ? (
          <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <div>
              <h2 className="text-2xl font-semibold">Welcome, {userName}</h2>
              <p className="mt-2 text-slate-300">
                Join an existing team or create your own team to get started.
              </p>
            </div>

            <div className="space-y-4 rounded-lg border border-slate-700 p-4">
              <h3 className="font-semibold">Have an invite code?</h3>
              <p className="text-sm text-slate-400">Join a private team with the code your admin shared.</p>
              <div className="flex flex-wrap gap-2">
                <input
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  placeholder="INVITE-CODE"
                  className="min-w-[200px] flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-sm uppercase"
                />
                <button
                  type="button"
                  className="rounded bg-violet-600 px-4 py-2 text-sm hover:bg-violet-500"
                  onClick={async () => {
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
                >
                  Join with code
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-semibold">Public teams available to join</h3>
                {discoverTeams.length === 0 ? (
                  <p className="text-sm text-slate-400">No available teams yet.</p>
                ) : (
                  discoverTeams.map((team) => (
                    <div key={team.workspaceId} className="rounded-lg border border-slate-700 p-3">
                      <p className="font-medium">{team.name}</p>
                      <p className="text-xs text-slate-400">
                        {team.members} member(s) · {team.slug} · {team.visibility}
                      </p>
                      <button
                        className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm hover:bg-blue-500"
                        onClick={async () => {
                          const res = await fetch("/api/workspaces/join", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ workspaceId: team.workspaceId })
                          });
                          if (!res.ok) return;
                          await refreshMemberships();
                        }}
                      >
                        Join team
                      </button>
                    </div>
                  ))
                )}
              </div>

              <form
                className="space-y-3 rounded-lg border border-slate-700 p-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!newTeamName.trim()) return;
                  const res = await fetch("/api/workspaces", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: newTeamName.trim(),
                      visibility: newTeamVisibility
                    })
                  });
                  if (!res.ok) return;
                  const body = await res.json();
                  setLastCreatedInvite(
                    newTeamVisibility === "PRIVATE" && body.inviteCode ? String(body.inviteCode) : null
                  );
                  setNewTeamName("");
                  setNewTeamVisibility("PUBLIC");
                  await refreshMemberships();
                }}
              >
                <h3 className="font-semibold">Create your own team</h3>
                <input
                  value={newTeamName}
                  onChange={(event) => setNewTeamName(event.target.value)}
                  placeholder="Team name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                />
                <fieldset className="space-y-2 text-sm">
                  <legend className="text-slate-300">Visibility</legend>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="vis"
                      checked={newTeamVisibility === "PUBLIC"}
                      onChange={() => setNewTeamVisibility("PUBLIC")}
                    />
                    Public — listed for others to discover
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="vis"
                      checked={newTeamVisibility === "PRIVATE"}
                      onChange={() => setNewTeamVisibility("PRIVATE")}
                    />
                    Private — invite code only
                  </label>
                </fieldset>
                <button className="rounded bg-emerald-600 px-4 py-2 hover:bg-emerald-500">Create team</button>
                {lastCreatedInvite ? (
                  <p className="text-sm text-amber-300">
                    Save your invite code:{" "}
                    <span className="font-mono font-semibold">{lastCreatedInvite}</span>
                  </p>
                ) : null}
              </form>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <p className="text-sm text-slate-400">Not ready to join a team? Use a personal sandbox.</p>
              <button
                type="button"
                className="rounded border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
                onClick={async () => {
                  const res = await fetch("/api/workspaces/sandbox", { method: "POST" });
                  if (!res.ok) return;
                  await refreshMemberships();
                }}
              >
                Skip for now — personal sandbox
              </button>
            </div>
          </section>
        ) : null}

        {workspaces.length > 0 ? (
          <>
            <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {userName}</h1>
              <p className="mt-2 text-slate-300">Professional collaborative workspace</p>
            </div>
            <select
              value={workspaceId}
              onChange={(event) => setWorkspaceId(event.target.value)}
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
            <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-4 text-sm">
              <div className="flex flex-wrap items-center gap-3 text-slate-300">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs">
                  {currentWorkspace.isSandbox ? "Personal sandbox" : "Team workspace"}
                </span>
                {currentWorkspace.role === "ADMIN" ? (
                  <label className="flex items-center gap-2">
                    <span className="text-slate-400">Visibility</span>
                    <select
                      className="rounded border border-slate-600 bg-slate-800 px-2 py-1"
                      value={currentWorkspace.visibility}
                      onChange={async (event) => {
                        const visibility = event.target.value as WorkspaceVisibility;
                        const res = await fetch(`/api/workspaces/${workspaceId}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ visibility })
                        });
                        if (!res.ok) return;
                        await refreshMemberships();
                      }}
                    >
                      <option value="PUBLIC">Public (discoverable)</option>
                      <option value="PRIVATE">Private (invite only)</option>
                    </select>
                  </label>
                ) : (
                  <span className="text-slate-400">Visibility: {currentWorkspace.visibility}</span>
                )}
              </div>
              {currentWorkspace.role === "ADMIN" && currentWorkspace.visibility === "PRIVATE" ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400">Invite code</span>
                  <code className="rounded bg-slate-800 px-2 py-1 font-mono text-amber-200">
                    {currentWorkspace.inviteCode ?? "—"}
                  </code>
                  <button
                    type="button"
                    className="rounded border border-slate-600 px-2 py-1 text-xs hover:bg-slate-800"
                    onClick={() => {
                      if (currentWorkspace.inviteCode) {
                        void navigator.clipboard.writeText(currentWorkspace.inviteCode);
                      }
                    }}
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    className="rounded border border-slate-600 px-2 py-1 text-xs hover:bg-slate-800"
                    onClick={async () => {
                      const res = await fetch(`/api/workspaces/${workspaceId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ regenerateInvite: true })
                      });
                      if (!res.ok) return;
                      await refreshMemberships();
                    }}
                  >
                    New code
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <StatCard label="Tasks Due" value={stats.total} />
            <StatCard label="In Progress" value={stats.inProgress} />
            <StatCard label="Completed" value={stats.done} />
          </div>
          <form
            className="mt-4 flex gap-2"
            onSubmit={async (event) => {
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
          >
            <input
              value={newTaskTitle}
              onChange={(event) => setNewTaskTitle(event.target.value)}
              placeholder="Create a new task..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
            />
            <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500">Add task</button>
          </form>
            </header>

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
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </article>
  );
}
