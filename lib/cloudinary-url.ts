/** Validate that a stored upload belongs to this project's Cloudinary account/folders. */
export function isTrustedCloudinaryUpload(
  value: string,
  allowedFolderPrefixes: string[]
): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return false;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") return false;
    if (!url.pathname.startsWith(`/${cloudName}/`)) return false;
    if (!/\/(?:image|raw|video)\/upload\//.test(url.pathname)) return false;

    return allowedFolderPrefixes.some((prefix) =>
      url.pathname.split("/").some((segment) => segment.startsWith(prefix))
    );
  } catch {
    return false;
  }
}