"use client";

import { Component, type ReactNode } from "react";
import { ErrorAlert } from "@/components/ui/error-alert";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4">
          <ErrorAlert
            title="Something went wrong"
            message={this.state.error.message}
            onRetry={this.handleReset}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
