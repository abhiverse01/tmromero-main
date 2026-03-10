'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, useUIStore } from '@/store';
import {
  Search,
  Plus,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  MessageCircle,
  Heart,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { setCreatePostOpen, setAuthModalOpen, searchQuery, setSearchQuery, setSelectedUserId, setProfileModalOpen, setAdminPanelOpen } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Mock notifications
  const notifications = [
    { id: 1, type: 'join', message: 'Alex wants to join your book sharing post', time: '2m ago', unread: true },
    { id: 2, type: 'message', message: 'New message from Sarah about the trip', time: '1h ago', unread: true },
    { id: 3, type: 'like', message: 'Your post got 5 new interested people', time: '3h ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleLogout = () => {
    logout();
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm" aria-label="tmro-mero home">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow duration-300">
              <span className="text-white font-bold text-lg">t</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent border-2 border-background flex items-center justify-center">
              <span className="text-[8px] font-bold text-accent-foreground">m</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-foreground">tmro</span>
              <span className="text-primary">-</span>
              <span className="gradient-text">mero</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          <Link href="/" className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Home
          </Link>
          <Link href="#browse" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Browse
          </Link>
          <Link href="#how-it-works" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            How it Works
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary" aria-haspopup="true">
                Categories <ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem>📚 Books & Textbooks</DropdownMenuItem>
              <DropdownMenuItem>🔧 Tools & Equipment</DropdownMenuItem>
              <DropdownMenuItem>💻 Electronics</DropdownMenuItem>
              <DropdownMenuItem>🎓 Courses & Learning</DropdownMenuItem>
              <DropdownMenuItem>✈️ Travel & Trips</DropdownMenuItem>
              <DropdownMenuItem>💡 Projects & Ideas</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
            <Input
              ref={searchRef}
              type="search"
              placeholder="Search posts, people, items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-muted/50 border-transparent focus:border-primary/50 focus:bg-background transition-all"
              aria-label="Search posts, people, items"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Create Post Button */}
          <Button
            onClick={() => {
              if (isAuthenticated) {
                setCreatePostOpen(true);
              } else {
                setAuthModalOpen(true);
              }
            }}
            className="hidden sm:inline-flex btn-shine"
            aria-label="Create a new post"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Create Post
          </Button>

          {isAuthenticated && user ? (
            <>
              {/* Mobile Search Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label={searchOpen ? "Close search" : "Open search"}
                aria-expanded={searchOpen}
              >
                <Search className="h-5 w-5" aria-hidden="true" />
              </Button>

              {/* Notifications */}
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`} aria-haspopup="true" aria-expanded={notificationsOpen}>
                    <Bell className="h-5 w-5" aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center animate-scale-in" aria-live="polite">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto" role="list" aria-label="Notifications list">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        role="listitem"
                        className={`p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            notification.type === 'join' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                            notification.type === 'message' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
                          }`} aria-hidden="true">
                            {notification.type === 'join' ? <User className="h-4 w-4" /> :
                             notification.type === 'message' ? <MessageCircle className="h-4 w-4" /> :
                             <Heart className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">{notification.time}</p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 rounded-full bg-primary mt-2" aria-label="Unread" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full">
                      View all notifications
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 pl-2 pr-3 rounded-full hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring" aria-haspopup="true" aria-label="User menu">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.image || undefined} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-2 text-sm font-medium hidden sm:inline">{user.name.split(' ')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <div className="p-3 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image || undefined} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    {user.college && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <span aria-hidden="true">🎓</span> {user.college}
                      </div>
                    )}
                    {user.trustScore > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-xs">
                        <span className="text-yellow-500" aria-hidden="true">⭐</span>
                        <span className="font-medium">{user.trustScore.toFixed(1)}</span>
                        <span className="text-muted-foreground">trust score</span>
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer focus:bg-muted"
                    onClick={() => {
                      if (user) {
                        setSelectedUserId(user.id);
                        setProfileModalOpen(true);
                      }
                    }}
                  >
                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer focus:bg-muted">
                    <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer focus:bg-muted">
                    <Heart className="mr-2 h-4 w-4" aria-hidden="true" />
                    Saved Posts
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <>
                      <DropdownMenuItem 
                        className="cursor-pointer text-primary focus:text-primary focus:bg-primary/10"
                        onClick={() => setAdminPanelOpen(true)}
                      >
                        <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                        Admin Panel
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem className="cursor-pointer focus:bg-muted">
                    <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setAuthModalOpen(true)}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="hidden sm:inline-flex"
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="md:hidden border-t p-3 bg-background">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              ref={searchRef}
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
              aria-label="Search"
            />
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background animate-slide-up" role="navigation" aria-label="Mobile navigation">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <Link href="/" className="block px-4 py-2 rounded-lg hover:bg-muted font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="#browse" className="block px-4 py-2 rounded-lg hover:bg-muted text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setMobileMenuOpen(false)}>
              Browse Posts
            </Link>
            <Link href="#how-it-works" className="block px-4 py-2 rounded-lg hover:bg-muted text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setMobileMenuOpen(false)}>
              How it Works
            </Link>
            <div className="pt-2 border-t space-y-2">
              <Button
                className="w-full"
                onClick={() => {
                  if (isAuthenticated) {
                    setCreatePostOpen(true);
                  } else {
                    setAuthModalOpen(true);
                  }
                  setMobileMenuOpen(false);
                }}
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Create Post
              </Button>
              {!isAuthenticated && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
