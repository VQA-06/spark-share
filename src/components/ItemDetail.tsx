import { Download, Copy, Check, Clock, FileText, Image, Code, Globe, Pencil, Save, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SharedItem, timeRemaining, formatFileSize, updateItem } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import mammoth from 'mammoth';
import CodePreview from '@/components/CodePreview';

const TEXT_EXTENSIONS = ['txt', 'md', 'csv', 'json', 'xml', 'html', 'css', 'js', 'ts', 'tsx', 'jsx', 'py', 'java', 'c', 'cpp', 'h', 'rb', 'go', 'rs', 'php', 'sh', 'bash', 'bat', 'cmd', 'ps1', 'yml', 'yaml', 'toml', 'ini', 'cfg', 'conf', 'log', 'sql', 'env', 'gitignore', 'dockerfile', 'makefile', 'readme', 'license', 'svg', 'htaccess', 'properties', 'gradle', 'kt', 'swift', 'r', 'lua', 'pl', 'pm', 'tcl', 'asm', 'vbs', 'reg'];

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'ico'];

function isTextFile(fileName?: string, fileType?: string): boolean {
  if (fileType?.startsWith('text/')) return true;
  if (fileType === 'application/json' || fileType === 'application/xml' || fileType === 'application/javascript') return true;
  if (!fileName) return false;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return TEXT_EXTENSIONS.includes(ext);
}

function isPdfFile(fileName?: string, fileType?: string): boolean {
  if (fileType === 'application/pdf') return true;
  if (!fileName) return false;
  return fileName.toLowerCase().endsWith('.pdf');
}

function isImageFile(fileName?: string, fileType?: string): boolean {
  if (fileType?.startsWith('image/')) return true;
  if (!fileName) return false;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return IMAGE_EXTENSIONS.includes(ext);
}

function isDocxFile(fileName?: string, fileType?: string): boolean {
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return true;
  if (!fileName) return false;
  return fileName.toLowerCase().endsWith('.docx');
}

function isHtmlFile(fileName?: string, fileType?: string): boolean {
  if (fileType === 'text/html') return true;
  if (!fileName) return false;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return ['html', 'htm'].includes(ext);
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

function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

interface ItemDetailProps {
  item: SharedItem;
}

const ItemDetail = ({ item }: ItemDetailProps) => {
  const [copied, setCopied] = useState(false);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [docxLoading, setDocxLoading] = useState(false);

  const textPreview = useMemo(() => {
    if (item.type === 'file' && isTextFile(item.fileName, item.fileType)) {
      return decodeDataUrl(item.content);
    }
    return '';
  }, [item]);

  const isImage = item.type === 'file' && isImageFile(item.fileName, item.fileType);
  const isPdf = item.type === 'file' && isPdfFile(item.fileName, item.fileType);
  const isDocx = item.type === 'file' && isDocxFile(item.fileName, item.fileType);
  const isHtml = item.type === 'file' && isHtmlFile(item.fileName, item.fileType);

  useEffect(() => {
    if (!isDocx) return;
    setDocxLoading(true);
    const arrayBuffer = dataUrlToArrayBuffer(item.content);
    mammoth.convertToHtml({ arrayBuffer })
      .then((result) => {
        setDocxHtml(result.value);
      })
      .catch(() => {
        setDocxHtml('<p style="color:gray;">Gagal memuat preview dokumen.</p>');
      })
      .finally(() => setDocxLoading(false));
  }, [item, isDocx]);

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

  const FileHeader = ({ name, size }: { name?: string; size?: number }) => (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted border border-border border-b-0 rounded-t-lg">
      <FileText className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">{name}</span>
      {size && (
        <span className="text-xs text-muted-foreground ml-auto">{formatFileSize(size)}</span>
      )}
    </div>
  );

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
      ) : isHtml && textPreview ? (
        <div className="space-y-4">
          <FileHeader name={item.fileName} size={item.fileSize} />
          <Tabs defaultValue="web" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="web" className="flex-1 gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Preview Web
              </TabsTrigger>
              <TabsTrigger value="code" className="flex-1 gap-1.5">
                <Code className="w-3.5 h-3.5" />
                Preview Teks
              </TabsTrigger>
            </TabsList>
            <TabsContent value="web">
              <iframe
                srcDoc={textPreview}
                className="w-full h-[60vh] border border-border rounded-lg bg-white"
                title={item.fileName || 'HTML Preview'}
                sandbox="allow-scripts allow-same-origin"
              />
            </TabsContent>
            <TabsContent value="code" className="relative">
              <CodePreview code={textPreview} fileName={item.fileName} className="!rounded-lg" />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(textPreview);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  toast.success('Konten disalin!');
                }}
                className="absolute top-3 right-3 p-2 rounded-md bg-card border border-border hover:bg-muted transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              </button>
            </TabsContent>
          </Tabs>
          <Button onClick={handleDownload} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download {item.fileName}
          </Button>
        </div>
      ) : textPreview ? (
        <div className="space-y-4">
          <div className="relative">
            <FileHeader name={item.fileName} size={item.fileSize} />
            <CodePreview code={textPreview} fileName={item.fileName} />
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
      ) : isImage ? (
        <div className="space-y-4">
          <FileHeader name={item.fileName} size={item.fileSize} />
          <div className="border border-border rounded-b-lg overflow-hidden bg-muted/20 flex items-center justify-center p-4">
            <img
              src={item.content}
              alt={item.fileName || 'Image preview'}
              className="max-w-full max-h-[60vh] object-contain rounded"
            />
          </div>
          <Button onClick={handleDownload} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download {item.fileName}
          </Button>
        </div>
      ) : isPdf ? (
        <div className="space-y-4">
          <FileHeader name={item.fileName} size={item.fileSize} />
          <iframe
            src={item.content}
            className="w-full h-[60vh] border border-border rounded-b-lg"
            title={item.fileName || 'PDF Preview'}
          />
          <Button onClick={handleDownload} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download {item.fileName}
          </Button>
        </div>
      ) : isDocx ? (
        <div className="space-y-4">
          <FileHeader name={item.fileName} size={item.fileSize} />
          <div className="border border-border rounded-b-lg overflow-auto bg-card p-6 max-h-[60vh]">
            {docxLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                Memuat preview...
              </div>
            ) : docxHtml ? (
              <div
                className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: docxHtml }}
              />
            ) : null}
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
