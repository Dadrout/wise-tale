-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add RLS (Row Level Security) if needed
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for waitlist signups)
CREATE POLICY "Allow public inserts" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view waitlist (optional)
CREATE POLICY "Allow authenticated users to view" ON waitlist
  FOR SELECT USING (auth.role() = 'authenticated'); 