-- Add 'on_request' status to allowed values
ALTER TABLE watches DROP CONSTRAINT IF EXISTS watches_status_check;

ALTER TABLE watches ADD CONSTRAINT watches_status_check 
  CHECK (status = ANY (ARRAY['available'::text, 'on_order'::text, 'out_of_stock'::text, 'on_request'::text]));