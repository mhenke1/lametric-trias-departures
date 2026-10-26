# LaMetric TRIAS departures

Shows bus departures from a TRIAS API. Three ways to consume it:

| URL | Purpose |
|---|---|
| `/api/departures/:stationId` | LaMetric JSON (`frames`) |
| `/api/trmnl/:stationId` | Structured JSON for a TRMNL device (see [trmnl/README.md](trmnl/README.md)) |
| `/` | Web UI (vanilla JS), also previews the TRMNL layout. `?station=ID[&token=...]` pre-loads a station |

The app keeps no background process (cache has no timer), so it can scale to zero.

## Configuration (environment variables)

| Name | Required | Description |
|---|---|---|
| `TRIAS_ENDPOINT` | yes | TRIAS API URL |
| `TRIAS_TOKEN` | yes | TRIAS requestor reference / API token |
| `TRMNL_TOKEN` | no | If set, `/api/trmnl/*` requires `?token=<value>` |
| `PORT` | no | Default `3000` |

Locally, put them in `.env` (gitignored). Never commit credentials.

## Run

```
npm ci
npm run dev      # development
npm run build && node dist/app.js
```
