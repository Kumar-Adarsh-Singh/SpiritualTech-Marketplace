import { useState } from 'react';
import { useSessions } from '../hooks/useSessions';
import { useAuth } from '../context/AuthContext';
import SessionCard from '../components/sessions/SessionCard';
import SessionFilters from '../components/sessions/SessionFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { GOOGLE_AUTH_URL, GITHUB_AUTH_URL } from '../utils/constants';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    ordering: '-date_time',
    page: 1,
  });

  const queryParams = {};
  if (filters.search) queryParams.search = filters.search;
  if (filters.category) queryParams.category = filters.category;
  if (filters.ordering) queryParams.ordering = filters.ordering;
  queryParams.page = filters.page;

  const { data, isLoading, isError } = useSessions(queryParams);
  const sessions = data?.results || [];
  const totalPages = data?.count ? Math.ceil(data.count / 12) : 1;

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        {/* Background orbs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[150px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm mb-6">
            <Sparkles size={14} />
            Discover transformative experiences
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-text leading-tight">
            Your Journey to{' '}
            <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              Inner Peace
            </span>{' '}
            Starts Here
          </h1>

          <p className="mt-4 text-lg text-text-muted max-w-2xl mx-auto">
            Browse sessions from expert creators in meditation, yoga, astrology,
            healing, and more. Book your next transformative experience.
          </p>

          {!isAuthenticated && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <a href={GOOGLE_AUTH_URL} className="btn-accent">
                Get Started
                <ArrowRight size={16} />
              </a>
              <a href={GITHUB_AUTH_URL} className="btn-secondary">
                Sign in with GitHub
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="glass-card p-5 lg:sticky lg:top-24">
              <h2 className="font-heading font-semibold text-text mb-4">
                Filters
              </h2>
              <SessionFilters filters={filters} onChange={setFilters} />
            </div>
          </aside>

          {/* Session grid */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-semibold text-text">
                {filters.category
                  ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Sessions`
                  : 'All Sessions'}
              </h2>
              {data?.count !== undefined && (
                <p className="text-sm text-text-muted">
                  {data.count} session{data.count !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card overflow-hidden">
                    <div className="h-44 skeleton" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 skeleton w-3/4" />
                      <div className="h-3 skeleton w-1/2" />
                      <div className="h-3 skeleton w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-16">
                <p className="text-danger text-lg">Failed to load sessions</p>
                <p className="text-text-muted text-sm mt-1">
                  Please check your connection and try again.
                </p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-text-muted text-lg">No sessions found</p>
                <p className="text-text-dim text-sm mt-1">
                  Try adjusting your filters or check back later.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {sessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() =>
                        setFilters((f) => ({ ...f, page: f.page - 1 }))
                      }
                      disabled={filters.page <= 1}
                      className="btn-secondary py-2 px-3 disabled:opacity-30"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-text-muted px-4">
                      Page {filters.page} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setFilters((f) => ({ ...f, page: f.page + 1 }))
                      }
                      disabled={filters.page >= totalPages}
                      className="btn-secondary py-2 px-3 disabled:opacity-30"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
