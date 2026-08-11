const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

function createMockAnswer(input) {
  const text = input.toLocaleLowerCase('hr')
  if (/plan|sutra|raspored|zadatak/.test(text)) return 'Pripremio sam početni plan: odredi tri najvažnija cilja, rasporedi fokusirane radne blokove i ostavi prostor za pregled rezultata. Kada povežemo pravi AI servis, plan će se prilagođavati svim detaljima koje navedeš.'
  if (/napravi|dizajn|idej|napiši|kreativ/.test(text)) return 'Kreativni sistem je generisao početni smjer: izgradi iskustvo oko jedne snažne ideje, jasnog vizuelnog identiteta i interakcije koja korisniku odmah pokazuje vrijednost. Pravi AI provider će kasnije ponuditi detaljne varijante.'
  if (/izračunaj|koliko|analiz/.test(text)) return 'Logički sistem je obradio strukturu zahtjeva. Za precizan proračun biće potrebno povezati pravi AI servis i proslijediti kompletne vrijednosti, ali neuralni tok i streaming odgovor već rade.'
  if (/seća|sjeća|ranije|prethodno/.test(text)) return 'Memory Matrix je aktiviran. Trenutno pamtim poruke samo tokom ove otvorene sesije; trajna memorija još nije uključena.'
  return 'Neuralna obrada je završena. JONA AI razgovorna arhitektura radi u sigurnom mock režimu i spremna je za kasnije povezivanje sa server-side AI servisom.'
}

export class MockAIProvider {
  async stream({ input, signal, onToken }) {
    const words = createMockAnswer(input).split(' ')
    for (const word of words) {
      if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError')
      await wait(42); onToken(`${word} `)
    }
    return words.join(' ')
  }
}
