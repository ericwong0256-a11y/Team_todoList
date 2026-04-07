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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <article className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Create a new team</h3>
            <p className="mt-1 text-sm text-slate-400">
              Invite your teammates, manage visibility, and start collaborating in seconds.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md border border-slate-600 px-3 py-1.5 text-sm hover:bg-slate-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="create-team-name">
              Team name
            </label>
            <input
              id="create-team-name"
              autoFocus
              value={teamName}
              onChange={(event) => onTeamNameChange(event.target.value)}
              placeholder="e.g. Product Engineering"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 outline-none ring-violet-400 transition focus:ring-2"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm text-slate-300">Visibility</legend>
            <div className="grid gap-2 md:grid-cols-2">
              <button
                type="button"
                onClick={() => onVisibilityChange("PUBLIC")}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                  visibility === "PUBLIC"
                    ? "border-violet-400 bg-violet-500/15 text-violet-100"
                    : "border-slate-700 bg-slate-800/70 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <p className="font-medium">Public</p>
                <p className="text-xs text-slate-400">Visible in team discovery.</p>
              </button>
              <button
                type="button"
                onClick={() => onVisibilityChange("PRIVATE")}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                  visibility === "PRIVATE"
                    ? "border-violet-400 bg-violet-500/15 text-violet-100"
                    : "border-slate-700 bg-slate-800/70 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <p className="font-medium">Private</p>
                <p className="text-xs text-slate-400">Join by invite code only.</p>
              </button>
            </div>
          </fieldset>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
            <button
              type="button"
              className="rounded border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy ? "Creating..." : "Create team"}
            </button>
          </div>
        </form>
      </article>
    </div>
  );
}
