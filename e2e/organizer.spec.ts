import { test, expect } from '@playwright/test'
import { expectNoHorizontalScroll, trackErrors } from './helpers'

test('organizer creates an invitation, adds a guest, publishes; the guest answers', async ({ page, context }, info) => {
  test.setTimeout(90_000)
  const errors = trackErrors(page)
  await page.goto('/organizer')
  await expect(page.getByRole('heading', { name: 'Votre espace organisateur' })).toBeVisible()
  await page.getByRole('button', { name: /Créer un compte/ }).click()
  await page.getByLabel('E-mail').fill(`alice+${info.project.name}@example.test`)
  await page.getByLabel('Mot de passe').fill('motdepasse-solide')
  await page.getByRole('button', { name: 'Créer mon compte' }).click()

  await expect(page.getByRole('heading', { name: 'Vos invitations' })).toBeVisible()
  await page.getByLabel('Premier prénom').fill('Léa')
  await page.getByLabel('Second prénom').fill('Noé')
  await page.getByLabel('Date du mariage').fill('2099-09-04')
  await page.getByRole('button', { name: 'Créer l’invitation' }).click()

  await expect(page.getByText('Tout est enregistré.')).toBeVisible()
  await page.getByLabel(/Lieu affiché/).fill('Arles, France')
  await page.locator('#c-ceremony-name').fill('Mas des Oliviers')
  await page.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText('Enregistré.')).toBeVisible()
  await expectNoHorizontalScroll(page)

  await page.getByRole('link', { name: 'Invités' }).click()
  await page.locator('#guest-name').fill('Claire Martin')
  await page.getByLabel('Accompagnants autorisés').selectOption('1')
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await expect(page.getByText(/Claire Martin a été ajouté·e/)).toBeVisible()
  const link = await page.getByLabel('Lien personnel de Claire Martin').inputValue()
  expect(link).toMatch(/\/i\/[A-Za-z0-9_-]{32}$/)
  await page.getByRole('button', { name: 'Publier' }).click()
  await expect(page.getByText(/Invitation en ligne/)).toBeVisible()
  await expectNoHorizontalScroll(page)

  // Same browser profile: the local demo backend stores data per browser.
  const guest = await context.newPage()
  await guest.goto(link)
  await guest.getByRole('button', { name: /Open the invitation/ }).click()
  await expect(guest.getByRole('heading', { level: 1, name: 'Léa et Noé' })).toBeVisible()
  await guest.locator('#rsvp').scrollIntoViewIfNeeded()
  await guest.getByText('Avec joie').click()
  await guest.getByLabel('Nombre d’accompagnants').selectOption('1')
  await guest.getByLabel(/Restrictions alimentaires/).fill('Sans gluten')
  await guest.getByRole('button', { name: 'Envoyer ma réponse' }).click()
  await expect(guest.getByText('Merci, nous avons hâte de vous voir.')).toBeVisible()
  await expectNoHorizontalScroll(guest)

  await page.getByRole('link', { name: 'Vue d’ensemble' }).click()
  await expect(page.getByText('1 / 1')).toBeVisible()
  await expect(page.getByText('Sans gluten')).toBeVisible()
  expect(errors).toEqual([])
})

test('a broken guest link shows the neutral page', async ({ page }) => {
  await page.goto('/i/not-a-real-token')
  await expect(page.getByRole('heading', { name: 'Cette invitation est introuvable.' })).toBeVisible()
})
