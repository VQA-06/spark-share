import { supabase } from '@/integrations/supabase/client';

export interface SharedItem {
  id: string;
  type: 'text' | 'file';
  title: string;
  content: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  createdAt: number;
  expiresAt: number;
  shortCode: string;
}

interface DbRow {
  id: string;
  type: string;
  title: string;
  content: string;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  short_code: string;
  created_at: string;
  expires_at: string | null;
}

function rowToItem(row: DbRow): SharedItem {
  return {
    id: row.id,
    type: row.type as 'text' | 'file',
    title: row.title,
    content: row.content,
    fileName: row.file_name ?? undefined,
    fileSize: row.file_size ?? undefined,
    fileType: row.file_type ?? undefined,
    shortCode: row.short_code,
    createdAt: new Date(row.created_at).getTime(),
    expiresAt: row.expires_at ? new Date(row.expires_at).getTime() : 0,
  };
}

export async function getItems(): Promise<SharedItem[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('shared_items')
    .select('*')
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }
  return (data as DbRow[]).map(rowToItem);
}

export async function getItemByCode(code: string): Promise<SharedItem | undefined> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('shared_items')
    .select('*')
    .eq('short_code', code)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .maybeSingle();

  if (error || !data) return undefined;
  return rowToItem(data as DbRow);
}

export async function addItem(item: Omit<SharedItem, 'id' | 'shortCode' | 'createdAt'>): Promise<SharedItem> {
  // Get next short code
  const { data: codeData } = await supabase.rpc('next_short_code');
  const shortCode = codeData || String(Date.now());

  const { data, error } = await supabase
    .from('shared_items')
    .insert({
      type: item.type,
      title: item.title,
      content: item.content,
      file_name: item.fileName || null,
      file_size: item.fileSize || null,
      file_type: item.fileType || null,
      short_code: shortCode,
      expires_at: item.expiresAt === 0 ? null : new Date(item.expiresAt).toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToItem(data as DbRow);
}

export async function deleteItem(id: string): Promise<void> {
  await supabase.from('shared_items').delete().eq('id', id);
}

export async function deleteAllItems(): Promise<void> {
  await supabase.from('shared_items').delete().neq('id', '');
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
