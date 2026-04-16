import { Link } from 'react-router-dom';
import { Clock, MapPin, Users, Calendar } from 'lucide-react';
import { formatPrice, formatDuration, formatDate } from '../../utils/helpers';
import { CATEGORY_COLORS } from '../../utils/constants';

export default function SessionCard({ session }) {
  const colors = CATEGORY_COLORS[session.category] || CATEGORY_COLORS.other;

  return (
    <Link
      to={`/sessions/${session.id}`}
      className="glass-card block overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {session.image ? (
          <img
            src={session.image}
            alt={session.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center">
            <span className="text-4xl opacity-40">🧘</span>
          </div>
        )}

        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 badge ${colors.bg} ${colors.text} border ${colors.border}`}
        >
          {session.category}
        </span>

        {/* Price badge */}
        <span className="absolute top-3 right-3 badge bg-bg/70 text-accent font-semibold backdrop-blur-sm">
          {formatPrice(session.price, session.currency)}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-heading font-semibold text-text text-base leading-tight line-clamp-2 group-hover:text-primary-light transition-colors">
          {session.title}
        </h3>

        <p className="text-xs text-text-muted">
          by {session.creator_name}
        </p>

        <div className="flex flex-wrap gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(session.date_time)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDuration(session.duration)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <MapPin size={12} />
            {session.location}
          </span>
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              session.is_fully_booked ? 'text-danger' : 'text-success'
            }`}
          >
            <Users size={12} />
            {session.is_fully_booked
              ? 'Full'
              : `${session.available_spots} spots`}
          </span>
        </div>
      </div>
    </Link>
  );
}
