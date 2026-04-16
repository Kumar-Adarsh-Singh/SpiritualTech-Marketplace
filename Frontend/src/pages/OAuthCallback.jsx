import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { googleLogin, githubLogin } from '../services/auth';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const processed = useRef(false);

  const code = searchParams.get('code');
  const isGoogle = location.pathname.includes('google');
  const provider = isGoogle ? 'Google' : 'GitHub';

  useEffect(() => {
    if (!code || processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      try {
        const redirectUri = `${window.location.origin}${location.pathname}`;
        const res = isGoogle
          ? await googleLogin(code, redirectUri)
          : await githubLogin(code, redirectUri);

        const { tokens, user } = res.data;
        login(tokens, user);
        toast.success(`Welcome, ${user.first_name || user.username}!`);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.detail ||
          `${provider} login failed. Please try again.`;
        toast.error(msg);
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [code, isGoogle, provider, login, navigate, toast, location.pathname]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 page-enter">
      <LoadingSpinner size="lg" />
      <p className="text-text-muted">Signing in with {provider}...</p>
    </div>
  );
}
