'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  postCount?: number;
  onClick?: () => void;
  isSelected?: boolean;
}

export function CategoryCard({ category, postCount = 0, onClick, isSelected }: CategoryCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${category.name}${postCount > 0 ? `, ${postCount} posts` : ''}`}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none ${
        isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : ''
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-4 text-center">
        <div className="text-3xl mb-2" role="img" aria-hidden="true">{category.icon}</div>
        <h3 className="font-medium text-sm">{category.name}</h3>
        {postCount > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {postCount} {postCount === 1 ? 'post' : 'posts'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
