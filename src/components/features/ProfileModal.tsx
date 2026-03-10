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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useUIStore, useAuthStore } from '@/store';
import { POST_TYPE_LABELS, type Post } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  Mail,
  School,
  Calendar,
  Star,
  Edit2,
  Loader2,
  Package,
  MessageCircle,
  Award,
  CheckCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  college: string | null;
  isVerified: boolean;
  isAdmin: boolean;
  trustScore: number;
  createdAt: string;
  _count: {
    posts: number;
    comments: number;
    receivedRatings: number;
  };
  posts: Post[];
  receivedRatings: Array<{
    id: string;
    score: number;
    review: string | null;
    createdAt: string;
    giver: { id: string; name: string; image: string | null };
  }>;
}

export function ProfileModal() {
  const { isProfileModalOpen, setProfileModalOpen, selectedUserId } = useUIStore();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', college: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isProfileModalOpen && selectedUserId) {
      fetchProfile();
    }
  }, [isProfileModalOpen, selectedUserId]);

  useEffect(() => {
    if (!isProfileModalOpen) {
      setProfile(null);
      setIsEditing(false);
    }
  }, [isProfileModalOpen]);

  const fetchProfile = async () => {
    if (!selectedUserId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${selectedUserId}`);
      const data = await response.json();
      setProfile(data);
      setEditForm({
        name: data.name || '',
        bio: data.bio?.replace(/^pwd:[a-f0-9]+$/, '') || '', // Hide password hash
        college: data.college || '',
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedUserId) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${selectedUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      setProfile((prev) => prev ? { ...prev, ...data } : null);
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const isOwnProfile = currentUser?.id === selectedUserId;

  return (
    <Dialog open={isProfileModalOpen} onOpenChange={setProfileModalOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Always include DialogTitle for accessibility */}
        <VisuallyHidden>
          <DialogTitle>
            {isLoading ? 'Loading Profile' : profile ? `${profile.name}'s Profile` : 'User Profile'}
          </DialogTitle>
        </VisuallyHidden>

        {isLoading ? (
          <div className="space-y-6 py-8 px-6">
            <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg">
              <div className="relative -mt-12 px-6">
                <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        ) : profile ? (
          <>
            {/* Header Banner */}
            <div className="h-32 bg-gradient-to-r from-primary/30 via-primary/20 to-accent/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
              
              {/* Avatar */}
              <div className="absolute -bottom-12 left-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-4 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
                    <AvatarImage src={profile.image || undefined} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-white font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {profile.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-background shadow-lg animate-scale-in">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {profile.isAdmin && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1 border-2 border-background shadow-lg animate-scale-in">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              {isOwnProfile && !isEditing && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4 shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4 mr-1" /> Edit Profile
                </Button>
              )}
            </div>

            {/* Content with ScrollArea */}
            <ScrollArea className="flex-1" style={{ maxHeight: 'calc(90vh - 8rem)' }}>
              <div className="pt-16 px-6 pb-6">
                {/* User Info */}
                <div className="mb-6">
                  {isEditing ? (
                    <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Bio</label>
                        <Textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">College/University</label>
                        <Input
                          value={editForm.college}
                          onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                        {profile.isVerified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {profile.isAdmin && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
                            <Award className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-4 w-4" />
                          {profile.email}
                        </span>
                        {profile.college && (
                          <span className="flex items-center gap-1.5">
                            <School className="h-4 w-4" />
                            {profile.college}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {profile.bio && !profile.bio.startsWith('pwd:') && (
                        <p className="text-sm bg-muted/30 p-3 rounded-lg border">{profile.bio}</p>
                      )}
                    </>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-center gap-1">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="text-2xl font-bold text-primary">{profile._count.posts}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Posts</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-900 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-center gap-1">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-600">{profile._count.comments}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Comments</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-50/50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/30 rounded-xl border border-yellow-100 dark:border-yellow-900 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      <span className="text-2xl font-bold text-yellow-600">{profile.trustScore.toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Trust Score</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/30 rounded-xl border border-green-100 dark:border-green-900 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">{profile._count.receivedRatings}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Reviews</div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Tabs */}
                <Tabs defaultValue="posts" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-12">
                    <TabsTrigger value="posts" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Package className="h-4 w-4" />
                      Posts ({profile._count.posts})
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Star className="h-4 w-4" />
                      Reviews ({profile._count.receivedRatings})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="posts" className="mt-4">
                    <ScrollArea className="h-64">
                      {profile.posts.length > 0 ? (
                        <div className="space-y-2 pr-4">
                          {profile.posts.map((post) => (
                            <div
                              key={post.id}
                              className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group border border-transparent hover:border-primary/20"
                            >
                              <Badge className={`${POST_TYPE_LABELS[post.type].color} border-0 group-hover:scale-105 transition-transform`}>
                                {POST_TYPE_LABELS[post.type].icon}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate group-hover:text-primary transition-colors">
                                  {post.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                →
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                          <p className="text-muted-foreground">No posts yet</p>
                          <p className="text-xs text-muted-foreground mt-1">Share something with the community!</p>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-4">
                    <ScrollArea className="h-64">
                      {profile.receivedRatings.length > 0 ? (
                        <div className="space-y-3 pr-4">
                          {profile.receivedRatings.map((rating) => (
                            <div
                              key={rating.id}
                              className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/20"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={rating.giver.image || undefined} />
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {rating.giver.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">{rating.giver.name}</span>
                                <div className="flex items-center gap-0.5 ml-auto">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 transition-all ${
                                        i < rating.score
                                          ? 'text-yellow-400 fill-yellow-400'
                                          : 'text-gray-200 dark:text-gray-700'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {rating.review && (
                                <p className="text-sm text-muted-foreground pl-11">{rating.review}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2 pl-11">
                                {formatDistanceToNow(new Date(rating.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                          <p className="text-muted-foreground">No reviews yet</p>
                          <p className="text-xs text-muted-foreground mt-1">Complete transactions to earn reviews!</p>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">User not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
