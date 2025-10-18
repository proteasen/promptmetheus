"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
  const error = searchParams.get("error")
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(error)

  // Handle potential auth errors
  useEffect(() => {
    if (error) {
      setLoginError(error)
      // Clear error from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('error')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [error])

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault()
    setLoginError(null)
    setIsLoading(true)
    // The actual navigation is handled by the LoginLink component
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
        <div className="milky-way"></div>
      </div>
      <Card className="w-full max-w-md bg-gray-900/90 backdrop-blur-md border-gray-700 relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/prompt-royale-logo.png"
              alt="Prompt Royale Logo"
              width={48}
              height={48}
              className="w-12 h-12"
            />
          </div>
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Welcome to Promptmetheus</h2>
            
            {/* Error Message */}
            {loginError && (
              <Alert variant="destructive" className="text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Error</AlertTitle>
                <AlertDescription>
                  {loginError === 'access_denied' 
                    ? 'You do not have permission to access this application.'
                    : 'An error occurred during login. Please try again.'
                  }
                </AlertDescription>
              </Alert>
            )}
            
            {/* Success Message */}
            {message === 'signed_out' && (
              <Alert className="border-green-500 bg-green-900/20">
                <AlertCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Signed Out</AlertTitle>
                <AlertDescription className="text-green-400">
                  You have been successfully signed out.
                </AlertDescription>
              </Alert>
            )}
            <CardDescription className="text-gray-300">Sign in to access your account and start building</CardDescription>
            {message && (
              <div className="mt-2 p-3 bg-yellow-900/50 border border-yellow-700 rounded-md">
                <p className="text-yellow-200 text-sm">{decodeURIComponent(message)}</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mt-6 space-y-4">
            <LoginLink>
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </Button>
            </LoginLink>
            <div className="text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <RegisterLink 
                className="text-blue-400 hover:underline"
                onClick={() => setIsLoading(true)}
              >
                Sign up
              </RegisterLink>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900 px-2 text-gray-400">Or</span>
            </div>
          </div>

          <RegisterLink>
            <Button variant="outline" className="w-full bg-transparent border-gray-600 text-white hover:bg-gray-800">
              Create Account
            </Button>
          </RegisterLink>

          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm">
              <a href="/" className="text-white underline hover:text-gray-300 transition-colors">
                Back to Home
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
