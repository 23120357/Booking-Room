'use client';

/**
 * MapModal.tsx — Modal bản đồ toàn màn hình
 *
 * Hiển thị phòng trọ từ DATABASE quanh vị trí người dùng.
 * Dùng Leaflet + OpenStreetMap (miễn phí).
 * Luồng:
 *   1. Xin quyền Geolocation
 *   2. Gọi /api/rooms?nearLat=...&nearLng=...&radiusKm=5
 *   3. Render markers trên bản đồ
 *   4. Click marker → popup với thông tin phòng + link chi tiết
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { roomService, mapBackendRoomToBookingRoom } from '@/services/roomService';
import type { BookingRoom } from '@/data/bookingRooms';

interface MapModalProps {
  onClose: () => void;
}

type MapRoom = BookingRoom & { latitude: number | null; longitude: number | null };

const DEFAULT_CENTER: [number, number] = [10.7769, 106.7009]; // TP. HCM
const DEFAULT_RADIUS_KM = 5;

type LoadState = 'locating' | 'fetching' | 'ready' | 'error';

export default function MapModal({ onClose }: MapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  const [rooms, setRooms] = useState<MapRoom[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('locating');
  const [errorMsg, setErrorMsg] = useState('');
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [totalCount, setTotalCount] = useState(0);

  // Đóng modal khi bấm Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Khởi tạo Leaflet map
  const initMap = useCallback(async (center: [number, number]) => {
    if (!mapRef.current || leafletMapRef.current) return;

    const L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    leafletMapRef.current = L.map(mapRef.current, {
      center,
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(leafletMapRef.current);

    return L;
  }, []);

  // Thêm marker vị trí người dùng
  const addUserMarker = useCallback(async (pos: [number, number]) => {
    if (!leafletMapRef.current) return;
    const L = await import('leaflet');

    if (userMarkerRef.current) userMarkerRef.current.remove();

    const icon = L.divIcon({
      className: '',
      html: `
        <div style="
          width:16px; height:16px; border-radius:50%;
          background:#1a73e8; border: 3px solid white;
          box-shadow: 0 0 0 3px rgba(26,115,232,0.3);
        "></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    userMarkerRef.current = L.marker(pos, { icon })
      .addTo(leafletMapRef.current)
      .bindPopup('<strong>📍 Vị trí của bạn</strong>');
  }, []);

  // Thêm vòng tròn bán kính tìm kiếm
  const addRadiusCircle = useCallback(async (pos: [number, number], km: number) => {
    if (!leafletMapRef.current) return;
    const L = await import('leaflet');
    L.circle(pos, {
      radius: km * 1000,
      color: '#1a73e8',
      fillColor: '#1a73e8',
      fillOpacity: 0.05,
      weight: 1.5,
      dashArray: '6 4',
    }).addTo(leafletMapRef.current);
  }, []);

  // Render room markers
  const renderRoomMarkers = useCallback(async (roomList: MapRoom[]) => {
    if (!leafletMapRef.current) return;
    const L = await import('leaflet');

    // Xóa markers cũ
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const validRooms = roomList.filter(r => r.latitude != null && r.longitude != null);

    validRooms.forEach((room) => {
      const priceLabel = new Intl.NumberFormat('vi-VN', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(room.price) + 'đ';

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            background: #004AC6; color: white;
            font-size: 11px; font-weight: 700;
            padding: 4px 9px; border-radius: 20px;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            border: 2px solid white;
            cursor: pointer;
            transform: translateX(-50%);
            display: inline-block;
            transition: transform 0.15s;
          ">${priceLabel}/tháng</div>
          <div style="
            width:0; height:0;
            border-left:6px solid transparent;
            border-right:6px solid transparent;
            border-top:8px solid #004AC6;
            margin: 0 auto;
            transform: translateX(calc(-50% + 6px));
          "></div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const imgHtml = room.image
        ? `<img src="${room.image}" alt="${room.title}"
            style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px"
            onerror="this.style.display='none'" />`
        : '';

      const popup = L.popup({ maxWidth: 260, className: 'room-map-popup' }).setContent(`
        <div style="padding:2px 0;min-width:210px;font-family:system-ui,sans-serif">
          ${imgHtml}
          <div style="font-weight:700;font-size:13px;color:#191B23;margin-bottom:3px;line-height:1.4">
            ${room.title}
          </div>
          <div style="font-size:11px;color:#6B7280;margin-bottom:5px;display:flex;align-items:center;gap:3px">
            📍 ${room.location || ''}
          </div>
          <div style="font-size:12px;color:#555;margin-bottom:2px">
            🏠 ${room.type || ''} &nbsp;·&nbsp; ⭐ ${room.rating?.toFixed(1) || '–'}
          </div>
          <div style="font-weight:800;font-size:16px;color:#004AC6;margin:6px 0 10px">
            ${new Intl.NumberFormat('vi-VN').format(room.price)}đ
            <span style="font-size:11px;font-weight:400;color:#6B7280">/tháng</span>
          </div>
          <a href="/rooms/${room.id}"
            style="display:block;text-align:center;background:#004AC6;color:white;
            padding:7px 12px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none">
            Xem chi tiết →
          </a>
        </div>
      `);

      const marker = L.marker([room.latitude!, room.longitude!], { icon })
        .addTo(leafletMapRef.current!)
        .bindPopup(popup);

      markersRef.current.push(marker);
    });
  }, []);

  // Fetch phòng từ DB theo vị trí
  const fetchNearbyRooms = useCallback(async (lat: number, lng: number, km: number) => {
    setLoadState('fetching');
    try {
      const res = await roomService.listRooms({
        nearLat: lat,
        nearLng: lng,
        radiusKm: km,
        limit: 50,
      });
      if (res?.data) {
        const items = (res.data.items || []).map((r, i) => mapBackendRoomToBookingRoom(r, i)) as MapRoom[];
        setRooms(items);
        setTotalCount(res.data.pagination?.total || items.length);
        await renderRoomMarkers(items);
        setLoadState('ready');
      } else {
        setErrorMsg('Không thể tải danh sách phòng.');
        setLoadState('error');
      }
    } catch (e: any) {
      setErrorMsg('Lỗi kết nối server.');
      setLoadState('error');
    }
  }, [renderRoomMarkers]);

  // Khởi động: xin vị trí → init map → fetch phòng
  useEffect(() => {
    let isMounted = true;

    async function start() {
      let center: [number, number] = DEFAULT_CENTER;

      // 1. Xin Geolocation
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 })
          );
          if (!isMounted) return;
          center = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(center);
        } catch {
          // Từ chối hoặc timeout → dùng mặc định HCM
        }
      }

      if (!isMounted) return;

      // 2. Init map
      const L = await initMap(center);
      if (!isMounted || !L) return;

      // 3. Marker vị trí người dùng (nếu có)
      if (userPos || center !== DEFAULT_CENTER) {
        await addUserMarker(center);
        await addRadiusCircle(center, radiusKm);
      }

      // 4. Fetch phòng
      await fetchNearbyRooms(center[0], center[1], radiusKm);
    }

    start();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi user thay đổi bán kính → fetch lại
  const handleRadiusChange = async (newKm: number) => {
    setRadiusKm(newKm);
    if (!leafletMapRef.current) return;
    const L = await import('leaflet');
    // Xóa circles cũ
    leafletMapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Circle) layer.remove();
    });
    const center = userPos || DEFAULT_CENTER;
    await addRadiusCircle(center, newKm);
    await fetchNearbyRooms(center[0], center[1], newKm);
  };

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="fixed inset-x-3 bottom-3 top-3 z-[9999] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:inset-x-6 sm:bottom-6 sm:top-6 md:inset-x-10 md:bottom-10 md:top-10 lg:inset-x-16 lg:bottom-10 lg:top-10">

        {/* ---- Header ---- */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-3">
          <div className="flex items-center gap-2.5">
            {/* Google Maps logo color */}
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
              <circle cx="12" cy="9" r="2.8" fill="white"/>
            </svg>
            <div>
              <h2 className="text-sm font-bold leading-none text-gray-900">Phòng trọ gần bạn</h2>
              {loadState === 'ready' && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {rooms.filter((r: any) => r.latitude).length} phòng trong {radiusKm}km
                </p>
              )}
              {loadState === 'locating' && (
                <p className="mt-0.5 text-xs text-blue-500 animate-pulse">Đang xác định vị trí…</p>
              )}
              {loadState === 'fetching' && (
                <p className="mt-0.5 text-xs text-blue-500 animate-pulse">Đang tải phòng từ hệ thống…</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bộ chọn bán kính */}
            <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-2 py-1">
              <span className="text-xs text-gray-500 font-medium">Bán kính:</span>
              {[2, 5, 10, 20].map((km) => (
                <button
                  key={km}
                  onClick={() => handleRadiusChange(km)}
                  className={`rounded-lg px-2 py-0.5 text-xs font-semibold transition ${
                    radiusKm === km
                      ? 'bg-[#004AC6] text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {km}km
                </button>
              ))}
            </div>

            {/* Nút đóng */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Đóng bản đồ"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ---- Body: Map + Sidebar ---- */}
        <div className="relative flex flex-1 overflow-hidden">

          {/* Bản đồ */}
          <div ref={mapRef} className="flex-1" />

          {/* Loading overlay trên bản đồ */}
          {(loadState === 'locating' || loadState === 'fetching') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-[1000]">
              <div className="h-10 w-10 rounded-full border-4 border-[#004AC6] border-t-transparent animate-spin mb-3" />
              <p className="text-sm font-semibold text-gray-700">
                {loadState === 'locating' ? 'Đang xác định vị trí…' : 'Đang tải phòng…'}
              </p>
            </div>
          )}

          {/* Error overlay */}
          {loadState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-[1000]">
              <div className="text-4xl mb-2">😕</div>
              <p className="text-sm font-semibold text-red-600">{errorMsg}</p>
              <button
                onClick={() => {
                  const center = userPos || DEFAULT_CENTER;
                  fetchNearbyRooms(center[0], center[1], radiusKm);
                }}
                className="mt-3 rounded-xl bg-[#004AC6] px-4 py-2 text-xs font-bold text-white hover:bg-[#003f9e]"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Sidebar danh sách phòng (desktop) */}
          {loadState === 'ready' && rooms.length > 0 && (
            <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-gray-100 bg-white lg:block xl:w-80">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  {rooms.filter((r: any) => r.latitude).length} phòng trong {radiusKm}km
                </p>
              </div>
              <ul className="divide-y divide-gray-50">
                {rooms
                  .filter((r: any) => r.latitude != null)
                  .map((room) => (
                    <li key={room.id}>
                      <a
                        href={`/rooms/${room.id}`}
                        className="flex gap-3 px-4 py-3 transition hover:bg-gray-50"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {/* Ảnh nhỏ */}
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {room.image && (
                            <img
                              src={room.image}
                              alt={room.title}
                              className="h-full w-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-gray-800 leading-snug">{room.title}</p>
                          <p className="mt-0.5 truncate text-[11px] text-gray-500">{room.location}</p>
                          <p className="mt-1 text-sm font-extrabold text-[#004AC6]">
                            {new Intl.NumberFormat('vi-VN').format(room.price)}đ
                            <span className="text-[10px] font-normal text-gray-400">/tháng</span>
                          </p>
                        </div>
                      </a>
                    </li>
                  ))}
              </ul>
            </aside>
          )}
        </div>

        {/* ---- Footer (mobile): tóm tắt kết quả ---- */}
        {loadState === 'ready' && (
          <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-2 lg:hidden">
            <p className="text-xs text-center text-gray-500 font-medium">
              📍 {rooms.filter((r: any) => r.latitude).length} phòng trong bán kính {radiusKm}km — Click marker để xem chi tiết
            </p>
          </div>
        )}
      </div>
    </>
  );
}
