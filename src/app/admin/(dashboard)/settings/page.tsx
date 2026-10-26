"use client";

import React, { useState } from "react";
import { Settings, Save, MapPin, Bell, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
  const [mapCenterLat, setMapCenterLat] = useState("12.7042");
  const [mapCenterLng, setMapCenterLng] = useState("124.0326");
  const [defaultZoom, setDefaultZoom] = useState("13");
  const [emergencyBannerActive, setEmergencyBannerActive] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Application Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure default map focus, civic alerts, and community interaction limits
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Default Map Configuration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Center Latitude</label>
              <Input
                value={mapCenterLat}
                onChange={(e) => setMapCenterLat(e.target.value)}
                placeholder="12.7042"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Center Longitude</label>
              <Input
                value={mapCenterLng}
                onChange={(e) => setMapCenterLng(e.target.value)}
                placeholder="124.0326"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Default Zoom Level</label>
              <Input
                value={defaultZoom}
                onChange={(e) => setDefaultZoom(e.target.value)}
                placeholder="13"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Centered on the municipal heart of Irosin, Sorsogon, Philippines.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Emergency Drought / El Niño Alert Banner
          </h2>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={emergencyBannerActive}
              onChange={(e) => setEmergencyBannerActive(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary w-4 h-4"
            />
            <span className="text-sm font-medium">
              Activate prominent municipal water shortage advisory banner on public home screen
            </span>
          </label>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Security & Rate Limits
          </h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Max chat message length: 1,000 characters.</p>
            <p>• Chat rate limit: 10 messages per 60 seconds per visitor session.</p>
            <p>• Submission rate limit: 5 submissions per hour per visitor session.</p>
            <p>• Public admin registration is strictly disabled.</p>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
