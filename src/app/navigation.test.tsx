import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderAt, mockReducedMotion } from '@/test/utils'

beforeEach(() => mockReducedMotion(true))

const KNOWN = [/^#main$/, /^\/$/, /^\/#(maison|offres|faq|fonctionnalites|demo)$/, /^\/demo$/, /^\/organizer$/, /^\/commander\/(essential|signature|couture)$/]

describe('navigation', () => {
  it('renders the landing hero with its signature', async () => {
    renderAt('/')
    const h1 = await screen.findByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Your moment.')
    expect(h1).toHaveTextContent('Another dimension.')
  })

  it('every internal link on the landing page points at a real route', async () => {
    renderAt('/')
    await screen.findByRole('heading', { level: 1 })
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(10)
    for (const a of links) {
      const href = a.getAttribute('href') ?? ''
      if (/^https?:/.test(href)) continue
      expect(KNOWN.some((r) => r.test(href)), `unexpected link target ${href}`).toBe(true)
    }
  })

  it('shows the three plans with working order CTAs', async () => {
    renderAt('/')
    const section = (await screen.findByRole('heading', { name: /Trois offres/ })).closest('section')!
    for (const [name, price] of [['Essential', '49'], ['Signature', '99'], ['Couture', '179']]) {
      const cta = within(section).getByRole('link', { name: new RegExp(`Commander l’offre ${name}, ${price}`) })
      expect(cta).toHaveAttribute('href', `/commander/${name.toLowerCase()}`)
    }
  })

  it('order page states explicitly that payment is not yet available', async () => {
    renderAt('/commander/couture')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Couture')
    expect(screen.getByRole('status')).toHaveTextContent(/n’est pas encore ouvert/)
    expect(screen.getByRole('status')).toHaveTextContent(/Aucun paiement/)
  })

  it('unknown plans and routes fall back to the 404 page', async () => {
    renderAt('/commander/platinum')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('n’existe pas')
  })

  it('mobile menu toggles and exposes its state', async () => {
    const user = userEvent.setup()
    renderAt('/')
    const toggle = await screen.findByRole('button', { name: 'Ouvrir le menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Fermer le menu' })).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Ouvrir le menu' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('features index supports keyboard navigation (tabs pattern)', async () => {
    const user = userEvent.setup()
    renderAt('/')
    const tabs = await screen.findAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    tabs[0].focus()
    await user.keyboard('{ArrowDown}')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveFocus()
    await user.keyboard('{End}')
    expect(tabs[tabs.length - 1]).toHaveAttribute('aria-selected', 'true')
  })
})
