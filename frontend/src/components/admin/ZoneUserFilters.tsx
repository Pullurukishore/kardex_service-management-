import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ZoneUserFiltersProps {
  searchParams: {
    search?: string;
    page?: string;
  };
}

export function ZoneUserFilters({ searchParams }: ZoneUserFiltersProps) {
  const currentSearch = searchParams.search || '';

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <form method="GET" className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#979796] h-4 w-4" />
            <Input
              name="search"
              placeholder="Search zone users by name, email, or phone..."
              defaultValue={currentSearch}
              className="pl-10 pr-10"
            />
            {currentSearch && (
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-[#AEBFC3]/20"
                onClick={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget.closest('form');
                  if (form) {
                    const input = form.querySelector('input[name="search"]') as HTMLInputElement;
                    if (input) input.value = '';
                    form.submit();
                  }
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button type="submit" className="bg-[#6F8A9D] hover:bg-[#546A7A]">
            Search
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
