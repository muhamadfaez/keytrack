import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useSearchStore } from '@/stores/searchStore';
export function GlobalSearch() {
  const searchTerm = useSearchStore((state) => state.searchTerm);
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);
  return (
    <div className="relative w-full max-w-md ml-4 hidden md:block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search keys or personnel..."
        className="pl-9"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}