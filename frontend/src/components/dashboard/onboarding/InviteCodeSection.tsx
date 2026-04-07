type Props = {
  value: string;
  onChange: (value: string) => void;
  onJoin: () => void | Promise<void>;
};

export function InviteCodeSection({ value, onChange, onJoin }: Props) {
  return (
    <div className="space-y-4 rounded-lg border border-slate-700 p-4">
      <h3 className="font-semibold">Have an invite code?</h3>
      <p className="text-sm text-slate-400">Join a private team with the code your admin shared.</p>
      <div className="flex flex-wrap gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="INVITE-CODE"
          className="min-w-[200px] flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-sm uppercase"
        />
        <button
          type="button"
          className="rounded bg-violet-600 px-4 py-2 text-sm hover:bg-violet-500"
          onClick={() => void onJoin()}
        >
          Join with code
        </button>
      </div>
    </div>
  );
}
