'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface SelectedPlace {
  detailedAddress: string;
  formattedAddress: string;
  placeId: string;
  latitude: string;
  longitude: string;
  provinceName: string;
  districtName: string;
  wardName: string;
}

interface GoogleAddressInputProps {
  id: string;
  value: string;
  placeholder?: string;
  inputClassName: string;
  onChange: (value: string) => void;
  onPlaceSelected: (place: SelectedPlace) => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    quarter?: string;
    suburb?: string;
    city_district?: string;
    district?: string;
    county?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

function parseNominatimResult(result: NominatimResult): SelectedPlace {
  const addr = result.address;

  // Detailed address = house number + street
  const detailedAddress = [addr.house_number, addr.road].filter(Boolean).join(' ').trim()
    || result.display_name.split(',')[0].trim();

  // Ward
  const wardName = addr.quarter || addr.suburb || '';

  // District
  const districtName = addr.city_district || addr.district || addr.county || '';

  // Province
  const provinceName = addr.state || addr.city || '';

  return {
    detailedAddress,
    formattedAddress: result.display_name,
    placeId: String(result.place_id),
    latitude: result.lat,
    longitude: result.lon,
    provinceName,
    districtName,
    wardName,
  };
}

export default function GoogleAddressInput({
  id,
  value,
  placeholder,
  inputClassName,
  onChange,
  onPlaceSelected,
}: GoogleAddressInputProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const [hasSelectedPlace, setHasSelectedPlace] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Search Nominatim with debounce
  const search = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: `${query.trim()}, Việt Nam`,
          format: 'json',
          addressdetails: '1',
          countrycodes: 'vn',
          limit: '6',
          'accept-language': 'vi',
        });
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            signal: controller.signal,
            headers: { 'User-Agent': 'BookingRoom/1.0' },
          },
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        // aborted or network error — ignore
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  // Trigger search when value changes externally OR by typing
  useEffect(() => {
    if (!selected) {
      search(value);
    }
    setSelected(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (result: NominatimResult) => {
    const parsed = parseNominatimResult(result);
    // Show the full selected address in the input while keeping parsed metadata for submit.
    const displayValue = parsed.formattedAddress || result.display_name;
    setSelected(true);
    setHasSelectedPlace(true);
    onChange(displayValue);
    setSuggestions([]);
    setOpen(false);
    onPlaceSelected(parsed);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        id={id}
        type="text"
        value={value}
        autoComplete="off"
        onChange={(event) => {
          setHasSelectedPlace(false);
          onChange(event.target.value);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        placeholder={placeholder}
        className={inputClassName}
      />

      {/* Loading spinner */}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin text-[#004AC6]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : hasSelectedPlace ? (
          <svg className="h-5 w-5 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
            <circle cx="10.5" cy="10.5" r="6.5" />
          </svg>
        )}
      </span>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 top-full z-[9999] mt-1 max-h-[236px] w-full overflow-y-auto rounded-lg border border-[#C3C6D7] bg-white shadow-2xl">
          {suggestions.map((result) => {
            const parsed = parseNominatimResult(result);
            const parts = result.display_name.split(', ');
            const mainText = parts[0];
            const subText = parts.slice(1, 3).join(', ');
            return (
              <li key={result.place_id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent blur before click
                    handleSelect(result);
                  }}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#F3F3FE]"
                >
                  {/* Map pin icon */}
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#004AC6]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11z"
                    />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#191B23]">
                      {mainText}
                    </p>
                    {subText && (
                      <p className="truncate text-xs text-[#6B7280]">{subText}</p>
                    )}
                    {(parsed.districtName || parsed.provinceName) && (
                      <p className="mt-0.5 text-xs text-[#004AC6]">
                        {[parsed.wardName, parsed.districtName, parsed.provinceName]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
          <li className="border-t border-[#E1E2ED] px-4 py-2">
            <p className="text-[10px] text-[#9CA3AF]">
              © OpenStreetMap contributors — Miễn phí, không cần API key
            </p>
          </li>
        </ul>
      )}

      <p className="mt-1 text-xs font-medium text-[#6B7280]">
        {value.length >= 3
          ? loading
            ? 'Đang tìm kiếm...'
            : open
            ? `Tìm thấy ${suggestions.length} gợi ý — nhấn để chọn`
            : suggestions.length === 0 && !loading
            ? 'Không tìm thấy gợi ý. Thử nhập thêm chi tiết.'
            : 'Gõ địa chỉ và chọn gợi ý để hệ thống tự lấy tọa độ.'
          : 'Gõ ít nhất 3 ký tự để tìm kiếm địa chỉ.'}
      </p>
    </div>
  );
}