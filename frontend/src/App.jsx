import { useState, createContext, useContext, useEffect, useCallback } from 'react';
import Navbar from './components/navbar.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Listings from './pages/Listings.jsx';
import Auth from './pages/Auth.jsx';
import ListPropertyPage from './pages/ListPropertyPage.jsx';
import PaymentReturn from './pages/PaymentReturn.jsx';
import PremiumFeatures from './components/PremiumFeatures.jsx';
import PropertyDetails from './pages/PropertyDetails.jsx';
import Account from './pages/Account.jsx';
import MyListings from './pages/MyListings.jsx';
import HostDashboard from './pages/HostDashboard.jsx';
import MorphBg from './components/MorphBg.jsx';
import { currentRole } from './services/api';

// URL <-> page mapping
const urlToPageMap = {
  '/': 'home',
  '/listings': 'listings',
  '/about': 'about',
  '/auth': 'auth',
  '/list-your-property': 'list-your-property',
  '/payment-return': 'payment-return',
  '/premium-features': 'premium-features',
  '/property-details': 'property-details',
  '/profile': 'profile',
  '/saved': 'profile',
  '/host-dashboard': 'host-dashboard',
  '/my-listings': 'my-listings',
};

const pageToUrlMap = {
  home: '/',
  listings: '/listings',
  about: '/about',
  auth: '/auth',
  'list-your-property': '/list-your-property',
  'payment-return': '/payment-return',
  'premium-features': '/premium-features',
  'property-details': '/property-details',
  profile: '/profile',
  'host-dashboard': '/host-dashboard',
  'my-listings': '/my-listings',
};

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within NavigationProvider');
  return context;
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  // The accommodation currently opened in the detail/apply views.
  const [selectedId, setSelectedId] = useState(null);
  // Active "view" role for nav (defaults to the signed-in user's role).
  const [role, setRole] = useState(currentRole() || 'student');

  useEffect(() => {
    document.body.style.display = 'block';
    document.body.style.placeItems = 'unset';
    document.body.className = 'bg-bg-page text-text-primary';

  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(urlToPageMap[window.location.pathname] || 'home');
    };
    setCurrentPage(urlToPageMap[window.location.pathname] || 'home');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((page, opts = {}) => {
    if (opts.id !== undefined) {
      setSelectedId(opts.id);
      // Persist so the detail view survives a refresh / direct nav.
      try {
        localStorage.setItem('selectedAccommodationId', opts.id);
      } catch {
        /* ignore */
      }
    }
    const url = pageToUrlMap[page] || '/';
    setCurrentPage(page);
    window.history.pushState({}, '', url);
    window.scrollTo(0, 0);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'listings':
        return <Listings />;
      case 'about':
        return <About />;
      case 'auth':
        return <Auth />;
      case 'list-your-property':
        return <ListPropertyPage />;
      case 'payment-return':
        return <PaymentReturn />;
      case 'premium-features':
        return <PremiumFeatures />;
      case 'property-details':
        return <PropertyDetails />;
      case 'profile':
        return <Account />;
      case 'host-dashboard':
        return <HostDashboard />;
      case 'my-listings':
        return <MyListings />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-bg-page text-text-primary">
      <MorphBg />
      <div className="relative z-10">
        <NavigationContext.Provider
          value={{ currentPage, navigate, selectedId, setSelectedId, role, setRole }}
        >
          <Navbar />
          <main className="w-full">{renderPage()}</main>
        </NavigationContext.Provider>
      </div>
    </div>
  );
}

export default App;
