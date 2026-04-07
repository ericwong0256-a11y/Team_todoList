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
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <h2 className="mb-4 text-xl font-semibold">Task Board</h2>
      <div className="grid gap-4 lg:grid-cols-4">
        {columns.map((column) => (
          <div key={column.status} className="rounded-xl bg-slate-800/70 p-3">
            <h3 className="mb-3 text-sm font-semibold text-slate-200">{column.label}</h3>
            <div className="space-y-2">
              {tasks
                .filter((task) => task.status === column.status)
                .map((task) => (
                  <article key={task.id} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
                    <button className="w-full text-left" onClick={() => onTaskSelect(task)}>
                      <p className="font-medium">{task.title}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                      </p>
                    </button>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {columns
                        .filter((x) => x.status !== task.status)
                        .map((target) => (
                          <button
                            key={target.status}
                            onClick={() => moveTask(task, target.status)}
                            className="rounded bg-slate-700 px-2 py-1 text-xs hover:bg-slate-600"
                          >
                            Move to {target.label}
                          </button>
                        ))}
                    </div>
                  </article>
                ))}
              {tasks.filter((task) => task.status === column.status).length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-700 p-3 text-xs text-slate-400">No tasks</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
