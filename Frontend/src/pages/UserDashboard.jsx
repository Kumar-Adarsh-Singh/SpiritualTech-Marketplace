import { useState } from 'react';
import { useMyBookings, useCancelBooking } from '../hooks/useBookings';
import { useCreatePaymentOrder, useVerifyPayment } from '../hooks/usePayments';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import BookingCard from '../components/dashboard/BookingCard';
import StatsCard from '../components/dashboard/StatsCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { CalendarCheck, CalendarX, History } from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('confirmed');

  const { data: bookingsData, isLoading: bookingsLoading } = useMyBookings();

  const cancelBooking = useCancelBooking();
  const createPaymentOrder = useCreatePaymentOrder();
  const verifyPayment = useVerifyPayment();

  const allBookings = bookingsData?.results || bookingsData || [];
  
  const confirmed = allBookings.filter((b) => b.status === 'confirmed');
  const cancelled = allBookings.filter((b) => b.status === 'cancelled');
  const completed = allBookings.filter((b) => b.status === 'completed');

  const handleCancel = async (id) => {
    try {
      await cancelBooking.mutateAsync(id);
      toast.success('Booking cancelled.');
    } catch {
      toast.error('Failed to cancel booking.');
    }
  };

  const handlePay = async (booking) => {
    try {
      const res = await createPaymentOrder.mutateAsync(booking.id);
      const orderData = res.data;

      const options = {
        key: orderData.razorpay_key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SpiritualTech',
        description: booking.session?.title,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            await verifyPayment.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful!');
          } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Payment verification failed.';
            toast.error(errorMsg);
          }
        },
        prefill: {
          email: user?.email,
          name: user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username,
        },
        theme: { color: '#6c5ce7' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Could not initiate payment.';
      toast.error(errorMsg);
    }
  };

  const tabs = [
    { key: 'confirmed', label: 'Active', count: confirmed.length },
    { key: 'completed', label: 'Completed', count: completed.length },
    { key: 'cancelled', label: 'Cancelled', count: cancelled.length },
  ];

  const currentBookings = tab === 'confirmed' ? confirmed : tab === 'completed' ? completed : cancelled;

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-2xl font-bold text-text mb-6">
        Welcome back, {user?.first_name || user?.username}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard
          icon={<CalendarCheck size={22} className="text-success" />}
          label="Active Bookings"
          value={confirmed.length}
          color="success"
        />
        <StatsCard
          icon={<History size={22} className="text-primary-light" />}
          label="Completed"
          value={completed.length}
          color="primary"
        />
        <StatsCard
          icon={<CalendarX size={22} className="text-danger" />}
          label="Cancelled"
          value={cancelled.length}
          color="danger"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface-light rounded-lg p-1 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-primary text-white shadow-md'
                : 'text-text-muted hover:text-text'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Booking list */}
      {bookingsLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : currentBookings.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg">No {tab} bookings</p>
          <p className="text-sm mt-1 text-text-dim">
            {tab === 'confirmed'
              ? 'Browse sessions to book your first one!'
              : `Your ${tab} bookings will appear here.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
              onPay={handlePay}
              cancelLoading={cancelBooking.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
