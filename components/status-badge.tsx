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
    className: "bg-success/15 text-success",
  },
  inactive: {
    label: "Neaktiven",
    className: "bg-muted-foreground/15 text-muted-foreground",
  },
  pending: {
    label: "V postopku",
    className: "bg-warning/15 text-warning",
  },
  upcoming: {
    label: "Prihajajoč",
    className: "bg-info/15 text-info",
  },
  ongoing: {
    label: "V teku",
    className: "bg-info/15 text-info",
  },
  completed: {
    label: "Zaključen",
    className: "bg-success/15 text-success",
  },
  cancelled: {
    label: "Odpovedan",
    className: "bg-destructive/15 text-destructive",
  },
  registered: {
    label: "Prijavljen",
    className: "bg-warning/15 text-warning",
  },
  confirmed: {
    label: "Potrjen",
    className: "bg-success/15 text-success",
  },
  attended: {
    label: "Udeležen",
    className: "bg-info/15 text-info",
  },
};

export function StatusBadge({ status }: { status: StatusKind }) {
  const config = statusConfig[status];

  return (
    <Badge className={`rounded-full border-0 px-3 py-1 text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}
