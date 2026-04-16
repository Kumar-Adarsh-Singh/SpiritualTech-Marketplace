import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GOOGLE_AUTH_URL, GITHUB_AUTH_URL } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';
import {
  Sparkles,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  PlusCircle,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isCreator, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-bg/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles
              size={24}
              className="text-accent group-hover:rotate-12 transition-transform"
            />
            <span className="font-heading font-bold text-xl text-text">
              Spiritual<span className="text-primary-light">Tech</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              Explore
            </Link>

            {isAuthenticated ? (
              <>
                {isCreator && (
                  <Link
                    to="/creator/sessions/new"
                    className="btn-primary text-sm"
                  >
                    <PlusCircle size={16} />
                    Create Session
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-light border border-border hover:border-primary/30 transition-all"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary-light flex items-center justify-center text-xs font-semibold">
                        {getInitials(
                          user?.first_name
                            ? `${user.first_name} ${user.last_name}`
                            : user?.username
                        )}
                      </div>
                    )}
                    <span className="text-sm text-text hidden lg:block">
                      {user?.first_name || user?.username}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-text-muted transition-transform ${
                        profileOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {profileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-2xl py-2 z-20">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm font-medium text-text">
                            {user?.first_name
                              ? `${user.first_name} ${user.last_name}`
                              : user?.username}
                          </p>
                          <p className="text-xs text-text-muted">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary-light capitalize">
                            {user?.role}
                          </span>
                        </div>

                        <Link
                          to="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-surface-light transition-colors"
                        >
                          <LayoutDashboard size={16} />
                          Dashboard
                        </Link>

                        {isCreator && (
                          <Link
                            to="/creator/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-surface-light transition-colors"
                          >
                            <Sparkles size={16} />
                            Creator Studio
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-surface-light transition-colors"
                        >
                          <User size={16} />
                          Profile
                        </Link>

                        <div className="border-t border-border mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <a href={GOOGLE_AUTH_URL} className="btn-secondary text-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </a>
                <a href={GITHUB_AUTH_URL} className="btn-primary text-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-text-muted hover:text-text"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-text-muted hover:text-text transition-colors"
            >
              Explore Sessions
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-text-muted hover:text-text transition-colors"
                >
                  Dashboard
                </Link>
                {isCreator && (
                  <>
                    <Link
                      to="/creator/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block py-2 text-text-muted hover:text-text transition-colors"
                    >
                      Creator Studio
                    </Link>
                    <Link
                      to="/creator/sessions/new"
                      onClick={() => setMenuOpen(false)}
                      className="block py-2 text-text-muted hover:text-text transition-colors"
                    >
                      Create Session
                    </Link>
                  </>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-text-muted hover:text-text transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="block py-2 text-danger"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <a href={GOOGLE_AUTH_URL} className="btn-secondary text-sm justify-center">
                  Sign in with Google
                </a>
                <a href={GITHUB_AUTH_URL} className="btn-primary text-sm justify-center">
                  Sign in with GitHub
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
