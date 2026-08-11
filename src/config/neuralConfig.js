export const CONFIG = {
  nodeCount: 1900,
  connectionCount: 4300,
  signalCount: 62,
  starCount: 1100,
  coreRadius: 5.1,
  bloomIntensity: 1.25,
  bloomThreshold: 0.16,
  pulseSpeed: 1,
  burstStrength: 2.8,
}

export const ZONES = [
  { name: 'LANGUAGE', color: '#19e9ff', pos: [-5.5, 2.8, 1.1], status: 'ACTIVE' },
  { name: 'MEMORY', color: '#8b5cff', pos: [-3.4, -4.1, -1.4], status: 'ACTIVE' },
  { name: 'LOGIC', color: '#2f7dff', pos: [1.1, 4.9, -1.1], status: 'ACTIVE' },
  { name: 'VISION', color: '#ff3ca6', pos: [5.2, 2.1, -1.5], status: 'STANDBY' },
  { name: 'CREATIVE', color: '#ff593f', pos: [5.5, -2.5, 0.8], status: 'ACTIVE' },
  { name: 'PLANNING', color: '#ffb31a', pos: [1.5, -5.0, -0.5], status: 'ACTIVE' },
  { name: 'CONTEXT', color: '#47e675', pos: [-5.9, -1.0, -1.8], status: 'ACTIVE' },
  { name: 'RESPONSE', color: '#ffe35b', pos: [3.1, 3.8, 1.9], status: 'READY' },
]
