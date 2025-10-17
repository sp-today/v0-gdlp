-- Create function to get claims by status
CREATE OR REPLACE FUNCTION get_claims_by_status()
RETURNS TABLE(status VARCHAR, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT warranty_claims.status, COUNT(*) as count
  FROM warranty_claims
  GROUP BY warranty_claims.status
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get grievances by status
CREATE OR REPLACE FUNCTION get_grievances_by_status()
RETURNS TABLE(status VARCHAR, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT grievances.status, COUNT(*) as count
  FROM grievances
  GROUP BY grievances.status
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for daily metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_metrics AS
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT CASE WHEN table_name = 'users' THEN id END) as new_users,
  COUNT(DISTINCT CASE WHEN table_name = 'devices' THEN id END) as new_devices,
  COUNT(DISTINCT CASE WHEN table_name = 'warranty_claims' THEN id END) as new_claims,
  COUNT(DISTINCT CASE WHEN table_name = 'grievances' THEN id END) as new_grievances
FROM (
  SELECT created_at, 'users' as table_name, id FROM profiles
  UNION ALL
  SELECT created_at, 'devices' as table_name, id FROM devices
  UNION ALL
  SELECT created_at, 'warranty_claims' as table_name, id FROM warranty_claims
  UNION ALL
  SELECT created_at, 'grievances' as table_name, id FROM grievances
) combined
GROUP BY DATE(created_at)
ORDER BY date DESC;
