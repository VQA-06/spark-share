import { useState, useRef, DragEvent } from 'react';
import { Upload, FileText, Clock, Check, Copy } from 'lucide-react';
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
  const [expiry, setExpiry] = useState(EXPIRY_OPTIONS[2].value);
  const [file, setFile] = useState<File | null>(null);
  const [lastLink, setLastLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (mode === 'text' && !text.trim()) {
      toast.error('Masukkan teks untuk dibagikan');
      return;
    }
    if (mode === 'file' && !file) {
      toast.error('Pilih file untuk dibagikan');
      return;
    }

    let content = text;
    let fileName: string | undefined;
    let fileSize: number | undefined;
    let fileType: string | undefined;

    if (mode === 'file' && file) {
      content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      fileName = file.name;
      fileSize = file.size;
      fileType = file.type;
    }

    const item = addItem({
      type: mode,
      title: title.trim() || (mode === 'file' ? fileName! : 'Teks tanpa judul'),
      content,
      fileName,
      fileSize,
      fileType,
      expiresAt: expiry === 0 ? 0 : Date.now() + expiry,
    });

    const link = `${window.location.origin}/s/${item.shortCode}`;
    setLastLink(link);
    setText('');
    setTitle('');
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
    onItemAdded();
    toast.success('Berhasil dibagikan!');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(lastLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link disalin!');
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
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
        placeholder="Judul (opsional)"
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
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e: DragEvent) => { e.preventDefault(); setDragging(true); }}
          onDragEnter={(e: DragEvent) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={(e: DragEvent) => { e.preventDefault(); setDragging(false); }}
          onDrop={(e: DragEvent) => {
            e.preventDefault();
            setDragging(false);
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) setFile(droppedFile);
          }}
          className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            dragging
              ? 'border-primary bg-accent/50 scale-[1.01]'
              : 'border-border hover:border-primary/50 hover:bg-accent/30'
          }`}
        >
          <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors ${dragging ? 'text-primary' : 'text-muted-foreground'}`} />
          {file ? (
            <div>
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{formatFileSize(file.size)}</p>
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground">{dragging ? 'Lepaskan file di sini' : 'Seret file ke sini atau klik untuk memilih'}</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
      )}

      {/* Expiry */}
      <div className="flex items-center gap-3">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Hapus otomatis:</span>
        <div className="flex gap-2">
          {EXPIRY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setExpiry(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                expiry === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button onClick={handleSubmit} className="w-full h-12 text-base font-medium">
        Bagikan
      </Button>

      {/* Last Link */}
      {lastLink && (
        <div className="flex items-center gap-2 p-3 bg-accent/50 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-bottom-2">
          <code className="flex-1 text-sm text-accent-foreground truncate">{lastLink}</code>
          <button
            onClick={copyLink}
            className="p-2 rounded-md hover:bg-primary/10 transition-colors text-primary"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareForm;
