const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Default request timeout. Without this, a slow/hung backend leaves the UI
// spinning forever (e.g. the weather panel stuck on "Fetching weather data...").
const DEFAULT_TIMEOUT = 45000

// Wraps fetch with an AbortController so requests can never hang indefinitely.
async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.')
    throw err
  } finally {
    clearTimeout(timer)
  }
}

async function fetchJSON(url, options = {}) {
  const res = await fetchWithTimeout(url, options)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// Like fetchJSON, but surfaces the API's error message (FastAPI `detail`)
// so the UI can show "An account with this email already exists" not "HTTP 409".
async function authFetch(url, options = {}) {
  const res = await fetchWithTimeout(url, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`)
  return data
}

// ─────────────── Authentication ───────────────
export const signup = async (name, email, password) =>
  authFetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })

export const login = async (email, password) =>
  authFetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

export const getMe = async (token) =>
  authFetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

export const detectDisease = async (imageFile, cropType, demoMode = false) => {
  const formData = new FormData()
  formData.append('image', imageFile)
  formData.append('crop_type', cropType)
  formData.append('demo_mode', demoMode)
  return fetchJSON(`${BASE_URL}/api/crop-disease/detect`, { method: 'POST', body: formData })
}

export const getWeather = async (lat, lon, crop = 'rice', demoMode = false) => {
  return fetchJSON(`${BASE_URL}/api/weather?lat=${lat}&lon=${lon}&crop=${crop}&demo_mode=${demoMode}`)
}

export const getMarketPrices = async (crop = '', state = '', demoMode = false) => {
  return fetchJSON(`${BASE_URL}/api/market?crop=${crop}&state=${state}&demo_mode=${demoMode}`)
}

export const analyzeSoil = async (soilData, demoMode = false) => {
  return fetchJSON(`${BASE_URL}/api/soil/analyze?demo_mode=${demoMode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(soilData),
  })
}

export const predictYield = async (yieldData, demoMode = false) => {
  return fetchJSON(`${BASE_URL}/api/yield/predict?demo_mode=${demoMode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(yieldData),
  })
}

export const diagnoseLivestock = async (livestockData, demoMode = false) => {
  return fetchJSON(`${BASE_URL}/api/livestock/diagnose?demo_mode=${demoMode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(livestockData),
  })
}

export const chatWithAI = async (message, language = 'en', history = []) => {
  return fetchJSON(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, language, history }),
  })
}

export const findSchemes = async (schemeData, demoMode = false) => {
  return fetchJSON(`${BASE_URL}/api/schemes/find?demo_mode=${demoMode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schemeData),
  })
}

export const getFertilizerRecommendation = async (data, demoMode = false) => {
  return fetchJSON(`${BASE_URL}/api/fertilizer/recommend?demo_mode=${demoMode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export const getInsuranceAssistance = async (data, demoMode = false) => {
  return fetchJSON(`${BASE_URL}/api/insurance/assist?demo_mode=${demoMode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
