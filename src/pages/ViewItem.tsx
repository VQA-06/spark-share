import { useParams, Link } from 'react-router-dom';
import { getItemByCode } from '@/lib/storage';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ItemDetail from '@/components/ItemDetail';

const ViewItem = () => {
  const { code } = useParams<{ code: string }>();
  const item = code ? getItemByCode(code) : undefined;

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
        <ItemDetail item={item} />
      </div>
    </div>
  );
};

export default ViewItem;
