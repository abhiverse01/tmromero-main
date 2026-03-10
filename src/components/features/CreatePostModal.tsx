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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUIStore, useCategoriesStore, useAuthStore, usePostsStore } from '@/store';
import { POST_TYPE_LABELS, type PostType } from '@/types';
import { toast } from 'sonner';
import {
  Loader2,
  Sparkles,
  Package,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Image,
  Zap,
  BookOpen,
  Wrench,
  Laptop,
  GraduationCap,
  Plane,
  Lightbulb,
  Book,
} from 'lucide-react';

const typeIcons: Record<PostType, React.ReactNode> = {
  CO_BUY: <ShoppingCart className="h-4 w-4" />,
  SHARE: <Users className="h-4 w-4" />,
  RENT: <DollarSign className="h-4 w-4" />,
  TRIP: <Plane className="h-4 w-4" />,
  PROJECT: <Lightbulb className="h-4 w-4" />,
  STUDY: <Book className="h-4 w-4" />,
};

// Import missing icon
function ShoppingCart({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  );
}

export function CreatePostModal() {
  const { isCreatePostOpen, setCreatePostOpen } = useUIStore();
  const { categories } = useCategoriesStore();
  const { user, isAuthenticated, setAuthModalOpen } = useAuthStore();
  const { addPost } = usePostsStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'SHARE' as PostType,
    itemName: '',
    itemPrice: '',
    itemCondition: '',
    maxParticipants: '2',
    location: '',
    terms: '',
    startDate: '',
    endDate: '',
    categoryId: '',
    isUrgent: false,
  });

  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories, formData.categoryId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isCreatePostOpen) {
      setFormData({
        title: '',
        description: '',
        type: 'SHARE',
        itemName: '',
        itemPrice: '',
        itemCondition: '',
        maxParticipants: '2',
        location: '',
        terms: '',
        startDate: '',
        endDate: '',
        categoryId: categories[0]?.id || '',
        isUrgent: false,
      });
      setActiveTab('details');
    }
  }, [isCreatePostOpen, categories]);

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      setAuthModalOpen(true);
      toast.error('Please sign in to create a post');
      return;
    }

    if (!formData.title || !formData.description || !formData.itemName || !formData.categoryId) {
      toast.error('Please fill in all required fields');
      setActiveTab('details');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          authorId: user.id,
          itemPrice: formData.itemPrice ? parseFloat(formData.itemPrice) : undefined,
          maxParticipants: parseInt(formData.maxParticipants) || 2,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      const post = await response.json();
      addPost(post);
      toast.success('Post created successfully! 🎉');
      setCreatePostOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isCreatePostOpen} onOpenChange={setCreatePostOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create a New Post
          </DialogTitle>
          <DialogDescription>
            Share your idea and find people to collaborate with
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="details" className="space-y-5 mt-0">
              {/* Post Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">What do you want to do?</Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(Object.keys(POST_TYPE_LABELS) as PostType[]).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={formData.type === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, type }))}
                      className="flex flex-col py-3 h-auto"
                    >
                      <span className="text-lg">{POST_TYPE_LABELS[type].icon}</span>
                      <span className="text-xs mt-1">{POST_TYPE_LABELS[type].label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Looking for people to share a Data Science book"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="text-base"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you're looking for, what you're offering, or what you want to collaborate on..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Item Name & Category */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName" className="text-sm font-medium">
                    Item Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="itemName"
                    placeholder="e.g., Data Science Handbook"
                    value={formData.itemName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, itemName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price & Condition */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">
                    Price (optional)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      className="pl-9"
                      value={formData.itemPrice}
                      onChange={(e) => setFormData((prev) => ({ ...prev, itemPrice: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition" className="text-sm font-medium">Condition</Label>
                  <Select
                    value={formData.itemCondition}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, itemCondition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like_new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-5 mt-0">
              {/* Participants & Location */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="participants" className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Max Participants
                  </Label>
                  <Input
                    id="participants"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxParticipants: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    How many people can join?
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Kathmandu, Nepal"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-2">
                <Label htmlFor="terms" className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Terms & Conditions
                </Label>
                <Textarea
                  id="terms"
                  placeholder="Any specific terms, rules, or agreements participants should know about..."
                  rows={3}
                  value={formData.terms}
                  onChange={(e) => setFormData((prev) => ({ ...prev, terms: e.target.value }))}
                />
              </div>

              {/* Urgent Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.isUrgent ? 'bg-destructive/10' : 'bg-muted'}`}>
                    <Zap className={`h-5 w-5 ${formData.isUrgent ? 'text-destructive' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <Label htmlFor="urgent" className="font-medium cursor-pointer">
                      Mark as Urgent
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Your post will be highlighted and shown first
                    </p>
                  </div>
                </div>
                <Switch
                  id="urgent"
                  checked={formData.isUrgent}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isUrgent: checked }))}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="p-6 pt-0 flex gap-3 border-t">
          <Button variant="outline" onClick={() => setCreatePostOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 btn-shine">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Post
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
