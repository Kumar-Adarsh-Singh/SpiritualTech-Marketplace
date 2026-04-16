import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMySessions, useDeleteSession } from '../hooks/useSessions';
import { useSessionBookings } from '../hooks/useBookings';
import { useToast } from '../components/common/Toast';
import StatsCard from '../components/dashboard/StatsCard';
import SessionTable from '../components/dashboard/SessionTable';
import BookingTable from '../components/dashboard/BookingTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { Layers, Users, CalendarCheck, PlusCircle } from 'lucide-react';

export default function CreatorDashboard() {
  const toast = useToast();
  const [tab, setTab] = useState('sessions');
  const [deleteId, setDeleteId] = useState(null);

  const { data: sessionsData, isLoading: sessionsLoading } = useMySessions();
  const { data: bookingsData, isLoading: bookingsLoading } = useSessionBookings();
  const deleteSession = useDeleteSession();

  const sessions = sessionsData?.results || sessionsData || [];
  const bookings = bookingsData?.results || bookingsData || [];
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSession.mutateAsync(deleteId);
      toast.success('Session deleted.');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete session.');
    }
  };

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-text">Creator Studio</h1>
        <Link to="/creator/sessions/new" className="btn-accent">
          <PlusCircle size={16} />
          New Session
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard
          icon={<Layers size={22} className="text-primary-light" />}
          label="Total Sessions"
          value={sessions.length}
          color="primary"
        />
        <StatsCard
          icon={<Users size={22} className="text-accent" />}
          label="Total Bookings"
          value={bookings.length}
          color="accent"
        />
        <StatsCard
          icon={<CalendarCheck size={22} className="text-success" />}
          label="Active Bookings"
          value={confirmedBookings.length}
          color="success"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface-light rounded-lg p-1 mb-6">
        <button
          onClick={() => setTab('sessions')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            tab === 'sessions'
              ? 'bg-primary text-white shadow-md'
              : 'text-text-muted hover:text-text'
          }`}
        >
          My Sessions ({sessions.length})
        </button>
        <button
          onClick={() => setTab('bookings')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            tab === 'bookings'
              ? 'bg-primary text-white shadow-md'
              : 'text-text-muted hover:text-text'
          }`}
        >
          Bookings ({bookings.length})
        </button>
      </div>

      {/* Content */}
      {sessionsLoading || bookingsLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : tab === 'sessions' ? (
        <div className="glass-card overflow-hidden">
          <SessionTable
            sessions={sessions}
            onDelete={(id) => setDeleteId(id)}
            deleteLoading={deleteSession.isPending}
          />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <BookingTable bookings={bookings} />
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Session"
        size="sm"
      >
        <p className="text-text-muted text-sm mb-4">
          Are you sure you want to delete this session? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => setDeleteId(null)} className="btn-secondary text-sm">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteSession.isPending}
            className="btn-danger text-sm"
          >
            {deleteSession.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
