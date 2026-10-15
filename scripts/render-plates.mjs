#!/usr/bin/env node
/**
 * Renders the raster "plates" used by Our Story, Memories, Features and the demo
 * showcase. Every plate is a still of the real VOW. WebGL sculpture (dev route
 * /__plates?seed=N), or a capture of the demo invitation itself, so no imagery is
 * invented or sourced elsewhere.
 *
 * Usage: npm run plates   (needs ffmpeg with libwebp on PATH)
 */
import { spawn, execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { chromium, devices } from '@playwright/test'

const PORT = 5199
const OUT = 'public/plates'
const TMP = 'node_modules/.tmp/plates'
export const SEEDS = [3, 5, 7, 11, 13, 17, 23, 29, 31, 41]

mkdirSync(OUT, { recursive: true })
mkdirSync(TMP, { recursive: true })

const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
const base = `http://localhost:${PORT}`

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base)).ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error('vite dev server did not start')
}

function toWebp(png, out, width) {
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-vf', `scale=${width}:-2`, '-c:v', 'libwebp', '-quality', '80', out])
}

const provenance = {}
try {
  await waitForServer()
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })

  const ctx = await browser.newContext({ viewport: { width: 960, height: 1200 }, deviceScaleFactor: 1.5 })
  const page = await ctx.newPage()
  for (const seed of SEEDS) {
    await page.goto(`${base}/__plates?seed=${seed}`)
    await page.waitForSelector('[data-plate-ready="true"]', { timeout: 30_000 })
    await page.waitForTimeout(400)
    const png = `${TMP}/plate-${seed}.png`
    await page.screenshot({ path: png })
    toWebp(png, `${OUT}/plate-${seed}.webp`, 1200)
    provenance[`plate-${seed}.webp`] = `Still of the VOW. WebGL sculpture, /__plates?seed=${seed} (src/components/three, stillPose(${seed})), captured by scripts/render-plates.mjs`
    console.log('plate', seed)
  }
  await ctx.close()

  const phone = await browser.newContext({ ...devices['iPhone 14 Pro'], browserName: undefined, defaultBrowserType: undefined })
  const p2 = await phone.newPage()
  await p2.goto(`${base}/demo?open=1`)
  await p2.waitForSelector('[data-scene-ready="true"]', { timeout: 30_000 })
  await p2.waitForTimeout(1500)
  const png = `${TMP}/demo-phone.png`
  await p2.screenshot({ path: png })
  toWebp(png, `${OUT}/demo-phone.webp`, 720)
  provenance['demo-phone.webp'] = 'Capture of the demo invitation (/demo?open=1) on an emulated iPhone 14 Pro, by scripts/render-plates.mjs'
  await browser.close()

  writeFileSync(`${OUT}/PROVENANCE.json`, JSON.stringify(provenance, null, 2) + '\n')
} finally {
  server.kill()
  rmSync(TMP, { recursive: true, force: true })
}
