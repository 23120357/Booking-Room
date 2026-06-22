'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

interface LocationPickerMapProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

function LocationPickerMapInner({ lat, lng, onChange }: LocationPickerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      if (!mapRef.current) return;
      const L = await import('leaflet');

      if (!isMounted) return;

      if (!leafletMapRef.current) {
        const defaultCenter = lat && lng ? [lat, lng] : [10.762622, 106.660172]; // HCM or selected

        const map = L.map(mapRef.current).setView(defaultCenter as [number, number], lat ? 15 : 12);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(map);

        leafletMapRef.current = map;

        map.on('click', (e: any) => {
          onChange(e.latlng.lat, e.latlng.lng);
        });
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current) return;
    (async () => {
      const L = await import('leaflet');
      const map = leafletMapRef.current;

      if (lat && lng) {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          circleRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], {
            icon: L.divIcon({
              className: '',
              html: `<div style="
                width:16px;height:16px;background:#E63946;border:3px solid white;
                border-radius:50%;box-shadow:0 0 0 4px rgba(230,57,70,0.3);
                transform:translate(-50%,-50%);
              "></div>`,
              iconSize: [0, 0],
              iconAnchor: [0, 0],
            }),
          }).addTo(map);

          circleRef.current = L.circle([lat, lng], {
            radius: 5000,
            color: '#E63946',
            fillColor: '#E63946',
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '6 4',
          }).addTo(map);
        }
        map.flyTo([lat, lng], 15, { duration: 0.5 });
      } else {
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        if (circleRef.current) {
          circleRef.current.remove();
          circleRef.current = null;
        }
      }
    })();
  }, [lat, lng]);

  useEffect(() => {
    // Invalidate size to prevent half-rendered map when tab switches
    const timeout = setTimeout(() => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  return <div ref={mapRef} className="w-full h-full z-0" />;
}

export default dynamic(() => Promise.resolve(LocationPickerMapInner), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-booking-surface animate-pulse" />
});
