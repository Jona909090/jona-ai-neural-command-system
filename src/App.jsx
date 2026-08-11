import { useState } from 'react'
import { NeuralStateProvider } from './state/NeuralStateContext'
import NeuralScene from './components/NeuralScene'
import StartupSequence from './components/StartupSequence'
import HUD from './components/HUD'
import CommandInput from './components/CommandInput'
import ConversationPanel from './components/ConversationPanel'
import { ConversationProvider } from './controllers/ConversationContext'
import { VoiceProvider } from './controllers/VoiceContext'

export default function App() {
  const [ready, setReady] = useState(false)
  const [boot, setBoot] = useState({ started: false, phase: 'gate', progress: 0, zone: -1 })
  return <NeuralStateProvider><ConversationProvider><VoiceProvider>
    <main className="app">
      <NeuralScene ready={ready} boot={boot} />
      <div className={`interface ${ready ? 'visible' : ''}`}><HUD /><ConversationPanel /><CommandInput /></div>
      {!ready && <StartupSequence onProgress={setBoot} onComplete={() => setReady(true)} />}
      <div className="scanlines" />
    </main>
  </VoiceProvider></ConversationProvider></NeuralStateProvider>
}
