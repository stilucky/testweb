export function isValidCloudinaryVideoUrl(src: string) {
  const trimmed = src.trim();
  if (!trimmed) return true;

  try {
    const url = new URL(trimmed);
    return url.protocol === "https:"
      && url.hostname === "res.cloudinary.com"
      && url.pathname.includes("/video/upload/");
  } catch {
    return false;
  }
}

export function cloudinaryVideoThumbnailUrl(src: string) {
  if (!src.trim() || !isValidCloudinaryVideoUrl(src)) return "";

  const url = new URL(src.trim());
  const uploadMarker = "/video/upload/";
  const markerIndex = url.pathname.indexOf(uploadMarker);
  const prefix = url.pathname.slice(0, markerIndex + uploadMarker.length);
  const assetPath = url.pathname.slice(markerIndex + uploadMarker.length);
  const imagePath = /\.[a-z0-9]+$/i.test(assetPath)
    ? assetPath.replace(/\.[a-z0-9]+$/i, ".jpg")
    : `${assetPath}.jpg`;

  url.pathname = `${prefix}so_0/${imagePath}`;
  url.search = "";
  url.hash = "";
  return url.toString();
}
