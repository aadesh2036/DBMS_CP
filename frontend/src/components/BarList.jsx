function BarList({
  title,
  items,
  labelKey,
  valueKey,
  emptyText,
  labelMax = 42,
}) {
  const values = items.map((item) => Number(item[valueKey]) || 0);
  const maxValue = Math.max(...values, 0);

  return (
    <div className="panel-card">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <ul className="bar-list">
          {items.map((item) => {
            const value = Number(item[valueKey]) || 0;
            const width = maxValue ? (value / maxValue) * 100 : 0;
            const label = String(item[labelKey] || "");
            const shortLabel =
              label.length > labelMax
                ? `${label.slice(0, labelMax - 1)}...`
                : label;
            const key =
              item.id || item.user_id || item.post_id || `${shortLabel}-${value}`;

            return (
              <li key={key}>
                <div className="bar-label">{shortLabel}</div>
                <div className="bar-row">
                  <div className="bar-fill" style={{ width: `${width}%` }} />
                  <span className="bar-value">{value}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default BarList;
