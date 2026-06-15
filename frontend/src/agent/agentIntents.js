/* ─────────────────────────────────────────────────────────────
   Agent Intents
   ─────────────
   Maps a farmer's free-text request to an ACTION PLAN the agent
   engine executes on the website. Pure keyword matching — fast,
   offline, demo-safe, and trivial to extend.

   To teach the agent a NEW feature:
   1. Add data-agent="<id>" to the button it should click.
   2. registerAgentAction('<feature>.run', handler) in that component,
      where handler does the work and returns its result data.
   3. Add an INTENT below pointing at them.

   A plan is an array of steps. Step types:
     { type:'navigate', section, say }
         → smooth-scroll to a #section
     { type:'click', selector?, action?, say }
         → glide the cursor to the [data-agent] button (if selector
           given), show a click, then run the registered action.
           The action's resolved value is passed to summary(result).
   `say` and summaries are localised per language (en / hi / te).
   ───────────────────────────────────────────────────────────── */

import { composeWeather, composeMarket, extractCrop } from './agentAnswers'

const L = (en, hi, te) => ({ en, hi, te })

/** Pick a localised string, falling back to English. */
export function loc(localized, lang) {
  if (!localized) return ''
  return localized[lang] || localized.en || ''
}

/** Small helper to build the common "navigate → click & run" plan. */
function plan(section, navSay, actSay, action, selector) {
  return [
    { type: 'navigate', section, say: navSay },
    { type: 'click', selector, action, say: actSay },
  ]
}

const SAY_OPEN = (name) => L(
  `🛰️ Opening ${name.en} for you…`,
  `🛰️ आपके लिए ${name.hi} खोल रहा हूँ…`,
  `🛰️ మీ కోసం ${name.te} తెరుస్తున్నాను…`,
)

