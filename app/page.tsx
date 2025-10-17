import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-light to-background">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">Guardian Device Lifecycle Platform</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive warranty management, authentic repairs, and consumer protection for India
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-primary hover:bg-primary-dark">
                Get Started
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {[
            {
              title: "Warranty Guardian",
              description: "Digital vault for warranty documents with OCR processing",
              icon: "📋",
            },
            {
              title: "Vernacular Fix Hub",
              description: "Self-repair guidance in 10+ Indian languages",
              icon: "🗣️",
            },
            {
              title: "Part Authenticity",
              description: "Real-time verification of spare parts",
              icon: "✓",
            },
            {
              title: "Service Connect",
              description: "ML-powered repair booking and tracking",
              icon: "🔧",
            },
            {
              title: "Grievance Hub",
              description: "AI-powered complaint automation",
              icon: "⚖️",
            },
          ].map((feature, idx) => (
            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Target Users", value: "500M+" },
            { label: "Claim Success", value: "90%" },
            { label: "Languages", value: "10+" },
            { label: "Repair Centers", value: "1000+" },
          ].map((stat, idx) => (
            <div key={idx}>
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
