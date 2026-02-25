import { useState, useEffect } from 'react';
import { Copy, Trash2, FileText, File, Check } from 'lucide-react';
import { SharedItem, deleteItem, deleteAllItems, timeRemaining, formatFileSize } from '@/lib/storage';
import { toast } from 'sonner';

interface ItemListProps {
  items: SharedItem[];
  onUpdate: () => void;
}

const ItemList = ({ items, onUpdate }: ItemListProps) => {
  const [, setTick] = useState(0);
  const [copiedId, setCopiedId] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const copyLink = (code: string, id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${code}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
    toast.success('Link disalin!');
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
    onUpdate();
    toast.success('Item dihapus');
  };

  const handleDeleteAll = () => {
    deleteAllItems();
    onUpdate();
    toast.success('Semua item dihapus');
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

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => copyLink(item.shortCode, item.id)}
                className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                {copiedId === item.id ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemList;
