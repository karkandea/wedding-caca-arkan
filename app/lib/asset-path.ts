export const BASE_PATH = "/salsaarkan";

export function assetPath(path: string) {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}
