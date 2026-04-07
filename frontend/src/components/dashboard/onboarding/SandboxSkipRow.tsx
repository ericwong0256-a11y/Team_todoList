type Props = {
  onCreateSandbox: () => void | Promise<void>;
};

export function SandboxSkipRow({ onCreateSandbox }: Props) {
  return (
    <div className="app-divider flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-500">Prefer to explore alone first? Spin up a personal sandbox.</p>
      <button type="button" className="app-btn-ghost shrink-0 text-sm" onClick={() => void onCreateSandbox()}>
        Use personal sandbox
      </button>
    </div>
  );
}
