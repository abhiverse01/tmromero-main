'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/features/Header';
import { Footer } from '@/components/features/Footer';
import { PostCard } from '@/components/features/PostCard';
import { CategoryCard } from '@/components/features/CategoryCard';
import { CreatePostModal } from '@/components/features/CreatePostModal';
import { AuthModal } from '@/components/features/AuthModal';
import { PostDetailModal } from '@/components/features/PostDetailModal';
import { JoinRequestModal } from '@/components/features/JoinRequestModal';
import { RatingModal } from '@/components/features/RatingModal';
import { ProfileModal } from '@/components/features/ProfileModal';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { usePostsStore, useCategoriesStore, useUIStore, useAuthStore } from '@/store';
import { POST_TYPE_LABELS, type PostType } from '@/types';
import {
  ArrowRight,
  Sparkles,
  Users,
  BookOpen,
  Shield,
  Globe,
  Zap,
  Search,
  TrendingUp,
  Clock,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { posts, setPosts, isLoading, setLoading } = usePostsStore();
  const { categories, setCategories, selectedCategoryId, setSelectedCategoryId } = useCategoriesStore();
  const { 
    selectedPostType, 
    setSelectedPostType, 
    setAuthModalOpen, 
    setCreatePostOpen,
    setSelectedPostId,
    setPostDetailOpen,
    setJoinModalOpen,
    searchQuery,
    setSearchQuery,
  } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState({ totalPosts: 0, totalUsers: 0, categoryCounts: {} as Record<string, number> });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, [setCategories]);

  // Fetch posts on mount and when filters change
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategoryId) params.append('category', selectedCategoryId);
        if (selectedPostType) params.append('type', selectedPostType);
        if (searchQuery) params.append('search', searchQuery);
        params.append('limit', '20');

        const response = await fetch(`/api/posts?${params.toString()}`);
        const data = await response.json();
        setPosts(data.posts || []);
        setStats(prev => ({ ...prev, totalPosts: data.total || 0 }));
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [selectedCategoryId, selectedPostType, searchQuery, setPosts, setLoading]);

  // Handle post card click
  const handleViewPost = useCallback((postId: string) => {
    setSelectedPostId(postId);
    setPostDetailOpen(true);
  }, [setSelectedPostId, setPostDetailOpen]);

  // Handle join click
  const handleJoinPost = useCallback((postId: string) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    setSelectedPostId(postId);
    setJoinModalOpen(true);
  }, [isAuthenticated, setAuthModalOpen, setSelectedPostId, setJoinModalOpen]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden gradient-mesh">
          <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="secondary" className="mb-4 px-4 py-1.5">
                  <Sparkles className="h-3 w-3 mr-1.5" />
                  Open Source & Community Driven
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Share, Co-buy &{' '}
                <span className="gradient-text">Collaborate</span>{' '}
                Together
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Connect with people who share your interests. Buy books together, share resources,
                plan trips, and build a more collaborative community.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button size="lg" className="btn-shine" onClick={() => isAuthenticated ? setCreatePostOpen(true) : setAuthModalOpen(true)}>
                  Start Sharing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}>
                  Browse Posts
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-float" style={{ animationDelay: '1s' }} />
        </section>

        {/* Stats Bar */}
        <section className="border-y bg-card/50 backdrop-blur-sm py-4">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">{stats.totalPosts}</span>
                <span className="text-xs text-muted-foreground">Active Posts</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">{categories.length}</span>
                <span className="text-xs text-muted-foreground">Categories</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">500+</span>
                <span className="text-xs text-muted-foreground">Users</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">150+</span>
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Strip */}
        <section className="border-b bg-muted/30 py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Co-buy Together</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Share Resources</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Trust System</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">College Networks</span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 border-b" id="browse">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Browse by Category</h2>
              <Badge variant="outline" className="text-sm">
                {stats.totalPosts} posts
              </Badge>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <CategoryCard
                category={{ id: 'all', name: 'All', icon: '📦', description: null }}
                onClick={() => setSelectedCategoryId(null)}
                isSelected={!selectedCategoryId}
              />
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isSelected={selectedCategoryId === category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  postCount={stats.categoryCounts[category.id] || 0}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Posts Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedCategoryId
                    ? categories.find((c) => c.id === selectedCategoryId)?.name || 'Posts'
                    : 'Recent Posts'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Find collaborations that match your interests
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-48 lg:w-64"
                  />
                </div>
                
                {/* Type Filters */}
                <div className="flex gap-1.5 flex-wrap">
                  <Button
                    variant={selectedPostType === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPostType(null)}
                    className="text-xs"
                  >
                    All
                  </Button>
                  {(Object.keys(POST_TYPE_LABELS) as PostType[]).map((type) => (
                    <Button
                      key={type}
                      variant={selectedPostType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPostType(type)}
                      className="text-xs hidden sm:inline-flex"
                    >
                      {POST_TYPE_LABELS[type].icon} {POST_TYPE_LABELS[type].label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3 rounded-xl border overflow-hidden">
                    <Skeleton className="h-44 w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <motion.div 
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-animation"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {posts.map((post) => (
                    <motion.div key={post.id} variants={itemVariants}>
                      <PostCard 
                        post={post}
                        onView={() => handleViewPost(post.id)}
                        onJoin={() => handleJoinPost(post.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-4xl">📭</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? `No posts match "${searchQuery}". Try a different search term.`
                    : 'Be the first to share something with your community!'}
                </p>
                <Button onClick={() => isAuthenticated ? setCreatePostOpen(true) : setAuthModalOpen(true)}>
                  Create a Post
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30" id="how-it-works">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-3">Simple Process</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">How It Works</h2>
              <p className="text-muted-foreground mt-2">Get started in four easy steps</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '📝', title: 'Post Your Need', description: 'Share what you want to buy, share, or collaborate on with your community.' },
                { icon: '🤝', title: 'Find Partners', description: 'Connect with people who have similar interests and want to join you.' },
                { icon: '✅', title: 'Agree & Execute', description: 'Set terms, make agreements, and complete the transaction together.' },
                { icon: '⭐', title: 'Rate & Review', description: 'Build trust in the community by rating your experience.' },
              ].map((step, index) => (
                <div key={index} className="bg-card p-6 rounded-2xl border text-center card-hover">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 border">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <Badge variant="secondary">Trending</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">Popular This Week</h3>
                <p className="text-muted-foreground mb-4">
                  See what others in your community are sharing and collaborating on right now.
                </p>
                <Button variant="outline" onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}>
                  View Trending Posts
                </Button>
              </div>
              
              <div className="bg-card rounded-2xl p-6 border space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { text: 'New post in Books', time: '2m ago' },
                    { text: 'Someone joined a trip', time: '15m ago' },
                    { text: 'New user signed up', time: '1h ago' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{activity.text}</span>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-3xl p-8 md:p-16 text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to Start Collaborating?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Join thousands of students and young professionals who are already sharing resources,
                  saving money, and building stronger communities.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="btn-shine" onClick={() => setAuthModalOpen(true)}>
                    Join tmro-mero
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                      View on GitHub
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      {/* All Modals */}
      <CreatePostModal />
      <AuthModal />
      <PostDetailModal />
      <JoinRequestModal />
      <RatingModal />
      <ProfileModal />
      <AdminPanel />
    </div>
  );
}
