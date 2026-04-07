import type { FormEvent } from "react";
import type { WorkspaceVisibility } from "@/types/domain";

type Props = {
  teamName: string;
  onTeamNameChange: (value: string) => void;
  visibility: WorkspaceVisibility;
  onVisibilityChange: (value: WorkspaceVisibility) => void;
  busy: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
};

export function CreateTeamDialog({
  teamName,
  onTeamNameChange,
  visibility,
  onVisibilityChange,
  busy,
  error,
  onClose,
  onSubmit
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 p-4 backdrop-blur-sm">
      <article className="app-card-elevated w-full max-w-xl p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-zinc-50">Create a new team</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
              Choose visibility and invite teammates later from the team dashboard.
            </p>
          </div>
          <button
            type="button"
            className="app-btn-ghost shrink-0 px-3 py-1.5 text-xs"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form className="space-y-5" onSubmit={(e) => void onSubmit(e)}>
          <div>
            <label className="app-label" htmlFor="create-team-name">
              Team name
            </label>
            <input
              id="create-team-name"
              autoFocus
              value={teamName}
              onChange={(event) => onTeamNameChange(event.target.value)}
              placeholder="e.g. Product Engineering"
              className="app-input"
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="app-label">Visibility</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onVisibilityChange("PUBLIC")}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  visibility === "PUBLIC"
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-50 shadow-lg shadow-cyan-950/20"
                    : "border-zinc-800/90 bg-zinc-950/40 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <p className="font-semibold">Public</p>
                <p className="mt-0.5 text-xs text-zinc-500">Listed in team discovery.</p>
              </button>
              <button
                type="button"
                onClick={() => onVisibilityChange("PRIVATE")}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  visibility === "PRIVATE"
                    ? "border-violet-500/50 bg-violet-500/10 text-violet-50 shadow-lg shadow-violet-950/25"
                    : "border-zinc-800/90 bg-zinc-950/40 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <p className="font-semibold">Private</p>
                <p className="mt-0.5 text-xs text-zinc-500">Invite code only.</p>
              </button>
            </div>
          </fieldset>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}

          <div className="app-divider flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" className="app-btn-secondary w-full sm:w-auto" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={busy} className="app-btn-primary w-full min-w-[140px] sm:w-auto">
              {busy ? "Creating…" : "Create team"}
            </button>
          </div>
        </form>
      </article>
    </div>
  );
}
