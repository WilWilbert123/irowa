// src/lib/utils/image-compression.ts
/**
 * Fast client-side image compression and resizing.
 * Prepares camera/mobile photos for instant upload by scaling down massive
 * dimensions (e.g. 4000x3000 -> 1600x1200) and reducing payload to ~200KB-400KB.
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.85,
    maxSizeBytes = 1024 * 1024, // 1MB target
  } = options;

  // If already smaller than 300KB and reasonable format, no need to compress
  if (file.size <= 300 * 1024 && (file.type === "image/jpeg" || file.type === "image/webp")) {
    return file;
  }

  // Only compress images that browser can render to Image
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio scaling
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === "image/png" ? "image/jpeg" : file.type;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const cleanFileName = file.name.replace(/\.[^/.]+$/, ".jpg");
            const compressedFile = new File([blob], cleanFileName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            // Return compressed file if smaller, else keep original
            resolve(compressedFile.size < file.size ? compressedFile : file);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => {
        resolve(file);
      };
    };

    reader.onerror = () => {
      resolve(file);
    };
  });
}

