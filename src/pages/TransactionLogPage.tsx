import { Navigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { LogDataTable } from "@/components/log/LogDataTable";
import { useAuthStore } from "@/stores/authStore";
export function TransactionLogPage() {
  const user = useAuthStore((state) => state.user);
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <PageHeader
          title="Transaction Log"
          subtitle="An audit trail of all system events and notifications."
        />
        <LogDataTable />
      </div>
    </div>
  );
}