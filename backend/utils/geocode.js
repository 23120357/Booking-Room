/**
 * geocode.js — Geocoding utility
 *
 * Hỗ trợ 2 provider:
 *   1. Google Geocoding API  (nếu có GOOGLE_MAPS_API_KEY trong .env)
 *   2. Nominatim OpenStreetMap (miễn phí, fallback mặc định)
 *
 * Trả về { lat, lng } hoặc { lat: null, lng: null } nếu không tìm được.
 * Không bao giờ throw — mọi lỗi đều được log và trả về null coordinates.
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const NOMINATIM_USER_AGENT = process.env.NOMINATIM_USER_AGENT || 'BookingRoom/1.0 (booking-room-app)';
const GEOCODE_TIMEOUT_MS = 5000;

/**
 * Gọi Google Geocoding API
 * @param {string} address
 * @returns {Promise<{lat: number|null, lng: number|null}>}
 */
async function geocodeWithGoogle(address) {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', address);
  url.searchParams.set('key', GOOGLE_MAPS_API_KEY);
  url.searchParams.set('language', 'vi');
  url.searchParams.set('region', 'VN');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEOCODE_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    const data = await res.json();
    const result = data?.results?.[0];
    if (!result) return { lat: null, lng: null };
    const { lat, lng } = result.geometry.location;
    return { lat, lng };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Gọi Nominatim OpenStreetMap API (miễn phí, không cần key)
 * Rate limit: 1 request/giây — chỉ dùng ở backend, không expose ra client.
 * @param {string} address
 * @returns {Promise<{lat: number|null, lng: number|null}>}
 */
async function geocodeWithNominatim(address) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', address);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'vn');
  url.searchParams.set('addressdetails', '0');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEOCODE_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': NOMINATIM_USER_AGENT,
        'Accept-Language': 'vi,en',
      },
    });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return { lat: null, lng: null };
    const { lat, lon } = data[0];
    return { lat: parseFloat(lat), lng: parseFloat(lon) };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Geocode địa chỉ → { lat, lng }
 * Ưu tiên Google nếu có API key, fallback sang Nominatim.
 * Không throw — mọi lỗi đều trả về { lat: null, lng: null }.
 *
 * @param {string} address — Địa chỉ đầy đủ (tiếng Việt)
 * @returns {Promise<{lat: number|null, lng: number|null}>}
 */
async function geocodeAddress(address) {
  if (!address || typeof address !== 'string' || !address.trim()) {
    return { lat: null, lng: null };
  }

  try {
    if (GOOGLE_MAPS_API_KEY) {
      return await geocodeWithGoogle(address.trim());
    }
    return await geocodeWithNominatim(address.trim());
  } catch (err) {
    console.warn('[geocode] Geocoding failed for address "%s": %s', address, err?.message || err);
    return { lat: null, lng: null };
  }
}

module.exports = { geocodeAddress };
