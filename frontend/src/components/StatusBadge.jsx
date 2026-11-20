import { STATUS_CLASSES, STATUS_LABELS } from "../utils/status";

function StatusBadge({ status }) {
  return (
    <span className={STATUS_CLASSES[status] ?? "badge"}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default StatusBadge;