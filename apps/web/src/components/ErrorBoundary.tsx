// ============================================================
// Catches errors thrown while rendering anything below it, and shows a
// fallback instead of a blank page.
//
// REACT CONCEPT: error boundaries. There is no hook for this yet, so it is the
// one place where a class component is still the idiomatic choice.
// Note: boundaries catch render/lifecycle errors, not errors in event handlers
// or async code (those are reported through toasts).
// ============================================================
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error('Unhandled render error', error, info.componentStack);
  }

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="crash" role="alert">
        <h1>Something went wrong</h1>
        <p>The editor hit an unexpected error. Your last saved version is safe on the server.</p>
        <pre className="crash__details">{error.message}</pre>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }
}
