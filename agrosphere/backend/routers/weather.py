import os
import json
import datetime
import requests
from collections import defaultdict
from fastapi import APIRouter, Query
from utils.huggingface import call_gemini

router = APIRouter()

OPENWEATHER_KEY = os.getenv("OPENWEATHER_API_KEY", "")

DEMO_WEATHER = {
    "city": "Hyderabad",
    "current": {
        "temp": 28,
        "feels_like": 31,
        "humidity": 68,
        "wind_speed": 12,
        "uv_index": 7,
        "rainfall_today": 2.1,
        "description": "Partly Cloudy",
        "icon": "02d",
        "pressure": 1008,
        "visibility": 8000,
    },
    "forecast": [
        {"day": "Today",     "high": 31, "low": 22, "description": "Partly Cloudy",    "icon": "02d", "rain_prob": 20},
        {"day": "Tomorrow",  "high": 29, "low": 21, "description": "Light Rain",        "icon": "10d", "rain_prob": 75},
        {"day": "Wed",       "high": 27, "low": 20, "description": "Heavy Rain",        "icon": "09d", "rain_prob": 90},
        {"day": "Thu",       "high": 30, "low": 22, "description": "Scattered Showers", "icon": "11d", "rain_prob": 55},
        {"day": "Fri",       "high": 32, "low": 23, "description": "Sunny",             "icon": "01d", "rain_prob": 10},
        {"day": "Sat",       "high": 33, "low": 24, "description": "Clear",             "icon": "01d", "rain_prob":  5},
        {"day": "Sun",       "high": 31, "low": 22, "description": "Partly Cloudy",     "icon": "02d", "rain_prob": 30},
    ],
    "pest_risk": "Medium",
    "advisory": [
        "🌧️ Heavy rain expected Wednesday — delay pesticide application by 3 days",
        "🌱 Good conditions for rice transplanting today and tomorrow",
        "💧 Reduce irrigation today due to expected rainfall",
        "🌡️ High humidity (68%) — monitor for fungal diseases in tomato crops",
    ],
}


def _compute_alerts(current_icon: str, forecast: list) -> list:
    """Detect rain / thunderstorm conditions and return structured alert objects."""
    alerts = []

    # ── Active right now ──
    if current_icon.startswith("11"):
        alerts.append({
            "type": "thunderstorm",
            "severity": "critical",
            "title": "⚡ Thunderstorm Active — 15 km Radius",
            "message": (
                "Thunderstorm is active in your area! "
                "Seek shelter immediately. Do NOT work in open fields or near tall trees. "
                "Disconnect electrical equipment."
            ),
        })
    elif current_icon.startswith(("09", "10")):
        alerts.append({
            "type": "rain",
            "severity": "warning",
            "title": "🌧️ Rain Falling — 15 km Radius",
            "message": (
                "Rain is currently falling within 15 km of your location. "
                "Cover stored produce, delay pesticide application, and protect farm equipment."
            ),
        })

    # ── Upcoming (next few days) ──
    seen: set = set()
    for day in forecast[:4]:
        icon      = day.get("icon", "")
        rain_prob = day.get("rain_prob", 0)
        label     = day.get("day", "")

        if icon.startswith("11") and label not in seen:
            seen.add(label)
            alerts.append({
                "type": "thunderstorm_incoming",
                "severity": "high",
                "title": f"⚡ Thunderstorm Forecast — {label}",
                "message": (
                    f"Thunderstorm expected on {label}. "
                    "Avoid spraying pesticides or fertilizers. "
                    "Secure loose equipment and move livestock to shelter."
                ),
                "when": label,
            })
        elif rain_prob >= 75 and label not in seen:
            seen.add(label)
            alerts.append({
                "type": "heavy_rain_incoming",
                "severity": "medium",
                "title": f"🌧️ Heavy Rain — {label} ({rain_prob}%)",
                "message": (
                    f"{rain_prob}% chance of heavy rain on {label}. "
                    "Ensure proper field drainage, cover stored grain, "
                    "and delay any scheduled spraying."
                ),
                "when": label,
            })

    return alerts


def _build_advisory_prompt(crop: str, lat: float, lon: float, city: str, summary: str) -> str:
    return (
        f"For a farmer growing {crop} near {city} (lat:{lat:.2f}, lon:{lon:.2f}), "
        f"given current weather: {summary}, "
        f"provide 4 concise crop advisory tips as a JSON array of strings. Include emojis."
    )


