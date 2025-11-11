import { PageHeader } from "@/components/layout/PageHeader";
import { MyKeysDataTable } from "@/components/my-keys/MyKeysDataTable";
export function MyKeysPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <PageHeader
          title="My Keys"
          subtitle="A list of all keys currently assigned to you."
        />
        <MyKeysDataTable />
      </div>
    </div>
  );
}