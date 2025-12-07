import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { BarChart3, Zap, TrendingUp, Shield } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Redirect authenticated users to dashboard
  if (isAuthenticated && user) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold text-white">Nano-Vitals</span>
          </div>
          <Button onClick={() => window.location.href = getLoginUrl()} variant="default" className="bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Real-time Core Web Vitals Monitoring
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Monitor LCP, FID, and CLS metrics with AI-powered insights. Get actionable recommendations to optimize your website performance.
          </p>
          <Button onClick={() => window.location.href = getLoginUrl()} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
              <CardTitle className="text-white">Real-time Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                Monitor LCP, FID, and CLS metrics with live WebSocket updates
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <Zap className="w-8 h-8 text-yellow-500 mb-2" />
              <CardTitle className="text-white">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                LLM-powered insights and optimization recommendations
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <Shield className="w-8 h-8 text-red-500 mb-2" />
              <CardTitle className="text-white">Smart Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                Configurable thresholds and instant notifications
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle className="text-white">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                Interactive charts and historical trend analysis
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Start Monitoring Today</h2>
        <p className="text-slate-300 mb-8">Free to get started. No credit card required.</p>
        <Button onClick={() => window.location.href = getLoginUrl()} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          Sign In Now
        </Button>
      </section>
    </div>
  );
}
