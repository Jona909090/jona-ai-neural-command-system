const rules = [
  { match: /plan|sutra|raspored|zadatak|prioritet/i, system: 'PLANNING', intensity: 1 },
  { match: /izračunaj|koliko|analiz|logik/i, system: 'LOGIC', intensity: 1 },
  { match: /seća|sjeća|ranije|prethodno|pamti/i, system: 'MEMORY', intensity: .95 },
  { match: /napravi|dizajn|idej|napiši|kreativ/i, system: 'CREATIVE', intensity: .95 },
]

export function routeMessage(message) {
  const matches = rules.filter(rule => rule.match.test(message))
  const dominant = matches[0]?.system
  const middle = dominant ? [dominant, ...['MEMORY', 'LOGIC', 'PLANNING'].filter(x => x !== dominant)] : ['MEMORY', 'LOGIC', 'PLANNING']
  return {
    path: ['LANGUAGE', 'CONTEXT', ...middle, 'CORE', 'RESPONSE'],
    intensities: Object.fromEntries(matches.map(rule => [rule.system, rule.intensity])),
    dominant,
  }
}
