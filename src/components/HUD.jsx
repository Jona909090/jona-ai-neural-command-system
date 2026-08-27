import { useMemo } from 'react'
import { useNeuralState } from '../state/NeuralStateContext'

const nav = [
  ['⌂', 'Glavno jezgro'],
  ['◎', 'Svi projekti'],
  ['◌', 'AI Chat'],
  ['▤', 'Dokumenti'],
  ['✓', 'Zadaci'],
  ['◫', 'Kalendar'],
  ['⌁', 'Analitike'],
  ['⚙', 'Postavke'],
]

export default function HUD() {
  const runtime = useNeuralState()
  const date = useMemo(() => new Date(runtime.runtimeNow || Date.now()), [runtime.runtimeNow])
  const time = date.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
  const day = date.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return <div className="jona-shell">
    <aside className="jona-sidebar">
      <div className="jona-brand"><span className="brand-mark">J</span><div><strong>JONA AI</strong><small>Your Living Project Core</small></div></div>
      <nav>{nav.map(([icon, label], index) => <button key={label} className={index === 0 ? 'active' : ''}><span>{icon}</span>{label}</button>)}</nav>
      <div className="jona-status-card"><i /><div><small>JONA AI STATUS</small><strong>● SISTEM AKTIVAN</strong><span>Verzija 1.0.0</span></div></div>
      <div className="jona-owner"><span>SJ</span><div><strong>Stefan Jonic</strong><small>Vlasnik sistema</small></div></div>
    </aside>

    <header className="jona-topbar">
      <div className="jona-greeting"><strong>Dobro veče, Stefan 👋</strong><span>Jona je spremna da ti pomogne</span></div>
      <label className="jona-search"><span>⌕</span><input placeholder="Pretraži projekte, dokumente, zadatke..." /></label>
      <div className="jona-top-actions"><button>◉</button><button>♢</button><button>◎</button><div className="jona-clock"><strong>{time}</strong><span>{day}</span></div></div>
    </header>

    <section className="jona-bottom-panel">
      <div className="core-preview"><div className="core-preview-icon">J</div><div><small>AKTIVNO JEZGRO</small><h2>Jona Core</h2><p>Centralno živo jezgro sistema i ulaz u sve povezane module.</p><button>OTVORI JEZGRO <span>→</span></button></div></div>
      <div className="panel-column"><small>BRZI PREGLED</small><ul><li><span>Zadaci</span><b>23</b></li><li><span>U progresu</span><b>8</b></li><li><span>Završeni</span><b>15</b></li><li><span>Rokovi</span><b>5</b></li></ul></div>
      <div className="panel-column activity"><small>AKTIVNOST</small><ul><li><span>Danas u 08:15</span><b>Jezgro sinhronizovano</b></li><li><span>Juče u 17:42</span><b>Sistem ažuriran</b></li><li><span>26.08.2026</span><b>Nova vizuelna struktura</b></li></ul></div>
      <div className="panel-column quick"><small>BRZE AKCIJE</small><button>Novi zadatak <span>＋</span></button><button>Novi dokument <span>▤</span></button><button>AI Chat sa Jonom <span>◌</span></button><button>Pogledaj analitiku <span>⌁</span></button></div>
    </section>
  </div>
}
