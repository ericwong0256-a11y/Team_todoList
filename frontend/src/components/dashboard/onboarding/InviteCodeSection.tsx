type Props = {
  value: string;
  onChange: (value: string) => void;
  onJoin: () => void | Promise<void>;
};

export function InviteCodeSection({ value, onChange, onJoin }: Props) {
  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800/90 bg-zinc-950/35 p-5">
      <div>
        <h3 className="app-section-title">Have an invite code?</h3>
        <p className="app-muted mt-1">Join a private team with the code your admin shared.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="INVITE-CODE"
          className="app-input min-w-0 flex-1 font-mono text-sm uppercase tracking-wide"
        />
        <button type="button" className="app-btn-accent shrink-0 sm:px-6" onClick={() => void onJoin()}>
          Join with code
        </button>
      </div>
    </div>
  );
}
