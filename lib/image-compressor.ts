/**
 * Client-side browser image compression utility.
 * Automatically resizes and compresses high-resolution images (JPEG, PNG, WebP)
 * so they fit under the target size limit (e.g., 5MB) while maintaining visual quality.
 */

export async function compressImageIfNeeded(
  file: File,
  maxSizeBytes: number = 5 * 1024 * 1024
): Promise<File> {
  // If file is already under limit or not an image (e.g. PDF), return as-is
  if (file.size <= maxSizeBytes || !file.type.startsWith("image/")) {
    return file;
  }

  return new Promise<File>((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Downscale dimensions if extremely large (e.g., max width/height 2560px)
        const MAX_DIMENSION = 2560;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw image onto canvas
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Quality reduction loop to guarantee size <= maxSizeBytes
        const attemptCompression = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              if (blob.size <= maxSizeBytes || q <= 0.35) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                console.log(
                  `Auto-compressed image: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(
                    compressedFile.size /
                    1024 /
                    1024
                  ).toFixed(2)}MB`
                );
                resolve(compressedFile);
              } else {
                // Try lower quality step
                attemptCompression(q - 0.15);
              }
            },
            "image/jpeg",
            q
          );
        };

        attemptCompression(0.85);
      };

      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
