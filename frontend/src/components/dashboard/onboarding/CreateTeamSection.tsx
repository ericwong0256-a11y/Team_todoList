type Props = {
  onOpenCreateDialog: () => void;
  lastCreatedInvite: string | null;
};

export function CreateTeamSection({ onOpenCreateDialog, lastCreatedInvite }: Props) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800/90 bg-zinc-950/25 p-5">
      <div>
        <h3 className="app-section-title">Create a team</h3>
        <p className="app-muted mt-1">
          Launch a dedicated space with roles, realtime updates, and a full task board.
        </p>
      </div>
      <button type="button" className="app-btn-primary w-full sm:w-auto" onClick={onOpenCreateDialog}>
        Create team
      </button>
      {lastCreatedInvite ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95">
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-200/80">Private invite code</span>
          <p className="mt-1 font-mono text-base font-semibold tracking-wide">{lastCreatedInvite}</p>
        </div>
      ) : null}
    </section>
  );
}
