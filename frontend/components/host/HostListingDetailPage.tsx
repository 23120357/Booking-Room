'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import HostSidebar from '@/components/host/HostSidebar';
import { getHostListingDetail, type ListingAmenity } from '@/data/hostListingDetails';

function HostIconBar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-end border-b border-[#E1E2ED] bg-[#FAF8FF] px-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-4 text-[#434655]">
        <button type="button" aria-label="Thông báo" title="Thông báo" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a3 3 0 0 0 6 0" />
          </svg>
        </button>
        <button type="button" aria-label="Trợ giúp" title="Trợ giúp" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.1 9a3 3 0 1 1 4.8 2.4c-.9.6-1.4 1.1-1.4 2.1v.3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </button>
      </div>
    </header>
  );
}

function AmenityIcon({ icon }: { icon: ListingAmenity['icon'] }) {
  const paths: Record<ListingAmenity['icon'], React.ReactNode> = {
    snow: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 7l14 10M19 7L5 17M7 5l10 14M17 5 7 19" />,
    wifi: <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19h.01" />,
    kitchen: <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h10v18H7zM10 7h4M10 15h4" />,
    washer: <><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="14" r="4" /><path d="M9 7h.01M12 7h.01" /></>,
    shield: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />,
    parking: <path strokeLinecap="round" strokeLinejoin="round" d="M8 20V4h6a4 4 0 0 1 0 8H8" />,
  };

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgba(134,242,228,0.2)] text-[#006A61]">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        {paths[icon]}
      </svg>
    </span>
  );
}

