import { Component, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught render error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
          {/* Logo */}
          <div className="mb-8">
            <img src="/logo.svg" alt="KongoFix" className="h-12 mx-auto" />
          </div>

          {/* Icon */}
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
            <span className="text-5xl">⚠️</span>
          </div>

          {/* Title */}
          <h1 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Oups ! Quelque chose s'est mal passé.
          </h1>

          {/* Message */}
          <p className="mb-8 max-w-md text-base text-muted-foreground leading-relaxed">
            Une erreur inattendue s'est produite. Veuillez réessayer.
          </p>

          {/* Error detail in development */}
          {process.env.NODE_ENV !== "production" && this.state.error && (
            <details className="mb-6 max-w-lg w-full text-left">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Détails techniques
              </summary>
              <pre className="mt-2 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground max-h-40">
                {this.state.error.message}
                {this.state.error.stack ? `\n\n${this.state.error.stack}` : ""}
              </pre>
            </details>
          )}

          {/* Retry button */}
          <Button onClick={this.handleRetry} size="lg" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
