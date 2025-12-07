import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Plus } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PerformanceAlert } from "../../../drizzle/schema";

const alertSchema = z.object({
  metricType: z.enum(["lcp", "fid", "cls", "lighthouseScore"]),
  thresholdValue: z.string().min(1, "Threshold is required"),
});

type AlertForm = z.infer<typeof alertSchema>;

interface AlertsPanelProps {
  websiteId: number;
  alerts: PerformanceAlert[];
}

export default function AlertsPanel({ websiteId, alerts }: AlertsPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createAlertMutation = trpc.websites.createAlert.useMutation({
    onSuccess: () => {
      toast.success("Alert created successfully");
      setIsDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create alert");
    },
  });

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<AlertForm>({
    resolver: zodResolver(alertSchema),
    defaultValues: { metricType: "lcp", thresholdValue: "" },
  });

  const onSubmit = (data: AlertForm) => {
    createAlertMutation.mutate({
      websiteId,
      metricType: data.metricType,
      thresholdValue: data.thresholdValue,
    });
  };

  const metricType = watch("metricType");

  const getThresholdHint = (type: string) => {
    switch (type) {
      case "lcp":
        return "milliseconds (e.g., 2500)";
      case "fid":
        return "milliseconds (e.g., 100)";
      case "cls":
        return "decimal (e.g., 0.1)";
      case "lighthouseScore":
        return "0-100 (e.g., 90)";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Performance Alerts</CardTitle>
              <CardDescription>Configure thresholds for performance degradation</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Performance Alert</DialogTitle>
                  <DialogDescription>Set a threshold for performance metrics</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="metricType">Metric Type</Label>
                    <Select defaultValue="lcp" onValueChange={(value) => {
                      const event = { target: { name: "metricType", value } };
                      register("metricType").onChange(event);
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lcp">LCP (Largest Contentful Paint)</SelectItem>
                        <SelectItem value="fid">FID (First Input Delay)</SelectItem>
                        <SelectItem value="cls">CLS (Cumulative Layout Shift)</SelectItem>
                        <SelectItem value="lighthouseScore">Lighthouse Score</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="threshold">Threshold Value</Label>
                    <Input
                      id="threshold"
                      placeholder={`Enter value in ${getThresholdHint(metricType)}`}
                      {...register("thresholdValue")}
                      className={errors.thresholdValue ? "border-red-500" : ""}
                    />
                    {errors.thresholdValue && <p className="text-red-500 text-sm mt-1">{errors.thresholdValue.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={createAlertMutation.isPending}>
                    {createAlertMutation.isPending ? "Creating..." : "Create Alert"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {alerts && alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {alert.metricType === "lcp" && "LCP"}
                      {alert.metricType === "fid" && "FID"}
                      {alert.metricType === "cls" && "CLS"}
                      {alert.metricType === "lighthouseScore" && "Lighthouse Score"}
                      {" "}Alert
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Trigger when metric exceeds {alert.thresholdValue}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${alert.isActive ? "bg-green-500/20 text-green-700" : "bg-gray-500/20 text-gray-700"}`}>
                    {alert.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No alerts configured. Create one to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
