import { Link } from "wouter";
import { Button } from "../components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-between items-center border-b">
        <h1 className="text-xl font-bold">Face Payment</h1>
        <div className="space-x-4">
          <Link href="/signin"><Button variant="ghost">Sign In</Button></Link>
          <Link href="/signup"><Button>Sign Up</Button></Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8">
        <h2 className="text-5xl font-bold tracking-tight">Pay with your Face</h2>
        <p className="text-xl text-gray-600 max-w-2xl">
            The future of biometric payments is here. Secure, fast, and easy.
        </p>
        <div className="space-x-4">
            <Link href="/signup"><Button size="lg">Get Started</Button></Link>
            <Link href="/signin"><Button variant="outline" size="lg">Sign In</Button></Link>
        </div>
      </main>
    </div>
  );
}
