"use client";

import { format } from "date-fns";
import type { TaskItem } from "@/types/domain";

export function CalendarView({
  tasks,
  onTaskSelect
}: {
  tasks: TaskItem[];
  onTaskSelect: (task: TaskItem) => void;
}) {
  const datedTasks = tasks
    .filter((task) => task.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  return (
    <section className="app-card overflow-hidden">
      <div className="border-b border-zinc-800/80 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-50">Upcoming</h2>
        <p className="mt-0.5 text-xs text-zinc-500">Tasks with a due date, soonest first.</p>
      </div>
      <div className="space-y-2 p-5 sm:p-6">
        {datedTasks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-800/80 bg-zinc-950/40 px-4 py-10 text-center text-sm text-zinc-500">
            No scheduled tasks with a due date yet.
          </p>
        ) : (
          datedTasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onTaskSelect(task)}
              className="flex w-full items-center justify-between gap-4 rounded-xl border border-zinc-800/80 bg-zinc-950/35 px-4 py-3 text-left transition hover:border-zinc-700/90 hover:bg-zinc-900/40"
            >
              <span className="font-medium text-zinc-100">{task.title}</span>
              <span className="shrink-0 rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-2.5 py-1 text-xs font-medium text-zinc-400">
                {format(new Date(task.dueDate!), "MMM d, yyyy")}
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
