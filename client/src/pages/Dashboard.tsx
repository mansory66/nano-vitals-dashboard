import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import MetricsChart from "@/components/MetricsChart";
import AlertsPanel from "@/components/AlertsPanel";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const addWebsiteSchema = z.object({
  url: z.string().url("Invalid URL"),
  name: z.string().min(1, "Name is required"),
});

type AddWebsiteForm = z.infer<typeof addWebsiteSchema>;

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: websites, isLoading: websitesLoading, refetch: refetchWebsites } = trpc.websites.list.useQuery();
  const { data: metrics } = trpc.metrics.getHistory.useQuery(
    selectedWebsiteId ? { websiteId: selectedWebsiteId, limit: 50 } : skipToken
  );
  const { data: alerts } = trpc.websites.getAlerts.useQuery(
    selectedWebsiteId ? { websiteId: selectedWebsiteId } : skipToken
  );

  const createWebsiteMutation = trpc.websites.create.useMutation({
    onSuccess: () => {
      toast.success("Website added successfully");
      refetchWebsites();
      setIsDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add website");
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddWebsiteForm>({
    resolver: zodResolver(addWebsiteSchema),
    defaultValues: { url: "", name: "" },
  });

  const onSubmit = async (data: AddWebsiteForm) => {
    createWebsiteMutation.mutate(data);
  };

  if (!user) {
    return null;
  }

  const selectedWebsite = websites?.find(w => w.id === selectedWebsiteId);
  const isSelected = selectedWebsiteId !== null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nano-Vitals Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor your website Core Web Vitals in real-time</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Website
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Website</DialogTitle>
                <DialogDescription>Enter your website URL to start monitoring Core Web Vitals</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Website Name</Label>
                  <Input
                    id="name"
                    placeholder="My Website"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com"
                    {...register("url")}
                    className={errors.url ? "border-red-500" : ""}
                  />
                  {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={createWebsiteMutation.isPending}>
                  {createWebsiteMutation.isPending ? "Adding..." : "Add Website"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Monitored Sites</CardTitle>
              <CardDescription>{websites?.length || 0} websites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {websitesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : websites && websites.length > 0 ? (
                  websites.map((website) => (
                    <button
                      key={website.id}
                      onClick={() => setSelectedWebsiteId(website.id)}
                      className={`w-full text-left p-2 rounded-md transition-colors ${
                        selectedWebsiteId === website.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <div className="font-medium text-sm truncate">{website.name}</div>
                      <div className="text-xs opacity-75 truncate">Monitoring</div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No websites added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            {isSelected && selectedWebsite ? (
              <Tabs defaultValue="metrics" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="metrics" className="gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Metrics
                  </TabsTrigger>
                  <TabsTrigger value="alerts" className="gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Alerts
                  </TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="metrics" className="space-y-4">
                  <MetricsChart metrics={metrics || []} websiteName={selectedWebsite.name || "Website"} />
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                  <AlertsPanel websiteId={selectedWebsite.id} alerts={alerts || []} />
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Analysis</CardTitle>
                      <CardDescription>LLM-powered insights and recommendations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Analysis coming soon...</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Select a website to view metrics</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
