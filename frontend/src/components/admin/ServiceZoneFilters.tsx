import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceZoneFiltersProps {
  searchParams: {
    search?: string;
    page?: string;
  };
}

export function ServiceZoneFilters({ searchParams }: ServiceZoneFiltersProps) {
  const currentSearch = searchParams.search || '';

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#AEBFC3]/10 to-[#AEBFC3]/20 rounded-t-lg">
        <CardTitle className="text-[#546A7A]">Search & Filter</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form method="GET" className="flex flex-col md:flex-row gap-4">
          {/* Preserve current page when searching */}
          <input type="hidden" name="page" value="1" />
          
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#979796] h-4 w-4" />
              <Input
                name="search"
                type="search"
                placeholder="Search zones by name or description..."
                defaultValue={currentSearch}
                className="pl-10 focus:ring-2 focus:ring-[#82A094] focus:border-[#82A094]"
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