@router.get("")
async def get_weather(
    lat: float = Query(17.385, description="Latitude"),
    lon: float = Query(78.4867, description="Longitude"),
    crop: str = Query("rice", description="Current crop"),
    demo_mode: bool = Query(False),
):
    # ── Demo / no key ──
    if demo_mode or not OPENWEATHER_KEY:
        advisory_raw = await call_gemini(
            _build_advisory_prompt(
                crop, lat, lon, "your location",
                "temp 28°C, humidity 68%, partly cloudy with rain expected in 2 days"
            )
        )
        try:
            s, e = advisory_raw.find("["), advisory_raw.rfind("]") + 1
            DEMO_WEATHER["advisory"] = json.loads(advisory_raw[s:e])
        except Exception:
            pass

        DEMO_WEATHER["alerts"] = _compute_alerts(
            DEMO_WEATHER["current"]["icon"],
            DEMO_WEATHER["forecast"],
        )
        return DEMO_WEATHER

    # ── Live data via free-tier OWM APIs ──
    try:
        base = "http://api.openweathermap.org"
        key  = f"appid={OPENWEATHER_KEY}&units=metric"

        # Current weather
        curr_resp = requests.get(
            f"{base}/data/2.5/weather?lat={lat}&lon={lon}&{key}", timeout=10
        )
        if curr_resp.status_code != 200:
            DEMO_WEATHER["alerts"] = _compute_alerts(
                DEMO_WEATHER["current"]["icon"], DEMO_WEATHER["forecast"]
            )
            return DEMO_WEATHER
        curr = curr_resp.json()

        # 5-day / 3-hour forecast
        fc_resp = requests.get(
            f"{base}/data/2.5/forecast?lat={lat}&lon={lon}&{key}&cnt=40", timeout=10
        )
        if fc_resp.status_code != 200:
            DEMO_WEATHER["alerts"] = _compute_alerts(
                DEMO_WEATHER["current"]["icon"], DEMO_WEATHER["forecast"]
            )
            return DEMO_WEATHER
        fc = fc_resp.json()

        # Reverse geocode
        city = "Your Location"
        geo_resp = requests.get(
            f"{base}/geo/1.0/reverse?lat={lat}&lon={lon}&limit=1&{key}", timeout=5
        )
        if geo_resp.status_code == 200:
            geo = geo_resp.json()
            if geo:
                city = geo[0].get("name", "Your Location")

        # ── Current block ──
        cw = curr.get("weather", [{}])[0]
        current = {
            "temp":           round(curr.get("main", {}).get("temp", 28)),
            "feels_like":     round(curr.get("main", {}).get("feels_like", 30)),
            "humidity":       curr.get("main", {}).get("humidity", 65),
            "wind_speed":     round(curr.get("wind", {}).get("speed", 3) * 3.6),
            "uv_index":       6,
            "rainfall_today": round(curr.get("rain", {}).get("1h", 0), 1),
            "description":    cw.get("description", "Clear").title(),
            "icon":           cw.get("icon", "01d"),
            "pressure":       curr.get("main", {}).get("pressure", 1010),
            "visibility":     curr.get("visibility", 10000),
        }

        # ── Group into daily buckets ──
        day_buckets: dict = defaultdict(list)
        for slot in fc.get("list", []):
            day_buckets[slot["dt_txt"][:10]].append(slot)

        forecast = []
        for i, (date_str, slots) in enumerate(sorted(day_buckets.items())[:7]):
            rep   = next((s for s in slots if "12:00:00" in s.get("dt_txt", "")), slots[len(slots) // 2])
            rep_w = rep.get("weather", [{}])[0]
            highs = [s["main"]["temp_max"] for s in slots if s.get("main", {}).get("temp_max") is not None]
            lows  = [s["main"]["temp_min"] for s in slots if s.get("main", {}).get("temp_min") is not None]
            pops  = [s.get("pop", 0) for s in slots]

            if i == 0:       label = "Today"
            elif i == 1:     label = "Tomorrow"
            else:            label = datetime.datetime.strptime(date_str, "%Y-%m-%d").strftime("%a")

            forecast.append({
                "day":         label,
                "high":        round(max(highs)) if highs else 30,
                "low":         round(min(lows))  if lows  else 20,
                "description": rep_w.get("description", "Clear").title(),
                "icon":        rep_w.get("icon", "01d"),
                "rain_prob":   round(max(pops) * 100),
            })

        # ── Pest risk ──
        humidity       = current["humidity"]
        rain_prob_tmrw = forecast[1]["rain_prob"] if len(forecast) > 1 else 0
        if rain_prob_tmrw > 70:      pest_risk = "High"
        elif humidity > 70 or rain_prob_tmrw > 40: pest_risk = "Medium"
        else:                        pest_risk = "Low"

        # ── Alerts ──
        alerts = _compute_alerts(current["icon"], forecast)

        # ── AI advisory ──
        summary      = f"temp:{current['temp']}°C, humidity:{humidity}%, {current['description']}"
        advisory_raw = await call_gemini(_build_advisory_prompt(crop, lat, lon, city, summary))
        try:
            s, e = advisory_raw.find("["), advisory_raw.rfind("]") + 1
            tips = json.loads(advisory_raw[s:e])
        except Exception:
            tips = [
                "Monitor your crops regularly",
                "Check soil moisture levels",
                "Watch for pest activity",
                "Scout for disease symptoms",
            ]

        return {
            "city":      city,
            "current":   current,
            "forecast":  forecast,
            "pest_risk": pest_risk,
            "alerts":    alerts,
            "advisory":  tips,
        }

    except Exception as exc:
        DEMO_WEATHER["error"]  = str(exc)
        DEMO_WEATHER["alerts"] = _compute_alerts(
            DEMO_WEATHER["current"]["icon"], DEMO_WEATHER["forecast"]
        )
        return DEMO_WEATHER
