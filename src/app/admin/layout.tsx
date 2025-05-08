'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/AuthContext';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  FileText,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Layout,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Laden...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { 
      name: 'Profile',
      href: '/admin/profile',
      icon: Layout,
      subitems: [
        { name: 'Profile', href: '/admin/pages' },
        { name: 'Profile Settings', href: '/admin/content/page/create' }
      ]
    },
    { name: 'Content', href: '/admin/content', icon: FileText },
    { name: 'Content Types', href: '/admin/content-types', icon: FileText },
    { name: 'Taxonomies', href: '/admin/taxonomies', icon: Settings },
  ];

  // Function to determine if a link is active
  const isActive = (path: string) => {
    if (typeof window !== 'undefined') {
      return window.location.pathname === path;
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navbar - Desktop */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4 lg:px-6">
          <Link href="/admin/dashboard" className="flex items-center">
            <span className="font-bold text-xl text-primary">CMS Admin</span>
          </Link>
          
          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden ml-4">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
              <div className="flex flex-col gap-6 py-4">
                <Link 
                  href="/admin/dashboard" 
                  className="font-bold text-xl text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  CMS Admin
                </Link>
                <nav className="flex flex-col gap-2">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      {item.subitems ? (
                        <div className="pl-3 py-2">
                          <div className="flex items-center gap-2 text-sm font-medium mb-2">
                            <item.icon className="h-5 w-5" />
                            {item.name}
                          </div>
                          <div className="pl-5 space-y-1">
                            {item.subitems.map(subitem => (
                              <Link
                                key={subitem.href}
                                href={subitem.href}
                                className={cn(
                                  "flex items-center py-1 text-sm transition-colors",
                                  isActive(subitem.href) 
                                    ? "text-primary font-medium" 
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {subitem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                            isActive(item.href) 
                              ? "bg-primary/10 text-primary font-medium" 
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
                <Separator />
                <Button 
                  variant="ghost" 
                  className="justify-start text-muted-foreground hover:text-destructive" 
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Abmelden
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Desktop navigation */}
          <nav className="hidden lg:flex mx-6 items-center space-x-4 lg:space-x-6">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.subitems ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary flex items-center px-2 py-1 rounded-md",
                          isActive(item.href) 
                            ? "text-primary bg-primary/10" 
                            : "text-muted-foreground"
                        )}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Link>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {item.subitems.map(subitem => (
                        <DropdownMenuItem key={subitem.href}>
                          <Link href={subitem.href} className="w-full">
                            {subitem.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary flex items-center px-2 py-1 rounded-md",
                      isActive(item.href) 
                        ? "text-primary bg-primary/10" 
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
          
          <div className="ml-auto flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || ''} alt={user.username} />
                    <AvatarFallback className="text-primary-foreground bg-primary">
                      {user.username?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.full_name || user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <Link href="/admin/profile" className="w-full">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <Link href="/admin/settings" className="w-full">Einstellungen</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} CMS Admin. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
}