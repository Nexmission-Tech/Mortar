import { Component, type ReactNode } from 'react'

/**
 * Catches a Building view that cannot start (no WebGL 2, a lost context, a GPU
 * blocklist) so the page can fall back to the Grid instead of the whole app
 * showing its error screen.
 */
export class BuildingBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onFail()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
