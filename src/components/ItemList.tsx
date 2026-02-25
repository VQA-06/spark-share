import { useState, useEffect } from 'react';
import { Copy, Trash2, FileText, File, Check, MoreVertical, ExternalLink } from 'lucide-react';
import { SharedItem, deleteItem, deleteAllItems, timeRemaining, formatFileSize } from '@/lib/storage';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ItemListProps {
  items: SharedItem[];
  onUpdate: () => void;
}

const ItemList = ({ items, onUpdate }: ItemListProps) => {
  const [, setTick] = useState(0);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [openMenuId]);

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${code}`);
    toast.success('Link disalin!');
    setOpenMenuId(null);
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
    onUpdate();
    setOpenMenuId(null);
    toast.success('Item dihapus');
  };

  const handleDeleteAll = () => {
    deleteAllItems();
    onUpdate();
    toast.success('Semua item dihapus');
  };

  const handleOpen = (code: string) => {
    navigate(`/s/${code}`);
    setOpenMenuId(null);
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
        <button
          onClick={handleDeleteAll}
          className="text-xs text-destructive hover:underline font-medium"
        >
          Hapus semua
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-all group"
          >
            <div className="p-2 bg-muted rounded-md">
              {item.type === 'text' ? (
                <FileText className="w-4 h-4 text-muted-foreground" />
              ) : (
                <File className="w-4 h-4 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <code className="text-xs text-primary font-mono">/s/{item.shortCode}</code>
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

            {/* Three-dot menu */}
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
                    onClick={() => handleOpen(item.shortCode)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    Buka
                  </button>
                  <button
                    onClick={() => copyLink(item.shortCode)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    Salin link
                  </button>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemList;
