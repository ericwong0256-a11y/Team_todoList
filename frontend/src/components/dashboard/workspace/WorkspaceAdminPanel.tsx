import type { WorkspaceSummary, WorkspaceVisibility } from "@/types/domain";

type Props = {
  workspace: WorkspaceSummary;
  onVisibilityChange: (visibility: WorkspaceVisibility) => void | Promise<void>;
  onRegenerateInvite: () => void | Promise<void>;
};

export function WorkspaceAdminPanel({ workspace, onVisibilityChange, onRegenerateInvite }: Props) {
  return (
    <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-zinc-800/90 bg-zinc-950/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
          {workspace.isSandbox ? "Personal sandbox" : "Team workspace"}
        </span>
        {workspace.role === "ADMIN" && !workspace.isSandbox ? (
          <span className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300/95">
            Team manager
          </span>
        ) : null}
        {workspace.role === "ADMIN" ? (
          <label className="ml-auto flex flex-wrap items-center gap-2 text-sm text-zinc-300">
            <span className="text-zinc-500">Visibility</span>
            <select
              className="app-select py-1.5 text-xs"
              value={workspace.visibility}
              onChange={(event) => onVisibilityChange(event.target.value as WorkspaceVisibility)}
            >
              <option value="PUBLIC">Public (discoverable)</option>
              <option value="PRIVATE">Private (invite only)</option>
            </select>
          </label>
        ) : (
          <span className="text-sm text-zinc-500">Visibility: {workspace.visibility}</span>
        )}
      </div>
      {workspace.role === "ADMIN" && workspace.visibility === "PRIVATE" ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800/80 pt-4">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Invite code</span>
          <code className="rounded-lg border border-zinc-700/80 bg-zinc-900/80 px-2.5 py-1 font-mono text-sm text-amber-200/95">
            {workspace.inviteCode ?? "—"}
          </code>
          <button
            type="button"
            className="app-btn-ghost py-1.5 text-xs"
            onClick={() => {
              if (workspace.inviteCode) {
                void navigator.clipboard.writeText(workspace.inviteCode);
              }
            }}
          >
            Copy
          </button>
          <button type="button" className="app-btn-ghost py-1.5 text-xs" onClick={() => void onRegenerateInvite()}>
            New code
          </button>
        </div>
      ) : null}
    </div>
  );
}
