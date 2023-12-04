import React from 'react';

export class ErrorBoundary extends React.Component<any> {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error: 'Ooops! Something went wrong.' };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.warn({ error, errorInfo });
  }

  render() {
    const {error} = this.state;

    if (error) {
      return <div>{error}</div>;
    }

    return this.props.children;
  }
}