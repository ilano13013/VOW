import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderAt, mockReducedMotion } from '@/test/utils'

describe('demo invitation', () => {
  beforeEach(() => mockReducedMotion(true))

  it('starts behind the opening gate with the content inert and scroll locked', async () => {
    renderAt('/demo')
    expect(await screen.findByText('Some moments deserve another dimension.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Open the invitation/ })).toBeInTheDocument()
    expect(screen.getByText('Démonstration — contenu fictif')).toBeInTheDocument()
    expect(document.documentElement.style.overflow).toBe('hidden')
    const heading = screen.getByRole('heading', { level: 1, hidden: true })
    expect(heading.closest('[inert]')).not.toBeNull()
  })

  it('opens the invitation, reveals the couple and moves focus to the names', async () => {
    const user = userEvent.setup()
    renderAt('/demo')
    await user.click(await screen.findByRole('button', { name: /Open the invitation/ }))
    expect(screen.queryByRole('button', { name: /Open the invitation/ })).not.toBeInTheDocument()
    const h1 = screen.getByRole('heading', { level: 1, name: 'Camille et Gabriel' })
    expect(h1.closest('[inert]')).toBeNull()
    await vi.waitFor(() => expect(h1).toHaveFocus())
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('renders every chapter: story, the day, RSVP and memories', async () => {
    renderAt('/demo?open=1')
    expect(await screen.findByRole('heading', { name: 'Our Story' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The Day' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'RSVP' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Envoyer ma réponse' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Memories' })).toBeInTheDocument()
    expect(screen.getByText('dimanche 18 juillet 2027')).toBeInTheDocument()
    expect(screen.getByText(/Plus que \d+ jours/)).toBeInTheDocument()
    expect(screen.getAllByText(/Lieu fictif/)).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: /Itinéraire/ }).length).toBe(4)
    expect(screen.getByText(/Récit fictif/)).toBeInTheDocument()
  })
})
