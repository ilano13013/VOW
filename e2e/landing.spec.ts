import { test, expect } from '@playwright/test'
import { expectNoHorizontalScroll, trackErrors } from './helpers'

test.describe('landing', () => {
  test('hero is immediately legible and the primary CTA opens the demo', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/')
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toContainText('Your moment.')
    await expect(h1).toContainText('Another dimension.')
    await expect(page.getByRole('link', { name: /Ouvrir l’invitation démo/ })).toBeVisible()
    await expectNoHorizontalScroll(page)
    await page.getByRole('link', { name: /Ouvrir l’invitation démo/ }).click()
    await expect(page).toHaveURL(/\/demo$/)
    await expect(page.getByRole('button', { name: /Open the invitation/ })).toBeVisible()
    expect(errors).toEqual([])
  })

  test('3D stage resolves to a WebGL scene or the CSS fallback', async ({ page }) => {
    await page.goto('/')
    const stage = page.locator('[data-scene-mode]').first()
    await expect(stage).toHaveAttribute('data-scene-mode', /webgl|fallback/)
    const mode = await stage.getAttribute('data-scene-mode')
    if (mode === 'webgl') await expect(stage).toHaveAttribute('data-scene-ready', 'true', { timeout: 15_000 })
    test.info().annotations.push({ type: 'scene-mode', description: mode ?? 'unknown' })
  })

  test('pricing CTAs lead to their order page', async ({ page }) => {
    await page.goto('/#offres')
    for (const [name, price] of [['Essential', '49'], ['Signature', '99'], ['Couture', '179']]) {
      await page.goto('/#offres')
      await page.getByRole('link', { name: new RegExp(`Commander l’offre ${name}, ${price}`) }).click()
      await expect(page).toHaveURL(new RegExp(`/commander/${name.toLowerCase()}$`))
      await expect(page.getByRole('heading', { level: 1 })).toContainText(name)
      await expect(page.getByRole('status')).toContainText('pas encore ouvert')
    }
  })

  test('FAQ items expand', async ({ page }) => {
    await page.goto('/#faq')
    const q = page.getByText('Mes invités doivent-ils installer une application ?')
    await q.click()
    await expect(page.getByText(/L’invitation s’ouvre dans le navigateur/)).toBeVisible()
  })

  test('full page has no horizontal scroll and every section renders', async ({ page }) => {
    await page.goto('/')
    for (const id of ['maison', 'demo', 'fonctionnement', 'fonctionnalites', 'offres', 'faq']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded()
      await expect(page.locator(`#${id}`)).toBeVisible()
    }
    await expectNoHorizontalScroll(page)
  })
})
