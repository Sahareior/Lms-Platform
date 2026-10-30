// ─── Progress Delta Badge ──────────────────────────────────
export default function DeltaBadge({
  delta,
  suffix = '%',
  invert = false,
}: {
  delta: number | null;
  suffix?: string;
  invert?: boolean;
}) {
  if (delta === null || delta === 0) return null;
  const positive = invert ? delta < 0 : delta > 0;
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
        positive
          ? 'text-[#00E5B3] bg-[#00E5B3]/10 border-[#00E5B3]/30'
          : 'text-[#EB5757] bg-[#EB5757]/10 border-[#EB5757]/30'
      }`}
    >
      {up ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}
      {suffix}
    </span>
  );
}
