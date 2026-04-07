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
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <h2 className="mb-4 text-xl font-semibold">Calendar View</h2>
      <div className="grid gap-2">
        {datedTasks.length === 0 ? (
          <p className="text-sm text-slate-400">No scheduled tasks yet.</p>
        ) : (
          datedTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onTaskSelect(task)}
              className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-left hover:bg-slate-700"
            >
              <span>{task.title}</span>
              <span className="text-sm text-slate-300">{format(new Date(task.dueDate!), "MMM dd, yyyy")}</span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
