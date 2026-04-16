import { formatDate } from '../../utils/helpers';

export default function BookingTable({ bookings }) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-lg">No bookings yet</p>
        <p className="text-sm mt-1">Bookings for your sessions will appear here.</p>
      </div>
    );
  }

  const statusColors = {
    confirmed: 'bg-success/15 text-success border-success/20',
    cancelled: 'bg-danger/15 text-danger border-danger/20',
    completed: 'bg-primary/15 text-primary-light border-primary/20',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider">
            <th className="text-left py-3 px-4">User</th>
            <th className="text-left py-3 px-4">Session</th>
            <th className="text-left py-3 px-4 hidden sm:table-cell">Booked At</th>
            <th className="text-left py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr
              key={booking.id}
              className="border-b border-border/50 hover:bg-surface-light/30 transition-colors"
            >
              <td className="py-3 px-4">
                <p className="font-medium text-text">{booking.user_name}</p>
              </td>
              <td className="py-3 px-4">
                <p className="text-text-muted line-clamp-1">
                  {booking.session?.title}
                </p>
              </td>
              <td className="py-3 px-4 hidden sm:table-cell text-text-muted">
                {formatDate(booking.booked_at)}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`badge border text-xs ${statusColors[booking.status]}`}
                >
                  {booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
