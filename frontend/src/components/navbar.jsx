import { useState } from 'react';
import { 
  NavigationMenu, 
  NavigationMenuList, 
  NavigationMenuItem, 
  NavigationMenuLink,
  navigationMenuTriggerStyle 
} from './ui/navigation-menu';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { useNavigation } from '../App';
import { LogIn, User, ChevronDown, Crown } from 'lucide-react';
import '../styles/brand-colors.css';

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export default function Navbar() {
  const { currentPage, navigate } = useNavigation();

  const token = localStorage.getItem('token');
  const role = token ? parseJwt(token)?.role : null;
  const isLandlord = role === 'landlord';
  const isAuthenticated = Boolean(token);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleNavigation = (e, page) => {
    e.preventDefault();
    navigate(page);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-6">
      <div className="flex items-center justify-center gap-4 w-full">
        <div className="flex items-center gap-4 max-w-7xl w-full justify-between">
        {/* Logo */}
        <img 
          src="/src/assets/logo.png" 
          alt="UniAcco Logo" 
          className="h-12 w-12 rounded-full cursor-pointer hover:scale-105 transition-transform duration-200 shadow-xl border-2 border-border/20 dark:border-brand-primary/30"
          onClick={() => navigate('home')}
        />
        
        <NavigationMenu className="text-text-primary flex-1">
          <NavigationMenuList className="bg-bg-surface backdrop-blur-sm rounded-full shadow-xl border border-border px-2">
            <NavigationMenuItem>
              <NavigationMenuLink 
                href="/" 
                onClick={(e) => handleNavigation(e, 'home')}
                className={cn(
                  navigationMenuTriggerStyle(), 
                  "bg-transparent hover:bg-bg-surface-alt hover:text-text-primary cursor-pointer text-text-primary transition-all duration-200 font-medium",
                  currentPage === 'home' && "border-b-2 border-brand-primary text-brand-primary font-semibold"
                )}
              >
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink 
                href="/listings" 
                onClick={(e) => handleNavigation(e, 'listings')}
                className={cn(
                  navigationMenuTriggerStyle(), 
                  "bg-transparent hover:bg-bg-surface-alt hover:text-text-primary cursor-pointer text-text-primary transition-all duration-200 font-medium",
                  currentPage === 'listings' && "border-b-2 border-brand-primary text-brand-primary font-semibold"
                )}
              >
                Browse Listings
              </NavigationMenuLink>
            </NavigationMenuItem>

            {isLandlord && (
              <>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/my-listings"
                    onClick={(e) => handleNavigation(e, 'my-listings')}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent hover:bg-bg-surface-alt hover:text-text-primary cursor-pointer text-text-primary transition-all duration-200 font-medium",
                      currentPage === 'my-listings' && "border-b-2 border-brand-primary text-brand-primary font-semibold"
                    )}
                  >
                    My Listings
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/list-your-property"
                    onClick={(e) => handleNavigation(e, 'list-your-property')}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent hover:bg-bg-surface-alt hover:text-text-primary cursor-pointer text-text-primary transition-all duration-200 font-medium",
                      currentPage === 'list-your-property' && "border-b-2 border-brand-primary text-brand-primary font-semibold"
                    )}
                  >
                    List Your Property
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </>
            )}

            {/* Profile Dropdown moved to top right */}


            <NavigationMenuItem>
              <NavigationMenuLink 
                href="/about" 
                onClick={(e) => handleNavigation(e, 'about')}
                className={cn(
                  navigationMenuTriggerStyle(), 
                  "bg-transparent hover:bg-bg-surface-alt hover:text-text-primary cursor-pointer text-text-primary transition-all duration-200 font-medium",
                  currentPage === 'about' && "border-b-2 border-brand-primary text-brand-primary font-semibold"
                )}
              >
                About Us
              </NavigationMenuLink>
            </NavigationMenuItem>

          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          {/* Profile Dropdown - Only show if authenticated */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className={cn(
                  "px-4 py-2 rounded-full bg-transparent hover:bg-bg-surface-alt text-text-primary font-medium flex items-center gap-2 transition-all duration-200",
                  currentPage === 'profile' && "border-b-2 border-brand-primary text-brand-primary font-semibold"
                )}
              >
                <User className="w-4 h-4" />
                My Profile
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-bg-surface rounded-lg shadow-lg border border-border z-50">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('profile');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-text-primary hover:bg-bg-surface-alt transition-colors flex items-center"
                    >
                      <User className="w-4 h-4 mr-3" />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('premium-features');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-text-primary hover:bg-bg-surface-alt transition-colors flex items-center"
                    >
                      <Crown className="w-4 h-4 mr-3 text-yellow-500" />
                      Premium Features
                    </button>
                    <button
                      onClick={() => {
                        navigate('bookings');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-text-primary hover:bg-bg-surface-alt transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h2a2 2 0 00-2 2z" />
                      </svg>
                      My Bookings
                    </button>
                    <button
                      onClick={() => {
                        navigate('favorites');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-text-primary hover:bg-bg-surface-alt transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.5v12a5.5 5.5 0 00-5.5 5.5v-9a5.5 5.5 0 00-5.5-5.5H12v9z" />
                      </svg>
                      My Favorites
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        setShowProfileDropdown(false);
                        navigate('home');
                      }}
                      className="w-full text-left px-4 py-2 text-error hover:bg-error/10 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4 4m0 0L12 20m0 0l-1.5-1.5M3 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sign In Button - Only show if not authenticated */}
          {!isAuthenticated && (
            <a
              href="/auth"
              onClick={(e) => {
                e.preventDefault();
                navigate('auth');
              }}
              className={cn(
                "px-4 py-2 rounded-full bg-transparent hover:bg-bg-surface-alt text-text-primary font-medium flex items-center gap-2 transition-all duration-200",
                currentPage === 'auth' && "border-b-2 border-brand-primary text-brand-primary font-semibold"
              )}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </a>
          )}

          {/* Theme Toggle */}
          <div className="bg-bg-surface hover:bg-bg-surface-alt backdrop-blur-sm rounded-full shadow-xl border border-border p-1 transition-all duration-200">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
    </nav>
  );
}
