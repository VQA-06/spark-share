import { Download, Copy, Check, Clock } from 'lucide-react';
import { SharedItem, timeRemaining, formatFileSize } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface ItemDetailProps {
  item: SharedItem;
}

const ItemDetail = ({ item }: ItemDetailProps) => {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = item.content;
    a.download = item.fileName || 'download';
    a.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Teks disalin!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{item.title}</h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeRemaining(item.expiresAt)}</span>
          {item.fileSize && (
            <>
              <span>·</span>
              <span>{formatFileSize(item.fileSize)}</span>
            </>
          )}
        </div>
      </div>

      {item.type === 'text' ? (
        <div className="relative">
          <pre className="p-4 bg-muted/50 border border-border rounded-lg text-sm text-foreground whitespace-pre-wrap break-words font-mono leading-relaxed max-h-[60vh] overflow-auto">
            {item.content}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-2 rounded-md bg-card border border-border hover:bg-muted transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
      ) : (
        <div className="p-6 bg-card border border-border rounded-lg text-center">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-lg">📄</span>
          </div>
          <p className="font-medium text-foreground mb-1">{item.fileName}</p>
          {item.fileSize && (
            <p className="text-sm text-muted-foreground mb-4">{formatFileSize(item.fileSize)}</p>
          )}
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;
