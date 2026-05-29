/**
 * Admin Layout
 * Wrapper for all admin pages with sidebar
 */

import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <div className="flex-1 min-w-0">
          <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.08),_transparent_22%),linear-gradient(180deg,#f8fafc_0%,#f8fbff_100%)]">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
