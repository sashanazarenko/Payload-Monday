import { Navigate } from 'react-router';

/** Legacy route: APPA monitoring and conflicts live on `/dashboard`. */
export function AppaSyncDashboard() {
  return <Navigate to="/dashboard?focus=appa" replace />;
}
