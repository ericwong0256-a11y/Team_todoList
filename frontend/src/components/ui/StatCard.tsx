type Props = {
  label: string;
  value: number;
  tone?: "cyan" | "violet" | "emerald";
};

const toneBar = {
  cyan: "from-cyan-500 to-cyan-400",
  violet: "from-violet-500 to-violet-400",
  emerald: "from-emerald-500 to-emerald-400"
};

export function StatCard({ label, value, tone = "cyan" }: Props) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/35 p-5 shadow-lg shadow-black/25">
      <div
        className={`absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b opacity-90 ${toneBar[tone]}`}
        aria-hidden
      />
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-zinc-50">{value}</p>
    </article>
  );
}
