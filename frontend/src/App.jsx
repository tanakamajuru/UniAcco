import { useState, createContext, useContext } from 'react';
import Navbar from './components/navbar.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Listings from './pages/Listings.jsx';
import Auth from './pages/Auth.jsx';
import Abouts from './pages/Abouts.jsx';


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

  const navigate = (page) => {
    setCurrentPage(page);
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
      case 'abouts':
        return <Abouts />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <NavigationContext.Provider value={{ currentPage, navigate }}>
        <Navbar />
        <main className="w-full max-w-[100vw] overflow-hidden">
          <div className="w-full mx-auto">
            {renderPage()}
          </div>
        </main>
      </NavigationContext.Provider>
    </div>
  );
}

export default App;
