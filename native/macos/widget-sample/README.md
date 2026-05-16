# WeatherCore macOS WidgetKit sample

This folder documents a **minimal Xcode 16+** companion that reads WeatherCore’s compact JSON — it is **not wired into CI**.

## API

`GET {AUTH_URL}/api/weather?lat=40.7&lon=-74&minimal=1`

Optional: add `name=` for friendlier labels server-side.

Payload shape (see `WidgetWeatherCompact` in the web app `types/weather.types.ts`):

- `cached` — boolean
- `current.temp` — Celsius in the API response (convert in Swift if needed)
- `current.condition`, `iconCode`
- `location.name`

## SwiftUI sketch

Create a new **Widget Extension** target (e.g. `WeatherCoreWidget`). Use a `TimelineProvider` that:

1. Reads `lat` / `lon` from App Group defaults or `AppIntent` configuration.
2. Uses `URLSession` to fetch `/api/weather?minimal=1`.
3. Returns a `Timeline` with `.after(...)` (~30–45 min refresh; system budgets may be tighter on macOS).

Widgets **cannot** rely on signed-in browser cookies. Keep using the **public** compact route (current default) or add a dedicated token later.

## Entitlements

- Enable **Outgoing Connections (HTTPS)**.
- Disclose location usage if you ship with fixed coordinates vs user-selected places.