export const INTENTS = [
  /* ── Crop disease diagnosis ── */
  {
    id: 'cropdoctor',
    keywords: [
      'crop doctor', 'disease', 'diseased', 'infected', 'infection', 'leaf', 'leaves',
      'fungus', 'blight', 'yellow leaf', 'sick plant', 'spots on', 'diagnose crop',
      'फसल रोग', 'बीमारी', 'पत्ती', 'पत्ते', 'రోగం', 'ఆకు', 'పంట వ్యాధి', 'తెగులు',
    ],
    plan: plan('crop-doctor',
      SAY_OPEN(L('the AI Crop Doctor', 'एआई क्रॉप डॉक्टर', 'AI క్రాప్ డాక్టర్')),
      L('🔬 Running disease diagnosis on your crop…',
        '🔬 आपकी फसल की बीमारी जाँच रहा हूँ…',
        '🔬 మీ పంట వ్యాధిని నిర్ధారిస్తున్నాను…'),
      'cropdoctor.run', '[data-agent="crop-doctor-run"]'),
    summary: (r, lang) => {
      if (!r || r.error) return loc(L('Diagnosis failed — please try again or enable Demo Mode.',
        'जाँच विफल — कृपया फिर से प्रयास करें या डेमो मोड चालू करें।',
        'నిర్ధారణ విఫలమైంది — దయచేసి మళ్లీ ప్రయత్నించండి లేదా డెమో మోడ్ ఆన్ చేయండి.'), lang)
      if (r.needUpload) return loc(L('📷 Please tap the upload box on screen and add a clear photo of your crop leaf — then I will diagnose it instantly.',
        '📷 कृपया स्क्रीन पर अपलोड बॉक्स पर टैप करें और अपनी फसल की पत्ती की साफ़ फ़ोटो डालें — फिर मैं तुरंत जाँच करूँगा।',
        '📷 దయచేసి స్క్రీన్‌పై అప్‌లోడ్ బాక్స్‌ను నొక్కి మీ పంట ఆకు స్పష్టమైన ఫోటో జోడించండి — వెంటనే నిర్ధారిస్తాను.'), lang)
      if (r.is_healthy) return loc(L(`🌿 Good news — your ${r.crop || 'crop'} looks healthy!`,
        `🌿 अच्छी खबर — आपकी ${r.crop || 'फसल'} स्वस्थ दिख रही है!`,
        `🌿 శుభవార్త — మీ ${r.crop || 'పంట'} ఆరోగ్యంగా ఉంది!`), lang)
      return loc(L(`🌿 Detected ${r.disease} (${r.severity}, ${r.confidence}% confident). Treatment steps are on screen.`,
        `🌿 ${r.disease} पाया गया (${r.severity}, ${r.confidence}% विश्वास)। उपचार के चरण स्क्रीन पर हैं।`,
        `🌿 ${r.disease} గుర్తించాను (${r.severity}, ${r.confidence}% నమ్మకం). చికిత్స దశలు స్క్రీన్‌పై ఉన్నాయి.`), lang)
    },
  },

  /* ── Soil analysis ── */
  {
    id: 'soil',
    keywords: ['soil', 'npk', 'nitrogen', 'phosphorus', 'potassium', ' ph ', 'fertility',
      'मिट्टी', 'मृदा', 'నేల', 'మట్టి', 'భూసారం'],
    plan: plan('soil',
      SAY_OPEN(L('Soil Analysis', 'मृदा विश्लेषण', 'నేల విశ్లేషణ')),
      L('🧪 Analysing your soil health…', '🧪 आपकी मिट्टी का स्वास्थ्य जाँच रहा हूँ…', '🧪 మీ నేల ఆరోగ్యాన్ని విశ్లేషిస్తున్నాను…'),
      'soil.run', '[data-agent="soil-run"]'),
    summary: (r, lang) => {
      if (!r) return ''
      const crops = (r.suitable_crops || []).slice(0, 3).join(', ')
      return loc(L(`🌱 Soil health ${r.health_score}/100 (${r.grade}). Best crops: ${crops}.`,
        `🌱 मिट्टी का स्वास्थ्य ${r.health_score}/100 (${r.grade})। उपयुक्त फसलें: ${crops}।`,
        `🌱 నేల ఆరోగ్యం ${r.health_score}/100 (${r.grade}). అనుకూల పంటలు: ${crops}.`), lang)
    },
  },

  /* ── Yield prediction ── */
  {
    id: 'yield',
    keywords: ['yield', 'production', 'produce', 'revenue', 'how much will i get', 'harvest estimate',
      'उपज', 'पैदावार', 'दिगुबडी', 'దిగుబడి', 'ఉత్పత్తి', 'ఆదాయం'],
    plan: plan('yield',
      SAY_OPEN(L('Yield Prediction', 'उपज भविष्यवाणी', 'దిగుబడి అంచనా')),
      L('📊 Predicting your yield and revenue…', '📊 आपकी उपज और आय का अनुमान लगा रहा हूँ…', '📊 మీ దిగుబడి, ఆదాయాన్ని అంచనా వేస్తున్నాను…'),
      'yield.run', '[data-agent="yield-run"]'),
    summary: (r, lang) => {
      if (!r) return ''
      const rev = r.expected_revenue?.toLocaleString?.() || r.expected_revenue
      return loc(L(`📈 Predicted ${r.predicted_yield_per_acre} quintals/acre — about ₹${rev} expected revenue.`,
        `📈 अनुमानित ${r.predicted_yield_per_acre} क्विंटल/एकड़ — लगभग ₹${rev} आय।`,
        `📈 అంచనా ${r.predicted_yield_per_acre} క్వింటాళ్లు/ఎకరా — సుమారు ₹${rev} ఆదాయం.`), lang)
    },
  },

  /* ── Livestock health ── */
  {
    id: 'livestock',
    keywords: ['livestock', 'cattle', 'cow', 'buffalo', 'goat', 'sheep', 'animal', 'milk', 'veterinary', 'vet',
      'पशु', 'गाय', 'भैंस', 'बकरी', 'दूध', 'పశు', 'ఆవు', 'గేదె', 'మేక', 'పాడి'],
    plan: plan('livestock',
      SAY_OPEN(L('the Livestock Health Tracker', 'पशु स्वास्थ्य ट्रैकर', 'పశు ఆరోగ్య ట్రాకర్')),
      L('🩺 Checking your animal\'s symptoms…', '🩺 आपके पशु के लक्षण जाँच रहा हूँ…', '🩺 మీ పశువు లక్షణాలను పరిశీలిస్తున్నాను…'),
      'livestock.run', '[data-agent="livestock-run"]'),
    summary: (r, lang) => {
      if (!r) return ''
      return loc(L(`🐄 Likely ${r.diagnosis} (${r.severity}, ${r.confidence}% confident). First-aid steps are shown.`,
        `🐄 संभवतः ${r.diagnosis} (${r.severity}, ${r.confidence}% विश्वास)। प्राथमिक उपचार स्क्रीन पर हैं।`,
        `🐄 బహుశా ${r.diagnosis} (${r.severity}, ${r.confidence}% నమ్మకం). ప్రథమ చికిత్స దశలు చూపించాను.`), lang)
    },
  },

  /* ── Insurance claim ── */
  {
    id: 'insurance',
    keywords: ['insurance', 'claim', 'pmfby', 'damage', 'crop loss', 'compensation',
      'बीमा', 'दावा', 'नुकसान', 'मुआवजा', 'బీమా', 'క్లెయిమ్', 'నష్టం', 'పరిహారం'],
    plan: plan('insurance',
      SAY_OPEN(L('the Insurance Claim Assistant', 'बीमा दावा सहायक', 'బీమా క్లెయిమ్ సహాయకుడు')),
      L('🛡️ Assessing your insurance claim…', '🛡️ आपके बीमा दावे का आकलन कर रहा हूँ…', '🛡️ మీ బీమా క్లెయిమ్‌ను అంచనా వేస్తున్నాను…'),
      'insurance.run'),  // multi-step wizard — no on-arrival button
    summary: (r, lang) => {
      if (!r) return ''
      return loc(L(`🛡️ Claim ${r.claim_eligibility}. Estimated compensation: ${r.estimated_compensation}.`,
        `🛡️ दावा ${r.claim_eligibility}। अनुमानित मुआवजा: ${r.estimated_compensation}।`,
        `🛡️ క్లెయిమ్ ${r.claim_eligibility}. అంచనా పరిహారం: ${r.estimated_compensation}.`), lang)
    },
  },

  /* ── Government schemes ── */
  {
    id: 'schemes',
    keywords: ['scheme', 'schemes', 'subsidy', 'loan', 'pm-kisan', 'pmkisan', 'pm kisan', 'kisan',
      'yojana', 'government', 'sarkari',
      'योजना', 'सब्सिडी', 'ऋण', 'सरकारी', 'पीएम किसान', 'పథకం', 'సబ్సిడీ', 'రుణం', 'ప్రభుత్వ'],
    plan: plan('schemes',
      SAY_OPEN(L('the Government Scheme Finder', 'सरकारी योजना खोजक', 'ప్రభుత్వ పథకాల ఫైండర్')),
      L('🏛️ Finding schemes you are eligible for…', '🏛️ आपके लिए पात्र योजनाएँ ढूँढ रहा हूँ…', '🏛️ మీకు అర్హత ఉన్న పథకాలను వెతుకుతున్నాను…'),
      'schemes.run'),  // multi-step wizard — no on-arrival button
    summary: (r, lang) => {
      const n = r?.matched_schemes?.length || 0
      const first = r?.matched_schemes?.[0]?.name
      return loc(L(`🏛️ Found ${n} schemes you may qualify for${first ? `, like ${first}` : ''}. Tap "Apply Now" on any card.`,
        `🏛️ ${n} योजनाएँ मिलीं${first ? `, जैसे ${first}` : ''}। किसी भी कार्ड पर "Apply Now" दबाएँ।`,
        `🏛️ ${n} పథకాలు దొరికాయి${first ? `, ఉదా: ${first}` : ''}. ఏదైనా కార్డ్‌పై "Apply Now" నొక్కండి.`), lang)
    },
  },

  /* ── Equipment rental ── */
  {
    id: 'equipment',
    keywords: ['equipment', 'tractor', 'rent', 'rental', 'harvester', 'drone', 'machine', 'machinery', 'sprayer',
      'उपकरण', 'ट्रैक्टर', 'किराया', 'मशीन', 'యంత్రం', 'ట్రాక్టర్', 'అద్దె', 'డ్రోన్'],
    plan: plan('equipment',
      SAY_OPEN(L('the Equipment Rental Marketplace', 'उपकरण किराया बाज़ार', 'పరికరాల అద్దె మార్కెట్')),
      L('🚜 Finding machines available near you…', '🚜 आपके पास उपलब्ध मशीनें ढूँढ रहा हूँ…', '🚜 మీ దగ్గర అందుబాటులో ఉన్న యంత్రాలను వెతుకుతున్నాను…'),
      'equipment.run'),
    summary: (r, lang) => {
      if (!r?.nearest) return ''
      const n = r.nearest
      return loc(L(`🚜 ${r.available_count} machines available nearby. Nearest: ${n.name} — ₹${n.price_hour}/hr, ${n.distance} km away.`,
        `🚜 पास में ${r.available_count} मशीनें उपलब्ध। निकटतम: ${n.name} — ₹${n.price_hour}/घंटा, ${n.distance} किमी दूर।`,
        `🚜 దగ్గరలో ${r.available_count} యంత్రాలు అందుబాటులో ఉన్నాయి. సమీపం: ${n.name} — ₹${n.price_hour}/గంట, ${n.distance} కిమీ దూరం.`), lang)
    },
  },

  /* ── Smart irrigation ── */
  {
    id: 'irrigation',
    keywords: ['irrigation', 'irrigate', 'watering', 'water schedule', 'how much water', 'water',
      'सिंचाई', 'पानी', 'नीटी', 'నీటిపారుదల', 'నీరు', 'నీటి'],
    plan: plan('irrigation',
      SAY_OPEN(L('the Smart Irrigation Planner', 'स्मार्ट सिंचाई योजनाकार', 'స్మార్ట్ నీటిపారుదల ప్లానర్')),
      L('💧 Calculating your irrigation plan…', '💧 आपकी सिंचाई योजना बना रहा हूँ…', '💧 మీ నీటిపారుదల ప్లాన్‌ను లెక్కిస్తున్నాను…'),
      'irrigation.run', '[data-agent="irrigation-run"]'),
    summary: (r, lang) => {
      if (!r) return ''
      const next = r.next_irrigation_days
      const when = next === 0
        ? { en: 'Irrigate immediately!', hi: 'तुरंत सिंचाई करें!', te: 'వెంటనే నీరు పెట్టండి!' }
        : { en: `Next irrigation in ${next} day(s).`, hi: `अगली सिंचाई ${next} दिन में।`, te: `తదుపరి నీరు ${next} రోజుల్లో.` }
      return loc(L(`💧 You need ~${r.water_needed.toLocaleString()} L today, saving ${r.saving_pct}% vs traditional. ${when.en}`,
        `💧 आज ~${r.water_needed.toLocaleString()} लीटर चाहिए, पारंपरिक से ${r.saving_pct}% बचत। ${when.hi}`,
        `💧 ఈ రోజు ~${r.water_needed.toLocaleString()} లీటర్లు అవసరం, సంప్రదాయం కంటే ${r.saving_pct}% ఆదా. ${when.te}`), lang)
    },
  },

  /* ── Mandi / market prices ── */
  {
    id: 'market',
    keywords: ['price', 'prices', 'mandi', 'market', 'sell', ' rate', 'best market',
      'भाव', 'मंडी', 'कीमत', 'दाम', 'बेच', 'ధర', 'మార్కెట్', 'మండి', 'అమ్మ', 'ధరలు'],
    plan: plan('market',
      SAY_OPEN(L('Live Mandi Prices', 'लाइव मंडी भाव', 'లైవ్ మండి ధరలు')),
      L('💰 Fetching the latest mandi prices…', '💰 ताज़ा मंडी भाव ला रहा हूँ…', '💰 తాజా మండి ధరలను తెస్తున్నాను…'),
      'market.run', '[data-agent="market-run"]'),
    // Pull the crop name from the question so we fetch & answer for it.
    extract: (query) => ({ crop: extractCrop(query) }),
    summary: (r, lang, query, params) => composeMarket(r, lang, query, params),
  },

  /* ── Weather & crop advisory (also a generic fallback) ── */
  {
    id: 'weather',
    keywords: ['weather', ' rain', 'rainfall', 'forecast', 'temperature', 'storm', 'climate', 'humidity', 'wind', 'monsoon',
      'मौसम', 'बारिश', 'तापमान', 'वर्षा', 'आंधी', 'వాతావరణ', 'వర్షం', 'ఉష్ణోగ్రత', 'వాన'],
    plan: plan('weather',
      SAY_OPEN(L('the Weather & Crop Advisory', 'मौसम और फसल सलाह', 'వాతావరణం & పంట సలహా')),
      L('📍 Detecting your location and fetching live weather…',
        '📍 आपका स्थान पता कर के लाइव मौसम ला रहा हूँ…',
        '📍 మీ లొకేషన్ గుర్తించి ప్రత్యక్ష వాతావరణాన్ని తెస్తున్నాను…'),
      'weather.useLocation', '[data-agent="weather-locate"]'),
    // Answers the *specific* weather question (rain today? temp? wind?…) from live data.
    summary: (r, lang, query) => composeWeather(r, lang, query),
  },
]

/**
 * Find the first intent whose keyword appears in the message.
 * Order matters — more specific intents are listed first.
 * @returns {object|null}
 */
export function matchIntent(message) {
  const text = ' ' + (message || '').toLowerCase() + ' '
  for (const intent of INTENTS) {
    if (intent.keywords.some(k => text.includes(k.toLowerCase()))) return intent
  }
  return null
}
