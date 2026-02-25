import { useState, useEffect } from 'react';
import { Copy, Trash2, FileText, File, MoreVertical, CheckSquare, X, AlertTriangle, Search } from 'lucide-react';
import { SharedItem, deleteItem, timeRemaining, formatFileSize } from '@/lib/storage';
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

interface ItemListProps {
  items: SharedItem[];
  onUpdate: () => void;
  onItemClick: (item: SharedItem) => void;
}

const ItemList = ({ items, onUpdate, onItemClick }: ItemListProps) => {
  const [, setTick] = useState(0);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'multi'; id?: string } | null>(null);
  const [search, setSearch] = useState('');

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

  const executeDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'single' && deleteConfirm.id) {
      deleteItem(deleteConfirm.id);
      toast.success('Item dihapus');
    } else if (deleteConfirm.type === 'multi') {
      selected.forEach(id => deleteItem(id));
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
            const q = search.toLowerCase();
            return item.title.toLowerCase().includes(q) || item.shortCode.includes(q) || (item.fileName?.toLowerCase().includes(q));
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
    </div>
  );
};

export default ItemList;
