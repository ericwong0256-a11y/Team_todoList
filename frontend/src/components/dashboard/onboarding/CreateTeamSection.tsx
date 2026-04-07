type Props = {
  onOpenCreateDialog: () => void;
  lastCreatedInvite: string | null;
};

export function CreateTeamSection({ onOpenCreateDialog, lastCreatedInvite }: Props) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-700 p-4">
      <h3 className="font-semibold">Create your own team</h3>
      <p className="text-sm text-slate-400">
        Launch a dedicated team space with role-based access and real-time collaboration.
      </p>
      <button
        type="button"
        className="rounded bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500"
        onClick={onOpenCreateDialog}
      >
        Create team
      </button>
      {lastCreatedInvite ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
          Private invite code: <span className="font-mono font-semibold">{lastCreatedInvite}</span>
        </div>
      ) : null}
    </section>
  );
}
