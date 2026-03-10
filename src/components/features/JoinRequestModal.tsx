'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useUIStore, useAuthStore } from '@/store';
import { POST_TYPE_LABELS, type Post } from '@/types';
import { toast } from 'sonner';
import { Users, MapPin, Calendar, Loader2, DollarSign } from 'lucide-react';

export function JoinRequestModal() {
  const { isJoinModalOpen, setJoinModalOpen, selectedPostId } = useUIStore();
  const { user, isAuthenticated, setAuthModalOpen } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch post details when modal opens
  useEffect(() => {
    if (isJoinModalOpen && selectedPostId) {
      fetchPost();
    }
  }, [isJoinModalOpen, selectedPostId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isJoinModalOpen) {
      setMessage('');
      setPost(null);
    }
  }, [isJoinModalOpen]);

  const fetchPost = async () => {
    if (!selectedPostId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${selectedPostId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setPost(data);
    } catch {
      toast.error('Failed to load post details');
      setJoinModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      setAuthModalOpen(true);
      toast.error('Please sign in to join');
      return;
    }

    if (!selectedPostId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/join-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: selectedPostId,
          senderId: user.id,
          message: message || 'I would like to join this collaboration!',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send request');
      }

      toast.success('Join request sent successfully! The organizer will review your request.');
      setJoinModalOpen(false);
      setMessage('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeInfo = post ? POST_TYPE_LABELS[post.type] : null;
  const isFull = post ? post.currentParticipants >= post.maxParticipants : false;
  const participationPercent = post ? (post.currentParticipants / post.maxParticipants) * 100 : 0;

  return (
    <Dialog open={isJoinModalOpen} onOpenChange={setJoinModalOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            Join Collaboration
          </DialogTitle>
          <DialogDescription>
            Send a request to participate in this collaboration
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : post ? (
          <div className="space-y-4 py-4">
            {/* Post Summary */}
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 space-y-4 border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-lg">{post.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.description}</p>
                </div>
                {typeInfo && (
                  <Badge className={`${typeInfo.color} border-0 shrink-0`}>
                    {typeInfo.icon} {typeInfo.label}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {post.location && (
                  <span className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md">
                    <MapPin className="h-4 w-4" /> {post.location}
                  </span>
                )}
                {post.startDate && (
                  <span className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md">
                    <Calendar className="h-4 w-4" /> {new Date(post.startDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Participants Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <Users className="h-4 w-4" />
                    {post.currentParticipants}/{post.maxParticipants} participants
                  </span>
                  {isFull ? (
                    <Badge variant="destructive" className="text-xs">Full</Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-600 text-xs">
                      {post.maxParticipants - post.currentParticipants} spots left
                    </Badge>
                  )}
                </div>
                <Progress value={participationPercent} className="h-2" />
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={post.author.image || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {post.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.author.name}</p>
                <p className="text-xs text-muted-foreground">Organizer</p>
              </div>
            </div>

            {/* Price Per Person */}
            {post.itemPrice && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Estimated share per person</span>
                </div>
                <p className="text-3xl font-bold text-primary">
                  ${(post.itemPrice / Math.max(post.currentParticipants + 1, 1)).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total: ${post.itemPrice.toLocaleString()} ÷ {post.currentParticipants + 1} people
                </p>
              </div>
            )}

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Message to organizer (optional)</label>
              <Textarea
                placeholder="Introduce yourself and explain why you'd like to join this collaboration..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No post selected
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => setJoinModalOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || isFull || !post} 
            className="flex-1 btn-shine"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : isFull ? (
              'Already Full'
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Send Request
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
