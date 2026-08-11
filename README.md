# JONA AI // Neural Command System

Interactive WebGL V1 prototype built with React, Vite, Three.js and React Three Fiber.

## Local development

```bash
npm install
npm run dev
npm run build
```

## Visual tuning

The main controls live in `src/config/neuralConfig.js`: node/connection/signal counts, bloom, pulse speed and burst strength. Zone positions and colors are defined in the same file.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys every push to `main`. In repository Settings → Pages, select **GitHub Actions** as the source.
