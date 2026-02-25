export interface SharedItem {
  id: string;
  type: 'text' | 'file';
  title: string;
  content: string; // text content or base64 file data
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  createdAt: number;
  expiresAt: number; // 0 means no expiry
  shortCode: string;
}

const STORAGE_KEY = 'shared_items';

function generateShortCode(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getItems(): SharedItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const items: SharedItem[] = JSON.parse(raw);
  const now = Date.now();
  const valid = items.filter(i => i.expiresAt === 0 || i.expiresAt > now);
  if (valid.length !== items.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
  }
  return valid.sort((a, b) => b.createdAt - a.createdAt);
}

export function getItemByCode(code: string): SharedItem | undefined {
  return getItems().find(i => i.shortCode === code);
}

export function addItem(item: Omit<SharedItem, 'id' | 'shortCode' | 'createdAt'>): SharedItem {
  const items = getItems();
  const newItem: SharedItem = {
    ...item,
    id: crypto.randomUUID(),
    shortCode: generateShortCode(),
    createdAt: Date.now(),
  };
  items.push(newItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return newItem;
}

export function deleteItem(id: string): void {
  const items = getItems().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function deleteAllItems(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getExpiryLabel(ms: number): string {
  if (ms <= 3600000) return '1 jam';
  if (ms <= 21600000) return '6 jam';
  if (ms <= 86400000) return '24 jam';
  return '7 hari';
}

export const EXPIRY_OPTIONS = [
  { label: '1 Jam', value: 3600000 },
  { label: '6 Jam', value: 21600000 },
  { label: '24 Jam', value: 86400000 },
  { label: '7 Hari', value: 604800000 },
  { label: 'Selamanya', value: 0 },
];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export function timeRemaining(expiresAt: number): string {
  if (expiresAt === 0) return 'Permanen';
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'Kedaluwarsa';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return Math.floor(hours / 24) + 'h ' + (hours % 24) + 'j lagi';
  if (hours > 0) return hours + 'j ' + minutes + 'm lagi';
  return minutes + 'm lagi';
}
