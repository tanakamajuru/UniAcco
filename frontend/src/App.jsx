import { useState, createContext, useContext, useEffect } from 'react';
import Navbar from './components/navbar.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Listings from './pages/Listings.jsx';
import Auth from './pages/Auth.jsx';
import ListYourProperty from './pages/ListYourProperty.jsx';
import PaymentReturn from './pages/PaymentReturn.jsx';
import PremiumFeatures from './components/PremiumFeatures.jsx';
import PropertyDetails from './pages/PropertyDetails.jsx';
import UserProfile from './pages/UserProfile.jsx';
import Account from './pages/Account.jsx';
import MyListings from './pages/MyListings.jsx';

// URL to page mapping
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
  '/my-listings': 'my-listings'
};

const pageToUrlMap = {
  'home': '/',
  'listings': '/listings',
  'about': '/about',
  'auth': '/auth',
  'list-your-property': '/list-your-property',
  'payment-return': '/payment-return',
  'premium-features': '/premium-features',
  'property-details': '/property-details',
  'profile': '/profile',
  'my-listings': '/my-listings'
};

// Create Navigation Context
const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // Override body flex layout for all pages
  useEffect(() => {
    document.body.style.display = 'block';
    document.body.style.placeItems = 'unset';
    document.body.className = 'bg-bg-page text-text-primary';
    
    // Apply theme on initial load
    const savedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = savedTheme;
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Sync URL with page state
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const page = urlToPageMap[path] || 'home';
      setCurrentPage(page);
    };

    // Initialize page from URL
    const path = window.location.pathname;
    const page = urlToPageMap[path] || 'home';
    setCurrentPage(page);

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (page) => {
    const url = pageToUrlMap[page] || '/';
    setCurrentPage(page);
    window.history.pushState({}, '', url);
    window.scrollTo(0, 0);
  };

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
        return <ListYourProperty />;
      case 'payment-return':
        return <PaymentReturn />;
      case 'premium-features':
        return <PremiumFeatures />;
      case 'property-details':
        return <PropertyDetails />;
      case 'profile':
        return <Account />;
      case 'my-listings':
        return <MyListings />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-bg-page text-text-primary">
      <NavigationContext.Provider value={{ currentPage, navigate }}>
        <Navbar />
        <main className="w-full">
          {renderPage()}
        </main>
      </NavigationContext.Provider>
    </div>
  );
}

export default App;
