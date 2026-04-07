"use client";

import { useEffect, useMemo, useState } from "react";
import type { TaskItem, WorkspaceSummary } from "@/types/domain";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { CalendarView } from "@/components/calendar/CalendarView";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { getSocket } from "@/lib/realtime";

export function DashboardClient({ userName }: { userName: string }) {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    fetch("/api/workspaces")
      .then((res) => res.json())
      .then((data: WorkspaceSummary[]) => {
        setWorkspaces(data);
        if (data[0]) setWorkspaceId(data[0].workspaceId);
      })
      .catch(() => setWorkspaces([]));
  }, []);

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-8">
      <section className="mx-auto max-w-7xl space-y-6">
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
