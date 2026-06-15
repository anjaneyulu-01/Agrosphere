/* ─────────────────────────────────────────────────────────────
   Agent Answers
   ─────────────
   Turns REAL fetched data + the farmer's actual question into a
   specific, conversational answer — instead of one canned line per
   feature. e.g. "is it rainy today?" → a yes/no with the % and a tip;
   "cotton prices" → cotton's exact rate, not the top row.

   Everything here is deterministic (no API key needed), so it is
   reliable for a live demo.
   ───────────────────────────────────────────────────────────── */

const pick = (o, lang) => (o ? (o[lang] || o.en) : '')
const has = (text, ...words) => words.some(w => text.includes(w))
const lower = (s) => (s || '').toLowerCase()

/* ───────────────────────── Crops ───────────────────────── */

// Crops the mandi dataset knows about.
const CROPS = ['tomato', 'rice', 'cotton', 'chilli', 'onion', 'wheat', 'potato',
  'maize', 'groundnut', 'soybean', 'banana', 'brinjal', 'okra', 'sugarcane', 'turmeric']

// Hindi / Telugu names → English crop the API understands.
const CROP_ALIASES = {
  // Hindi
  'कपास': 'cotton', 'रुई': 'cotton', 'धान': 'rice', 'चावल': 'rice', 'गेहूं': 'wheat', 'गेहूँ': 'wheat',
  'प्याज': 'onion', 'टमाटर': 'tomato', 'मिर्च': 'chilli', 'मिर्ची': 'chilli', 'आलू': 'potato',
  'मक्का': 'maize', 'गन्ना': 'sugarcane', 'हल्दी': 'turmeric', 'मूंगफली': 'groundnut',
  'सोयाबीन': 'soybean', 'केला': 'banana', 'बैंगन': 'brinjal', 'भिंडी': 'okra',
  // Telugu
  'పత్తి': 'cotton', 'వరి': 'rice', 'బియ్యం': 'rice', 'గోధుమ': 'wheat', 'ఉల్లి': 'onion',
  'టమాటా': 'tomato', 'మిర్చి': 'chilli', 'మిరప': 'chilli', 'బంగాళాదుంప': 'potato',
  'మొక్కజొన్న': 'maize', 'చెరకు': 'sugarcane', 'పసుపు': 'turmeric', 'వేరుశెనగ': 'groundnut',
  'సోయా': 'soybean', 'అరటి': 'banana', 'వంకాయ': 'brinjal', 'బెండ': 'okra',
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

/** Pull a crop name out of the question (English or regional).
 *  Uses word boundaries so "cotton price" doesn't match "rice" inside "p-rice". */
export function extractCrop(query) {
  const q = lower(query)
  for (const c of CROPS) if (new RegExp(`\\b${c}\\b`).test(q)) return cap(c)
  for (const [alias, eng] of Object.entries(CROP_ALIASES)) {
    if ((query || '').includes(alias)) return cap(eng)
  }
  return null
}

/* ───────────────────────── Weather ───────────────────────── */

function rainTip(lang) {
  return pick({
    en: 'Cover stored produce and hold off on spraying or fertiliser.',
    hi: 'भंडारित उपज ढकें और छिड़काव या खाद टालें।',
    te: 'నిల్వ ఉత్పత్తులను కప్పి, పిచికారీ/ఎరువులు వాయిదా వేయండి.',
  }, lang)
}

/**
 * Compose a weather answer tailored to what was asked.
 * @param {object} d    full weather payload
 * @param {string} lang
 * @param {string} query original question
 */
export function composeWeather(d, lang, query) {
  if (!d || !d.current || !d.forecast?.length) {
    return pick({ en: 'Here is your weather advisory.', hi: 'यह रही आपकी मौसम सलाह।', te: 'ఇదిగో మీ వాతావరణ సలహా.' }, lang)
  }
  const q = lower(query)
  const city = d.city
  const cur = d.current
  const fc = d.forecast

  // Which day are they asking about?
  const isTomorrow = has(q, 'tomorrow', 'कल', 'రేపు')
  const isWeek = has(q, 'week', 'days', 'सप्ताह', 'हफ्ते', 'వారం', 'రోజుల')
  const idx = isTomorrow ? 1 : 0
  const day = fc[idx] || fc[0]
  const whenWord = pick(isTomorrow
    ? { en: 'tomorrow', hi: 'कल', te: 'రేపు' }
    : { en: 'today', hi: 'आज', te: 'ఈరోజు' }, lang)

  /* ── Rain ── */
  if (has(q, 'rain', 'rainy', 'rainfall', 'shower', 'wet', 'बारिश', 'वर्षा', 'వర్షం', 'వాన', 'వర్షించ')) {
    if (isWeek) {
      const wet = fc.filter(x => x.rain_prob >= 50)
      const driest = [...fc].sort((a, b) => a.rain_prob - b.rain_prob)[0]
      if (wet.length) {
        const list = wet.map(x => `${x.day} (${x.rain_prob}%)`).join(', ')
        return pick({
          en: `🌧️ This week in ${city}, rain is most likely on ${list}. ${driest.day} looks the driest — plan spraying then.`,
          hi: `🌧️ ${city} में इस सप्ताह बारिश की सबसे अधिक संभावना: ${list}. ${driest.day} सबसे सूखा रहेगा — छिड़काव उसी दिन करें।`,
          te: `🌧️ ఈ వారం ${city}లో వర్షం ఎక్కువగా: ${list}. ${driest.day} పొడిగా ఉంటుంది — పిచికారీ ఆ రోజు చేయండి.`,
        }, lang)
      }
      return pick({
        en: `☀️ Mostly dry week ahead in ${city} — no day crosses 50% rain chance. A good window for harvesting and spraying.`,
        hi: `☀️ ${city} में सप्ताह ज़्यादातर सूखा रहेगा — कोई दिन 50% बारिश से ऊपर नहीं। कटाई और छिड़काव के लिए अच्छा समय।`,
        te: `☀️ ${city}లో వారం ఎక్కువగా పొడిగా — ఏ రోజూ 50% దాటదు. కోత, పిచికారీకి మంచి సమయం.`,
      }, lang)
    }
    const p = day.rain_prob
    const range = `${day.low}°–${day.high}°C`
    if (p >= 60) {
      return pick({
        en: `🌧️ Yes — ${whenWord} looks rainy in ${city}: about ${p}% chance (${day.description}, ${range}). ${rainTip(lang)}`,
        hi: `🌧️ हाँ — ${city} में ${whenWord} बारिश की संभावना है: लगभग ${p}% (${day.description}, ${range})। ${rainTip(lang)}`,
        te: `🌧️ అవును — ${city}లో ${whenWord} వర్షం: సుమారు ${p}% (${day.description}, ${range}). ${rainTip(lang)}`,
      }, lang)
    }
    if (p >= 30) {
      return pick({
        en: `🌦️ Maybe — ${p}% chance of rain ${whenWord} in ${city} (${day.description}, ${range}). Keep covers handy, but light field work is fine.`,
        hi: `🌦️ शायद — ${city} में ${whenWord} ${p}% बारिश की संभावना (${day.description}, ${range})। ढक्कन तैयार रखें, हल्का काम ठीक है।`,
        te: `🌦️ బహుశా — ${city}లో ${whenWord} ${p}% వర్ష అవకాశం (${day.description}, ${range}). కవర్లు సిద్ధంగా ఉంచండి, తేలికపాటి పని సరే.`,
      }, lang)
    }
    return pick({
      en: `☀️ No — ${whenWord} should stay mostly dry in ${city} (only ${p}% rain chance, ${day.description}, ${range}). A good day for spraying or harvesting.`,
      hi: `☀️ नहीं — ${city} में ${whenWord} ज़्यादातर सूखा रहेगा (सिर्फ ${p}% बारिश, ${day.description}, ${range})। छिड़काव या कटाई के लिए अच्छा दिन।`,
      te: `☀️ లేదు — ${city}లో ${whenWord} ఎక్కువగా పొడిగా (కేవలం ${p}% వర్షం, ${day.description}, ${range}). పిచికారీ/కోతకు మంచి రోజు.`,
    }, lang)
  }

  /* ── Temperature ── */
  if (has(q, 'temp', 'hot', 'cold', 'heat', 'warm', 'तापमान', 'गरम', 'गर्मी', 'ठंड', 'ఉష్ణోగ్రత', 'వేడి', 'చలి')) {
    const tip = cur.temp >= 35
      ? { en: 'Very hot — irrigate early morning or evening and skip midday spraying.', hi: 'बहुत गर्म — सुबह जल्दी या शाम को सिंचाई करें, दोपहर में छिड़काव न करें।', te: 'చాలా వేడి — ఉదయం/సాయంత్రం నీరు పెట్టండి, మధ్యాహ్నం పిచికారీ వద్దు.' }
      : cur.temp <= 15
        ? { en: 'Quite cool — watch sensitive crops for cold stress.', hi: 'काफी ठंडा — संवेदनशील फसलों में शीत तनाव देखें।', te: 'చల్లగా ఉంది — సున్నిత పంటలపై చలి ఒత్తిడి గమనించండి.' }
        : { en: 'Comfortable for most field work.', hi: 'अधिकांश खेत काम के लिए अनुकूल।', te: 'చాలా పనులకు అనుకూలం.' }
    return pick({
      en: `🌡️ It's ${cur.temp}°C in ${city} right now (feels like ${cur.feels_like}°C), ${lower(cur.description)}. Today's range is ${fc[0].low}°–${fc[0].high}°C. ${pick(tip, 'en')}`,
      hi: `🌡️ ${city} में अभी ${cur.temp}°C (महसूस ${cur.feels_like}°C), ${lower(cur.description)}। आज ${fc[0].low}°–${fc[0].high}°C। ${pick(tip, 'hi')}`,
      te: `🌡️ ${city}లో ప్రస్తుతం ${cur.temp}°C (అనిపించేది ${cur.feels_like}°C), ${lower(cur.description)}. ఈరోజు ${fc[0].low}°–${fc[0].high}°C. ${pick(tip, 'te')}`,
    }, lang)
  }

  /* ── Wind ── */
  if (has(q, 'wind', 'breeze', 'gust', 'आंधी', 'हवा', 'గాలి', 'గాలులు')) {
    const tip = cur.wind_speed >= 20
      ? { en: 'Too gusty for spraying — drift will waste chemicals. Wait for calmer hours.', hi: 'छिड़काव के लिए तेज़ हवा — दवा बह जाएगी। शांत समय का इंतज़ार करें।', te: 'పిచికారీకి గాలి ఎక్కువ — మందు వృథా అవుతుంది. ప్రశాంత సమయం వరకు ఆగండి.' }
      : { en: 'Calm enough for spraying and dusting.', hi: 'छिड़काव और बुरकाव के लिए पर्याप्त शांत।', te: 'పిచికారీ, దుమ్ము చల్లడానికి సరిపడా ప్రశాంతం.' }
    return pick({
      en: `💨 Wind in ${city} is about ${cur.wind_speed} km/h. ${pick(tip, 'en')}`,
      hi: `💨 ${city} में हवा लगभग ${cur.wind_speed} किमी/घंटा। ${pick(tip, 'hi')}`,
      te: `💨 ${city}లో గాలి సుమారు ${cur.wind_speed} కిమీ/గంట. ${pick(tip, 'te')}`,
    }, lang)
  }

  /* ── Humidity ── */
  if (has(q, 'humid', 'humidity', 'moist', 'नमी', 'आर्द्रता', 'తేమ')) {
    const tip = cur.humidity >= 70
      ? { en: 'High humidity raises fungal disease risk — scout tomato/chilli and consider a preventive fungicide.', hi: 'अधिक नमी से फफूंद रोग का जोखिम — टमाटर/मिर्च जाँचें और निवारक फफूंदनाशक सोचें।', te: 'తేమ ఎక్కువ — శిలీంధ్ర వ్యాధి ముప్పు. టమాటా/మిర్చి పరిశీలించి నివారణ మందు చూడండి.' }
      : { en: 'Moderate — low fungal pressure right now.', hi: 'मध्यम — अभी फफूंद का दबाव कम।', te: 'మధ్యస్థం — ప్రస్తుతం శిలీంధ్ర ఒత్తిడి తక్కువ.' }
    return pick({
      en: `💧 Humidity in ${city} is ${cur.humidity}%. ${pick(tip, 'en')}`,
      hi: `💧 ${city} में नमी ${cur.humidity}%। ${pick(tip, 'hi')}`,
      te: `💧 ${city}లో తేమ ${cur.humidity}%. ${pick(tip, 'te')}`,
    }, lang)
  }

  /* ── General ── */
  const alert = d.alerts?.[0]?.title
  const base = {
    en: `📍 ${city}: ${cur.temp}°C and ${lower(cur.description)}, feels like ${cur.feels_like}°C. Rain chance ${fc[0].rain_prob}% today, ${fc[1]?.rain_prob ?? 0}% tomorrow. Pest risk is ${d.pest_risk}.`,
    hi: `📍 ${city}: ${cur.temp}°C, ${lower(cur.description)}, महसूस ${cur.feels_like}°C। बारिश आज ${fc[0].rain_prob}%, कल ${fc[1]?.rain_prob ?? 0}%। कीट जोखिम ${d.pest_risk}।`,
    te: `📍 ${city}: ${cur.temp}°C, ${lower(cur.description)}, అనిపించేది ${cur.feels_like}°C. వర్షం ఈరోజు ${fc[0].rain_prob}%, రేపు ${fc[1]?.rain_prob ?? 0}%. చీడ ముప్పు ${d.pest_risk}.`,
  }
  const al = alert ? { en: ` ⚠️ ${alert}`, hi: ` ⚠️ ${alert}`, te: ` ⚠️ ${alert}` } : null
  return pick(base, lang) + (al ? pick(al, lang) : '')
}

/* ───────────────────────── Market ───────────────────────── */

const TREND = {
  up:     { en: 'trending up 📈', hi: 'बढ़ रहे हैं 📈', te: 'పెరుగుతున్నాయి 📈' },
  down:   { en: 'trending down 📉', hi: 'गिर रहे हैं 📉', te: 'తగ్గుతున్నాయి 📉' },
  stable: { en: 'holding steady', hi: 'स्थिर हैं', te: 'స్థిరంగా ఉన్నాయి' },
}
const TREND_TIP = {
  up:     { en: 'A good time to sell.', hi: 'बेचने का अच्छा समय।', te: 'అమ్మడానికి మంచి సమయం.' },
  down:   { en: 'Hold and store if you can.', hi: 'हो सके तो रोककर भंडारण करें।', te: 'వీలైతే నిల్వ చేసి ఆగండి.' },
  stable: { en: 'Prices are stable for now.', hi: 'फ़िलहाल भाव स्थिर हैं।', te: 'ప్రస్తుతం ధరలు స్థిరం.' },
}

/**
 * Compose a market answer for the specific crop asked about.
 * @param {object} d      market payload
 * @param {string} lang
 * @param {string} query
 * @param {object} params { crop }
 */
export function composeMarket(d, lang, query, params) {
  const prices = d?.prices || []
  const crop = params?.crop || extractCrop(query)

  if (crop) {
    const rows = prices.filter(p => lower(p.crop).includes(lower(crop)))
    const row = rows.sort((a, b) => b.modal_price - a.modal_price)[0] || d?.best_market
    if (!row) {
      return pick({
        en: `I couldn't find ${crop} in today's mandi feed. Try another crop or check the table on screen.`,
        hi: `आज के मंडी डेटा में ${crop} नहीं मिला। दूसरी फसल आज़माएँ या स्क्रीन पर तालिका देखें।`,
        te: `నేటి మండి డేటాలో ${crop} కనబడలేదు. మరో పంట ప్రయత్నించండి లేదా స్క్రీన్ టేబుల్ చూడండి.`,
      }, lang)
    }
    const trend = TREND[row.trend] || TREND.stable
    const tip = TREND_TIP[row.trend] || TREND_TIP.stable
    const more = rows.length > 1
      ? { en: ` I'm showing ${rows.length} mandis for ${crop} on screen.`, hi: ` स्क्रीन पर ${crop} के ${rows.length} मंडी दिखा रहा हूँ।`, te: ` స్క్రీన్‌పై ${crop}కి ${rows.length} మండీలు చూపుతున్నాను.` }
      : null
    return pick({
      en: `💰 ${row.crop} is selling at about ₹${row.modal_price}/quintal today at ${row.market}, ${row.state} (range ₹${row.min_price}–₹${row.max_price}). Prices are ${pick(trend, 'en')}. ${pick(tip, 'en')}${more ? pick(more, 'en') : ''}`,
      hi: `💰 ${row.crop} आज ${row.market}, ${row.state} में लगभग ₹${row.modal_price}/क्विंटल बिक रहा है (₹${row.min_price}–₹${row.max_price})। भाव ${pick(trend, 'hi')}। ${pick(tip, 'hi')}${more ? pick(more, 'hi') : ''}`,
      te: `💰 ${row.crop} ఈరోజు ${row.market}, ${row.state}లో సుమారు ₹${row.modal_price}/క్వింటాల్‌కు అమ్ముడవుతోంది (₹${row.min_price}–₹${row.max_price}). ధరలు ${pick(trend, 'te')}. ${pick(tip, 'te')}${more ? pick(more, 'te') : ''}`,
    }, lang)
  }

  // No specific crop → show top market + invite a crop name.
  const bm = d?.best_market
  if (!bm) return pick({ en: 'Latest mandi prices are on screen.', hi: 'ताज़ा मंडी भाव स्क्रीन पर हैं।', te: 'తాజా మండి ధరలు స్క్రీన్‌పై ఉన్నాయి.' }, lang)
  return pick({
    en: `💰 Today's highest-value mandi: ${bm.crop} at ₹${bm.modal_price}/quintal in ${bm.market}, ${bm.state}. I'm showing ${prices.length} crops — say a crop name like "cotton prices" for its exact rate.`,
    hi: `💰 आज सबसे ऊँचा भाव: ${bm.crop} — ${bm.market}, ${bm.state} में ₹${bm.modal_price}/क्विंटल। ${prices.length} फसलें दिखा रहा हूँ — किसी फसल का नाम कहें जैसे "कपास भाव"।`,
    te: `💰 ఈరోజు అత్యధిక ధర: ${bm.crop} — ${bm.market}, ${bm.state}లో ₹${bm.modal_price}/క్వింటాల్. ${prices.length} పంటలు చూపుతున్నాను — "పత్తి ధర" లా పంట పేరు చెప్పండి.`,
  }, lang)
}
