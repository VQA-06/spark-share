import { useState, useRef, DragEvent } from 'react';
import { Upload, FileText, Clock, Check, Copy, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addItem, EXPIRY_OPTIONS, formatFileSize } from '@/lib/storage';
import { toast } from 'sonner';

interface ShareFormProps {
  onItemAdded: () => void;
}

const ShareForm = ({ onItemAdded }: ShareFormProps) => {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [expiry, setExpiry] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [lastLink, setLastLink] = useState('');
  const [lastLinks, setLastLinks] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    setFiles(prev => [...prev, ...arr]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (mode === 'text' && !text.trim()) {
      toast.error('Masukkan teks untuk dibagikan');
      return;
    }
    if (mode === 'file' && files.length === 0) {
      toast.error('Pilih file untuk dibagikan');
      return;
    }

    setUploading(true);

    try {
      if (mode === 'text') {
        const item = addItem({
          type: 'text',
          title: title.trim() || 'Teks tanpa judul',
          content: text,
          expiresAt: expiry === 0 ? 0 : Date.now() + expiry,
        });
        const link = `${window.location.origin}/${item.shortCode}`;
        setLastLink(link);
        setLastLinks([]);
      } else {
        const links: string[] = [];
        for (const file of files) {
          const content = await readFileAsDataUrl(file);
          const item = addItem({
            type: 'file',
            title: files.length === 1 && title.trim() ? title.trim() : file.name,
            content,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            expiresAt: expiry === 0 ? 0 : Date.now() + expiry,
          });
          links.push(`${window.location.origin}/${item.shortCode}`);
        }
        setLastLinks(links);
        setLastLink('');
      }

      setText('');
      setTitle('');
      setFiles([]);
      if (fileRef.current) fileRef.current.value = '';
      onItemAdded();
      toast.success(mode === 'file' && files.length > 1
        ? `${files.length} file berhasil dibagikan!`
        : 'Berhasil dibagikan!'
      );
    } finally {
      setUploading(false);
    }
  };

  const copyLink = (link: string, index?: number) => {
    navigator.clipboard.writeText(link);
    setCopied(index ?? -1);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Link disalin!');
  };

  const copyAllLinks = () => {
    navigator.clipboard.writeText(lastLinks.join('\n'));
    setCopied(-2);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Semua link disalin!');
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit mx-auto">
        <button
          onClick={() => setMode('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'text' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-4 h-4" />
          Teks
        </button>
        <button
          onClick={() => setMode('file')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'file' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Upload className="w-4 h-4" />
          File
        </button>
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder={mode === 'file' && files.length > 1 ? 'Judul (diabaikan untuk multi-file)' : 'Judul (opsional)'}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
      />

      {/* Content */}
      {mode === 'text' ? (
        <textarea
          placeholder="Tulis atau tempel teks di sini..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
        />
      ) : (
        <div className="space-y-3">
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e: DragEvent) => { e.preventDefault(); setDragging(true); }}
            onDragEnter={(e: DragEvent) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={(e: DragEvent) => { e.preventDefault(); setDragging(false); }}
            onDrop={(e: DragEvent) => {
              e.preventDefault();
              setDragging(false);
              if (e.dataTransfer.files?.length) {
                addFiles(e.dataTransfer.files);
              }
            }}
            className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              dragging
                ? 'border-primary bg-accent/50 scale-[1.01]'
                : 'border-border hover:border-primary/50 hover:bg-accent/30'
            }`}
          >
            <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors ${dragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-muted-foreground">
              {dragging ? 'Lepaskan file di sini' : 'Seret file ke sini atau klik untuk memilih'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Bisa pilih beberapa file sekaligus</p>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  addFiles(e.target.files);
                }
                e.target.value = '';
              }}
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{files.length} file dipilih</span>
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-destructive hover:underline font-medium"
                >
                  Hapus semua
                </button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                {files.map((file, i) => (
                  <div
                    key={`${file.name}-${i}`}
                    className="flex items-center gap-3 px-3 py-2 bg-muted/50 border border-border rounded-lg"
                  >
                    <div className="p-1.5 bg-muted rounded">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expiry */}
      <div className="flex items-center gap-3">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Hapus otomatis:</span>
        <div className="relative">
          <select
            value={expiry}
            onChange={(e) => setExpiry(Number(e.target.value))}
            className="appearance-none pl-3 pr-8 py-1.5 bg-muted border border-border rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            {EXPIRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Submit */}
      <Button onClick={handleSubmit} disabled={uploading} className="w-full h-12 text-base font-medium">
        {uploading ? 'Mengunggah...' : mode === 'file' && files.length > 1 ? `Bagikan ${files.length} File` : 'Bagikan'}
      </Button>

      {/* Single Link */}
      {lastLink && (
        <div className="flex items-center gap-2 p-3 bg-accent/50 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-bottom-2">
          <code className="flex-1 text-sm text-accent-foreground truncate">{lastLink}</code>
          <button
            onClick={() => copyLink(lastLink)}
            className="p-2 rounded-md hover:bg-primary/10 transition-colors text-primary"
          >
            {copied === -1 ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Multiple Links */}
      {lastLinks.length > 0 && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{lastLinks.length} link dibuat</span>
            <button
              onClick={copyAllLinks}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
            >
              {copied === -2 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              Salin semua
            </button>
          </div>
          {lastLinks.map((link, i) => (
            <div
              key={link}
              className="flex items-center gap-2 p-2.5 bg-accent/50 border border-primary/20 rounded-lg"
            >
              <code className="flex-1 text-sm text-accent-foreground truncate">{link}</code>
              <button
                onClick={() => copyLink(link, i)}
                className="p-1.5 rounded-md hover:bg-primary/10 transition-colors text-primary"
              >
                {copied === i ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShareForm;
