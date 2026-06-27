'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BookingManageCard from '@/components/host/BookingManageCard';
import HostSidebar from '@/components/host/HostSidebar';
import HostTopbar from '@/components/host/HostTopbar';
import { hostRoomService, mapToHostListing } from '@/services/hostRoomService';
import { getListingVisibilityMeta } from '@/services/hostRoomService';
import type { HostListing, HostListingStatus } from '@/data/hostListings';
import { useTranslation } from '@/context/LanguageContext';

type ActiveFilter = 'all' | HostListingStatus;

const PAGE_SIZE = 6;

const getFilterLabels = (t: any): Array<{ key: ActiveFilter; label: string }> => [
  { key: 'all', label: t('host.listings.filterAll') },
  { key: 'active', label: t('host.listings.filterActive') },
  { key: 'rented', label: t('host.listings.filterRented') },
  { key: 'pending', label: t('host.listings.filterPending') },
  { key: 'hidden', label: t('host.listings.filterHidden') },
];

export default function HostListingsPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const [listings, setListings] = useState<HostListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await hostRoomService.listMyRooms({ page: 1, limit: 100 });
        if (cancelled) return;
        setListings((res.data?.items || []).map(mapToHostListing));
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || t('host.listings.loadFailed'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filters = useMemo(
    () =>
      getFilterLabels(t).map((f) => ({
        ...f,
        count: f.key === 'all' ? listings.length : listings.filter((l) => l.status === f.key).length,
      })),
    [listings, t],
  );

  const filteredListings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('vi-VN');
    return listings.filter((listing) => {
      const matchesStatus = activeFilter === 'all' || listing.status === activeFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        listing.title.toLocaleLowerCase('vi-VN').includes(normalizedSearch) ||
        listing.address.toLocaleLowerCase('vi-VN').includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [activeFilter, searchTerm, listings]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedListings = filteredListings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to first page whenever filters/search change.
  useEffect(() => {
    setPage(1);
  }, [activeFilter, searchTerm]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const handleToggleVisibility = async (id: string, nextVisible: boolean) => {
    if (togglingId) return;
    const previous = listings;
    // Optimistic update.
    setTogglingId(id);
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...getListingVisibilityMeta(nextVisible) } : l)),
    );
    try {
      await hostRoomService.setVisibility(id, nextVisible);
    } catch (err: any) {
      // Revert on failure.
      setListings(previous);
      alert(err?.message || t('host.listings.updateVisibilityFail'));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <HostSidebar user={user} onLogout={handleLogout} activePage="listings" />

      <section className="lg:pl-64">
        <HostTopbar user={user} />

        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold leading-tight text-booking-text sm:text-[32px] sm:leading-[38px]">
                {t('host.listings.manageListingsTitle')}
              </h1>
              <p className="mt-2 text-base leading-6 text-booking-muted">
                {t('host.listings.manageListingsDesc')}
              </p>
            </div>
            <Link
              href="/host/listings/new"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-6 text-base font-semibold text-[#eeefff] shadow-sm transition hover:bg-booking-primary sm:w-auto"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              <span>{t('host.listings.addNewListing')}</span>
            </Link>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-booking-border/30 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:p-[17px]">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">{t('host.listings.searchAria')}</span>
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-booking-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4z" />
              </svg>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t('host.listings.searchPlaceholder')}
                className="h-11 w-full rounded-lg border-0 bg-[#f3f3fe] px-10 text-base text-booking-text outline-none placeholder:text-[#6b7280] focus:ring-2 focus:ring-booking-primary/20"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => {
                const isActive = activeFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className={`h-11 rounded-full px-4 text-base transition ${
                      isActive
                        ? 'bg-booking-primary font-semibold text-white shadow-sm'
                        : 'border border-booking-border/50 bg-[#f3f3fe] text-booking-muted hover:border-booking-primary/40'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-booking-border/30 bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-base font-semibold text-booking-text">{t('host.listings.loadingListings')}</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-[#ffdad6] bg-[#fff8f7] px-6 py-16 text-center shadow-sm">
              <p className="text-base font-semibold text-[#ba1a1a]">{error}</p>
            </div>
          ) : pagedListings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pagedListings.map((listing) => (
                <BookingManageCard
                  key={listing.id}
                  listing={listing}
                  onToggleVisibility={handleToggleVisibility}
                  toggling={togglingId === listing.id}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-booking-border/30 bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-base font-semibold text-booking-text">
                {listings.length === 0 ? t('host.listings.noListingsYet') : t('host.listings.noMatchingListings')}
              </p>
              <p className="mt-2 text-sm text-booking-muted">
                {listings.length === 0 ? t('host.listings.clickToAddFirst') : t('host.listings.tryDifferentKeywords')}
              </p>
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                aria-label={t('host.listings.prevPage')}
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-booking-border text-booking-muted transition hover:bg-white disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border text-base font-semibold ${
                    p === currentPage
                      ? 'border-booking-primary bg-booking-primary text-white shadow-sm'
                      : 'border-booking-border text-booking-text hover:bg-white'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                aria-label={t('host.listings.nextPage')}
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-booking-border text-booking-text transition hover:bg-white disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
