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
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useUIStore, useAuthStore } from '@/store';
import { toast } from 'sonner';
import { Star, Loader2, ThumbsUp } from 'lucide-react';

export function RatingModal() {
  const { isRatingModalOpen, setRatingModalOpen, selectedUserId } = useUIStore();
  const { user, isAuthenticated, setAuthModalOpen } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [targetUser, setTargetUser] = useState<{ 
    id: string; 
    name: string; 
    image: string | null;
    trustScore?: number;
    college?: string | null;
  } | null>(null);

  // Fetch user details when modal opens
  useEffect(() => {
    if (isRatingModalOpen && selectedUserId) {
      fetchUser();
    }
  }, [isRatingModalOpen, selectedUserId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isRatingModalOpen) {
      setRating(5);
      setReview('');
      setHoveredRating(0);
      setTargetUser(null);
    }
  }, [isRatingModalOpen]);

  const fetchUser = async () => {
    if (!selectedUserId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${selectedUserId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTargetUser(data);
    } catch {
      toast.error('Failed to load user details');
      setRatingModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      setAuthModalOpen(true);
      toast.error('Please sign in to rate');
      return;
    }

    if (!selectedUserId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giverId: user.id,
          receiverId: selectedUserId,
          score: rating,
          review: review || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit rating');
      }

      toast.success('Rating submitted successfully! Thank you for your feedback.');
      setRatingModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <Dialog open={isRatingModalOpen} onOpenChange={setRatingModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" aria-hidden="true" />
            </div>
            Rate Your Experience
          </DialogTitle>
          <DialogDescription>
            Your feedback helps build trust in the community
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-6" aria-busy="true" aria-label="Loading user details">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        ) : targetUser ? (
          <div className="space-y-6 py-4">
            {/* User being rated */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={targetUser.image || undefined} alt={targetUser.name} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary font-semibold">
                  {targetUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-semibold text-lg">{targetUser.name}</p>
                {targetUser.college && (
                  <p className="text-sm text-muted-foreground">{targetUser.college}</p>
                )}
                {targetUser.trustScore !== undefined && targetUser.trustScore > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                    {targetUser.trustScore.toFixed(1)} trust score
                  </p>
                )}
              </div>
            </div>

            {/* Star Rating */}
            <fieldset className="space-y-4">
              <legend className="text-center text-sm font-medium">Select your rating</legend>
              <div className="flex justify-center gap-2" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`${star} star${star > 1 ? 's' : ''} - ${ratingLabels[star]}`}
                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star
                      className={`h-12 w-12 transition-all duration-150 ${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-500 fill-yellow-500 scale-105'
                          : 'text-muted-foreground/20'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
              <div className="text-center" aria-live="polite">
                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                  {ratingLabels[hoveredRating || rating]}
                </p>
              </div>
            </fieldset>

            {/* Review */}
            <div className="space-y-2">
              <Label htmlFor="review">Your review (optional)</Label>
              <Textarea
                id="review"
                placeholder="Share your experience working with this person. Your feedback helps others make informed decisions."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Be honest and respectful. Reviews are visible to everyone.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No user selected
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => setRatingModalOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !targetUser} 
            className="flex-1 btn-shine"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Submitting...
              </>
            ) : (
              <>
                <ThumbsUp className="mr-2 h-4 w-4" aria-hidden="true" />
                Submit Rating
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
