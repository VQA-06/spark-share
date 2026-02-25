
-- Create shared_items table
CREATE TABLE public.shared_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('text', 'file')),
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- text content or base64 file data
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  short_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE -- null means no expiry
);

-- Enable RLS
ALTER TABLE public.shared_items ENABLE ROW LEVEL SECURITY;

-- Public access (no auth needed for this app)
CREATE POLICY "Anyone can view shared items"
  ON public.shared_items FOR SELECT USING (true);

CREATE POLICY "Anyone can create shared items"
  ON public.shared_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete shared items"
  ON public.shared_items FOR DELETE USING (true);

-- Indexes
CREATE INDEX idx_shared_items_short_code ON public.shared_items (short_code);
CREATE INDEX idx_shared_items_expires_at ON public.shared_items (expires_at);

-- Function to find next available short code
CREATE OR REPLACE FUNCTION public.next_short_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  slot INT := 1;
BEGIN
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.shared_items WHERE short_code = slot::TEXT) THEN
      RETURN slot::TEXT;
    END IF;
    slot := slot + 1;
  END LOOP;
END;
$$;
