import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

/**
 * לוח ניהול לוגיסטיקה — `/admin`
 * שישה טאבים (כל ההזמנות, משלוחים היום, מכתבים, ארכיון, צוות, אנליטיקס), סינון ופסי התקדמות — ב־`AdminDashboardClient`.
 */
export default function AdminPage() {
  return <AdminDashboardClient />;
}
