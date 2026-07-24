import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "d9qkvxkf",
  api_key: process.env.CLOUDINARY_API_KEY || "353144112924141",
  api_secret: process.env.CLOUDINARY_API_SECRET || "LBo7Us0mTbOuasB9PSGrqk7tHfE",
  secure: true,
});

export default cloudinary;

/**
 * Upload a file (buffer or base64) to Cloudinary
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = "tif_applications",
  resourceType: "auto" | "image" | "raw" = "auto"
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}
