import { CATEGORY_COLORS } from '../utils.js';

export default function CategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] || '#64748b';
  return (
    <span className="badge" style={{ '--badge-color': color }}>
      <span className="badge-dot" />
      {category}
    </span>
  );
}
