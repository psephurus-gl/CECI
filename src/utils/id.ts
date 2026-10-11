/** Generate a short, collision-resistant identifier such as `node-k3j9x2a`. */
export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
