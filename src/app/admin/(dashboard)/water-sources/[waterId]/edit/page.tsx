"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getWaterSourceByIdAction, updateWaterSourceAction } from "@/actions/water-actions";
import { 
  WATER_CATEGORIES, 
  AVAILABILITY_STATUSES, 
  VERIFICATION_STATUSES, 
  IROSIN_BARANGAYS,
  CATEGORY_LABELS,
  AVAILABILITY_STATUS_LABELS
} from "@/lib/utils/constants";
import { WaterCategory, WaterAvailabilityStatus, WaterVerificationStatus } from "@/types/water";

export default function EditWaterSourcePage() {
  const params = useParams();
  const router = useRouter();
  const waterId = params?.waterId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Public Water Source");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState(12.7042);
  const [longitude, setLongitude] = useState(124.0326);
  const [address, setAddress] = useState("");
  const [barangay, setBarangay] = useState("San Julian");
  const [availabilityStatus, setAvailabilityStatus] = useState<string>("Available");
  const [verificationStatus, setVerificationStatus] = useState<string>("Verified");
  const [operatingHours, setOperatingHours] = useState("");
  const [contactInformation, setContactInformation] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!waterId) return;
      try {
        const source = await getWaterSourceByIdAction(waterId);
        if (source) {
          setName(source.name);
          setCategory(source.category);
          setDescription(source.description || "");
          setLatitude(source.latitude);
          setLongitude(source.longitude);
          setAddress(source.address || "");
          setBarangay(source.barangay || "San Julian");
          setAvailabilityStatus(source.availability_status);
          setVerificationStatus(source.verification_status);
          setOperatingHours(source.operating_hours || "");
          setContactInformation(source.contact_information || "");
          setIsPublished(source.is_published);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [waterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await updateWaterSourceAction(waterId, {
        name,
        category,
        description,
        latitude,
        longitude,
        address,
        barangay,
        availability_status: availabilityStatus,
        verification_status: verificationStatus,
        operating_hours: operatingHours || undefined,
        contact_information: contactInformation || undefined,
        is_published: isPublished,
      });

      router.push(`/admin/water-sources/${waterId}`);
    } catch (err) {
      setError((err as Error).message || "Failed to update water resource");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading resource editor...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/water-sources/${waterId}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Water Source</h1>
          <p className="text-sm text-muted-foreground">Modify details, verification state, or geographic coordinates</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Resource Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Masacrot Spring Resort"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as WaterCategory)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  required
                >
                  {WATER_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Barangay *</label>
                <select
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  required
                >
                  {IROSIN_BARANGAYS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe current water flow, source type, and community usage..."
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Location & Coordinates
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Latitude *</label>
                <Input
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Longitude *</label>
                <Input
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Address / Landmark</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near San Julian Barangay Hall, along Maharlika Highway"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Status & Verification</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Availability Status</label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value as WaterAvailabilityStatus)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {AVAILABILITY_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {AVAILABILITY_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Verification Status</label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as WaterVerificationStatus)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {VERIFICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Operating Hours</label>
              <Input
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="e.g. 24 Hours or 7:00 AM - 6:00 PM"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Contact Information</label>
              <Input
                value={contactInformation}
                onChange={(e) => setContactInformation(e.target.value)}
                placeholder="e.g. 0912-345-6789"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary w-4 h-4"
              />
              <span className="text-sm font-medium">Publish this water source on the public map</span>
            </label>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button asChild variant="outline">
            <Link href={`/admin/water-sources/${waterId}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {submitting ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
