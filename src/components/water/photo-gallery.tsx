// src/components/water/photo-gallery.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { WaterPhotoRow } from "@/types/water";
import { getPublicStorageUrl } from "@/lib/utils/image-utils";
import { X } from "lucide-react";

interface PhotoGalleryProps {
  photos?: WaterPhotoRow[];
  name: string;
}

export function PhotoGallery({ photos, name }: PhotoGalleryProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const photoList =
    photos && photos.length > 0
      ? photos.map((p) => ({
          url: getPublicStorageUrl(p.storage_path),
          caption: p.caption,
        }))
      : [
          {
            url: "/images/irosin-map-placeholder.svg",
            caption: `${name} standard view`,
          },
        ];

  const currentPhoto = photoList[selectedPhotoIndex] || photoList[0];

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div
        className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer group"
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={currentPhoto.url}
          alt={currentPhoto.caption || name}
          fill
          unoptimized
          priority
          className="object-cover group-hover:scale-102 transition-transform duration-300"
        />
        {currentPhoto.caption && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4 text-white text-xs">
            {currentPhoto.caption}
          </div>
        )}
      </div>

      {/* Thumbnails if > 1 */}
      {photoList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {photoList.map((photo, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPhotoIndex(idx)}
              className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                selectedPhotoIndex === idx
                  ? "border-blue-500 scale-105"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={photo.url}
                alt={photo.caption || `${name} thumb ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] w-full h-[600px]">
            <Image
              src={currentPhoto.url}
              alt={currentPhoto.caption || name}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
