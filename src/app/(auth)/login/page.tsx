/**
 * Login Page
 * Enhanced user authentication page with healthcare-themed UI
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Label,
  Spinner,
} from '@/components/ui';
import { Activity, Shield, Users, Clock, AlertCircle } from 'lucide-react';
import { secureLogger } from '@/lib/utils/secure-logger';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, signIn, error } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
    } catch (err) {
      secureLogger.error('Login failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleForgotPassword = () => {
    // This will trigger Azure AD B2C password reset flow
    secureLogger.info('Forgot password flow initiated');
    // TODO: Implement B2C password reset redirect
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-6xl">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {/* Left Side - Branding and Features */}
          <div className="hidden flex-col justify-center space-y-8 md:flex">
            {/* Logo and Title */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary p-2">
                  <Activity className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                    EMR System
                  </h1>
                  <p className="text-lg text-gray-600">
                    Electronic Medical Records
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-100 p-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Secure & Compliant</h3>
                  <p className="text-sm text-gray-600">
                    HIPAA-compliant with enterprise-grade security powered by Azure AD B2C
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-green-100 p-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Collaborative Care</h3>
                  <p className="text-sm text-gray-600">
                    Seamless collaboration between doctors, nurses, and staff
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-purple-100 p-3">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Real-time Updates</h3>
                  <p className="text-sm text-gray-600">
                    Access patient information anytime, anywhere with instant updates
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border-2 shadow-xl">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to access your EMR dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Error Display */}
                {error && (
                  <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-medium">Authentication Failed</p>
                      <p className="text-xs">{error}</p>
                    </div>
                  </div>
                )}

                {/* Sign In Button */}
                <Button
                  onClick={handleLogin}
                  className="w-full"
                  size="lg"
                  disabled={isSigningIn}
                >
                  {isSigningIn ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg
                        className="mr-2 h-5 w-5"
                        viewBox="0 0 21 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0 10.5C0 4.701 4.701 0 10.5 0S21 4.701 21 10.5 16.299 21 10.5 21 0 16.299 0 10.5z"
                          fill="#F25022"
                        />
                        <path
                          d="M10.5 0v10.5H21C21 4.701 16.299 0 10.5 0z"
                          fill="#7FBA00"
                        />
                        <path
                          d="M10.5 10.5H0c0 5.799 4.701 10.5 10.5 10.5V10.5z"
                          fill="#00A4EF"
                        />
                        <path
                          d="M10.5 10.5V21c5.799 0 10.5-4.701 10.5-10.5H10.5z"
                          fill="#FFB900"
                        />
                      </svg>
                      Sign in with Microsoft
                    </>
                  )}
                </Button>

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </Label>
                </div>

                {/* Forgot Password Link */}
                <div className="text-center">
                  <button
                    onClick={handleForgotPassword}
                    className="text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    type="button"
                  >
                    Forgot your password?
                  </button>
                </div>

                {/* Security Note */}
                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <p className="text-xs font-medium">Secure Authentication</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your credentials are protected by Azure AD B2C with multi-factor
                    authentication and enterprise-grade security.
                  </p>
                </div>

                {/* Help Text */}
                <div className="text-center text-xs text-muted-foreground">
                  <p>
                    Need help?{' '}
                    <a
                      href="/support"
                      className="font-medium text-primary hover:underline"
                    >
                      Contact Support
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
