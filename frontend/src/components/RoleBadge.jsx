export function RoleBadge({ role, color = "#2cc0ff" }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border"
      style={{
        borderColor: color,
        color: color,
        background: color + "1f",
      }}
      data-testid="member-role-badge"
    >
      {role}
    </span>
  );
}
