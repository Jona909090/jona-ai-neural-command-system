import { createContext, useCallback, useContext, useRef, useState } from 'react'

const NeuralStateContext = createContext(null)
export const useNeuralState = () => useContext(NeuralStateContext)

export function NeuralStateProvider({ children }) {
  const [state, setState] = useState('IDLE')
  const [sequence, setSequence] = useState([])
  const runId = useRef(0)

  const activate = useCallback(() => {
    const id = ++runId.current
    setState('LISTENING'); setSequence(['LANGUAGE', 'CONTEXT'])
    setTimeout(() => { if (runId.current !== id) return; setState('PROCESSING'); setSequence(['LANGUAGE', 'CONTEXT', 'LOGIC', 'MEMORY']) }, 900)
    setTimeout(() => { if (runId.current !== id) return; setState('RESPONDING'); setSequence(['RESPONSE']) }, 2800)
    setTimeout(() => { if (runId.current !== id) return; setState('IDLE'); setSequence([]) }, 4600)
  }, [])

  return <NeuralStateContext.Provider value={{ state, sequence, activate }}>{children}</NeuralStateContext.Provider>
}
