import React, { useState, useEffect } from 'react';
import { useNavigation } from '../App';
import {
  User,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  Calendar,
  DollarSign,
  Shield,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  HelpCircle,
  Crown,
  Lock,
  Unlock,
  TrendingUp,
  Star,
  Heart,
  Search,
  Bell,
  MessageSquare,
  FileText,
  AlertCircle,
  BookOpen,
  Building,
  UserCheck,
  History,
  Bookmark
} from 'lucide-react';
import { usePaymentVerification } from '../hooks/usePaymentVerification';
import { motion, AnimatePresence } from 'framer-motion';
import MessagesSection from '../components/account/MessagesSection';
import ReviewsSection from '../components/account/ReviewsSection';
import SavedSearchesSection from '../components/account/SavedSearchesSection';
import SupportSection from '../components/account/SupportSection';

const Account = () => {
  const { navigate } = useNavigation();
  const [activeSection, setActiveSection] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);

  const { hasPaid: hasPremiumAccess, isLoading: paymentLoading } = usePaymentVerification('premium_support');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        navigate('auth');
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const userResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      } else if (userResponse.status === 401) {
        localStorage.removeItem('token');
        navigate('auth');
      } else {
        console.error('Failed to fetch user profile:', userResponse.statusText);
      }

      // Fetch bookings
      const bookingsResponse = await fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('home');
  };

  const menuItems = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
      subsections: ['Personal Details', 'University & Campus', 'Subscription Status']
    },
    {
      id: 'bookings',
      label: 'My Bookings',
      icon: Calendar,
      subsections: ['Active Bookings', 'Pending Requests', 'Past Bookings']
    },
    {
      id: 'favorites',
      label: 'My Favorites',
      icon: Heart,
      subsections: ['Saved Accommodations']
    },
    {
      id: 'premium',
      label: hasPremiumAccess ? 'My Subscription' : 'Premium Features',
      icon: Crown,
      subsections: ['Feature Comparison', 'Payment Management', 'Billing History']
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      subsections: ['Chat with Landlords']
    },
    {
      id: 'reviews',
      label: 'My Reviews',
      icon: Star,
      subsections: ['Reviews Written', 'Pending Reviews']
    },
    {
      id: 'searches',
      label: 'Saved Searches',
      icon: Search,
      subsections: ['Alerts & Notifications', 'Availability Alerts', 'Price Drop Alerts']
    },
    {
      id: 'support',
      label: 'Help & Support',
      icon: HelpCircle,
      subsections: ['Report an Issue', 'Terms & Privacy']
    }
  ];

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <p className="font-medium">{user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'Loading...'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="font-medium">{user?.email || 'Loading...'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <p className="font-medium">{user?.phone || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Role</label>
            <p className="font-medium capitalize">{user?.role || 'Not provided'}</p>
          </div>
          {user?.createdAt && (
            <div>
              <label className="text-sm text-gray-600">Member Since</label>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          )}
          {user?.updatedAt && (
            <div>
              <label className="text-sm text-gray-600">Last Updated</label>
              <p className="font-medium">{new Date(user.updatedAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building className="w-5 h-5" />
          University & Campus
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">University</label>
            <p className="font-medium">Feature coming soon</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Campus</label>
            <p className="font-medium">Feature coming soon</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Subscription Status
        </h3>
        <div className="flex items-center gap-3">
          {hasPremiumAccess ? (
            <>
              <Crown className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="font-medium text-green-600">Premium Active</p>
                <p className="text-sm text-gray-600">Full access to all features</p>
              </div>
            </>
          ) : (
            <>
              <Lock className="w-6 h-6 text-gray-400" />
              <div>
                <p className="font-medium text-gray-600">Free Plan</p>
                <p className="text-sm text-gray-600">Limited access to features</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderBookingsSection = () => {
    const activeBookings = bookings.filter(b => b.status === 'active');
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Active Bookings
          </h3>
          {activeBookings.length > 0 ? (
            <div className="space-y-3">
              {activeBookings.map(booking => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{booking.propertyName}</h4>
                      <p className="text-sm text-gray-600">{booking.location}</p>
                      <p className="text-sm text-gray-600">{booking.dates}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No active bookings</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Requests
          </h3>
          {pendingBookings.length > 0 ? (
            <div className="space-y-3">
              {pendingBookings.map(booking => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{booking.propertyName}</h4>
                      <p className="text-sm text-gray-600">{booking.location}</p>
                      <p className="text-sm text-gray-600">{booking.dates}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No pending requests</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <History className="w-5 h-5" />
            Past Bookings
          </h3>
          {pastBookings.length > 0 ? (
            <div className="space-y-3">
              {pastBookings.map(booking => (
                <div key={booking.id} className="border rounded-lg p-4 opacity-75">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{booking.propertyName}</h4>
                      <p className="text-sm text-gray-600">{booking.location}</p>
                      <p className="text-sm text-gray-600">{booking.dates}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === 'completed' 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No past bookings</p>
          )}
        </div>
      </div>
    );
  };

  const renderPremiumSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Feature Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Feature</th>
                <th className="text-center py-2">Free</th>
                <th className="text-center py-2">Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">Property Listings</td>
                <td className="text-center">Limited</td>
                <td className="text-center">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Messages</td>
                <td className="text-center">
                  <Lock className="w-4 h-4 inline text-gray-400" />
                </td>
                <td className="text-center">
                  <CheckCircle className="w-4 h-4 inline text-green-500" />
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Reviews</td>
                <td className="text-center">
                  <Lock className="w-4 h-4 inline text-gray-400" />
                </td>
                <td className="text-center">
                  <CheckCircle className="w-4 h-4 inline text-green-500" />
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Price Alerts</td>
                <td className="text-center">
                  <XCircle className="w-4 h-4 inline text-red-400" />
                </td>
                <td className="text-center">
                  <CheckCircle className="w-4 h-4 inline text-green-500" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {!hasPremiumAccess && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Upgrade to Premium</h3>
          <p className="mb-4">Unlock all features and get the best accommodation experience.</p>
          <button 
            onClick={() => navigate('premium-features')}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'bookings':
        return renderBookingsSection();
      case 'premium':
        return renderPremiumSection();
      case 'messages':
        return <MessagesSection hasPremiumAccess={hasPremiumAccess} />;
      case 'reviews':
        return <ReviewsSection hasPremiumAccess={hasPremiumAccess} />;
      case 'searches':
        return <SavedSearchesSection hasPremiumAccess={hasPremiumAccess} />;
      case 'support':
        return <SupportSection />;
      case 'favorites':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Saved Accommodations
            </h3>
            <p className="text-gray-500">Your favorite properties will appear here.</p>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-gray-500">This section is coming soon.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-6">Account</h2>
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isLocked = !hasPremiumAccess && ['messages', 'reviews'].includes(item.id);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-50'
                      } ${isLocked ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                        {hasPremiumAccess && item.id === 'premium' && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
