'use client';

/**
 * RoomMap.tsx — Bản đồ hiển thị phòng trọ dùng Leaflet (OpenStreetMap, miễn phí)
 *
 * - Lazy-loaded (dynamic import) vì Leaflet cần window object (SSR không hỗ trợ)
 * - Render marker cho từng phòng có lat/lng
 * - Click marker → mở popup thông tin phòng + link đến trang chi tiết
 * - Phòng không có lat/lng sẽ bị bỏ qua nhưng hiện cảnh báo nhỏ cuối bản đồ
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { BookingRoom } from '@/data/bookingRooms';

interface RoomMapProps {
  rooms: BookingRoom[];
  /** Chiều cao bản đồ, mặc định 520px */
  height?: number;
  /** Tọa độ trung tâm mặc định khi không có phòng nào, mặc định Hồ Chí Minh */
  defaultCenter?: [number, number];
  /** Zoom level mặc định */
  defaultZoom?: number;
}

type MapRoom = BookingRoom & { latitude: number | null; longitude: number | null };

export default function RoomMap({
  rooms,
  height = 520,
  defaultCenter = [10.7769, 106.7009], // TP. Hồ Chí Minh
  defaultZoom = 13,
}: RoomMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [noGeoCount, setNoGeoCount] = useState(0);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Lọc phòng có tọa độ
  const roomsWithGeo = rooms.filter(
    (r: any) => r.latitude != null && r.longitude != null
  ) as MapRoom[];

  useEffect(() => {
    setNoGeoCount(rooms.length - roomsWithGeo.length);
  }, [rooms.length, roomsWithGeo.length]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Lazy-load Leaflet (chỉ chạy ở client)
    let L: any;
    let isMounted = true;

    (async () => {
      L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      if (!isMounted || !mapRef.current) return;

      // Fix Leaflet default icon path (Next.js webpack đổi tên file)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Khởi tạo map nếu chưa có
      if (!leafletMapRef.current) {
        const center: [number, number] =
          roomsWithGeo.length > 0
            ? [roomsWithGeo[0].latitude!, roomsWithGeo[0].longitude!]
            : defaultCenter;

        leafletMapRef.current = L.map(mapRef.current, {
          center,
          zoom: defaultZoom,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(leafletMapRef.current);
      }

      // Xoá markers cũ
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Tạo icon giá tiền tuỳ chỉnh
      roomsWithGeo.forEach((room) => {
        const priceLabel = new Intl.NumberFormat('vi-VN', {
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(room.price) + 'đ';

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              background: #004AC6;
              color: white;
              font-size: 11px;
              font-weight: 700;
              padding: 4px 8px;
              border-radius: 20px;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              border: 2px solid white;
              cursor: pointer;
              transform: translateX(-50%);
              display: inline-block;
            ">${priceLabel}/tháng</div>
            <div style="
              width: 0; height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 8px solid #004AC6;
              margin: 0 auto;
              transform: translateX(calc(-50% + 6px));
            "></div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const popup = L.popup({ maxWidth: 280, className: 'room-map-popup' }).setContent(`
          <div style="padding:4px 0; min-width:220px">
            ${room.image ? `<img src="${room.image}" alt="${room.title}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px" onerror="this.style.display='none'" />` : ''}
            <div style="font-weight:700;font-size:13px;color:#191B23;margin-bottom:4px;line-height:1.4">${room.title}</div>
            <div style="font-size:11px;color:#6B7280;margin-bottom:6px">${room.location || ''}</div>
            <div style="font-weight:800;font-size:15px;color:#004AC6;margin-bottom:8px">
              ${new Intl.NumberFormat('vi-VN').format(room.price)}đ<span style="font-size:11px;font-weight:400;color:#6B7280">/tháng</span>
            </div>
            <a href="/rooms/${room.id}" style="
              display:block;text-align:center;background:#004AC6;color:white;
              padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;
              text-decoration:none
            ">Xem chi tiết →</a>
          </div>
        `);

        const marker = L.marker([room.latitude!, room.longitude!], { icon })
          .addTo(leafletMapRef.current!)
          .bindPopup(popup)
          .on('click', () => setActiveRoomId(room.id));

        markersRef.current.push(marker);
      });

      // Fit bounds nếu có nhiều phòng
      if (roomsWithGeo.length > 1) {
        const bounds = L.latLngBounds(
          roomsWithGeo.map((r) => [r.latitude!, r.longitude!] as [number, number])
        );
        leafletMapRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [rooms, roomsWithGeo, defaultCenter, defaultZoom]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-booking-border shadow-sm">
      {/* Leaflet map container */}
      <div ref={mapRef} style={{ height, width: '100%' }} />

      {/* Badge số phòng */}
      {roomsWithGeo.length > 0 && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm border border-booking-border rounded-xl px-3 py-1.5 text-xs font-semibold text-booking-text shadow-sm">
          📍 {roomsWithGeo.length} phòng trên bản đồ
        </div>
      )}

      {/* Cảnh báo phòng thiếu tọa độ */}
      {noGeoCount > 0 && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800 font-medium text-center shadow-sm">
          ⚠️ {noGeoCount} phòng chưa có tọa độ địa lý và không hiển thị trên bản đồ
        </div>
      )}

      {/* Không có phòng nào */}
      {roomsWithGeo.length === 0 && rooms.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[1000]">
          <div className="text-center text-booking-muted">
            <div className="text-3xl mb-2">🗺️</div>
            <p className="font-medium text-sm">Không có phòng nào để hiển thị trên bản đồ</p>
          </div>
        </div>
      )}
    </div>
  );
}
