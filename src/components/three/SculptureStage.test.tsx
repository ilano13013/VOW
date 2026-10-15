import { render } from '@testing-library/react'
import { SculptureStage } from './SculptureStage'
import { createSceneController } from './controller'

describe('SculptureStage', () => {
  it('renders the CSS fallback when WebGL is unavailable (jsdom has no WebGL)', () => {
    const { container } = render(<SculptureStage controller={createSceneController()} />)
    const stage = container.querySelector('[data-scene-mode]')
    expect(stage).toHaveAttribute('data-scene-mode', 'fallback')
    expect(container.querySelector('canvas')).toBeNull()
  })
})
