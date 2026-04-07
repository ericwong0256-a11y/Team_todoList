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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <article className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Task Details</h3>
          <button onClick={onClose} className="rounded bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700">
            Close
          </button>
        </div>
        <div className="space-y-3">
          <label className="block text-sm text-slate-300">Title</label>
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded bg-slate-800 p-3" />
          <label className="block text-sm text-slate-300">Description</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="h-28 w-full rounded bg-slate-800 p-3"
          />
          <button onClick={saveTask} className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-500">
            Save task
          </button>
        </div>
        <section className="mt-6">
          <h4 className="mb-2 font-semibold">Comments</h4>
          <div className="space-y-2">
            {comments.map((item) => (
              <div key={item.id} className="rounded bg-slate-800 p-3">
                <p className="text-sm">{item.body}</p>
                <p className="mt-1 text-xs text-slate-400">{item.author.name}</p>
              </div>
            ))}
          </div>
          <form onSubmit={addComment} className="mt-3 flex gap-2">
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Write a comment"
              className="flex-1 rounded bg-slate-800 p-2"
            />
            <button type="submit" className="rounded bg-emerald-600 px-3 hover:bg-emerald-500">
              Add
            </button>
          </form>
        </section>
      </article>
    </div>
  );
}
