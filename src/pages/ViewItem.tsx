import { useParams, Link } from 'react-router-dom';
import { getItemByCode, timeRemaining, formatFileSize } from '@/lib/storage';
import { ArrowLeft, Download, Clock, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

const ViewItem = () => {
  const { code } = useParams<{ code: string }>();
  const item = code ? getItemByCode(code) : undefined;
  const [copied, setCopied] = useState(false);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔗</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Item tidak ditemukan</h1>
          <p className="text-muted-foreground text-sm mb-6">Link mungkin sudah kedaluwarsa atau tidak valid.</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

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
      </div>
    </div>
  );
};

export default ViewItem;
