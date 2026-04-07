"use client";

import { FormEvent, useEffect, useState } from "react";
import type { TaskItem } from "@/types/domain";
import { getSocket } from "@/lib/realtime";

type CommentItem = {
  id: string;
  body: string;
  author: { id: string; name: string };
  createdAt: string;
};

type Props = {
  task: TaskItem;
  workspaceId: string;
  onClose: () => void;
  onTaskUpdated: (task: TaskItem) => void;
};

export function TaskDetailModal({ task, workspaceId, onClose, onTaskUpdated }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetch(`/api/tasks/${task.id}/comments?workspaceId=${workspaceId}`)
      .then((res) => res.json())
      .then((data: CommentItem[]) => setComments(data))
      .catch(() => setComments([]));
  }, [task.id, workspaceId]);

  async function saveTask() {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, title, description })
    });
    if (!response.ok) return;
    const updated = (await response.json()) as TaskItem;
    onTaskUpdated({ ...task, ...updated });
    getSocket().emit("task:updated", { workspaceId, payload: updated });
  }

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!comment.trim()) return;
    const response = await fetch(`/api/tasks/${task.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, body: comment.trim() })
    });
    if (!response.ok) return;
    const created = (await response.json()) as CommentItem;
    setComments((prev) => [...prev, created]);
    setComment("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 p-4 backdrop-blur-sm">
      <article className="app-card-elevated max-h-[85vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-50">Task details</h3>
          <button type="button" className="app-btn-ghost px-3 py-1.5 text-xs" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="app-label" htmlFor="task-title">
              Title
            </label>
            <input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label" htmlFor="task-desc">
              Description
            </label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="app-input min-h-[7rem] resize-y"
            />
          </div>
          <button type="button" className="app-btn-primary w-full sm:w-auto" onClick={saveTask}>
            Save changes
          </button>
        </div>

        <section className="app-divider mt-8 pt-8">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Comments</h4>
          <div className="mt-4 space-y-2">
            {comments.map((item) => (
              <div key={item.id} className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3">
                <p className="text-sm text-zinc-200">{item.body}</p>
                <p className="mt-1.5 text-[11px] text-zinc-500">{item.author.name}</p>
              </div>
            ))}
          </div>
          <form onSubmit={addComment} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Write a comment…"
              className="app-input flex-1"
            />
            <button type="submit" className="app-btn-secondary shrink-0 sm:px-6">
              Add
            </button>
          </form>
        </section>
      </article>
    </div>
  );
}
