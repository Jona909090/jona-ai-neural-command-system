import { useState } from 'react'
import { useNeuralState } from '../state/NeuralStateContext'

export default function CommandInput() {
  const [value, setValue] = useState('')
  const { state, activate } = useNeuralState()
  const submit = e => { e.preventDefault(); if (value.trim() && state === 'IDLE') { activate(); setValue('') } }
  return <form className="command" onSubmit={submit}>
    <button type="button" className="mic" aria-label="Microphone"><span /></button>
    <input value={value} onChange={e => setValue(e.target.value)} placeholder={state === 'IDLE' ? 'Ask JONA AI...' : `${state.toLowerCase()} neural request...`} />
    <span className="command-state">{state}</span>
    <button className="send" aria-label="Send">↗</button>
  </form>
}
