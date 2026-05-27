import { Badge } from "@/components/ui/badge";

type StatusKind =
  | "active"
  | "inactive"
  | "pending"
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "registered"
  | "confirmed"
  | "attended";

const statusConfig: Record<StatusKind, { label: string; className: string }> = {
  active: {
    label: "Aktiven",
    className: "bg-emerald-100 text-emerald-700",
  },
  inactive: {
    label: "Neaktiven",
    className: "bg-slate-100 text-slate-700",
  },
  pending: {
    label: "V postopku",
    className: "bg-amber-100 text-amber-800",
  },
  upcoming: {
    label: "Prihajajoč",
    className: "bg-sky-100 text-sky-800",
  },
  ongoing: {
    label: "V teku",
    className: "bg-violet-100 text-violet-800",
  },
  completed: {
    label: "Zaključen",
    className: "bg-emerald-100 text-emerald-700",
  },
  cancelled: {
    label: "Odpovedan",
    className: "bg-rose-100 text-rose-700",
  },
  registered: {
    label: "Prijavljen",
    className: "bg-amber-100 text-amber-800",
  },
  confirmed: {
    label: "Potrjen",
    className: "bg-emerald-100 text-emerald-700",
  },
  attended: {
    label: "Udeležen",
    className: "bg-sky-100 text-sky-700",
  },
};

export function StatusBadge({ status }: { status: StatusKind }) {
  const config = statusConfig[status];

  return (
    <Badge className={`rounded-full border-0 px-3 py-1 text-xs font-semibold ${config.className}`}>
      {config.label}
    </Badge>
  );
}
