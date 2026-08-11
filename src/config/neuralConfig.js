export const CONFIG = {
  nodeCount: 1900,
  connectionCount: 4300,
  signalCount: 62,
  starCount: 1100,
  coreRadius: 5.1,
  bloomIntensity: 0.72,
  bloomThreshold: 0.62,
  pulseSpeed: 1,
  burstStrength: 2.8,
}

export const ZONES = [
  { name: 'LANGUAGE', color: '#ff2d9b', pos: [-5.5, 2.8, 1.1], status: 'ACTIVE' },
  { name: 'MEMORY', color: '#58ed4f', pos: [-3.4, -4.1, -1.4], status: 'ACTIVE' },
  { name: 'LOGIC', color: '#238cff', pos: [1.1, 4.9, -1.1], status: 'ACTIVE' },
  { name: 'VISION', color: '#13e4ff', pos: [5.2, 2.1, -1.5], status: 'STANDBY' },
  { name: 'CREATIVE', color: '#ff8a19', pos: [5.5, -2.5, 0.8], status: 'ACTIVE' },
  { name: 'PLANNING', color: '#a84cff', pos: [1.5, -5.0, -0.5], status: 'ACTIVE' },
  { name: 'CONTEXT', color: '#ffd234', pos: [-5.9, -1.0, -1.8], status: 'ACTIVE' },
  { name: 'RESPONSE', color: '#27f0c1', pos: [3.1, 3.8, 1.9], status: 'READY' },
]