export default function HostListingDetailPage({ listingId }: { listingId: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const listing = getHostListingDetail(listingId);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <main className="min-h-screen bg-[#FAF8FF] text-[#191B23]">
      <HostSidebar user={user} onLogout={handleLogout} activePage="listings" />

      <section className="flex min-h-screen flex-col lg:ml-[272px]">
        <HostIconBar />

        <div className="mx-auto flex w-full max-w-[1024px] flex-col gap-6 p-4 sm:p-6">
          <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <nav className="text-base leading-6" aria-label="Breadcrumb">
                <Link href="/host/listings" className="text-[#434655] hover:text-[#004AC6]">My Listings</Link>
                <span className="px-1 text-[#434655]">›</span>
                <span className="text-[#004AC6]">Listing Details</span>
              </nav>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <h1 className="max-w-[580px] text-[32px] font-bold leading-[38px] text-[#191B23]">
                  {listing.title}
                </h1>
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#86F2E4] px-2 py-1 text-xs font-bold leading-4 text-[#006F66]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#006A61]" />
                  {listing.statusLabel}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-base leading-6 text-[#434655]">
                <span className="inline-flex items-center gap-1">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  {listing.address}
                </span>
                <span className="inline-flex items-center gap-1">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 11a1 1 0 1 0 1 1" />
                  </svg>
                  ID: {listing.listingCode}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <button type="button" className="flex h-14 items-center gap-2 rounded-xl border border-[#737686] px-6 text-base text-[#004AC6] hover:bg-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17.2 17.2 0 0 1-3.1 4.1M6.1 6.1C3.5 7.8 2 12 2 12s3.5 7 10 7a9.9 9.9 0 0 0 4.1-.9" />
                </svg>
                Ẩn phòng
              </button>
              <Link href={`/host/listings/${listing.id}/edit`} className="flex h-14 items-center gap-2 rounded-xl bg-[#004AC6] px-6 text-base text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] hover:bg-[#003f9e]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.9 4.6l2.5 2.5M5 19l4.8-1 9.3-9.3a1.8 1.8 0 0 0-2.5-2.5l-9.3 9.3L5 19z" />
                </svg>
                Chỉnh sửa
              </Link>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-6">
              <div className="grid h-[480px] overflow-hidden rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] sm:grid-cols-[1fr_1.15fr]">
                <img src={listing.images[0].src} alt={listing.images[0].alt} className="h-full w-full object-cover" />
                <div className="grid grid-rows-2 gap-2 bg-white pl-2">
                  <img src={listing.images[1].src} alt={listing.images[1].alt} className="h-full w-full object-cover" />
                  <div className="grid grid-cols-2 gap-2">
                    <img src={listing.images[2].src} alt={listing.images[2].alt} className="h-full w-full object-cover" />
                    <div className="relative h-full bg-[#E1E2ED]">
                      <img src={listing.images[0].src} alt="" className="h-full w-full object-cover opacity-40" />
                      <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-[#191B23]">+2 photos</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {listing.metrics.map((metric) => (
                  <article key={metric.label} className="rounded-2xl border border-[#C3C6D7] bg-white p-6 shadow-sm">
                    <p className="text-base leading-6 text-[#434655]">{metric.label}</p>
                    <p className="mt-1 text-base leading-6 text-[#191B23]">{metric.value}</p>
                    <p className="mt-1 text-xs leading-4 text-[#434655]">{metric.note}</p>
                  </article>
                ))}
              </div>

              <section className="rounded-2xl border border-[#C3C6D7] bg-white p-8 shadow-sm">
                <h2 className="flex items-center gap-2 text-2xl font-semibold leading-8 text-[#191B23]">
                  <svg className="h-6 w-6 text-[#004AC6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h8l4 4v14H7zM15 3v5h4M9 13h6M9 17h6" />
                  </svg>
                  Description
                </h2>
                <div className="mt-6 space-y-5 text-base leading-7 text-[#434655]">
                  {listing.description.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <h2 className="mt-12 flex items-center gap-2 text-2xl font-semibold leading-8 text-[#191B23]">
                  <svg className="h-6 w-6 text-[#004AC6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
                  </svg>
                  Amenities
                </h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {listing.amenities.map((amenity) => (
                    <div key={amenity.label} className="flex items-center gap-4 text-base font-medium leading-6 text-[#191B23]">
                      <AmenityIcon icon={amenity.icon} />
                      <span>{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="flex flex-col gap-6">
              <section className="rounded-2xl border border-[#C3C6D7] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold leading-7">Listing Status</h2>
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-[#C3C6D7] bg-[#FAF8FF] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base text-[#434655]">Verified Tag</span>
                      <span className="rounded bg-[#DCFCE7] px-2 py-1 text-[10px] font-bold text-[#15803D]">ACTIVE</span>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-[#434655]">Your listing has been verified by the An Tâm safety team.</p>
                  </div>
                  <div className="rounded-xl border border-[#C3C6D7] bg-[#FAF8FF] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base text-[#434655]">Featured Status</span>
                      <span className="rounded bg-[#DBE1FF] px-2 py-1 text-[10px] font-bold text-[#004AC6]">STANDARD</span>
                    </div>
                    <button type="button" className="mt-4 h-9 w-full rounded-lg bg-[rgba(0,74,198,0.1)] text-sm text-[#004AC6]">Boost Listing</button>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[#C3C6D7] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold leading-7">Location</h2>
                  <button type="button" className="text-sm text-[#004AC6]">View on Map</button>
                </div>
                <div className="relative mt-4 h-64 overflow-hidden rounded-xl bg-[#E1E2ED]">
                  <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(30deg, rgba(255,255,255,.45) 12%, transparent 12%, transparent 50%, rgba(255,255,255,.45) 50%, rgba(255,255,255,.45) 62%, transparent 62%), linear-gradient(120deg, rgba(255,255,255,.35) 12%, transparent 12%, transparent 50%, rgba(255,255,255,.35) 50%, rgba(255,255,255,.35) 62%, transparent 62%)', backgroundSize: '64px 64px' }} />
                  <span className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(0,74,198,0.2)]" />
                  <span className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#004AC6] shadow-lg" />
                </div>
                <p className="mt-4 text-sm font-bold leading-5 text-[#191B23]">
                  Area Insight: <span className="font-normal text-[#434655]">Highly desirable location with high walking score. Excellent accessibility to District 1 and District 10.</span>
                </p>
              </section>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}
