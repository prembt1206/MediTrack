import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'detect';
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const query = searchParams.get('q');

    // 1. Reverse Geocode: (lat, lon) -> Human Address
    if (action === 'reverse' && lat && lon) {
      try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16`;
        const res = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'MediTrack-HealthApp/1.0 (contact: support@meditrack.internal)',
            'Accept-Language': 'en',
          },
          next: { revalidate: 3600 },
        });

        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};
          const locality =
            addr.suburb ||
            addr.neighbourhood ||
            addr.residential ||
            addr.village ||
            addr.road ||
            addr.quarter ||
            '';
          const city = addr.city || addr.town || addr.municipality || addr.county || 'Bengaluru';
          const state = addr.state || 'Karnataka';

          const formatted = locality ? `${locality}, ${city}` : `${city}, ${state}`;

          return NextResponse.json({
            success: true,
            name: formatted,
            displayName: data.display_name,
            locality,
            city,
            state,
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            source: 'gps-reverse-geocoded',
          });
        }
      } catch (err) {
        console.warn('Nominatim reverse error, using fallback:', err);
      }

      // Coordinates fallback
      return NextResponse.json({
        success: true,
        name: `GPS (${parseFloat(lat).toFixed(4)}°, ${parseFloat(lon).toFixed(4)}°)`,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        source: 'coordinates-raw',
      });
    }

    // 2. Search location by text (Autocomplete)
    if (action === 'search' && query) {
      try {
        const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ', India'
        )}&limit=5&addressdetails=1`;
        const res = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'MediTrack-HealthApp/1.0',
            'Accept-Language': 'en',
          },
        });
        if (res.ok) {
          const list = await res.json();
          const formatted = list.map((item: { display_name: string; lat: string; lon: string; address?: Record<string, string> }) => {
            const addr = item.address || {};
            const city = addr.city || addr.town || addr.municipality || addr.county || '';
            const locality = addr.suburb || addr.neighbourhood || addr.road || '';
            const label = locality && city ? `${locality}, ${city}` : item.display_name.split(',').slice(0, 2).join(',');
            return {
              name: label,
              displayName: item.display_name,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
            };
          });
          return NextResponse.json({ success: true, locations: formatted });
        }
      } catch (err) {
        console.warn('Search geocode error:', err);
      }
      return NextResponse.json({ success: true, locations: [] });
    }

    // 3. Auto-Detect user location via client IP
    try {
      // Free IP geolocation
      const ipRes = await fetch('https://ipwho.is/', {
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 },
      });

      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData && ipData.success !== false && ipData.latitude && ipData.longitude) {
          const city = ipData.city || 'Mangaluru';
          const region = ipData.region || 'Karnataka';
          return NextResponse.json({
            success: true,
            name: `${city}, ${region}`,
            city,
            region,
            lat: Number(ipData.latitude),
            lon: Number(ipData.longitude),
            ip: ipData.ip,
            source: 'ip-detected',
          });
        }
      }
    } catch (err) {
      console.warn('IP detect error:', err);
    }

    // Default fallback (Mangaluru/Bengaluru hub)
    return NextResponse.json({
      success: true,
      name: 'Mangaluru, Karnataka',
      lat: 12.9172,
      lon: 74.8560,
      source: 'default-fallback',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Location service failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
