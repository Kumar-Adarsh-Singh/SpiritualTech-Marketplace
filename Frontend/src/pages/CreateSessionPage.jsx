import { useNavigate } from 'react-router-dom';
import { useCreateSession } from '../hooks/useSessions';
import { useToast } from '../components/common/Toast';
import SessionForm from '../components/sessions/SessionForm';
import { ArrowLeft } from 'lucide-react';

export default function CreateSessionPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const createSession = useCreateSession();

  const handleSubmit = async (data) => {
    try {
      await createSession.mutateAsync(data);
      toast.success('Session created successfully!');
      navigate('/creator/dashboard');
    } catch (err) {
      const errors = err.response?.data;
      if (errors && typeof errors === 'object') {
        const firstError = Object.values(errors).flat()[0];
        toast.error(firstError || 'Failed to create session.');
      } else {
        toast.error('Failed to create session.');
      }
    }
  };

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
          Create New Session
        </h1>
        <SessionForm onSubmit={handleSubmit} isLoading={createSession.isPending} />
      </div>
    </div>
  );
}
