import cloudinary from "@/lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";

export async function uploadAvatarToCloudinary(
  file: File,
  userId: string,
): Promise<UploadApiResponse> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "avatars",
        public_id: `user_${userId}`, // overwrite avatar lama user yang sama
        overwrite: true,
        resource_type: "image",
        transformation: [
          { width: 512, height: 512, crop: "fill", gravity: "face" },
        ],
      },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error("Upload gagal, tidak ada hasil."));
        }
        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
}
