import { Component, type ReactNode } from 'react'

/**
 * Isolates the WebGL scene: if it throws (no WebGL, lost context, a bad asset),
 * only the 3D backdrop disappears; the itinerary and booking CTA keep working.
 */
export default class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('3D scene failed; continuing without it.', error)
  }

  render() {
    if (this.state.failed) {
      return <div className="fixed inset-x-0 top-0 z-0 h-lvh bg-gradient-to-b from-[#1b2a36] via-[#24382c] to-obsidian" aria-hidden />
    }
    return this.props.children
  }
}
