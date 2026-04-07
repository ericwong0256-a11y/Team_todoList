type Props = {
  label: string;
  value: number;
};

export function StatCard({ label, value }: Props) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </article>
  );
}
