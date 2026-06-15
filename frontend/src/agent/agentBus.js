/* ─────────────────────────────────────────────────────────────
   Agent Bus
   ─────────
   A tiny pub/sub layer that lets the AI assistant "operate" the
   website the way a human would: components publish named actions
   (e.g. "weather.useLocation"), and the agent engine triggers them.

   Two channels:
   1. Action registry  — components register real handlers.
   2. Cursor channel    — the engine drives the on-screen robot
                          cursor / spotlight overlay.
   ───────────────────────────────────────────────────────────── */

/* ── 1. Action registry ── */

const actions = new Map() // name -> async handler

/**
 * Register an action a component can perform.
 * Call inside a useEffect and return the unregister fn for cleanup.
 *
 *   useEffect(() => registerAgentAction('weather.useLocation', handler), [deps])
 *
 * @returns {() => void} unregister function
 */
export function registerAgentAction(name, handler) {
  actions.set(name, handler)
  return () => {
    if (actions.get(name) === handler) actions.delete(name)
  }
}

/** True when a component currently exposes this action. */
export function hasAgentAction(name) {
  return actions.has(name)
}

/**
 * Run a registered action and return whatever it resolves to
 * (e.g. the weather summary). Throws if no handler is registered.
 */
export async function runAgentAction(name, params) {
  const handler = actions.get(name)
  if (!handler) throw new Error(`No agent action registered for "${name}"`)
  return handler(params)
}

/* ── 2. Cursor / overlay channel ── */

const cursorListeners = new Set()

/** Subscribe the AgentCursor overlay to cursor updates. */
export function subscribeCursor(fn) {
  cursorListeners.add(fn)
  return () => cursorListeners.delete(fn)
}

/**
 * Push a cursor state to the overlay.
 * @param {{x?:number,y?:number,visible?:boolean,click?:boolean,label?:string,status?:string}} state
 */
export function emitCursor(state) {
  cursorListeners.forEach(fn => fn(state))
}
