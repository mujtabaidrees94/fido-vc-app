'use client'

import { useState } from 'react'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import bs58 from 'bs58';

// Convert a Base64URL string to a Uint8Array
function base64URLToUint8Array(base64UrlString: string): Uint8Array {
  // Add padding if needed
  const padding = base64UrlString.length % 4;
  if (padding) {
    base64UrlString += '='.repeat(4 - padding);
  }

  // Convert Base64URL to Base64
  const base64String = base64UrlString
    .replace(/-/g, '+')  // Replace '-' with '+'
    .replace(/_/g, '/')  // Replace '_' with '/'
  
  // Decode the Base64 string to a Uint8Array
  const binaryString = atob(base64String);
  const byteArray = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }

  return byteArray;
}


function encodePublicKeyToDID(publicKey: string): string {
  // Simplified example for Base58 encoding (you might need a library like `bs58`):
  return `did:key:${bs58.encode(base64URLToUint8Array(publicKey))}`;
}

export function PasskeyDemoComponent() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const registerStartResponse = await fetch('http://localhost:3001/register/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })

      const registerStartData = await registerStartResponse.json()

      const credential = await startRegistration(registerStartData)

      const did = encodePublicKeyToDID(credential.response.publicKey || '');

      const registerFinishResponse = await fetch('http://localhost:3001/register/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, credential }),
      })

      const registerFinishData = await registerFinishResponse.json()

      if (registerFinishData.verified) {
        setMessage({ type: 'success', text: 'Registration successful with DID ${did} ! You can now log in.' })
      } else {
        setMessage({ type: 'error', text: 'Registration failed. Please try again.' })
      }
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: 'An error occurred during registration.' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const loginStartResponse = await fetch('http://localhost:3001/login/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })

      const loginStartData = await loginStartResponse.json()

      const credential = await startAuthentication(loginStartData)

      const loginFinishResponse = await fetch('http://localhost:3001/login/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, credential }),
      })

      const loginFinishData = await loginFinishResponse.json()

      if (loginFinishData.verified) {
        setMessage({ type: 'success', text: 'Login successful!' })
      } else {
        setMessage({ type: 'error', text: 'Login failed. Please try again.' })
      }
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: 'An error occurred during login.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Passkey Demo</CardTitle>
          <CardDescription>Register or login using passkeys</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="register">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button className="w-full mt-4" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Register'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button className="w-full mt-4" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          {message && (
            <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
              {message.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}