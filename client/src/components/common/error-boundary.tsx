import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {this.state.error?.message ?? "An unexpected error occurred. Please try again."}
          </p>
          <div className="flex items-center gap-3">
            <Button onClick={() => this.setState({ hasError: false, error: null })} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => (window.location.href = "/")}>
              <Home className="h-4 w-4" /> Go Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
