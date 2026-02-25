import { useState, useCallback } from 'react';
import { getItems, SharedItem } from '@/lib/storage';
import ShareForm from '@/components/ShareForm';
import ItemList from '@/components/ItemList';
import { Share2 } from 'lucide-react';

const Index = () => {
  const [items, setItems] = useState<SharedItem[]>(() => getItems());

  const refresh = useCallback(() => {
    setItems(getItems());
  }, []);

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
        <ItemList items={items} onUpdate={refresh} />
      </div>
    </div>
  );
};

export default Index;
