import { STATUS_LABELS } from "@/lib/data";

const dotColor: Record<string, string> = {
  pending: "var(--status-pending)",
  approved: "var(--status-approved)",
  rejected: "var(--status-rejected)",
};

export function StatusBadge({ status }: { status: string }) {
  const info = STATUS_LABELS[status] ?? { label: status, tone: "pending" };

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase">
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: dotColor[info.tone] }}
      />
      {info.label}
    </span>
  );
}
