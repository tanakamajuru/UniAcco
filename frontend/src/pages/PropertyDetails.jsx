import React, { useState, useEffect } from 'react';
import { useNavigation } from '../App';
import {
  MapPin,
  Star,
  Wifi,
  Utensils,
  BookOpen,
  Droplets,
  Dumbbell,
  WashingMachine,
  Snowflake,
  Tv2,
  Sun,
  Car,
  Sofa,
  PawPrint,
  Cigarette,
  Phone,
  Mail,
  Calendar,
  Lock,
  Unlock,
  ArrowLeft,
  Heart,
  Share2,
  BedDouble,
  Users,
  Home,
  CreditCard,
} from 'lucide-react';
import { usePaymentVerification, PaymentRequired } from '../hooks/usePaymentVerification';
import { motion, AnimatePresence } from 'framer-motion';
import ImageSlider from '../components/ImageSlider';
import PaymentForm from '../components/PaymentForm';

const PropertyDetails = () => {
  const { currentPage, navigate } = useNavigation();
  
  // Extract property ID from current page URL
  const id = currentPage === 'property-details' 
    ? window.location.pathname.split('/').pop() 
    : null;
    
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if user has paid for this accommodation
  const { hasPaid: hasPaidForAccommodation, isLoading: paymentLoading } = usePaymentVerification('accommodation_details', id);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        const response = await fetch(`${API_BASE_URL}/api/accommodations/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch property details');
        }

        const data = await response.json();
        setProperty(data);
      } catch (err) {
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    // Refresh property data to show unlocked features
    window.location.reload();
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite toggle API call
  };

  const handleShareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `Check out this property: ${property?.title} - $${property?.price_per_month}/month`,
        url: window.location.href
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Property link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/listings')}
            className="bg-btn-primary text-text-inverse px-6 py-3 rounded-lg hover:bg-btn-primary-hover"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  const amenities = [
    { id: 'tv', label: 'TV', icon: <Tv2 className="w-5 h-5" /> },
    { id: 'wifi', label: 'WiFi', icon: <Wifi className="w-5 h-5" /> },
    { id: 'heating', label: 'Heating', icon: <Sun className="w-5 h-5" /> },
    { id: 'kitchen', label: 'Kitchen', icon: <Utensils className="w-5 h-5" /> },
    { id: 'laundry', label: 'Laundry', icon: <WashingMachine className="w-5 h-5" /> },
    { id: 'parking', label: 'Parking', icon: <Car className="w-5 h-5" /> },
    { id: 'furnished', label: 'Furnished', icon: <Sofa className="w-5 h-5" /> },
    { id: 'pets_allowed', label: 'Pets Allowed', icon: <PawPrint className="w-5 h-5" /> },
    { id: 'smoking_allowed', label: 'Smoking Allowed', icon: <Cigarette className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Banner - Only show if not paid */}
      {!hasPaidForAccommodation && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              <span className="font-semibold">Premium Features Locked</span>
            </div>
            <button
              onClick={() => setShowPaymentForm(true)}
              className="bg-btn-secondary text-btn-primary px-4 py-2 rounded-lg font-medium hover:bg-btn-secondary-hover transition-colors flex items-center"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay to Unlock Full Access
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/listings')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Listings
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Images */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-96">
                <ImageSlider 
                  images={property.images} 
                  autoplay={true}
                  autoplayDelay={4000}
                />
              </div>
            </div>

            {/* Property Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{property.address}, {property.city}</span>
                  </div>
                </div>
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-full transition-colors ${
                    isFavorite 
                      ? 'bg-btn-danger/10 text-btn-danger hover:bg-btn-danger/20' 
                      : 'bg-btn-secondary text-btn-secondary-text hover:bg-btn-secondary-hover'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Property Details</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center">
                      <BedDouble className="w-4 h-4 mr-2" />
                      <span>{property.people_per_room || 'N/A'} {property.people_per_room === 1 ? 'Person' : 'People'}/Room</span>
                    </div>
                    <div className="flex items-center">
                      <Home className="w-4 h-4 mr-2" />
                      <span>{property.property_type || 'Apartment'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Available {property.available_from || 'Immediately'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Pricing</h3>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-blue-600">
                      ${property.price_per_month}
                      <span className="text-lg font-normal text-gray-600">/month</span>
                    </div>
                    {property.deposit && (
                      <div className="text-sm text-gray-600">
                        Deposit: ${property.deposit}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((amenity) => {
                    const isAvailable = property.accommodation_amenities?.[amenity.id] === true;
                    
                    return (
                      <div
                        key={amenity.id}
                        className={`flex items-center p-3 rounded-lg border ${
                          isAvailable
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className={`w-5 h-5 mr-2 ${
                          isAvailable ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {amenity.icon}
                        </div>
                        <span className={`text-sm ${
                          isAvailable ? 'text-green-800' : 'text-gray-600'
                        }`}>
                          {amenity.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleShareProperty}
                  className="flex-1 bg-btn-secondary text-btn-secondary-text py-3 px-4 rounded-lg hover:bg-btn-secondary-hover transition-colors flex items-center justify-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
                <button
                  onClick={() => {
                    if (hasPaidForAccommodation) {
                      // Show application form if already paid
                      navigate(`/bookings/new?accommodation=${id}`);
                    } else {
                      // Show payment form if not paid
                      setShowPaymentForm(true);
                    }
                  }}
                  className="flex-1 bg-btn-primary text-text-inverse py-3 px-4 rounded-lg hover:bg-btn-primary-hover transition-colors flex items-center justify-center"
                >
                  {hasPaidForAccommodation ? 'Book Now' : 'Pay to Book'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information - Premium Feature */}
            <div className={`bg-white rounded-xl shadow-lg p-6 ${
              !hasPaidForAccommodation ? 'opacity-75' : ''
            }`}>
              <div className="flex items-center mb-4">
                {hasPaidForAccommodation ? (
                  <Unlock className="w-5 h-5 mr-2 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 mr-2 text-gray-400" />
                )}
                <h3 className="text-lg font-semibold">Contact Information</h3>
              </div>

              {hasPaidForAccommodation ? (
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="font-medium">{property.landlord_name || 'Property Manager'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{property.landlord_phone || 'Available after payment'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{property.landlord_email || 'Available after payment'}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Contact information is locked</p>
                  <p className="text-sm text-gray-500 mb-4">Make a payment to unlock landlord details and start booking process</p>
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="w-full bg-btn-primary text-text-inverse py-3 px-4 rounded-lg hover:bg-btn-primary-hover transition-colors"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Unlock Contact Details
                  </button>
                </div>
              )}
            </div>

            {/* Location Map */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mt-3 text-center">
                {property.address}, {property.city}
              </p>
            </div>

            {/* University Info */}
            {property.university && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Campus Information</h3>
                <div className="space-y-2 text-gray-600">
                  <div>
                    <span className="font-medium">University:</span> {property.university?.name || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Campus:</span> {property.campus?.name || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Distance:</span> {property.distance_to_campus || 'N/A'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      <AnimatePresence>
        {showPaymentForm && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Unlock Premium Features</h3>
                <button
                  onClick={handleCancelPayment}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <PaymentForm
                accommodation={property}
                onPaymentSuccess={handlePaymentSuccess}
                onCancel={handleCancelPayment}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyDetails;
