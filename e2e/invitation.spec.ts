import { test, expect } from '@playwright/test'
import { expectNoHorizontalScroll, trackErrors } from './helpers'

test.describe('demo invitation', () => {
  test('opening sequence reveals the couple', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/demo')
    await expect(page.getByText('Some moments deserve another dimension.')).toBeVisible()
    await expect(page.getByText('Démonstration — contenu fictif')).toBeVisible()
    const open = page.getByRole('button', { name: /Open the invitation/ })
    await expect(open).toBeFocused()
    await open.click()
    await expect(open).toBeHidden({ timeout: 5_000 })
    const h1 = page.getByRole('heading', { level: 1, name: 'Camille et Gabriel' })
    await expect(h1).toBeVisible()
    await expect(h1).toBeFocused()
    // names finish their reveal
    await expect(page.locator('[data-name]').first()).toHaveCSS('opacity', '1', { timeout: 5_000 })
    await expectNoHorizontalScroll(page)
    expect(errors).toEqual([])
  })

  test('keyboard: Enter opens the invitation', async ({ page }) => {
    await page.goto('/demo')
    await expect(page.getByRole('button', { name: /Open the invitation/ })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { level: 1, name: 'Camille et Gabriel' })).toBeFocused({ timeout: 5_000 })
  })

  test('chapters, countdown and directions are present after opening', async ({ page }) => {
    await page.goto('/demo?open=1')
    await page.locator('#the-day').scrollIntoViewIfNeeded()
    await expect(page.getByRole('heading', { name: 'The Day' })).toBeVisible()
    await expect(page.locator('#the-day time')).toHaveText(/dimanche 18 juillet 2027/i)
    const directions = page.getByRole('link', { name: /Itinéraire Plans/ }).first()
    await expect(directions).toHaveAttribute('href', /maps\.apple\.com\/\?q=Luberon/)
    await expectNoHorizontalScroll(page)
  })

  test('memories lightbox opens, navigates and closes with Escape', async ({ page }) => {
    await page.goto('/demo?open=1')
    const first = page.getByRole('button', { name: 'Agrandir : Atelier, été 2024' })
    await first.scrollIntoViewIfNeeded()
    await first.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Atelier, été 2024')
    await page.getByRole('button', { name: 'Souvenir suivant' }).click()
    await expect(dialog).toContainText('Lisbonne')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(first).toBeFocused()
  })

  test('demo RSVP works and stays in the browser', async ({ page }) => {
    await page.goto('/demo?open=1')
    await page.locator('#rsvp').scrollIntoViewIfNeeded()
    await page.getByText('Avec regret').click()
    await page.getByRole('button', { name: 'Envoyer ma réponse' }).click()
    await expect(page.getByText('Merci de nous avoir prévenus.')).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('vow.demo.rsvp'))).toContain('"attending":false')
  })

  test('reduced motion: opening is instant and nothing is left hidden', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    await page.goto('/demo')
    await page.getByRole('button', { name: /Open the invitation/ }).click()
    await expect(page.locator('[data-name]').first()).toHaveCSS('opacity', '1')
    await ctx.close()
  })
})
