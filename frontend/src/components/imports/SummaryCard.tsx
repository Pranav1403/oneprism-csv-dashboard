interface SummaryCardProps {
  title: string;
  value: number;
  type: "total" | "valid" | "invalid" | "duplicate";
}

function SummaryCard({
  title,
  value,
  type,
}: SummaryCardProps) {
  return (
    <div
      className={`summary-card summary-${type}`}
    >
      <p className="summary-title">
        {title}
      </p>

      <h2 className="summary-value">
        {value}
      </h2>
    </div>
  );
}

export default SummaryCard;