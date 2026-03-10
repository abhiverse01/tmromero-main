'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MapPin, Users, Clock, MessageCircle, Heart, Share2, ExternalLink, Star } from 'lucide-react';
import type { Post } from '@/types';
import { POST_TYPE_LABELS, POST_STATUS_LABELS } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface PostCardProps {
  post: Post;
  onJoin?: () => void;
  onView?: () => void;
}

export function PostCard({ post, onJoin, onView }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const typeInfo = POST_TYPE_LABELS[post.type];
  const statusInfo = POST_STATUS_LABELS[post.status];
  const participationPercent = Math.min((post.currentParticipants / post.maxParticipants) * 100, 100);
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  const isFull = post.currentParticipants >= post.maxParticipants;
  const isOpen = post.status === 'OPEN';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onView?.();
    }
  };

  return (
    <Card 
      className="group relative overflow-hidden flex flex-col h-full cursor-pointer bg-card hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onView}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`${post.title} by ${post.author.name}`}
    >
      {/* Image or Placeholder */}
      {post.itemImage ? (
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <img
            src={post.itemImage}
            alt={post.itemName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <Badge className={`${typeInfo.color} border-0 shadow-lg backdrop-blur-sm`}>
              <span className="mr-1" aria-hidden="true">{typeInfo.icon}</span>
              {typeInfo.label}
            </Badge>
            {post.isUrgent && (
              <Badge variant="destructive" className="shadow-lg">
                🔥 Urgent
              </Badge>
            )}
          </div>
          
          {/* Price Tag */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            {post.itemPrice && (
              <Badge className="bg-white/95 text-gray-900 dark:bg-gray-900/95 dark:text-gray-100 border-0 font-bold text-base shadow-lg px-3 py-1">
                ${post.itemPrice.toLocaleString()}
              </Badge>
            )}
            {post.itemCondition && (
              <Badge variant="outline" className="bg-white/80 dark:bg-gray-800/80 border-0 text-xs capitalize">
                {post.itemCondition.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>
      ) : (
        <div className="relative h-40 w-full bg-gradient-to-br from-muted via-muted/80 to-muted/50 flex items-center justify-center overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-primary blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-accent blur-xl" />
          </div>
          
          <span className="text-6xl opacity-40 group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
            {typeInfo.icon}
          </span>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={`${typeInfo.color} border-0 shadow-lg`}>
              <span className="mr-1" aria-hidden="true">{typeInfo.icon}</span>
              {typeInfo.label}
            </Badge>
          </div>
          
          {post.isUrgent && (
            <div className="absolute top-3 right-3">
              <Badge variant="destructive" className="shadow-lg">
                🔥 Urgent
              </Badge>
            </div>
          )}
          
          {/* Price Tag */}
          {post.itemPrice && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-primary/90 text-primary-foreground border-0 font-bold shadow-lg px-3 py-1">
                ${post.itemPrice.toLocaleString()}
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardContent className="flex-1 p-4 space-y-3">
        {/* Title & Description */}
        <div>
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {post.description}
          </p>
        </div>

        {/* Category & Status */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs font-normal">
            <span aria-hidden="true">{post.category.icon}</span> {post.category.name}
          </Badge>
          <Badge variant="outline" className={`text-xs ${statusInfo.color}`}>
            {statusInfo.label}
          </Badge>
        </div>

        {/* Participation Progress */}
        <div className="space-y-2 bg-muted/30 p-3 rounded-lg -mx-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Users className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>
                <span className="text-foreground">{post.currentParticipants}</span>
                <span className="text-muted-foreground">/{post.maxParticipants}</span>
              </span>
            </span>
            {isFull ? (
              <Badge variant="outline" className="text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-800 text-xs">
                Full
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground font-normal">
                {post.maxParticipants - post.currentParticipants} spots left
              </span>
            )}
          </div>
          <Progress 
            value={participationPercent} 
            className={`h-2 ${isFull ? '[&>div]:bg-orange-500' : '[&>div]:bg-primary'}`} 
            aria-label={`${post.currentParticipants} of ${post.maxParticipants} participants`}
          />
        </div>

        {/* Location & Time */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {post.location && (
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate">{post.location}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {timeAgo}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto border-t border-border/50">
        <div className="flex items-center justify-between w-full pt-3">
          {/* Author */}
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9 border-2 border-background shadow-sm ring-2 ring-primary/10">
              <AvatarImage src={post.author.image || undefined} alt={post.author.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-xs font-semibold">
                {post.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs">
              <p className="font-medium truncate max-w-[90px]">{post.author.name}</p>
              {post.author.trustScore > 0 && (
                <p className="text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                  <span>{post.author.trustScore.toFixed(1)}</span>
                  <span className="sr-only">trust score</span>
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
              onClick={(e) => {
                e.stopPropagation();
                setLiked(!liked);
              }}
              aria-label={liked ? "Unlike post" : "Like post"}
              aria-pressed={liked}
            >
              <Heart className={`h-4 w-4 transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : ''}`} aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={(e) => e.stopPropagation()}
              aria-label="View comments"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={(e) => e.stopPropagation()}
              aria-label="Share post"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardFooter>

      {/* Join Button Overlay */}
      {isOpen && !isFull && (
        <div 
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-card via-card/95 to-transparent transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        >
          <Button 
            className="w-full shadow-lg" 
            onClick={(e) => {
              e.stopPropagation();
              onJoin?.();
            }}
            aria-label="Join this collaboration"
          >
            <Users className="h-4 w-4 mr-2" aria-hidden="true" />
            Join Now
            <ExternalLink className="h-4 w-4 ml-2" aria-hidden="true" />
          </Button>
        </div>
      )}
    </Card>
  );
}
