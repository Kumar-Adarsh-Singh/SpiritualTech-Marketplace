import { useParams, useNavigate } from 'react-router-dom';
import { useSession, useUpdateSession } from '../hooks/useSessions';
import { useToast } from '../components/common/Toast';
import SessionForm from '../components/sessions/SessionForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

export default function EditSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: session, isLoading } = useSession(id);
  const updateSession = useUpdateSession();

  const handleSubmit = async (data) => {
    try {
      await updateSession.mutateAsync({ id: parseInt(id), data });
      toast.success('Session updated successfully!');
      navigate('/creator/dashboard');
    } catch (err) {
      const errors = err.response?.data;
      if (errors && typeof errors === 'object') {
        const firstError = Object.values(errors).flat()[0];
        toast.error(firstError || 'Failed to update session.');
      } else {
        toast.error('Failed to update session.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-enter max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="glass-card p-6 sm:p-8">
        <h1 className="font-heading text-2xl font-bold text-text mb-6">
          Edit Session
        </h1>
        <SessionForm
          initialData={session}
          onSubmit={handleSubmit}
          isLoading={updateSession.isPending}
        />
      </div>
    </div>
  );
}
