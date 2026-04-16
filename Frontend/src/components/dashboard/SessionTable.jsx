import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye } from 'lucide-react';
import { formatDate, formatPrice } from '../../utils/helpers';
import { CATEGORY_COLORS } from '../../utils/constants';

export default function SessionTable({ sessions, onDelete, deleteLoading }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-lg">No sessions yet</p>
        <p className="text-sm mt-1">Create your first session to get started!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider">
            <th className="text-left py-3 px-4">Session</th>
            <th className="text-left py-3 px-4 hidden md:table-cell">Category</th>
            <th className="text-left py-3 px-4 hidden sm:table-cell">Date</th>
            <th className="text-left py-3 px-4">Price</th>
            <th className="text-left py-3 px-4">Spots</th>
            <th className="text-right py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => {
            const colors =
              CATEGORY_COLORS[session.category] || CATEGORY_COLORS.other;
            return (
              <tr
                key={session.id}
                className="border-b border-border/50 hover:bg-surface-light/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <p className="font-medium text-text line-clamp-1">
                    {session.title}
                  </p>
                  <p className="text-xs text-text-dim md:hidden capitalize">
                    {session.category}
                  </p>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <span
                    className={`badge ${colors.bg} ${colors.text} border ${colors.border}`}
                  >
                    {session.category}
                  </span>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell text-text-muted">
                  {formatDate(session.date_time)}
                </td>
                <td className="py-3 px-4 text-accent font-medium">
                  {formatPrice(session.price, session.currency)}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`text-xs font-medium ${
                      session.is_fully_booked ? 'text-danger' : 'text-success'
                    }`}
                  >
                    {session.available_spots} left
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/sessions/${session.id}`}
                      className="p-2 rounded-lg hover:bg-surface-lighter text-text-muted hover:text-text transition-colors"
                      title="View"
                    >
                      <Eye size={15} />
                    </Link>
                    <Link
                      to={`/creator/sessions/${session.id}/edit`}
                      className="p-2 rounded-lg hover:bg-surface-lighter text-text-muted hover:text-primary-light transition-colors"
                      title="Edit"
                    >
                      <Edit size={15} />
                    </Link>
                    <button
                      onClick={() => onDelete(session.id)}
                      disabled={deleteLoading}
                      className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
