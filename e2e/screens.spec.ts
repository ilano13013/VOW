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

test('capture organizer and RSVP screens', async ({ page, context }, info) => {
  test.setTimeout(180_000)
  const dir = `test-results/screens/${info.project.name}`
  await page.goto('/organizer')
  await page.screenshot({ path: `${dir}/org-login.png` })
  await page.getByRole('button', { name: /Créer un compte/ }).click()
  await page.getByLabel('E-mail').fill('camille@example.test')
  await page.getByLabel('Mot de passe').fill('motdepasse-solide')
  await page.getByRole('button', { name: 'Créer mon compte' }).click()
  await page.getByLabel('Premier prénom').fill('Camille')
  await page.getByLabel('Second prénom').fill('Gabriel')
  await page.getByLabel('Date du mariage').fill('2027-07-18')
  await page.getByRole('button', { name: 'Créer l’invitation' }).click()
  await page.getByText('Tout est enregistré.').waitFor()
  await page.getByLabel(/Lieu affiché/).fill('Provence, France')
  await page.locator('#c-ceremony-name').fill('La Chapelle des Lumières')
  await page.getByRole('button', { name: 'Enregistrer' }).click()
  await page.getByText('Enregistré.').waitFor()
  await page.screenshot({ path: `${dir}/org-content.png` })
  await page.getByRole('link', { name: 'Invités' }).click()
  const guests: [string, string][] = [['Claire et Thomas Martin', '1'], ['Hugo Bernard', '0'], ['Inès Laurent', '2'], ['Paul Moreau', '0']]
  const links: string[] = []
  for (const [name, max] of guests) {
    await page.locator('#guest-name').fill(name)
    await page.getByLabel('Accompagnants autorisés').selectOption(max)
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
    await page.getByText(new RegExp(`${name} a été ajouté`)).waitFor()
    links.push(await page.getByLabel(`Lien personnel de ${name}`).inputValue())
  }
  await page.getByRole('button', { name: 'Publier' }).click()
  await page.getByText(/Invitation en ligne/).waitFor()
  const guest = await context.newPage()
  for (const [i, answer] of [[0, 'yes'], [1, 'no'], [2, 'yes']] as const) {
    await guest.goto(`${links[i]}?open=1`)
    await guest.locator('#rsvp').scrollIntoViewIfNeeded()
    await guest.getByText(answer === 'yes' ? 'Avec joie' : 'Avec regret').click()
    if (answer === 'yes') await guest.getByLabel(/Restrictions alimentaires/).fill(i === 0 ? 'Thomas : sans gluten' : 'Végétarienne')
    await guest.getByLabel(/Un mot pour les mariés/).fill(i === 1 ? 'Je serai de cœur avec vous.' : 'Nous avons hâte !')
    if (i === 2) await guest.screenshot({ path: `${dir}/rsvp-filled.png` })
    await guest.getByRole('button', { name: 'Envoyer ma réponse' }).click()
    await guest.getByText(/Merci/).first().waitFor()
  }
  await guest.locator('#rsvp').screenshot({ path: `${dir}/rsvp-done.png` })
  await page.reload()
  await page.getByRole('heading', { name: /^Invités/ }).waitFor()
  await page.screenshot({ path: `${dir}/org-guests.png`, fullPage: true })
  await page.getByRole('link', { name: 'Vue d’ensemble' }).click()
  await page.getByText('3 / 4').waitFor()
  await page.screenshot({ path: `${dir}/org-overview.png`, fullPage: true })
  await page.goto('/organizer')
  await page.screenshot({ path: `${dir}/org-dashboard.png` })
})
