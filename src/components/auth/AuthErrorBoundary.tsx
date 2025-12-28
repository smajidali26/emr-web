/**
 * Authentication Error Boundary
 * Catches and handles authentication errors gracefully
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/ui';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { secureLogger } from '@/lib/utils/secure-logger';

interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallbackUrl?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error boundary component for authentication-related errors
 * Provides a fallback UI when auth errors occur
 */
export class AuthErrorBoundary extends Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AuthErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to our secure logger
    secureLogger.error('Authentication error caught by boundary:', error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    const { fallbackUrl = '/' } = this.props;
    window.location.href = fallbackUrl;
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
          <Card className="w-full max-w-md border-2 border-destructive/20 shadow-xl">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-3">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Authentication Error</CardTitle>
                  <CardDescription>
                    We encountered an issue with authentication
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User-friendly error message */}
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  {this.state.error?.message || 'An unexpected authentication error occurred.'}
                </p>
              </div>

              {/* Development-only detailed error info */}
              {isDevelopment && this.state.errorInfo && (
                <details className="rounded-lg border border-destructive/20 p-4">
                  <summary className="cursor-pointer text-sm font-medium text-destructive">
                    Technical Details (Development Only)
                  </summary>
                  <pre className="mt-2 overflow-auto text-xs text-muted-foreground">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {/* Help text */}
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  If this problem persists, please try:
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>• Clearing your browser cache and cookies</li>
                  <li>• Signing out and signing back in</li>
                  <li>• Using a different browser</li>
                  <li>• Contacting support if the issue continues</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with AuthErrorBoundary
 */
export function withAuthErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallbackUrl?: string
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <AuthErrorBoundary fallbackUrl={fallbackUrl}>
        <Component {...props} />
      </AuthErrorBoundary>
    );
  };
}
