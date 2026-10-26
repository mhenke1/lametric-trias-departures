# TRMNL plugin

1. In TRMNL create a Private Plugin, strategy **Polling**.
2. URL: `https://<your-app>/api/trmnl/<stationId>?token=<TRMNL_TOKEN>` (set `TRMNL_TOKEN` env var on the app; if unset the endpoint is open). Refresh every 5–15 min.
3. Paste `full.liquid`, `half_horizontal.liquid`, `half_vertical.liquid`, `quadrant.liquid` into the matching markup tabs.

Response: `{ station, departures: [{line, time}], lines: [{line, times}] }`.
