import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const NeuralStateContext = createContext(null)
export const useNeuralState = () => useContext(NeuralStateContext)

export const DEMO_PATH = ['LANGUAGE', 'CONTEXT', 'MEMORY', 'LOGIC', 'PLANNING', 'CORE', 'RESPONSE']

export function NeuralStateProvider({ children }) {
  const [state, setState] = useState('IDLE')
  const [sequence, setSequence] = useState([])
  const [signal, setSignal] = useState({ path: [], step: -1, run: 0 })
  const [focusedSystem, setFocusedSystem] = useState(null)
  const [demoResponse, setDemoResponse] = useState('')
  const [intensities, setIntensities] = useState({})
  const [hoveredSystem, setHoveredSystem] = useState(null)
  const [nearbySystem, setNearbySystem] = useState(null)
  const [sessionStartedAt, setSessionStartedAt] = useState(null)
  const [runtimeNow, setRuntimeNow] = useState(Date.now())
  const [requestCount, setRequestCount] = useState(0)
  const runId = useRef(0), timers = useRef([])

  const clearRun = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const setAIState = useCallback(next => setState(next), [])
  const activateSystem = useCallback(name => setSequence(current => current.includes(name) ? current : [...current, name]), [])
  const sendSignal = useCallback((from, to) => setSignal(current => ({ path: [from, to], step: 0, run: current.run + 1 })), [])
  const focusSystem = useCallback(name => setFocusedSystem(name), [])
  const setSystemIntensity = useCallback((name, value) => setIntensities(current => ({ ...current, [name]: Math.max(0, Math.min(1, value)) })), [])
  const resetActivity = useCallback(() => { setSequence([]); setIntensities({}); setSignal(current => ({ path: [], step: -1, run: current.run })) }, [])
  const startSession = useCallback(() => setSessionStartedAt(current => current || Date.now()), [])
  const incrementRequests = useCallback(() => setRequestCount(count => count + 1), [])
  useEffect(() => { const timer = setInterval(() => setRuntimeNow(Date.now()), 1000); return () => clearInterval(timer) }, [])

  const systemActivity = useMemo(() => {
    const names = ['LANGUAGE', 'MEMORY', 'LOGIC', 'VISION', 'CREATIVE', 'PLANNING', 'CONTEXT', 'RESPONSE'], base = state === 'IDLE' ? .12 : .18
    const activity = Object.fromEntries(names.map((name, index) => [name, base + ((index * 7) % 5) * .018]))
    sequence.forEach((name, index) => { if (activity[name] !== undefined) activity[name] = Math.max(activity[name], .78 + index * .07) })
    Object.entries(intensities).forEach(([name, value]) => { if (activity[name] !== undefined) activity[name] = Math.max(activity[name], value) })
    if (state === 'LISTENING') { activity.LANGUAGE = 1; activity.CONTEXT = Math.max(activity.CONTEXT, .82) }
    if (state === 'PROCESSING') { activity.MEMORY = Math.max(activity.MEMORY, .62); activity.LOGIC = Math.max(activity.LOGIC, .72); activity.PLANNING = Math.max(activity.PLANNING, .6) }
    if (state === 'RESPONDING') activity.RESPONSE = 1
    if (signal.step >= 0) { const current = signal.path[signal.step], next = signal.path[signal.step + 1]; if (activity[current] !== undefined) activity[current] = 1; if (activity[next] !== undefined) activity[next] = Math.max(activity[next], .82) }
    return activity
  }, [state, sequence, intensities, signal])
  const averageActivity = Object.values(systemActivity).reduce((sum, value) => sum + value, 0) / 8
  const baseLoad = state === 'PROCESSING' ? 62 : state === 'RESPONDING' ? 43 : state === 'LISTENING' ? 27 : state === 'ERROR' ? 34 : 14
  const coreLoad = Math.min(95, Math.round(baseLoad + averageActivity * (state === 'PROCESSING' ? 28 : 18)))
  const signalDensity = state === 'PROCESSING' ? (coreLoad > 84 ? 'PEAK' : 'HIGH') : state === 'RESPONDING' ? 'MEDIUM' : state === 'LISTENING' ? 'MEDIUM' : 'LOW'
  const systemEnergy = state === 'PROCESSING' ? (coreLoad > 84 ? 'PEAK' : 'HIGH') : state === 'RESPONDING' ? 'ELEVATED' : 'STABLE'
  const sessionSeconds = sessionStartedAt ? Math.max(0, Math.floor((runtimeNow - sessionStartedAt) / 1000)) : 0
  const activeRoute = signal.path.length ? signal.path : []

  const activate = useCallback(() => {
    clearRun(); const id = ++runId.current
    setDemoResponse(''); setState('LISTENING'); setSequence(['LANGUAGE', 'CONTEXT']); setSignal(s => ({ path: DEMO_PATH, step: -1, run: s.run + 1 }))
    timers.current.push(setTimeout(() => { if (runId.current !== id) return; setState('PROCESSING'); setSignal(s => ({ ...s, step: 0 })); setSequence(['LANGUAGE']) }, 650))
    DEMO_PATH.forEach((name, index) => timers.current.push(setTimeout(() => {
      if (runId.current !== id) return
      setSignal(s => ({ ...s, step: index })); setSequence(DEMO_PATH.slice(Math.max(0, index - 1), index + 1).filter(x => x !== 'CORE'))
      if (name === 'RESPONSE') { setState('RESPONDING'); setSequence(['RESPONSE']); setDemoResponse('Neural processing complete. System ready for AI integration.') }
    }, 1150 + index * 720)))
    timers.current.push(setTimeout(() => { if (runId.current !== id) return; setState('IDLE'); setSequence([]); setSignal(s => ({ ...s, step: -1 })) }, 7100))
  }, [])

  return <NeuralStateContext.Provider value={{ state, sequence, signal, focusedSystem, hoveredSystem, nearbySystem, demoResponse, intensities, systemActivity, coreLoad, signalDensity, systemEnergy, activeRoute, sessionSeconds, requestCount, runtimeNow, activate, activateSystem, sendSignal, setAIState, focusSystem, setSystemIntensity, resetActivity, setHoveredSystem, setNearbySystem, startSession, incrementRequests }}>{children}</NeuralStateContext.Provider>
}
