type Props = {
  onCreateSandbox: () => void | Promise<void>;
};

export function SandboxSkipRow({ onCreateSandbox }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
      <p className="text-sm text-slate-400">Not ready to join a team? Use a personal sandbox.</p>
      <button
        type="button"
        className="rounded border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
        onClick={() => void onCreateSandbox()}
      >
        Skip for now — personal sandbox
      </button>
    </div>
  );
}
