-- Supabase PostgreSQL Schema for MW Link Weekly Report Dashboard

-- 1. Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  report_period TEXT,
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0
);

-- 2. Utilization Data Table
CREATE TABLE IF NOT EXISTS utilization_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  link_id TEXT,
  ref_link_id TEXT,
  region TEXT,
  province TEXT,
  micro_cluster TEXT,
  site_name TEXT,
  transport_type TEXT,
  util_avg NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast query and filtering
CREATE INDEX IF NOT EXISTS idx_utilization_data_province ON utilization_data(province);
CREATE INDEX IF NOT EXISTS idx_utilization_data_report_id ON utilization_data(report_id);
CREATE INDEX IF NOT EXISTS idx_utilization_data_link_id ON utilization_data(link_id);
CREATE INDEX IF NOT EXISTS idx_utilization_data_util_avg ON utilization_data(util_avg DESC);

-- 3. Weekly Utilization Details Table (Historic Multi-Week Records)
CREATE TABLE IF NOT EXISTS weekly_utilization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilization_data_id UUID REFERENCES utilization_data(id) ON DELETE CASCADE,
  week TEXT NOT NULL,
  utilization_value NUMERIC,
  utilization_level TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for weekly aggregation and trend charts
CREATE INDEX IF NOT EXISTS idx_weekly_utilization_week ON weekly_utilization(week);
CREATE INDEX IF NOT EXISTS idx_weekly_utilization_parent ON weekly_utilization(utilization_data_id);

-- Enable Row Level Security (RLS) - internal dashboard read/write policy
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE utilization_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_utilization ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert on reports" ON reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on utilization_data" ON utilization_data FOR SELECT USING (true);
CREATE POLICY "Allow public insert on utilization_data" ON utilization_data FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on weekly_utilization" ON weekly_utilization FOR SELECT USING (true);
CREATE POLICY "Allow public insert on weekly_utilization" ON weekly_utilization FOR INSERT WITH CHECK (true);
