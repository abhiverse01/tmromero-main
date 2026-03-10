'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUIStore, useAuthStore } from '@/store';
import { POST_TYPE_LABELS, POST_STATUS_LABELS, type PostType, type PostStatus } from '@/types';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  MoreVertical,
  CheckCircle,
  Trash2,
  Search,
  RefreshCw,
  TrendingUp,
  Clock,
  Star,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  Shield,
  ShieldAlert,
  Crown,
  UserCheck,
  UserX,
  MessageSquare,
  Activity,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AdminStats {
  overview: {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
    totalJoinRequests: number;
    totalRatings: number;
    pendingRequests: number;
    activePosts: number;
    avgTrustScore: number;
  };
  postsByStatus: Record<string, number>;
  postsByType: Record<string, number>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
    college: string | null;
  }>;
  recentPosts: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
    author: { name: string };
    category: { name: string; icon: string };
  }>;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
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
}

interface AdminPost {
  id: string;
  title: string;
  type: string;
  status: string;
  isUrgent: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    trustScore: number;
  };
  category: {
    id: string;
    name: string;
    icon: string;
  };
  _count: {
    comments: number;
    joinRequests: number;
  };
}

export function AdminPanel() {
  const { isAdminPanelOpen, setAdminPanelOpen } = useUIStore();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Pagination
  const [userPage, setUserPage] = useState(1);
  const [postPage, setPostPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [postTotal, setPostTotal] = useState(0);
  
  // Search
  const [userSearch, setUserSearch] = useState('');
  const [postSearch, setPostSearch] = useState('');
  const [postStatusFilter, setPostStatusFilter] = useState<string>('');

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'user' | 'post'; id: string; name: string } | null>(null);

  // Check if user is admin
  const isAdmin = user?.isAdmin === true;

  // Helper function to add auth headers
  const getAuthHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-user-id': user?.id || '',
  }), [user?.id]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await fetch('/api/admin/stats', {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
      toast.error('Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  }, [getAuthHeaders]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', userPage.toString());
      params.append('limit', '10');
      if (userSearch) params.append('search', userSearch);

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
      setUserTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [userPage, userSearch, getAuthHeaders]);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', postPage.toString());
      params.append('limit', '10');
      if (postSearch) params.append('search', postSearch);
      if (postStatusFilter) params.append('status', postStatusFilter);

      const response = await fetch(`/api/admin/posts?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
      setPostTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to load posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [postPage, postSearch, postStatusFilter, getAuthHeaders]);

  useEffect(() => {
    if (isAdminPanelOpen && isAdmin) {
      fetchStats();
      fetchUsers();
      fetchPosts();
    }
  }, [isAdminPanelOpen, isAdmin, fetchStats, fetchUsers, fetchPosts]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAdminPanelOpen && isAdmin) {
        fetchUsers();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAdminPanelOpen && isAdmin) {
        fetchPosts();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [postSearch, postStatusFilter]);

  // User actions
  const handleVerifyUser = async (userId: string, verify: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: userId, isVerified: verify }),
      });
      
      if (!response.ok) throw new Error('Failed to update');
      
      toast.success(`User ${verify ? 'verified' : 'unverified'} successfully`);
      fetchUsers();
      fetchStats();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: userId, isAdmin: makeAdmin }),
      });
      
      if (!response.ok) throw new Error('Failed to update');
      
      toast.success(`Admin status ${makeAdmin ? 'granted' : 'revoked'}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update admin status');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'user') return;
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: deleteConfirm.id }),
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      toast.success('User deleted successfully');
      fetchUsers();
      fetchStats();
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Post actions
  const handleUpdatePostStatus = async (postId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/posts', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: postId, status }),
      });
      
      if (!response.ok) throw new Error('Failed to update');
      
      toast.success('Post status updated');
      fetchPosts();
      fetchStats();
    } catch {
      toast.error('Failed to update post');
    }
  };

  const handleDeletePost = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'post') return;
    
    try {
      const response = await fetch('/api/admin/posts', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: deleteConfirm.id }),
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      toast.success('Post deleted successfully');
      fetchPosts();
      fetchStats();
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Default stats object to prevent undefined errors
  const defaultStats: AdminStats = {
    overview: {
      totalUsers: 0,
      totalPosts: 0,
      totalComments: 0,
      totalJoinRequests: 0,
      totalRatings: 0,
      pendingRequests: 0,
      activePosts: 0,
      avgTrustScore: 0,
    },
    postsByStatus: {},
    postsByType: {},
    recentUsers: [],
    recentPosts: [],
  };

  const currentStats = stats || defaultStats;

  const statCards = [
    { label: 'Total Users', value: currentStats.overview.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12%' },
    { label: 'Total Posts', value: currentStats.overview.totalPosts, icon: Package, color: 'text-green-500', bg: 'bg-green-500/10', trend: '+8%' },
    { label: 'Active Posts', value: currentStats.overview.activePosts, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '+15%' },
    { label: 'Pending', value: currentStats.overview.pendingRequests, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: '-3%' },
    { label: 'Comments', value: currentStats.overview.totalComments, icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: '+20%' },
    { label: 'Ratings', value: currentStats.overview.totalRatings, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10', trend: '+5%' },
    { label: 'Avg Trust', value: currentStats.overview.avgTrustScore.toFixed(1), icon: Activity, color: 'text-pink-500', bg: 'bg-pink-500/10', trend: '+0.2' },
    { label: 'Requests', value: currentStats.overview.totalJoinRequests, icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-500/10', trend: '+10%' },
  ];

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <Dialog open={isAdminPanelOpen} onOpenChange={setAdminPanelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              Access Denied
            </DialogTitle>
            <DialogDescription>
              You don&apos;t have permission to access the admin panel. Only administrators can view this area.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-destructive" aria-hidden="true" />
              </div>
              <p className="text-muted-foreground text-sm">
                If you believe this is an error, please contact the platform administrators.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isAdminPanelOpen} onOpenChange={setAdminPanelOpen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-6 pb-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 shrink-0">
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Crown className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              Admin Dashboard
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
              Manage users, posts, and platform settings
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="px-6 pt-4 border-b bg-muted/20 shrink-0">
              <TabsList className="bg-background/50">
                <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="posts" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Package className="h-4 w-4" aria-hidden="true" />
                  Posts
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 p-6">
              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="mt-0 space-y-6" forceMount hidden={activeTab !== 'dashboard'}>
                {statsLoading ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                      ))}
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Skeleton className="h-64 rounded-xl" />
                      <Skeleton className="h-64 rounded-xl" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {statCards.map((stat, i) => (
                        <div key={i} className="bg-card border rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                              <stat.icon className={`h-4 w-4 ${stat.color}`} aria-hidden="true" />
                            </div>
                            <span className="text-xs text-green-500 font-medium">{stat.trend}</span>
                          </div>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Charts Row */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-card border rounded-xl p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" aria-hidden="true" />
                          Posts by Type
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(currentStats.postsByType).length > 0 ? (
                            Object.entries(currentStats.postsByType).map(([type, count]) => (
                              <div key={type} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                                <div className="flex items-center gap-2">
                                  <Badge className={POST_TYPE_LABELS[type as PostType]?.color || 'bg-gray-100'}>
                                    <span aria-hidden="true">{POST_TYPE_LABELS[type as PostType]?.icon}</span> {POST_TYPE_LABELS[type as PostType]?.label || type}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary rounded-full transition-all duration-500"
                                      style={{ width: `${Math.min((count / Math.max(currentStats.overview.totalPosts, 1)) * 100, 100)}%` }}
                                    />
                                  </div>
                                  <span className="font-medium w-8 text-right">{count}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-muted-foreground py-4">No posts yet</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-card border rounded-xl p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
                          Posts by Status
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(currentStats.postsByStatus).length > 0 ? (
                            Object.entries(currentStats.postsByStatus).map(([status, count]) => (
                              <div key={status} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <Badge className={POST_STATUS_LABELS[status as PostStatus]?.color || 'bg-gray-100'}>
                                  {POST_STATUS_LABELS[status as PostStatus]?.label || status}
                                </Badge>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-muted-foreground py-4">No posts yet</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-card border rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                            Recent Users
                          </h3>
                          <Badge variant="secondary" className="text-xs">{currentStats.overview.totalUsers} total</Badge>
                        </div>
                        <div className="space-y-3">
                          {currentStats.recentUsers.length > 0 ? (
                            currentStats.recentUsers.map((u) => (
                              <div key={u.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                    {u.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{u.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-muted-foreground py-4">No users yet</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-card border rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" aria-hidden="true" />
                            Recent Posts
                          </h3>
                          <Badge variant="secondary" className="text-xs">{currentStats.overview.totalPosts} total</Badge>
                        </div>
                        <div className="space-y-3">
                          {currentStats.recentPosts.length > 0 ? (
                            currentStats.recentPosts.map((p) => (
                              <div key={p.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                <Badge className={POST_TYPE_LABELS[p.type as PostType]?.color || ''}>
                                  <span aria-hidden="true">{POST_TYPE_LABELS[p.type as PostType]?.icon}</span>
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{p.title}</p>
                                  <p className="text-xs text-muted-foreground">by {p.author.name}</p>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-muted-foreground py-4">No posts yet</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-4 border">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
                        Quick Actions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('users')}>
                          <UserCheck className="h-4 w-4 mr-2" aria-hidden="true" />
                          Verify Users
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('posts')}>
                          <Package className="h-4 w-4 mr-2" aria-hidden="true" />
                          Manage Posts
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { fetchStats(); fetchUsers(); fetchPosts(); }}>
                          <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                          Refresh Data
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="mt-0 space-y-4" forceMount hidden={activeTab !== 'users'}>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                      type="search"
                      placeholder="Search users by name, email, or college..."
                      className="pl-9"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      aria-label="Search users"
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => { fetchUsers(); fetchStats(); }} aria-label="Refresh users">
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>

                <div className="border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead scope="col">User</TableHead>
                          <TableHead scope="col">College</TableHead>
                          <TableHead scope="col">Trust</TableHead>
                          <TableHead scope="col">Activity</TableHead>
                          <TableHead scope="col">Status</TableHead>
                          <TableHead scope="col">Joined</TableHead>
                          <TableHead scope="col" className="w-12"><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody aria-busy={isLoading}>
                        {isLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                            </TableRow>
                          ))
                        ) : users.length > 0 ? (
                          users.map((u) => (
                            <TableRow key={u.id} className="hover:bg-muted/30">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={u.image || undefined} alt={u.name} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                      {u.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm flex items-center gap-1">
                                      {u.name}
                                      {u.isAdmin && <Crown className="h-3 w-3 text-yellow-500" aria-label="Admin" />}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{u.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{u.college || '-'}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                                  <span className="font-medium">{u.trustScore.toFixed(1)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{u._count.posts} posts</span>
                                  <span>•</span>
                                  <span>{u._count.comments} comments</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {u.isVerified ? (
                                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                    <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                                    Verified
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${u.name}`}>
                                      <MoreVertical className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem onClick={() => handleVerifyUser(u.id, !u.isVerified)}>
                                      {u.isVerified ? (
                                        <>
                                          <UserX className="mr-2 h-4 w-4" aria-hidden="true" />
                                          Revoke Verification
                                        </>
                                      ) : (
                                        <>
                                          <UserCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                                          Verify User
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleAdmin(u.id, !u.isAdmin)}>
                                      {u.isAdmin ? (
                                        <>
                                          <ShieldAlert className="mr-2 h-4 w-4" aria-hidden="true" />
                                          Remove Admin
                                        </>
                                      ) : (
                                        <>
                                          <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                                          Make Admin
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => setDeleteConfirm({ type: 'user', id: u.id, name: u.name })}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                                      Delete User
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              {userSearch ? `No users found matching "${userSearch}"` : 'No users found'}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Pagination */}
                {userTotal > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground" aria-live="polite">
                      Showing {users.length} of {userTotal} users
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={userPage === 1}
                        onClick={() => setUserPage(p => p - 1)}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        Prev
                      </Button>
                      <span className="flex items-center px-3 text-sm text-muted-foreground">
                        Page {userPage}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={userPage * 10 >= userTotal}
                        onClick={() => setUserPage(p => p + 1)}
                        aria-label="Next page"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Posts Tab */}
              <TabsContent value="posts" className="mt-0 space-y-4" forceMount hidden={activeTab !== 'posts'}>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                      type="search"
                      placeholder="Search posts by title or description..."
                      className="pl-9"
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                      aria-label="Search posts"
                    />
                  </div>
                  <div className="flex gap-2" role="group" aria-label="Filter by status">
                    <Button
                      variant={postStatusFilter === '' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPostStatusFilter('')}
                    >
                      All
                    </Button>
                    <Button
                      variant={postStatusFilter === 'OPEN' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPostStatusFilter('OPEN')}
                    >
                      Open
                    </Button>
                    <Button
                      variant={postStatusFilter === 'CLOSED' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPostStatusFilter('CLOSED')}
                    >
                      Closed
                    </Button>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => { fetchPosts(); fetchStats(); }} aria-label="Refresh posts">
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>

                <div className="border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead scope="col">Post</TableHead>
                          <TableHead scope="col">Author</TableHead>
                          <TableHead scope="col">Type</TableHead>
                          <TableHead scope="col">Status</TableHead>
                          <TableHead scope="col">Engagement</TableHead>
                          <TableHead scope="col">Created</TableHead>
                          <TableHead scope="col" className="w-12"><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody aria-busy={isLoading}>
                        {isLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell><Skeleton className="h-8 w-48" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                            </TableRow>
                          ))
                        ) : posts.length > 0 ? (
                          posts.map((p) => (
                            <TableRow key={p.id} className="hover:bg-muted/30">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {p.isUrgent && (
                                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                                      <AlertTriangle className="h-3 w-3 text-orange-500" aria-label="Urgent" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-sm line-clamp-1">{p.title}</p>
                                    <p className="text-xs text-muted-foreground"><span aria-hidden="true">{p.category.icon}</span> {p.category.name}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm">{p.author.name}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500" aria-hidden="true" />
                                    {p.author.trustScore.toFixed(1)}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={POST_TYPE_LABELS[p.type as PostType]?.color || ''}>
                                  {POST_TYPE_LABELS[p.type as PostType]?.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={POST_STATUS_LABELS[p.status as PostStatus]?.color || ''}>
                                  {POST_STATUS_LABELS[p.status as PostStatus]?.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" aria-hidden="true" />
                                    {p._count.comments}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" aria-hidden="true" />
                                    {p._count.joinRequests}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for post: ${p.title}`}>
                                      <MoreVertical className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleUpdatePostStatus(p.id, 'OPEN')}>
                                      <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                                      Set Open
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdatePostStatus(p.id, 'IN_PROGRESS')}>
                                      <TrendingUp className="mr-2 h-4 w-4" aria-hidden="true" />
                                      Set In Progress
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdatePostStatus(p.id, 'CLOSED')}>
                                      <CheckCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                                      Set Closed
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => setDeleteConfirm({ type: 'post', id: p.id, name: p.title })}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                                      Delete Post
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              {postSearch ? `No posts found matching "${postSearch}"` : 'No posts found'}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Pagination */}
                {postTotal > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground" aria-live="polite">
                      Showing {posts.length} of {postTotal} posts
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={postPage === 1}
                        onClick={() => setPostPage(p => p - 1)}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        Prev
                      </Button>
                      <span className="flex items-center px-3 text-sm text-muted-foreground">
                        Page {postPage}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={postPage * 10 >= postTotal}
                        onClick={() => setPostPage(p => p + 1)}
                        aria-label="Next page"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteConfirm?.type === 'user' ? 'user' : 'post'} <strong>{deleteConfirm?.name}</strong>. 
              This action cannot be undone.
              {deleteConfirm?.type === 'user' && ' All their posts, comments, and ratings will also be deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteConfirm?.type === 'user' ? handleDeleteUser : handleDeletePost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
