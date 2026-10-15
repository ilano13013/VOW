/**
 * Mutable, render-free bridge between DOM animation (GSAP) and the WebGL scene.
 * GSAP tweens these numbers; the scene reads them every frame. No React re-renders.
 */
export interface SceneController {
  /** 0 → closed, 1 → opening burst at peak. */
  open: number
  /** Global intensity multiplier for distortion. */
  energy: number
  /** Scroll progress 0..1 for the section hosting the scene. */
  scroll: number
}

export function createSceneController(init: Partial<SceneController> = {}): SceneController {
  return { open: 0, energy: 1, scroll: 0, ...init }
}
