'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useUIStore, useAuthStore } from '@/store';
import { POST_TYPE_LABELS, POST_STATUS_LABELS, type Post, type Comment } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import {
  MapPin,
  Users,
  Calendar,
  Clock,
  MessageCircle,
  Heart,
  Share2,
  Send,
  Star,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export function PostDetailModal() {
  const { isPostDetailOpen, setPostDetailOpen, selectedPostId, setSelectedPostId } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (selectedPostId) {
      fetchPost();
    }
  }, [selectedPostId]);

  useEffect(() => {
    if (!isPostDetailOpen) {
      setPost(null);
      setComments([]);
      setNewComment('');
      setLiked(false);
    }
  }, [isPostDetailOpen]);

  const fetchPost = async () => {
    if (!selectedPostId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${selectedPostId}`);
      const data = await response.json();
      setPost(data);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to fetch post:', error);
      toast.error('Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please sign in to join');
      return;
    }

    try {
      const response = await fetch('/api/join-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: selectedPostId,
          senderId: user.id,
          message: 'I would like to join!',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast.success('Join request sent!');
      fetchPost();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send request');
    }
  };

  const handleComment = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: selectedPostId,
          authorId: user.id,
          content: newComment,
        }),
      });

      const comment = await response.json();
      setComments([comment, ...comments]);
      setNewComment('');
      toast.success('Comment added!');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const typeInfo = post ? POST_TYPE_LABELS[post.type] : null;
  const statusInfo = post ? POST_STATUS_LABELS[post.status] : null;
  const participationPercent = post ? (post.currentParticipants / post.maxParticipants) * 100 : 0;

  return (
    <Dialog open={isPostDetailOpen} onOpenChange={(open) => {
      setPostDetailOpen(open);
      if (!open) setSelectedPostId(null);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        {/* Visually Hidden Title for Accessibility */}
        <VisuallyHidden>
          <DialogTitle>
            {isLoading ? 'Loading Post' : post ? post.title : 'Post Details'}
          </DialogTitle>
        </VisuallyHidden>

        {isLoading ? (
          <div className="flex flex-col md:flex-row h-full">
            <div className="md:w-1/2 bg-muted h-64 md:h-auto">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="md:w-1/2 p-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : post ? (
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Side - Image */}
            <div className="md:w-1/2 bg-muted relative">
              {post.itemImage ? (
                <div className="relative h-64 md:h-full">
                  <img
                    src={post.itemImage}
                    alt={post.itemName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Image Navigation */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-64 md:h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                  <span className="text-8xl opacity-30">{typeInfo?.icon}</span>
                </div>
              )}
              
              {/* Type Badge */}
              <div className="absolute top-4 left-4">
                <Badge className={`${typeInfo?.color} border-0 shadow-lg`}>
                  <span className="mr-1">{typeInfo?.icon}</span>
                  {typeInfo?.label}
                </Badge>
              </div>
              
              {/* Urgent Badge */}
              {post.isUrgent && (
                <div className="absolute top-4 right-4">
                  <Badge variant="destructive" className="shadow-lg animate-pulse">
                    <Zap className="h-3 w-3 mr-1" />
                    Urgent
                  </Badge>
                </div>
              )}
            </div>

            {/* Right Side - Content */}
            <div className="md:w-1/2 flex flex-col h-[60vh] md:h-auto">
              {/* Header */}
              <div className="p-6 pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={post.author.image || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {post.author.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{post.author.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {post.author.trustScore > 0 && (
                            <>
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              {post.author.trustScore.toFixed(1)}
                            </>
                          )}
                          {post.author.college && (
                            <span className="ml-1">• {post.author.college}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={statusInfo?.color}>
                    {statusInfo?.label}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {/* Price & Category */}
                  <div className="flex flex-wrap gap-3">
                    {post.itemPrice && (
                      <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-xl">
                        ${post.itemPrice.toLocaleString()}
                      </div>
                    )}
                    <Badge variant="secondary" className="px-4 py-2">
                      {post.category.icon} {post.category.name}
                    </Badge>
                    {post.itemCondition && (
                      <Badge variant="outline" className="px-4 py-2 capitalize">
                        {post.itemCondition.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">{post.description}</p>

                  {/* Participation */}
                  <div className="bg-muted/50 rounded-xl p-4 space-y-3 border">
                    <div className="flex items-center justify-between">
                      <span className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Participants
                      </span>
                      <span className="text-sm">
                        <span className="font-bold text-lg">{post.currentParticipants}</span>
                        <span className="text-muted-foreground">/{post.maxParticipants}</span>
                      </span>
                    </div>
                    <Progress value={participationPercent} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {post.maxParticipants - post.currentParticipants} spots remaining
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {post.location && (
                      <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{post.location}</span>
                      </div>
                    )}
                    {post.startDate && (
                      <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{format(new Date(post.startDate), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>

                  {/* Terms */}
                  {post.terms && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h4 className="font-medium mb-2 text-amber-800 dark:text-amber-200 flex items-center gap-2">
                        📋 Terms & Conditions
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">{post.terms}</p>
                    </div>
                  )}

                  <Separator />

                  {/* Comments Section */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      Discussion ({comments.length})
                    </h4>
                    
                    {/* Comment Input */}
                    <div className="flex gap-2 mb-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {user?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                          className="flex-1"
                        />
                        <Button size="icon" onClick={handleComment} className="shrink-0">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author.image || undefined} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {comment.author.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-muted/50 rounded-lg p-3 border border-transparent hover:border-primary/10 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{comment.author.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <p className="text-center text-muted-foreground text-sm py-4">
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer Actions */}
              <div className="p-4 border-t bg-muted/30">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLiked(!liked)}
                    className="hover:bg-pink-100 dark:hover:bg-pink-900/30"
                  >
                    <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-blue-100 dark:hover:bg-blue-900/30">
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <div className="flex-1" />
                  {post.status === 'OPEN' && post.currentParticipants < post.maxParticipants && (
                    <Button onClick={handleJoin} className="btn-shine">
                      <Users className="h-4 w-4 mr-2" />
                      Join Now
                    </Button>
                  )}
                  {post.status !== 'OPEN' && (
                    <Badge variant="secondary" className="px-4 py-2">
                      {post.status === 'CLOSED' ? 'Already Closed' : 'Not Available'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Post not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
