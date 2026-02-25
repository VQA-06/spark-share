import { useState, useCallback } from 'react';
import { getItems, SharedItem } from '@/lib/storage';
import ShareForm from '@/components/ShareForm';
import ItemList from '@/components/ItemList';
import ItemDetail from '@/components/ItemDetail';
import { Share2, ArrowLeft } from 'lucide-react';

const Index = () => {
  const [items, setItems] = useState<SharedItem[]>(() => getItems());
  const [selectedItem, setSelectedItem] = useState<SharedItem | null>(null);

  const refresh = useCallback(() => {
    setItems(getItems());
  }, []);

  if (selectedItem) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button
            onClick={() => setSelectedItem(null)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <ItemDetail item={selectedItem} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 bg-primary rounded-xl">
            <Share2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">QuickShare</h1>
            <p className="text-sm text-muted-foreground">Bagikan teks & file dengan link pendek</p>
          </div>
        </div>

        {/* Share Form */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <ShareForm onItemAdded={refresh} />
        </div>

        {/* Items List */}
        <ItemList items={items} onUpdate={refresh} onItemClick={setSelectedItem} />
      </div>
    </div>
  );
};

export default Index;
