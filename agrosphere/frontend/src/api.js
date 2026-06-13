const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

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
