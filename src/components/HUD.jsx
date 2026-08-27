import { useEffect, useState } from 'react'

const nav = [
  ['⌂', 'Glavni Jezgro'],
  ['⊞', 'Svi Projekti'],
  ['☵', 'AI Chat'],
  ['▤', 'Dokumenti'],
  ['☑', 'Zadaci'],
  ['◫', 'Kalendar'],
  ['⌁', 'Analitike'],
  ['⚙', 'Postavke'],
]

const planets = [
  { cls:'tasker', icon:'</>', name:'Tasker', count:'23', color:'blue' },
  { cls:'docs', icon:'▰', name:'Dokumenti AI', count:'15', color:'green' },
  { cls:'tasker2', icon:'🚀', name:'Tasker 2.0', count:'12', color:'purple' },
  { cls:'webapp', icon:'◎', name:'Web App', count:'14', color:'orange' },
  { cls:'forge', icon:'⚒', name:'Kovačnica', count:'8', color:'orange2' },
  { cls:'analytics', icon:'▥', name:'Analytics AI', count:'9', color:'purple2' },
  { cls:'portfolio', icon:'▤', name:'Portfolio', count:'7', color:'blue2' },
  { cls:'newproject', icon:'＋', name:'Novi Projekat', count:'＋', color:'teal', planned:true },
]

export default function HUD(){
  const [now,setNow]=useState(new Date())
  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t)},[])
  const time=now.toLocaleTimeString('sr-RS',{hour:'2-digit',minute:'2-digit'})
  const date=now.toLocaleDateString('sr-RS',{day:'2-digit',month:'2-digit',year:'numeric'})

  return <div className="screen">
    <aside className="sidebar">
      <div className="brand"><div className="brand-logo">C</div><div><h1>JONA AI</h1><p>Your Living Project Core</p></div></div>
      <nav>{nav.map(([i,l],idx)=><button key={l} className={idx===0?'active':''}><span>{i}</span>{l}</button>)}</nav>
      <div className="status-card"><div className="pulse-line">⌁</div><div><small>JONA AI STATUS</small><b><i/> SISTEM AKTIVAN</b><span>Verzija 1.0.0</span></div></div>
      <div className="owner"><div className="owner-medal">✧</div><div><strong>Stefan Jonic</strong><small>Vlasnik Sistema</small></div></div>
    </aside>

    <main className="content">
      <header className="topbar">
        <div className="greeting"><h2>Dobro jutro, Stefan 👋</h2><p>Jona je spremna da ti pomogne</p></div>
        <label className="search"><span>⌕</span><input placeholder="Pretraži projekte, dokumente, zadatke..."/><kbd>⌘K</kbd></label>
        <div className="tools"><button>⌁</button><button>♢</button><button>◯</button><div className="clock"><strong>{time}</strong><span>{date}</span></div></div>
      </header>

      <section className="universe">
        <div className="starfield"/>
        <svg className="energy" viewBox="0 0 1280 690" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <path className="e blue" d="M642 340 C520 280 450 220 305 170"/>
          <path className="e green" d="M642 340 C640 245 645 190 648 105"/>
          <path className="e purple" d="M642 340 C735 265 835 220 955 170"/>
          <path className="e orange" d="M642 340 C480 360 355 355 205 330"/>
          <path className="e orange2" d="M642 340 C790 350 935 330 1085 315"/>
          <path className="e purple2" d="M642 340 C530 430 390 480 250 515"/>
          <path className="e blue2" d="M642 340 C760 420 880 480 915 535"/>
          <path className="e teal" d="M642 340 C840 390 1010 440 1135 490"/>
        </svg>

        {planets.map(p=><div key={p.name} className={`planet ${p.cls} ${p.color}`}>
          <div className="planet-halo"/><div className="planet-shell"/><div className="planet-icon">{p.icon}</div>
          <span className="badge">{p.count}</span><strong>{p.name}</strong><small className={p.planned?'planned':''}><i/>{p.planned?'Planiran':'Aktivan'}</small>
        </div>)}

        <div className="core-wrap">
          <div className="core-energy core-energy-a"/><div className="core-energy core-energy-b"/>
          <div className="core-orb">
            <div className="robot-head"><span className="ear left"/><span className="ear right"/><div className="face"><i/><i/><b/></div></div>
            <div className="robot-body">JONA AI<br/><span>CORE</span></div>
          </div>
          <div className="core-base"><i/><i/><i/></div>
        </div>
      </section>

      <section className="tasker-panel">
        <div className="tasker-main"><div className="tasker-icon">&lt;/&gt;</div><div><h3>Tasker</h3><span className="active-pill">AKTIVAN PROJEKAT</span><p>Aplikacija za upravljanje zadacima<br/>i projektima na gradilištu.</p><button>OTVORI PROJEKAT <b>→</b></button></div></div>
        <div className="panel-col"><small>BRZI PREGLED</small><ul><li><span>☑ Zadaci</span><b>23</b></li><li><span>◉ U progresu</span><b>8</b></li><li><span>◉ Završeni</span><b>15</b></li><li><span>◫ Rokovi</span><b className="red">5</b></li></ul></div>
        <div className="panel-col activity"><small>AKTIVNOST</small><ul><li><span>Danas u 08:15</span><b>Dodato 3 nova zadatka</b></li><li><span>Juče u 17:42</span><b>Završen modul: Vertiv Rugvica</b></li><li><span>26.08.2025 u 14:23</span><b>Izmenjen dokument: Ponuda.pdf</b></li></ul><a>Vidi sve aktivnosti →</a></div>
        <div className="panel-col quick"><small>BRZE AKCIJE</small><button>Novi Zadatak <span>＋</span></button><button>Novi Dokument <span>▤</span></button><button>AI Chat sa Jonom <span>☵</span></button><button>Pogledaj Analitiku <span>⌁</span></button></div>
      </section>
    </main>
  </div>
}
