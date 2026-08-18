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
  Users,
  Star,
} from 'lucide-react';
import { usePaymentVerification } from '../hooks/usePaymentVerification';
import { motion, AnimatePresence } from 'framer-motion';

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check payment status for premium features
  const { hasPaid: hasPremiumAccess, isLoading: paymentLoading } = usePaymentVerification('premium_support');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        // Get user data
        const userResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleManageSubscription = () => {
    // Navigate to subscription management
    navigate('/premium-features');
  };

  const handleUpgradePlan = () => {
    // Navigate to payment page for upgrading
    navigate('/premium-features');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primaryDark"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
    { id: 'subscription', label: 'Manage Subscription', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'payments', label: 'Payment History', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">First Name</label>
                  <input
                    type="text"
                    value={user?.first_name || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-input rounded-lg bg-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Last Name</label>
                  <input
                    type="text"
                    value={user?.last_name || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-input rounded-lg bg-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-input rounded-lg bg-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Phone</label>
                  <input
                    type="tel"
                    value={user?.phone || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-input rounded-lg bg-input"
                  />
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-brand-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-brand-primaryDark">12</div>
                  <div className="text-sm text-text-secondary">Properties Viewed</div>
                </div>
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success">3</div>
                  <div className="text-sm text-text-secondary">Applications Sent</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-brand-accent">1</div>
                  <div className="text-sm text-text-secondary">Active Bookings</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">89%</div>
                  <div className="text-sm text-text-secondary">Profile Complete</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Current Subscription</h3>
              <div className={`border rounded-lg p-6 ${ hasPremiumAccess ? 'border-success/30 bg-success/10' : 'border-border bg-bg-surface-alt' }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {hasPremiumAccess ? (
                      <Crown className="w-6 h-6 text-brand-accent mr-3" />
                    ) : (
                      <Lock className="w-6 h-6 text-text-muted mr-3" />
                    )}
                    <div>
                      <h4 className="text-xl font-bold">
                        {hasPremiumAccess ? 'Premium Plan' : 'Free Plan'}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {hasPremiumAccess 
                          ? 'Full access to all features' 
                          : 'Limited access to basic features'
                        }
                      </p>
                    </div>
                  </div>
                  {hasPremiumAccess && (
                    <span className="bg-success/15 text-success text-xs px-2 py-1 rounded-full font-medium">
                      Active
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">Property Details Access</span>
                    {hasPremiumAccess ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">Direct Messaging</span>
                    {hasPremiumAccess ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">Advanced Search</span>
                    {hasPremiumAccess ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-text-secondary">Priority Support</span>
                    {hasPremiumAccess ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  {!hasPremiumAccess && (
                    <button
                      onClick={handleUpgradePlan}
                      className="flex-1 bg-btn-primary text-text-inverse py-3 px-4 rounded-lg hover:bg-btn-primary-hover transition-colors flex items-center justify-center"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </button>
                  )}
                  <button
                    onClick={handleManageSubscription}
                    className="flex-1 bg-btn-secondary text-btn-secondary-text py-3 px-4 rounded-lg hover:bg-btn-secondary-hover transition-colors flex items-center justify-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Subscription
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-brand-primaryDark mr-3" />
                    <div>
                      <div className="font-medium">PayNow</div>
                      <div className="text-sm text-text-secondary">Primary payment method</div>
                    </div>
                  </div>
                  <button className="text-text-link hover:text-text-link text-sm font-medium">
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            {/* Payment History */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Payment History</h3>
                <button className="text-text-link hover:text-text-link text-sm font-medium flex items-center">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </button>
              </div>

              {/* Sample payment history - in real app, this would come from API */}
              <div className="space-y-3">
                <div className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">Sunshine Student Residences</div>
                      <div className="text-sm text-text-secondary">Room Booking</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-success">$350.00</div>
                      <div className="text-sm text-success">Paid</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-text-secondary">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>January 15, 2026 at 2:30 PM</span>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">Campus Heights Apartments</div>
                      <div className="text-sm text-text-secondary">Security Deposit</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-success">$200.00</div>
                      <div className="text-sm text-success">Paid</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-text-secondary">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>January 10, 2026 at 10:15 AM</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button className="text-text-link hover:text-text-link text-sm font-medium">
                  <Download className="w-4 h-4 mr-1 inline" />
                  Download Invoice History
                </button>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-text-secondary">Receive booking updates via email</div>
                  </div>
                  <button className="bg-btn-primary text-text-inverse px-3 py-1 rounded-full text-sm">
                    Enabled
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <div className="font-medium">SMS Notifications</div>
                    <div className="text-sm text-text-secondary">Get SMS alerts for new messages</div>
                  </div>
                  <button className="bg-btn-secondary text-btn-secondary-text px-3 py-1 rounded-full text-sm">
                    Disabled
                  </button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-text-secondary">Extra security for your account</div>
                  </div>
                  <button className="bg-btn-primary text-text-inverse px-3 py-1 rounded-full text-sm">
                    Enable
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <div className="font-medium">Profile Visibility</div>
                    <div className="text-sm text-text-secondary">Control who can see your profile</div>
                  </div>
                  <select className="border border-border rounded-lg px-3 py-2">
                    <option>Everyone</option>
                    <option>Only Landlords</option>
                    <option>Private</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">Data Sharing</div>
                    <div className="text-sm text-text-secondary">Share data with university partners</div>
                  </div>
                  <button className="bg-btn-secondary text-btn-secondary-text px-3 py-1 rounded-full text-sm">
                    Disabled
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-error/10 border border-error/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-error">Danger Zone</h3>
              <div className="space-y-3">
                <button className="w-full text-left bg-btn-secondary border border-btn-danger text-btn-danger py-3 px-4 rounded-lg hover:bg-btn-danger/10 transition-colors">
                  <div className="flex items-center">
                    <Download className="w-4 h-4 mr-3" />
                    <div>
                      <div className="font-medium">Download My Data</div>
                      <div className="text-sm text-error">Get a copy of all your data</div>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left bg-btn-secondary border border-btn-danger text-btn-danger py-3 px-4 rounded-lg hover:bg-btn-danger/10 transition-colors">
                  <div className="flex items-center">
                    <XCircle className="w-4 h-4 mr-3" />
                    <div>
                      <div className="font-medium">Delete Account</div>
                      <div className="text-sm text-error">Permanently remove your account</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg-surface-alt">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-text-primary">My Profile</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/listings')}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Browse Properties
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center text-text-secondary hover:text-text-primary transition-colors"
                >
                  <User className="w-5 h-5" />
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
                
                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-border z-50"
                    >
                      <div className="py-2">
                        <button
                          onClick={() => {
                            navigate('/premium-features');
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-text-secondary hover:bg-bg-surface-alt transition-colors flex items-center"
                        >
                          <Crown className="w-4 h-4 mr-3 text-brand-accent" />
                          Premium Features
                        </button>
                        <button
                          onClick={() => {
                            navigate('/bookings');
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-text-secondary hover:bg-bg-surface-alt transition-colors flex items-center"
                        >
                          <Calendar className="w-4 h-4 mr-3" />
                          My Bookings
                        </button>
                        <button
                          onClick={() => {
                            navigate('/favorites');
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-text-secondary hover:bg-bg-surface-alt transition-colors flex items-center"
                        >
                          <Heart className="w-4 h-4 mr-3" />
                          My Favorites
                        </button>
                        <hr className="my-2" />
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-error hover:bg-error/10 transition-colors flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${ activeTab === tab.id ? 'text-brand-primaryDark border-b-2 border-brand-primaryDark' : 'text-text-secondary border-b-2 border-transparent hover:text-text-primary' }`}
              >
                <div className="flex items-center justify-center">
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
