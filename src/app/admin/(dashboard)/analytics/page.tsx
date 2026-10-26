"use client";

import React, { useEffect, useState } from "react";
import { 
  BarChart3, Droplets, MapPin, MessageSquare, 
  AlertTriangle, Users, TrendingUp 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { getAdminDashboardMetrics } from "@/lib/services/analytics-service";
import { AdminDashboardMetrics } from "@/types/admin";
import { CategoryChart } from "@/components/admin/category-chart";

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAdminDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to load metrics", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading civic data analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics & System Health</h1>
        <p className="text-sm text-muted-foreground">
          Real-time metrics on water availability, visitor traffic, resource distribution, and report resolutions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-primary">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Total Resources</span>
            <span className="text-2xl font-bold text-foreground">{metrics.totalWaterSources}</span>
            <span className="text-[11px] text-emerald-600 block mt-0.5">8 barangays covered</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Currently Available</span>
            <span className="text-2xl font-bold text-foreground">{metrics.availableCount}</span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              {((metrics.availableCount / (metrics.totalWaterSources || 1)) * 100).toFixed(0)}% functional rate
            </span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Limited / Stale</span>
            <span className="text-2xl font-bold text-foreground">{metrics.limitedCount + metrics.unavailableCount}</span>
            <span className="text-[11px] text-amber-600 block mt-0.5">Requires field check</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Chat Discussions</span>
            <span className="text-2xl font-bold text-foreground">{metrics.totalChatMessages}</span>
            <span className="text-[11px] text-purple-600 block mt-0.5">Across active rooms</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart 
          breakdown={metrics.categoryBreakdown} 
          total={metrics.totalWaterSources} 
        />

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Availability Breakdown
          </h2>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Available / Flowing
                </span>
                <span>{metrics.availableCount}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-2.5 rounded-full" 
                  style={{ width: `${(metrics.availableCount / (metrics.totalWaterSources || 1)) * 100}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Limited Supply
                </span>
                <span>{metrics.limitedCount}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full" 
                  style={{ width: `${(metrics.limitedCount / (metrics.totalWaterSources || 1)) * 100}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-destructive inline-block" />
                  Temporarily Unavailable / Dry
                </span>
                <span>{metrics.unavailableCount}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-destructive h-2.5 rounded-full" 
                  style={{ width: `${(metrics.unavailableCount / (metrics.totalWaterSources || 1)) * 100}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border text-xs text-muted-foreground">
            Data reflects real-time status in Irosin, Sorsogon. Updates automatically when field teams submit verification checks.
          </div>
        </Card>
      </div>
    </div>
  );
}
