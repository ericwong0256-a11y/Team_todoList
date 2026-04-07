"use client";

import type { TaskItem, TaskStatus } from "@/types/domain";
import { getSocket } from "@/lib/realtime";

const columns: { status: TaskStatus; label: string }[] = [
  { status: "TODO", label: "To Do" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "REVIEW", label: "Review" },
  { status: "DONE", label: "Done" }
];

type Props = {
  tasks: TaskItem[];
  workspaceId: string;
  onTaskSelect: (task: TaskItem) => void;
  onTasksChange: (tasks: TaskItem[]) => void;
};

export function KanbanBoard({ tasks, workspaceId, onTaskSelect, onTasksChange }: Props) {
  async function moveTask(task: TaskItem, status: TaskStatus) {
    const optimistic = tasks.map((item) => (item.id === task.id ? { ...item, status } : item));
    onTasksChange(optimistic);
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, status })
    });
    if (response.ok) {
      const updated = await response.json();
      getSocket().emit("task:updated", { workspaceId, payload: updated });
    }
  }

  return (
    <section className="app-card overflow-hidden">
      <div className="border-b border-zinc-800/80 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-50">Task board</h2>
        <p className="mt-0.5 text-xs text-zinc-500">Drag-free moves — use actions on each card to change status.</p>
      </div>
      <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-4">
        {columns.map((column) => (
          <div key={column.status} className="flex flex-col rounded-xl border border-zinc-800/70 bg-zinc-950/40">
            <div className="border-b border-zinc-800/60 px-3 py-2.5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{column.label}</h3>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-2">
              {tasks
                .filter((task) => task.status === column.status)
                .map((task) => (
                  <article
                    key={task.id}
                    className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3 shadow-sm transition hover:border-zinc-700/90"
                  >
                    <button className="w-full text-left" type="button" onClick={() => onTaskSelect(task)}>
                      <p className="font-medium leading-snug text-zinc-100">{task.title}</p>
                      <p className="mt-1.5 text-[11px] text-zinc-500">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                      </p>
                    </button>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {columns
                        .filter((x) => x.status !== task.status)
                        .map((target) => (
                          <button
                            key={target.status}
                            type="button"
                            onClick={() => moveTask(task, target.status)}
                            className="rounded-lg border border-zinc-700/80 bg-zinc-950/60 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400 transition hover:border-cyan-500/30 hover:text-cyan-200/90"
                          >
                            → {target.label}
                          </button>
                        ))}
                    </div>
                  </article>
                ))}
              {tasks.filter((task) => task.status === column.status).length === 0 ? (
                <p className="rounded-lg border border-dashed border-zinc-800/80 px-3 py-6 text-center text-xs text-zinc-600">
                  No tasks
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
