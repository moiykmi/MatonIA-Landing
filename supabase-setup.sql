-- Tabla de leads capturados
CREATE TABLE leads (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  phone TEXT,
  email TEXT,
  current_provider TEXT,
  monthly_bill NUMERIC,
  services TEXT[], -- Array de servicios (telefonia, internet, etc)
  source TEXT DEFAULT 'landing_page',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  city TEXT,
  whatsapp_clicked BOOLEAN DEFAULT false,
  whatsapp_clicked_at TIMESTAMPTZ,
  status TEXT DEFAULT 'new' -- new, contacted, converted, lost
);

-- Tabla de analytics de visitantes
CREATE TABLE page_visits (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  city TEXT,
  device_type TEXT, -- mobile, desktop, tablet
  time_on_page INTEGER, -- segundos
  scroll_depth INTEGER, -- porcentaje de scroll
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

-- Tabla de eventos (clicks, hovers, etc)
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  event_type TEXT, -- click, hover, scroll, form_start, form_submit
  element_id TEXT,
  element_class TEXT,
  page_url TEXT,
  user_agent TEXT,
  ip_address INET
);

-- Índices para mejor performance
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_page_visits_created_at ON page_visits(created_at);
CREATE INDEX idx_page_visits_session_id ON page_visits(session_id);
CREATE INDEX idx_events_session_id ON events(session_id);
CREATE INDEX idx_events_created_at ON events(created_at);

-- Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción anónima (solo INSERT)
CREATE POLICY "Allow anonymous inserts" ON leads
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON page_visits
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON events
  FOR INSERT TO anon
  WITH CHECK (true);