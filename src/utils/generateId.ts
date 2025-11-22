// Counter to ensure uniqueness even with same timestamp
let counter = 0;

export function generateId(prefix: string): string {
  counter = (counter + 1) % 10000; // Reset after 10000 to prevent overflow
  return `${prefix}-${Date.now()}-${counter}-${Math.random().toString(36).substr(2, 9)}`;
}
