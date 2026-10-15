import { test, type Page } from '@playwright/test'

// Visual capture for review (not a pixel assertion). Output: test-results/screens/<project>/
// Tall pages are captured in segments: Chromium caps a single surface at ~16384 device px.
const SEGMENT = 3600 // CSS px

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(1800)
}

async function captureSegments(page: Page, path: string) {
  const { width, height } = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    height: document.documentElement.scrollHeight,
  }))
  for (let i = 0, y = 0; y < height; i++, y += SEGMENT) {
    await page.screenshot({ path: `${path}-${String(i + 1).padStart(2, '0')}.png`, fullPage: true, clip: { x: 0, y, width, height: Math.min(SEGMENT, height - y) } })
  }
}

test('capture key screens', async ({ page }, info) => {
  test.setTimeout(180_000)
  const dir = `test-results/screens/${info.project.name}`
  await page.goto('/')
  await page.waitForTimeout(3500)
  await page.screenshot({ path: `${dir}/landing-hero.png` })
  await scrollThrough(page)
  await captureSegments(page, `${dir}/landing-full`)
  await page.goto('/demo')
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${dir}/demo-opening.png` })
  await page.getByRole('button', { name: /Open the invitation/ }).click()
  await page.waitForTimeout(4000)
  await page.screenshot({ path: `${dir}/demo-hero.png` })
  await scrollThrough(page)
  await captureSegments(page, `${dir}/demo-full`)
})
