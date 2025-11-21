import { ArrowRight, Shield, Zap } from "lucide-react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";

export default function LandingPage() {
  const features = [
    {
      title: "Verify once, pay anywhere",
      body: "Face-matched payments with built-in AML rules keep every transaction compliant.",
    },
    {
      title: "Bank-grade security",
      body: "Data stays encrypted end-to-end with passive liveness checks and audit trails.",
    },
    {
      title: "Faster checkout",
      body: "Tap, smile, done. Average checkout time is under three seconds at the terminal.",
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6ee,#f8f0f4_55%,#fff)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-cerise-red-700">
          <Shield className="size-6" />
          <span className="text-lg font-semibold">lookandpay</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/signin" className="text-cerise-red-700 hover:underline">
            Sign in
          </Link>
          <Link href="/signup">
            <Button className="rounded-full px-5">Create account</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl bg-white/80 p-10 shadow-[0_20px_60px_rgba(168,46,69,0.12)]">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cerise-red-500">
            Biometric payments platform
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-cerise-red-900 lg:text-5xl">
            Delightful checkout journeys built on face verification.
          </h1>
          <p className="mt-4 text-lg text-cerise-red-700">
            Launch secure face-to-pay experiences faster with turnkey
            onboarding, AML-grade verification, and wallet issuance baked into
            one stack.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-7">
                Get started
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-cerise-red-200 bg-white/60 px-7"
              >
                I already have access
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-6 rounded-2xl bg-cerise-red-50/70 p-6 text-sm text-cerise-red-700 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Shield className="mt-1 size-4 text-cerise-red-500" />
              <p>
                Backed by encrypted device handshakes and continuous monitoring.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="mt-1 size-4 text-cerise-red-500" />
              <p>Real-time wallet updates keep merchants and users in sync.</p>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-cerise-red-100 bg-white/90 p-6 shadow-[0_12px_30px_rgba(167,44,69,0.08)]"
            >
              <h3 className="text-lg font-semibold text-cerise-red-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-cerise-red-700">{feature.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
