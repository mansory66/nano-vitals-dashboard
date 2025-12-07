import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import type { CoreWebVital } from "../../../drizzle/schema";

interface MetricsChartProps {
  metrics: CoreWebVital[];
  websiteName: string;
}

export default function MetricsChart({ metrics, websiteName }: MetricsChartProps) {
  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
          <CardDescription>No metrics recorded yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Metrics will appear here once data is collected</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = metrics
    .slice()
    .reverse()
    .map((m, idx) => ({
      time: `${idx}m`,
      lcp: m.lcp || 0,
      lighthouseScore: m.lighthouseScore || 0,
      performanceScore: m.performanceScore || 0,
    }));

  const latestMetric = metrics[metrics.length - 1];

  const getScoreColor = (score: number | null | undefined) => {
    if (!score) return "text-gray-500";
    if (score >= 90) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getLcpColor = (lcp: number | null | undefined) => {
    if (!lcp) return "text-gray-500";
    if (lcp <= 2500) return "text-green-500";
    if (lcp <= 4000) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">LCP</CardTitle>
            <CardDescription>Largest Contentful Paint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getLcpColor(latestMetric?.lcp)}`}>
              {latestMetric?.lcp ? `${latestMetric.lcp}ms` : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Good: &lt;2.5s</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lighthouse</CardTitle>
            <CardDescription>Performance Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(latestMetric?.lighthouseScore)}`}>
              {latestMetric?.lighthouseScore || "—"}/100
            </div>
            <p className="text-xs text-muted-foreground mt-1">Good: 90+</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <CardDescription>Overall Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(latestMetric?.performanceScore)}`}>
              {latestMetric?.performanceScore || "—"}/100
            </div>
            <p className="text-xs text-muted-foreground mt-1">Good: 90+</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>LCP Trend</CardTitle>
          <CardDescription>Largest Contentful Paint over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="lcp" stroke="#10b981" name="LCP (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Scores</CardTitle>
          <CardDescription>Lighthouse and Performance scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="lighthouseScore" fill="#3b82f6" name="Lighthouse" />
              <Bar dataKey="performanceScore" fill="#8b5cf6" name="Performance" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
