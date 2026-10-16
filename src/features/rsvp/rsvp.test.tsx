import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderAt, mockReducedMotion } from '@/test/utils'
import { LocalBackend, memoryStore } from '@/services/localBackend'
import { starterContent } from '@/features/invitation/content'

async function publishedInvitation(maxCompanions = 1) {
  const backend = new LocalBackend(memoryStore())
  await backend.signUp('alice@example.test', 'motdepasse-solide')
  const e = await backend.createEvent({ slug: 'lea-noe', content: { ...starterContent('Léa', 'Noé', '2099-09-04'), locationLabel: 'Arles' } })
  const g = await backend.addGuest(e.id, { name: 'Claire Martin', maxCompanions })
  await backend.addGuest(e.id, { name: 'Hugo Bernard', maxCompanions: 0 })
  await backend.updateEvent(e.id, { status: 'published' })
  await backend.signOut()
  return { backend, token: g.token, eventId: e.id, guestId: g.id }
}

describe('guest RSVP', () => {
  beforeEach(() => mockReducedMotion(true))

  it('a guest opens their personal link, answers, and sees a confirmation', async () => {
    const user = userEvent.setup()
    const { backend, token, eventId } = await publishedInvitation()
    renderAt(`/i/${token}?open=1`, backend)
    expect(await screen.findByRole('heading', { level: 1, name: 'Léa et Noé' })).toBeInTheDocument()
    expect(screen.getByText(/Cette invitation est adressée à/)).toHaveTextContent('Claire Martin')
    expect(document.body.textContent).not.toContain('Hugo Bernard')

    await user.click(screen.getByLabelText('Avec joie'))
    expect(screen.getByLabelText('Votre nom')).toHaveValue('Claire Martin')
    await user.selectOptions(screen.getByLabelText('Nombre d’accompagnants'), '1')
    await user.type(screen.getByLabelText(/Restrictions alimentaires/), 'Sans gluten')
    await user.type(screen.getByLabelText(/Un mot pour les mariés/), 'Avec plaisir !')
    await user.click(screen.getByRole('button', { name: 'Envoyer ma réponse' }))

    expect(await screen.findByText('Merci, nous avons hâte de vous voir.')).toBeInTheDocument()
    await backend.signIn('alice@example.test', 'motdepasse-solide')
    expect(await backend.listRsvps(eventId)).toEqual([expect.objectContaining({ attending: true, companions: 1, dietary: 'Sans gluten', message: 'Avec plaisir !' })])
  })

  it('shows an error summary that focuses and links to invalid fields', async () => {
    const user = userEvent.setup()
    const { backend, token } = await publishedInvitation()
    renderAt(`/i/${token}?open=1`, backend)
    await screen.findByRole('heading', { level: 1 })
    await user.clear(screen.getByLabelText('Votre nom'))
    await user.click(screen.getByRole('button', { name: 'Envoyer ma réponse' }))
    const summary = await screen.findByRole('alert', { name: /Quelques précisions/ })
    await vi.waitFor(() => expect(summary).toHaveFocus())
    expect(within(summary).getByRole('link', { name: /Indiquez si vous serez présent/ })).toHaveAttribute('href', '#rsvp-attending-yes')
    expect(within(summary).getByRole('link', { name: /Indiquez votre nom/ })).toBeInTheDocument()
    expect(screen.getByLabelText('Votre nom')).toHaveAttribute('aria-invalid', 'true')
  })

  it('offers no companion choice when the invitation is personal, and declining works', async () => {
    const user = userEvent.setup()
    const { backend, token } = await publishedInvitation(0)
    renderAt(`/i/${token}?open=1`, backend)
    await screen.findByRole('heading', { level: 1 })
    await user.click(screen.getByLabelText('Avec joie'))
    expect(screen.queryByLabelText('Nombre d’accompagnants')).not.toBeInTheDocument()
    await user.click(screen.getByLabelText('Avec regret'))
    expect(screen.queryByLabelText(/Restrictions alimentaires/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Envoyer ma réponse' }))
    expect(await screen.findByText('Merci de nous avoir prévenus.')).toBeInTheDocument()
  })

  it('an existing answer is shown and can be edited', async () => {
    const user = userEvent.setup()
    const { backend, token } = await publishedInvitation()
    await backend.submitRsvp(token, { attending: false, respondentName: 'Claire', companions: 0, dietary: '', message: '' })
    renderAt(`/i/${token}?open=1`, backend)
    expect(await screen.findByText('Merci de nous avoir prévenus.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Modifier ma réponse' }))
    expect(screen.getByLabelText('Avec regret')).toBeChecked()
    expect(screen.getByRole('button', { name: 'Mettre à jour ma réponse' })).toBeInTheDocument()
  })

  it('unknown and unpublished links show a neutral "introuvable" page', async () => {
    const { backend, eventId, token } = await publishedInvitation()
    const first = renderAt('/i/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', backend)
    expect(await screen.findByRole('heading', { name: 'Cette invitation est introuvable.' })).toBeInTheDocument()
    first.unmount()
    await backend.signIn('alice@example.test', 'motdepasse-solide')
    await backend.updateEvent(eventId, { status: 'draft' })
    renderAt(`/i/${token}`, backend)
    expect(await screen.findByRole('heading', { name: 'Cette invitation est introuvable.' })).toBeInTheDocument()
    expect(screen.queryByText(/Cette invitation est adressée/)).not.toBeInTheDocument()
  })

  it('the demo invitation has a working RSVP that stays local', async () => {
    const user = userEvent.setup()
    window.localStorage.clear()
    renderAt('/demo?open=1')
    await screen.findByRole('heading', { name: 'RSVP' })
    expect(screen.getByText(/reste dans ce navigateur/)).toBeInTheDocument()
    await user.click(screen.getByLabelText('Avec joie'))
    await user.click(screen.getByRole('button', { name: 'Envoyer ma réponse' }))
    expect(await screen.findByText('Merci, nous avons hâte de vous voir.')).toBeInTheDocument()
    expect(window.localStorage.getItem('vow.demo.rsvp')).toContain('"attending":true')
  })
})
