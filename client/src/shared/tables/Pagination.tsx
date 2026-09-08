type PaginationProps = {
  current?: number;
  total?: number;
};

export function Pagination({
  current = 1,
  total = 1,
}: PaginationProps) {
  return (
    <div className="pagination">
      <button type="button">‹</button>
      <span>{current} / {total}</span>
      <button type="button">›</button>
    </div>
  );
}
