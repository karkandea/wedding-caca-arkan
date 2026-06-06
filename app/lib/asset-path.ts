export const BASE_PATH = "";

export function assetPath(path: string) {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}
