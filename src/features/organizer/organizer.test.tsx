import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderAt, mockReducedMotion } from '@/test/utils'
import { LocalBackend, memoryStore } from '@/services/localBackend'

beforeEach(() => mockReducedMotion(true))

describe('organizer space', () => {
  it('redirects signed-out visitors to the login page', async () => {
    renderAt('/organizer')
    expect(await screen.findByRole('heading', { name: 'Votre espace organisateur' })).toBeInTheDocument()
    expect(screen.getByRole('note')).toHaveTextContent('Mode démo local')
  })

  it('full journey: sign up, create, edit content (persisted), add a guest, publish', async () => {
    const user = userEvent.setup()
    const backend = new LocalBackend(memoryStore())
    renderAt('/organizer', backend)

    await user.click(await screen.findByRole('button', { name: /Créer un compte/ }))
    await user.type(screen.getByLabelText('E-mail'), 'alice@example.test')
    await user.type(screen.getByLabelText('Mot de passe'), 'motdepasse-solide')
    await user.click(screen.getByRole('button', { name: 'Créer mon compte' }))

    expect(await screen.findByRole('heading', { name: 'Vos invitations' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Créer l’invitation' }))
    expect(screen.getByText('Indiquez le premier prénom.')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Premier prénom'), 'Léa')
    await user.type(screen.getByLabelText('Second prénom'), 'Noé')
    await user.type(screen.getByLabelText('Date du mariage'), '2099-09-04')
    await user.click(screen.getByRole('button', { name: 'Créer l’invitation' }))

    // Lands on the content editor
    expect(await screen.findByText('Tout est enregistré.')).toBeInTheDocument()
    expect(screen.getByLabelText('Premier prénom')).toHaveValue('Léa')
    await user.type(screen.getByLabelText(/Lieu affiché/), 'Arles, France')
    await user.type(screen.getByLabelText('Nom du lieu', { selector: '#c-ceremony-name' }), 'Mas des Oliviers')
    const programme = screen.getByRole('group', { name: 'Programme' })
    await user.click(within(programme).getByRole('button', { name: 'Ajouter' }))
    await user.type(within(programme).getByLabelText('Heure'), '17:30')
    await user.type(within(programme).getByLabelText('Étape'), 'Cocktail')
    expect(screen.getByRole('status')).toHaveTextContent('Modifications non enregistrées.')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(await screen.findByText('Enregistré.')).toBeInTheDocument()

    const [event] = await backend.listEvents()
    expect(event.content).toMatchObject({ partnerOne: 'Léa', locationLabel: 'Arles, France', ceremony: { name: 'Mas des Oliviers' }, schedule: [{ time: '17:30', title: 'Cocktail' }] })
    expect(event.content.dateIso).toBe('2099-09-04T16:00:00+02:00')

    // Guests
    await user.click(screen.getByRole('link', { name: 'Invités' }))
    await user.type(await screen.findByLabelText('Nom', { selector: '#guest-name' }), 'Claire Martin')
    await user.selectOptions(screen.getByLabelText('Accompagnants autorisés'), '2')
    await user.click(screen.getByRole('button', { name: 'Ajouter' }))
    expect(await screen.findByText(/Claire Martin a été ajouté·e/)).toBeInTheDocument()
    const linkInput = screen.getByLabelText('Lien personnel de Claire Martin') as HTMLInputElement
    expect(linkInput.value).toMatch(/\/i\/[A-Za-z0-9_-]{32}$/)

    // Publish
    await user.click(screen.getByRole('button', { name: 'Publier' }))
    expect(await screen.findByText(/Invitation en ligne/)).toBeInTheDocument()
    const token = linkInput.value.split('/i/')[1]
    expect((await backend.getInvitation(token))?.guest).toEqual({ name: 'Claire Martin', maxCompanions: 2 })

    // Unpublish
    await user.click(screen.getByRole('button', { name: 'Retirer de la ligne' }))
    expect(await screen.findByText(/Invitation retirée/)).toBeInTheDocument()
    expect(await backend.getInvitation(token)).toBeNull()
  })

  it('shows RSVP statistics, and deleting a guest asks for confirmation', async () => {
    const user = userEvent.setup()
    const backend = new LocalBackend(memoryStore())
    await backend.signUp('alice@example.test', 'motdepasse-solide')
    const e = await backend.createEvent({ slug: 'stats-test', content: { partnerOne: 'A', partnerTwo: 'B', dateIso: '2099-01-01T16:00:00+01:00' } as never })
    const g1 = await backend.addGuest(e.id, { name: 'Claire', maxCompanions: 1 })
    await backend.addGuest(e.id, { name: 'Hugo', maxCompanions: 0 })
    await backend.updateEvent(e.id, { status: 'published' })
    await backend.submitRsvp(g1.token, { attending: true, respondentName: 'Claire', companions: 1, dietary: 'Vegan', message: 'Merci !' })

    renderAt(`/organizer/events/${e.id}`, backend)
    const stats = await screen.findByRole('heading', { name: 'Statistiques des réponses', hidden: true })
    const dl = stats.parentElement!
    expect(within(dl).getByText('1 / 2')).toBeInTheDocument()
    expect(within(dl).getByText('2')).toBeInTheDocument() // Claire + 1 companion
    expect(screen.getByText('Vegan')).toBeInTheDocument()
    expect(screen.getByText(/Merci !/)).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Invités' }))
    await screen.findByRole('heading', { name: /^Invités/ })
    const rows = screen.getAllByRole('listitem')
    const hugo = rows.find((r) => within(r).queryByText('Hugo'))!
    await user.click(within(hugo).getByRole('button', { name: 'Supprimer' }))
    expect(within(hugo).getByRole('alertdialog')).toHaveTextContent('Retirer Hugo ?')
    await user.click(within(hugo).getByRole('button', { name: 'Retirer' }))
    expect(await screen.findByText(/Hugo a été retiré·e/)).toBeInTheDocument()
    expect((await backend.listGuests(e.id)).map((g) => g.name)).toEqual(['Claire'])
  })

  it('another account cannot open an event it does not own', async () => {
    const backend = new LocalBackend(memoryStore())
    await backend.signUp('alice@example.test', 'motdepasse-solide')
    const e = await backend.createEvent({ slug: 'private-one', content: {} as never })
    await backend.signOut()
    await backend.signUp('bruno@example.test', 'motdepasse-solide')
    renderAt(`/organizer/events/${e.id}`, backend)
    expect(await screen.findByRole('heading', { name: 'Invitation introuvable' })).toBeInTheDocument()
  })
})
