/* ─────────────────────────────────────────────────────────────
   Agent Engine
   ────────────
   Executes an action plan (see agentIntents.js) the way a human
   would: scrolls to the section, glides an on-screen cursor to the
   target button, "clicks" it, runs the real handler, and narrates
   each step through the assistant.
   ───────────────────────────────────────────────────────────── */

import { runAgentAction, emitCursor } from './agentBus'
import { loc } from './agentIntents'

const wait = (ms) => new Promise(r => setTimeout(r, ms))

// Height of the fixed navbar, so section headings aren't hidden underneath it.
const NAV_OFFSET = 80

/**
 * Smooth-scroll a section so it fits the screen, then let it settle.
 *
 * If the whole section fits in the viewport it is centred (so the farmer
 * sees ALL of it); if it is taller than the screen its heading is pinned
 * just under the navbar. Uses an absolute window.scrollTo so it lands
 * deterministically even while React is re-rendering at the same moment.
 *
 * @param {boolean} settle  wait for the smooth scroll to finish (default true)
 */
async function scrollToSection(id, settle = true) {
  const el = document.getElementById(id)
  if (!el) return
  const rect       = el.getBoundingClientRect()
  const sectionTop = rect.top + window.scrollY
  const vh         = window.innerHeight

  let top
  if (rect.height <= vh - NAV_OFFSET) {
    // Whole section fits on screen — centre it (but never tuck the
    // heading up under the fixed navbar).
    top = sectionTop - Math.max(NAV_OFFSET, (vh - rect.height) / 2)
  } else {
    // Taller than the screen — align its heading just below the navbar.
    top = sectionTop - NAV_OFFSET
  }

  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  if (settle) await wait(900)
}

/**
 * Run a full plan.
 *
 * @param {object}   intent   matched intent (with .plan and .summary)
 * @param {string}   lang     'en' | 'hi' | 'te'
 * @param {string}   query    the farmer's original question (for tailored answers)
 * @param {object}   cb
 * @param {(text:string)=>void}        cb.onNarrate  push a chat bubble
 * @param {(text:string,lang:string)=>void} cb.onSpeak   speak the final summary
 * @returns {Promise<{ok:boolean, summary?:string, error?:string}>}
 */
export async function runAgentPlan(intent, lang, query, { onNarrate, onSpeak } = {}) {
  let lastResult = null
  let lastSection = null   // remember where we navigated, to re-anchor wizards
  // Entities pulled from the question (e.g. which crop), passed to the action.
  const params = intent.extract ? intent.extract(query) : {}
  emitCursor({ active: true, status: '' })
  try {
    for (const step of intent.plan) {
      const sayText = loc(step.say, lang)
      if (sayText) {
        emitCursor({ active: true, status: sayText })
        onNarrate?.(sayText)
      }

      if (step.type === 'navigate') {
        lastSection = step.section
        await scrollToSection(step.section)
        await wait(400)
      } else if (step.type === 'click') {
        // Glide the cursor to the on-screen button (if this feature exposes
        // one). Wizard-style features have no button on arrival — that's fine,
        // we still run their registered action below.
        const el = step.selector ? await glideAndClick(step.selector, sayText) : null
        if (el) el.classList.add('agent-target-pulse')

        if (step.action) {
          try {
            lastResult = await runAgentAction(step.action, params)
          } catch (e) {
            // Fall back to a literal click so the UI still reacts.
            if (el) el.click()
          }
        } else if (el) {
          el.click()
        }

        if (el) setTimeout(() => el.classList.remove('agent-target-pulse'), 2500)
        await wait(500)

        // Re-frame the section now that its results/form have rendered, so the
        // farmer sees the whole thing fit on screen (not just the button it
        // clicked, and not a layout shifted by the new content).
        if (lastSection) await scrollToSection(lastSection)
      } else if (step.type === 'speak') {
        // narration handled above
        await wait(300)
      }
    }

    emitCursor({ visible: false })

    const summary = intent.summary ? intent.summary(lastResult, lang, query, params) : ''
    if (summary) {
      emitCursor({ active: true, status: summary })
      onNarrate?.(summary)
      onSpeak?.(summary, lang)
    }
    // Let the farmer read the result, then retract the overlay.
    setTimeout(() => emitCursor({ active: false, visible: false }), 6000)
    return { ok: true, summary }
  } catch (err) {
    emitCursor({ active: false, visible: false })
    return { ok: false, error: err?.message || 'Agent failed' }
  }
}

/** Move cursor to a target, show a click ripple, return the element. */
async function glideAndClick(selector, status) {
  const el = document.querySelector(selector)
  if (!el) return null
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  await wait(700)
  const r = el.getBoundingClientRect()
  const x = r.left + r.width / 2
  const y = r.top + r.height / 2
  emitCursor({ x, y, visible: true, status })
  await wait(650)
  emitCursor({ x, y, visible: true, click: true, status })
  await wait(350)
  return el
}
