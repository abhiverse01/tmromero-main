import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Post, Category } from '@/types';

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'tmro-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

// Posts Store
interface PostsState {
  posts: Post[];
  featuredPosts: Post[];
  userPosts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
  setPosts: (posts: Post[]) => void;
  setFeaturedPosts: (posts: Post[]) => void;
  setUserPosts: (posts: Post[]) => void;
  setCurrentPost: (post: Post | null) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, post: Partial<Post>) => void;
  removePost: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],
  featuredPosts: [],
  userPosts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  setPosts: (posts) => set({ posts }),
  setFeaturedPosts: (featuredPosts) => set({ featuredPosts }),
  setUserPosts: (userPosts) => set({ userPosts }),
  setCurrentPost: (currentPost) => set({ currentPost }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (id, updatedPost) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id ? { ...post, ...updatedPost } : post
      ),
    })),
  removePost: (id) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// Categories Store - FIXED: selectedCategory should be string (ID) not Category object
interface CategoriesState {
  categories: Category[];
  selectedCategoryId: string | null;  // Changed from selectedCategory: Category | null
  setCategories: (categories: Category[]) => void;
  setSelectedCategoryId: (categoryId: string | null) => void;  // Changed setter
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  selectedCategoryId: null,  // Changed
  setCategories: (categories) => set({ categories }),
  setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),  // Changed
}));

// UI Store
interface UIState {
  isCreatePostOpen: boolean;
  isAuthModalOpen: boolean;
  isPostDetailOpen: boolean;
  isJoinModalOpen: boolean;
  isRatingModalOpen: boolean;
  isProfileModalOpen: boolean;
  isAdminPanelOpen: boolean;
  authModalTab: 'login' | 'signup';
  searchQuery: string;
  selectedPostType: string | null;
  selectedPostId: string | null;
  selectedUserId: string | null;
  setCreatePostOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setPostDetailOpen: (open: boolean) => void;
  setJoinModalOpen: (open: boolean) => void;
  setRatingModalOpen: (open: boolean) => void;
  setProfileModalOpen: (open: boolean) => void;
  setAdminPanelOpen: (open: boolean) => void;
  setAuthModalTab: (tab: 'login' | 'signup') => void;
  setSearchQuery: (query: string) => void;
  setSelectedPostType: (type: string | null) => void;
  setSelectedPostId: (id: string | null) => void;
  setSelectedUserId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreatePostOpen: false,
  isAuthModalOpen: false,
  isPostDetailOpen: false,
  isJoinModalOpen: false,
  isRatingModalOpen: false,
  isProfileModalOpen: false,
  isAdminPanelOpen: false,
  authModalTab: 'login',
  searchQuery: '',
  selectedPostType: null,
  selectedPostId: null,
  selectedUserId: null,
  setCreatePostOpen: (isCreatePostOpen) => set({ isCreatePostOpen }),
  setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
  setPostDetailOpen: (isPostDetailOpen) => set({ isPostDetailOpen }),
  setJoinModalOpen: (isJoinModalOpen) => set({ isJoinModalOpen }),
  setRatingModalOpen: (isRatingModalOpen) => set({ isRatingModalOpen }),
  setProfileModalOpen: (isProfileModalOpen) => set({ isProfileModalOpen }),
  setAdminPanelOpen: (isAdminPanelOpen) => set({ isAdminPanelOpen }),
  setAuthModalTab: (authModalTab) => set({ authModalTab }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedPostType: (selectedPostType) => set({ selectedPostType }),
  setSelectedPostId: (selectedPostId) => set({ selectedPostId }),
  setSelectedUserId: (selectedUserId) => set({ selectedUserId }),
}));
