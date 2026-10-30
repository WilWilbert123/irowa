// src/app/admin/(dashboard)/settings/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Settings,
  Save,
  MapPin,
  Bell,
  Shield,
  CheckCircle2,
  Loader2,
  Phone,
  Database,
  Trash2,
  Lock,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Info,
  X,
  Sliders,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminHeader } from "@/components/admin/admin-header";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import {
  getSystemSettingsAction,
  updateSystemSettingsAction,
  getDatabaseTablesAction,
  clearDatabaseTableAction,
  SystemSettingsData,
  DatabaseTableInfo,
} from "@/actions/settings-actions";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "advisory" | "database">("general");

  const [settings, setSettings] = useState<SystemSettingsData>({
    appName: "IroWa",
    tagline: "Irosin Water Resources Map",
    emergencyHotline: "0917-123-4567",
    alertBannerEnabled: true,
    alertBannerText: "Water Advisory: Regular conservation guidelines in effect for low-elevation barangays.",
    mapCenterLat: 12.7042,
    mapCenterLng: 124.0326,
    defaultZoom: 13,
  });

  const [tables, setTables] = useState<DatabaseTableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Clear Table Modal State
  const [clearingTable, setClearingTable] = useState<DatabaseTableInfo | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [settingsData, tablesData] = await Promise.all([
        getSystemSettingsAction(),
        getDatabaseTablesAction(),
      ]);
      setSettings(settingsData);
      setTables(tablesData);
    } catch (err) {
      console.error("Failed to load settings data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const { isLive, lastSync, isRefreshing, triggerRefresh } = useAdminRealtime({
    tables: ["application_settings", "audit_logs", "chat_messages", "visitor_sessions"],
    onSync: loadData,
  });

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await updateSystemSettingsAction(settings);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        alert(res.error || "Failed to save settings");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmClearTable = async () => {
    if (!clearingTable) return;
    setIsClearing(true);
    setFeedback(null);

    try {
      const res = await clearDatabaseTableAction(clearingTable.name);
      if (res.success) {
        setFeedback({
          type: "success",
          text: `Table "${clearingTable.displayName}" cleared successfully (${res.deletedCount || 0} rows purged).`,
        });
        // Optimistically update row count
        setTables((prev) =>
          prev.map((t) => (t.name === clearingTable.name ? { ...t, rowCount: 0 } : t))
        );
        setClearingTable(null);
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Failed to clear table.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Failed to clear table.",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const totalRecords = useMemo(
    () => tables.reduce((acc, t) => acc + t.rowCount, 0),
    [tables]
  );
  const clearableCount = tables.filter((t) => t.isClearable).length;

  return (
    <div className="flex flex-col min-w-0 lg:h-[calc(100dvh-4.5rem)] space-y-2.5">
      {/* Compact Header */}
      <AdminHeader
        title="Application Settings & Maintenance"
        subtitle="Configure default map focus, municipal emergency advisories, and Supabase database storage."
        isLive={isLive}
        lastSync={lastSync}
        isRefreshing={isRefreshing || loading}
        onRefresh={triggerRefresh}
        compact={true}
        className="shrink-0 mb-0 pb-2.5"
      />

      {/* Settings Navigation Tabs */}
      <div className="shrink-0 flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-1.5 sm:p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2",
              activeTab === "general"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>General & Map</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("advisory")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2",
              activeTab === "advisory"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Emergency Advisory</span>
            {settings.alertBannerEnabled && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("database")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2",
              activeTab === "database"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Storage & Tables</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                activeTab === "database"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              )}
            >
              {totalRecords} rows
            </span>
          </button>
        </div>

        {/* Save feedback chip */}
        {savedSuccess && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saved to Database</span>
          </div>
        )}
      </div>

      {/* Global Notification Feedback */}
      {feedback && (
        <div
          className={cn(
            "p-2.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 shrink-0 animate-in fade-in",
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          )}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tab 1: General & Map Focus */}
      {activeTab === "general" && (
        <form onSubmit={handleSave} className="flex-1 min-h-0 flex flex-col justify-between">
          <div className="space-y-3 overflow-y-auto pr-1">
            {/* Map Settings Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Default Map Coordinate Focus</span>
                </h3>
                <span className="text-[11px] text-slate-400">Irosin, Sorsogon</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Center Latitude
                  </label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={settings.mapCenterLat}
                    onChange={(e) =>
                      setSettings({ ...settings, mapCenterLat: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8.5 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-800/60"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Center Longitude
                  </label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={settings.mapCenterLng}
                    onChange={(e) =>
                      setSettings({ ...settings, mapCenterLng: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8.5 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-800/60"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Default Zoom (10-19)
                  </label>
                  <Input
                    type="number"
                    min="10"
                    max="19"
                    value={settings.defaultZoom}
                    onChange={(e) =>
                      setSettings({ ...settings, defaultZoom: parseInt(e.target.value, 10) || 13 })
                    }
                    className="h-8.5 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-800/60"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Civic Hotline & Tagline Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Phone className="w-4 h-4 text-purple-500" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Municipal Contacts & App Branding
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Emergency Water Hotline
                  </label>
                  <Input
                    value={settings.emergencyHotline}
                    onChange={(e) =>
                      setSettings({ ...settings, emergencyHotline: e.target.value })
                    }
                    placeholder="0917-123-4567"
                    className="h-8.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Municipal Tagline
                  </label>
                  <Input
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    placeholder="Irosin Water Resources Map"
                    className="h-8.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Submit Footer */}
          <div className="shrink-0 pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 mt-2">
            <span className="text-[11px] text-slate-400">
              Changes apply instantly to live municipal map.
            </span>
            <Button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 h-8.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? "Saving..." : "Save Configuration"}</span>
            </Button>
          </div>
        </form>
      )}

      {/* Tab 2: Emergency Advisory Banner */}
      {activeTab === "advisory" && (
        <form onSubmit={handleSave} className="flex-1 min-h-0 flex flex-col justify-between">
          <div className="space-y-3 overflow-y-auto pr-1">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Emergency Broadcast Banner
                  </h3>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    settings.alertBannerEnabled
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}
                >
                  {settings.alertBannerEnabled ? "Active Broadcast" : "Inactive"}
                </span>
              </div>

              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alertBannerEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, alertBannerEnabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Broadcast banner prominently across public citizen home screen & water map
                </span>
              </label>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Advisory Banner Message
                </label>
                <Textarea
                  value={settings.alertBannerText}
                  onChange={(e) =>
                    setSettings({ ...settings, alertBannerText: e.target.value })
                  }
                  rows={2}
                  placeholder="e.g. Water Advisory: Low pressure expected in lower elevation barangays during peak afternoon hours."
                  className="rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 resize-none leading-relaxed"
                />
              </div>

              {/* Citizen Live Preview Box */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Citizen Public Viewport Preview:
                </span>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="line-clamp-2 leading-tight">
                    {settings.alertBannerText || "No advisory message entered."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 mt-2">
            <span className="text-[11px] text-slate-400">
              Emergency broadcasts update on all public screens in real-time.
            </span>
            <Button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 h-8.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? "Saving..." : "Save Advisory"}</span>
            </Button>
          </div>
        </form>
      )}

      {/* Tab 3: Supabase Database Storage & Safe Table Cleaner */}
      {activeTab === "database" && (
        <div className="flex-1 min-h-0 flex flex-col justify-between space-y-2">
          {/* Storage Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Total Records
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {totalRecords} Active Rows
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Supabase Storage
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  500 MB Available
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Table Security
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {clearableCount} Safe to Clear • {tables.length - clearableCount} Protected
                </span>
              </div>
            </div>
          </div>

          {/* Database Tables High-Density Table */}
          <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-850/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2 px-3.5">Table Name</th>
                    <th className="py-2 px-3">Live Records</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Description & Safety Policy</th>
                    <th className="py-2 px-3.5 text-right">Maintenance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {tables.map((table) => (
                    <tr
                      key={table.name}
                      className={cn(
                        "hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors",
                        table.isClearable ? "" : "opacity-90"
                      )}
                    >
                      {/* Name */}
                      <td className="py-2 px-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                            {table.name}
                          </span>
                          <span className="text-xs text-slate-700 dark:text-slate-300">
                            {table.displayName}
                          </span>
                        </div>
                      </td>

                      {/* Row Count */}
                      <td className="py-2 px-3">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {table.rowCount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">rows</span>
                      </td>

                      {/* Category */}
                      <td className="py-2 px-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            table.isClearable
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          )}
                        >
                          {table.isClearable ? "Clearable Transient" : "Protected Core Data"}
                        </span>
                      </td>

                      {/* Description & Safety Policy */}
                      <td className="py-2 px-3 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        <span>{table.description} </span>
                        <span className="text-slate-400 italic">({table.safetyReason})</span>
                      </td>

                      {/* Action */}
                      <td className="py-2 px-3.5 text-right shrink-0">
                        {table.isClearable ? (
                          <button
                            type="button"
                            onClick={() => setClearingTable(table)}
                            disabled={table.rowCount === 0}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Clear table and free space"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Clear Table</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Lock className="w-3 h-3" />
                            <span>Protected</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-3.5 py-1.5 bg-slate-50/90 dark:bg-slate-850/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>
                Safety policy: Only transient logs, visitor sessions, and chat streams can be purged. Core water assets are permanently protected.
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live database synced
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Clear Table Confirmation Modal Dialog */}
      {clearingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Confirm Clear Table</span>
              </h4>
              <button
                type="button"
                onClick={() => setClearingTable(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <p className="font-bold">
                Are you sure you want to purge all records from &quot;{clearingTable.displayName}&quot; ({clearingTable.name})?
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                This will delete {clearingTable.rowCount} existing records to free up Supabase space. This action is logged to the municipal maintenance audit.
              </p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Policy note: {clearingTable.safetyReason}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setClearingTable(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearTable}
                disabled={isClearing}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isClearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isClearing ? "Clearing..." : "Yes, Purge Table"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
