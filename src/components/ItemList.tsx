import { useState, useEffect } from 'react';
import { Copy, Trash2, MoreVertical, CheckSquare, X, AlertTriangle, Search, Pencil, Clock, FileText, File, Image, FileCode, FileType } from 'lucide-react';
import { SharedItem, deleteItem, updateItem, timeRemaining, formatFileSize, EXPIRY_OPTIONS } from '@/lib/storage';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';

interface ItemListProps {
  items: SharedItem[];
  onUpdate: () => void;
  onItemClick: (item: SharedItem) => void;
}

const IMAGE_EXT = ['jpg','jpeg','png','gif','webp','bmp','ico','svg'];
const CODE_EXT = ['js','ts','tsx','jsx','py','java','c','cpp','h','rb','go','rs','php','sh','bash','bat','ps1','lua','kt','swift','r','pl','asm','css','sql'];
const PDF_EXT = ['pdf'];
const DOC_EXT = ['doc','docx','odt','rtf'];

function getFileCategory(item: SharedItem): { label: string; icon: React.ReactNode; color: string } {
  if (item.type === 'text') return { label: 'Teks', icon: <FileText className="w-4 h-4" />, color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' };
  const ext = item.fileName?.split('.').pop()?.toLowerCase() || '';
  if (IMAGE_EXT.includes(ext) || item.fileType?.startsWith('image/'))
    return { label: 'Gambar', icon: <Image className="w-4 h-4" />, color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' };
  if (PDF_EXT.includes(ext) || item.fileType === 'application/pdf')
    return { label: 'PDF', icon: <FileType className="w-4 h-4" />, color: 'bg-red-500/15 text-red-600 dark:text-red-400' };
  if (CODE_EXT.includes(ext))
    return { label: 'Kode', icon: <FileCode className="w-4 h-4" />, color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' };
  if (DOC_EXT.includes(ext))
    return { label: 'Dokumen', icon: <FileText className="w-4 h-4" />, color: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' };
  if (['html','htm'].includes(ext))
    return { label: 'Web', icon: <FileCode className="w-4 h-4" />, color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400' };
  return { label: 'File', icon: <File className="w-4 h-4" />, color: 'bg-muted text-muted-foreground' };
}

const ItemList = ({ items, onUpdate, onItemClick }: ItemListProps) => {
  const [, setTick] = useState(0);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'multi'; id?: string } | null>(null);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<SharedItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editExpiry, setEditExpiry] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [openMenuId]);

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${code}`);
    toast.success('Link disalin!');
    setOpenMenuId(null);
  };

  const confirmDeleteSingle = (id: string) => {
    setOpenMenuId(null);
    setDeleteConfirm({ type: 'single', id });
  };

  const confirmDeleteMulti = () => {
    setDeleteConfirm({ type: 'multi' });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'single' && deleteConfirm.id) {
      await deleteItem(deleteConfirm.id);
      toast.success('Item dihapus');
    } else if (deleteConfirm.type === 'multi') {
      for (const id of selected) {
        await deleteItem(id);
      }
      toast.success(`${selected.size} item dihapus`);
      setSelected(new Set());
      setSelectMode(false);
    }
    setDeleteConfirm(null);
    onUpdate();
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const openEdit = (item: SharedItem) => {
    setOpenMenuId(null);
    setEditTitle(item.title);
    setEditExpiry(0); // default select value, will recalculate on save
    setEditItem(item);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const newExpiresAt = editExpiry === 0 ? 0 : Date.now() + editExpiry;
      await updateItem(editItem.id, {
        title: editTitle.trim() || editItem.title,
        expiresAt: newExpiresAt,
      });
      toast.success('Item diperbarui');
      setEditItem(null);
      onUpdate();
    } catch {
      toast.error('Gagal memperbarui item');
    } finally {
      setSaving(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Belum ada item yang dibagikan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{items.length} item aktif</h2>
        {selectMode ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{selected.size} dipilih</span>
            {selected.size > 0 && (
              <button
                onClick={confirmDeleteMulti}
                className="text-xs text-destructive hover:underline font-medium"
              >
                Hapus
              </button>
            )}
            <button
              onClick={exitSelectMode}
              className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSelectMode(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Pilih
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {items
          .filter(item => {
            if (!search.trim()) return true;
            // Extract words from search, splitting by spaces, dashes, dots, etc.
            const words = search.toLowerCase().replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/g, ' ').split(/\s+/).filter(Boolean);
            const target = item.title.toLowerCase() + ' ' + (item.fileName?.toLowerCase() || '') + ' ' + item.shortCode;
            return words.every(word => target.includes(word));
          })
          .map((item) => (
          <div
            key={item.id}
            onClick={() => selectMode ? toggleSelect(item.id) : onItemClick(item)}
            className={`flex items-center gap-3 p-4 bg-card border rounded-lg hover:shadow-sm transition-all cursor-pointer group ${
              selected.has(item.id) ? 'border-primary/50 bg-accent/30' : 'border-border'
            }`}
          >
            {selectMode ? (
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                selected.has(item.id)
                  ? 'bg-primary border-primary'
                  : 'border-border'
              }`}>
                {selected.has(item.id) && (
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            ) : (
              <div className="p-2 bg-muted rounded-md">
                {item.type === 'text' ? (
                  <FileText className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <File className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <code className="text-xs text-primary font-mono">/{item.shortCode}</code>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{timeRemaining(item.expiresAt)}</span>
                {item.fileSize && (
                  <>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{formatFileSize(item.fileSize)}</span>
                  </>
                )}
              </div>
            </div>

            {!selectMode && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === item.id ? null : item.id);
                  }}
                  className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {openMenuId === item.id && (
                  <div
                    className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-lg shadow-lg z-10 py-1 animate-in fade-in slide-in-from-top-1 duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => copyLink(item.shortCode)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      Salin link
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      Edit
                    </button>
                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={() => confirmDeleteSingle(item.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="border-destructive/30 bg-card">
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center text-foreground">
              {deleteConfirm?.type === 'multi'
                ? `Hapus ${selected.size} item?`
                : 'Hapus item ini?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {deleteConfirm?.type === 'multi'
                ? `${selected.size} item yang dipilih akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`
                : 'Item ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 sm:justify-center">
            <AlertDialogCancel className="flex-1">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nama / Judul</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Masukkan judul"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Hapus Otomatis
              </label>
              <div className="relative">
                <select
                  value={editExpiry}
                  onChange={(e) => setEditExpiry(Number(e.target.value))}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 bg-muted border border-border rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                >
                  {EXPIRY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {editItem && editItem.expiresAt > 0 && (
                <p className="text-xs text-muted-foreground">
                  Saat ini: {timeRemaining(editItem.expiresAt)}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Batal</Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItemList;
