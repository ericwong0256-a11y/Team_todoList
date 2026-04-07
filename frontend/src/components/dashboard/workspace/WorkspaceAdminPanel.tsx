import type { WorkspaceSummary, WorkspaceVisibility } from "@/types/domain";

type Props = {
  workspace: WorkspaceSummary;
  onVisibilityChange: (visibility: WorkspaceVisibility) => void | Promise<void>;
  onRegenerateInvite: () => void | Promise<void>;
};

export function WorkspaceAdminPanel({ workspace, onVisibilityChange, onRegenerateInvite }: Props) {
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-3 text-slate-300">
        <span className="rounded bg-slate-800 px-2 py-0.5 text-xs">
          {workspace.isSandbox ? "Personal sandbox" : "Team workspace"}
        </span>
        {workspace.role === "ADMIN" ? (
          <label className="flex items-center gap-2">
            <span className="text-slate-400">Visibility</span>
            <select
              className="rounded border border-slate-600 bg-slate-800 px-2 py-1"
              value={workspace.visibility}
              onChange={(event) => onVisibilityChange(event.target.value as WorkspaceVisibility)}
            >
              <option value="PUBLIC">Public (discoverable)</option>
              <option value="PRIVATE">Private (invite only)</option>
            </select>
          </label>
        ) : (
          <span className="text-slate-400">Visibility: {workspace.visibility}</span>
        )}
      </div>
      {workspace.role === "ADMIN" && workspace.visibility === "PRIVATE" ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400">Invite code</span>
          <code className="rounded bg-slate-800 px-2 py-1 font-mono text-amber-200">
            {workspace.inviteCode ?? "—"}
          </code>
          <button
            type="button"
            className="rounded border border-slate-600 px-2 py-1 text-xs hover:bg-slate-800"
            onClick={() => {
              if (workspace.inviteCode) {
                void navigator.clipboard.writeText(workspace.inviteCode);
              }
            }}
          >
            Copy
          </button>
          <button
            type="button"
            className="rounded border border-slate-600 px-2 py-1 text-xs hover:bg-slate-800"
            onClick={() => void onRegenerateInvite()}
          >
            New code
          </button>
        </div>
      ) : null}
    </div>
  );
}
