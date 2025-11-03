"use client";

import { cn } from '@/lib/utils';

interface PostCardProps {
  title: string;
  author: string;
  timestamp: string;
  badges?: React.ReactNode;
  categories?: React.ReactNode;
  excerpt?: string;
  stats?: { likes?: number; comments?: number; };
  className?: string;
}

export function PostCard({ 
  title, 
  author, 
  timestamp, 
  badges, 
  categories, 
  excerpt, 
  stats,
  className 
}: PostCardProps) {
  return (
    <div
      className={cn(
        "p-6 border-t border-brand-primary-950/30",
        "hover:bg-brand-primary-950/10 transition-colors cursor-pointer",
        className
      )}
    >
      {/* Badges */}
      {badges && (
        <div className="mb-3">
          {badges}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-bold text-foreground mb-2 hover:text-brand-primary-400 transition-colors">
        {title}
      </h3>

      {/* Author & Meta */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <span className="text-brand-primary-400 font-medium">{author}</span>
        <span>•</span>
        <span>{timestamp}</span>
      </div>

      {/* Excerpt */}
      {excerpt && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {excerpt}
        </p>
      )}

      {/* Categories */}
      {categories && (
        <div className="flex flex-wrap gap-2 mb-3">
          {categories}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {stats.likes !== undefined && (
            <span className="flex items-center gap-1">
              <span>❤️</span>
              <span>{stats.likes}</span>
            </span>
          )}
          {stats.comments !== undefined && (
            <span className="flex items-center gap-1">
              <span>💬</span>
              <span>{stats.comments}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

