import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSessions';
import { useCreateBooking } from '../hooks/useBookings';
import { useCreatePaymentOrder, useVerifyPayment } from '../hooks/usePayments';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate, formatDuration, formatPrice, getInitials } from '../utils/helpers';
import { CATEGORY_COLORS, GOOGLE_AUTH_URL } from '../utils/constants';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Globe,
  ArrowLeft,
  CheckCircle,
  CreditCard,
} from 'lucide-react';

export default function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  const { data: session, isLoading, isError } = useSession(id);
  const createBooking = useCreateBooking();
  const createPaymentOrder = useCreatePaymentOrder();
  const verifyPayment = useVerifyPayment();

  const handleBookNow = async () => {
    if (!isAuthenticated) {
      window.location.href = GOOGLE_AUTH_URL;
      return;
    }

    try {
      const res = await createBooking.mutateAsync(session.id);
      const booking = res.data;
      toast.success('Session booked successfully!');

      // If session has a price, initiate payment
      if (parseFloat(session.price) > 0) {
        try {
          const paymentRes = await createPaymentOrder.mutateAsync(booking.id);
          const orderData = paymentRes.data;

          // Open Razorpay checkout
          const options = {
            key: orderData.razorpay_key_id,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'SpiritualTech',
            description: session.title,
            order_id: orderData.order_id,
            handler: async function (response) {
              try {
                await verifyPayment.mutateAsync({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
                toast.success('Payment successful!');
                navigate('/dashboard');
              } catch (err) {
                const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Payment verification failed.';
                toast.error(errorMsg);
              }
            },
            prefill: {
              email: user?.email,
              name: user?.first_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username,
            },
            theme: { color: '#6c5ce7' },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (err) {
          const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Booked but payment could not be initiated.';
          toast.warning(errorMsg);
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg =
        err.response?.data?.session_id?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Failed to book session.';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <p className="text-danger text-lg">Session not found</p>
        <button onClick={() => navigate('/')} className="btn-secondary mt-4">
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>
    );
  }

  const colors = CATEGORY_COLORS[session.category] || CATEGORY_COLORS.other;
  const creator = session.creator;
  const isOwner = user?.id === creator?.id;

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Image */}
          <div className="rounded-xl overflow-hidden h-64 sm:h-80">
            {session.image ? (
              <img
                src={session.image}
                alt={session.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                <span className="text-6xl opacity-30">🧘</span>
              </div>
            )}
          </div>

          {/* Title & badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`badge ${colors.bg} ${colors.text} border ${colors.border}`}>
                {session.category}
              </span>
              <span className={`badge ${session.status === 'upcoming' ? 'bg-success/15 text-success border border-success/20' : 'bg-surface-light text-text-muted border border-border'}`}>
                {session.status}
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text">
              {session.title}
            </h1>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center">
              <Calendar size={18} className="mx-auto text-primary-light mb-1" />
              <p className="text-xs text-text-muted">Date</p>
              <p className="text-sm font-medium text-text mt-0.5">{formatDate(session.date_time)}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <Clock size={18} className="mx-auto text-primary-light mb-1" />
              <p className="text-xs text-text-muted">Duration</p>
              <p className="text-sm font-medium text-text mt-0.5">{formatDuration(session.duration)}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <MapPin size={18} className="mx-auto text-primary-light mb-1" />
              <p className="text-xs text-text-muted">Location</p>
              <p className="text-sm font-medium text-text mt-0.5">{session.location}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <Users size={18} className="mx-auto text-primary-light mb-1" />
              <p className="text-xs text-text-muted">Spots Left</p>
              <p className={`text-sm font-medium mt-0.5 ${session.is_fully_booked ? 'text-danger' : 'text-success'}`}>
                {session.is_fully_booked ? 'Full' : `${session.available_spots} / ${session.max_participants}`}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-heading font-semibold text-text mb-2">About this session</h2>
            <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{session.description}</p>
          </div>

          {/* Meeting link */}
          {session.meeting_link && (
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary-light hover:text-primary transition-colors"
            >
              <Globe size={14} /> Join Meeting Link
            </a>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:w-80 flex-shrink-0 space-y-6">
          {/* Price & Book */}
          <div className="glass-card p-6 space-y-4 lg:sticky lg:top-24 z-1">
            <div className="text-center">
              <p className="text-3xl font-heading font-bold text-accent">
                {formatPrice(session.price, session.currency)}
              </p>
              <p className="text-xs text-text-muted mt-1">per session</p>
            </div>

            {!isOwner && (
              <button
                onClick={handleBookNow}
                disabled={session.is_fully_booked || createBooking.isPending}
                className="btn-accent w-full justify-center text-base py-3"
              >
                {createBooking.isPending ? (
                  'Booking...'
                ) : session.is_fully_booked ? (
                  'Fully Booked'
                ) : parseFloat(session.price) > 0 ? (
                  <>
                    <CreditCard size={18} /> Book & Pay
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} /> Book Now — Free
                  </>
                )}
              </button>
            )}

            {!isAuthenticated && (
              <p className="text-xs text-text-dim text-center">
                Sign in to book this session
              </p>
            )}
          </div>

          {/* Creator card */}
          <div className="glass-card p-5 lg:sticky lg:top-54 z-1">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Created by</p>
            <div className="flex items-center gap-3">
              {creator?.avatar ? (
                <img src={creator.avatar} alt={creator.username} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary-light flex items-center justify-center font-semibold">
                  {getInitials(creator?.first_name ? `${creator.first_name} ${creator.last_name}` : creator?.username)}
                </div>
              )}
              <div>
                <p className="font-medium text-text">
                  {creator?.first_name ? `${creator.first_name} ${creator.last_name}` : creator?.username}
                </p>
                <p className="text-xs text-text-muted">{creator?.email}</p>
              </div>
            </div>
            {creator?.bio && (
              <p className="text-sm text-text-muted mt-3">{creator.bio}</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
