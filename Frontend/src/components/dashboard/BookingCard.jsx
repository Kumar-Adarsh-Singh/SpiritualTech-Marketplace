import { Calendar, Clock, MapPin, XCircle, CreditCard } from 'lucide-react';
import { formatDate, formatDuration, formatPrice } from '../../utils/helpers';
import { CATEGORY_COLORS } from '../../utils/constants';

export default function BookingCard({ booking, onCancel, onPay, cancelLoading }) {
  const session = booking.session;
  const colors = CATEGORY_COLORS[session?.category] || CATEGORY_COLORS.other;
  const isConfirmed = booking.status === 'confirmed';
  const isCancelled = booking.status === 'cancelled';

  const statusColors = {
    confirmed: 'bg-success/15 text-success border-success/20',
    cancelled: 'bg-danger/15 text-danger border-danger/20',
    completed: 'bg-primary/15 text-primary-light border-primary/20',
  };

  return (
    <div className={`glass-card p-5 ${isCancelled ? 'opacity-60' : ''}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Session image */}
        <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
          {session?.image ? (
            <img
              src={session.image}
              alt={session.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center">
              <span className="text-2xl opacity-40">🧘</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-heading font-semibold text-text">
                {session?.title}
              </h4>
              <p className="text-xs text-text-muted">by {session?.creator_name}</p>
            </div>
            <span
              className={`badge border text-xs ${statusColors[booking.status]}`}
            >
              {booking.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(session?.date_time)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDuration(session?.duration)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {session?.location}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <span className={`badge ${colors.bg} ${colors.text} border ${colors.border}`}>
              {session?.category}
            </span>
            <span className="text-sm font-semibold text-accent">
              {formatPrice(session?.price, session?.currency)}
            </span>
          </div>

          {/* Actions */}
          {isConfirmed && (
            <div className="flex items-center gap-2 pt-2">
              {parseFloat(session?.price) > 0 && onPay && (
                <button onClick={() => onPay(booking)} className="btn-accent text-xs py-1.5 px-3">
                  <CreditCard size={14} />
                  Pay Now
                </button>
              )}
              <button
                onClick={() => onCancel(booking.id)}
                disabled={cancelLoading}
                className="btn-danger text-xs py-1.5 px-3"
              >
                <XCircle size={14} />
                {cancelLoading ? 'Cancelling...' : 'Cancel'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
