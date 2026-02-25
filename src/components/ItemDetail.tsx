import { Download, Copy, Check, Clock, FileText } from 'lucide-react';
import { SharedItem, timeRemaining, formatFileSize } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

const TEXT_EXTENSIONS = ['txt', 'md', 'csv', 'json', 'xml', 'html', 'css', 'js', 'ts', 'tsx', 'jsx', 'py', 'java', 'c', 'cpp', 'h', 'rb', 'go', 'rs', 'php', 'sh', 'bash', 'yml', 'yaml', 'toml', 'ini', 'cfg', 'conf', 'log', 'sql', 'env', 'gitignore', 'dockerfile', 'makefile', 'readme', 'license', 'svg'];

function isTextFile(fileName?: string, fileType?: string): boolean {
  if (fileType?.startsWith('text/')) return true;
  if (fileType === 'application/json' || fileType === 'application/xml' || fileType === 'application/javascript') return true;
  if (!fileName) return false;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return TEXT_EXTENSIONS.includes(ext);
}

function decodeDataUrl(dataUrl: string): string {
  try {
    const base64 = dataUrl.split(',')[1];
    if (!base64) return '';
    return decodeURIComponent(escape(atob(base64)));
  } catch {
    return '';
  }
}

interface ItemDetailProps {
  item: SharedItem;
}

const ItemDetail = ({ item }: ItemDetailProps) => {
  const [copied, setCopied] = useState(false);
  const textPreview = useMemo(() => {
    if (item.type === 'file' && isTextFile(item.fileName, item.fileType)) {
      return decodeDataUrl(item.content);
    }
    return '';
  }, [item]);

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
      ) : textPreview ? (
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted border border-border border-b-0 rounded-t-lg">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{item.fileName}</span>
              {item.fileSize && (
                <span className="text-xs text-muted-foreground ml-auto">{formatFileSize(item.fileSize)}</span>
              )}
            </div>
            <pre className="p-4 bg-muted/30 border border-border rounded-b-lg text-sm text-foreground whitespace-pre-wrap break-words font-mono leading-relaxed max-h-[50vh] overflow-auto">
              {textPreview}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(textPreview);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                toast.success('Konten disalin!');
              }}
              className="absolute top-12 right-3 p-2 rounded-md bg-card border border-border hover:bg-muted transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
          <Button onClick={handleDownload} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download {item.fileName}
          </Button>
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
