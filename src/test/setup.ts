import '@testing-library/jest-dom/vitest'

// jsdom lacks matchMedia / IntersectionObserver; provide inert versions.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}
if (!('IntersectionObserver' in window)) {
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  ;(window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IO
}
window.scrollTo = () => {}

// jsdom has no WebGL: make the probe fail quietly (exercises the CSS fallback path).
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext
