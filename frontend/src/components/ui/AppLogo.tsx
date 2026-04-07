type Props = {
  size?: "sm" | "md";
};

export function AppLogo({ size = "md" }: Props) {
  const box = size === "sm" ? "h-8 w-8 rounded-lg text-xs" : "h-10 w-10 rounded-xl text-sm";
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-cyan-400 to-cyan-600 font-bold text-zinc-950 shadow-lg shadow-cyan-950/50 ${box}`}
      >
        T
      </div>
      <div className="leading-tight">
        <span className="text-base font-semibold tracking-tight text-zinc-100">Todo<span className="text-zinc-500">List</span></span>
        {size === "md" ? <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">Workspace</p> : null}
      </div>
    </div>
  );
}
