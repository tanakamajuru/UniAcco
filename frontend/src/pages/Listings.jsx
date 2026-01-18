import { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Star,
  Filter,
  Home as HomeIcon,
  Wifi,
  Utensils,
  BookOpen,
  Droplets,
  Dumbbell,
  WashingMachine,
  Snowflake,
  Tv2,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Sun,
  Car,
  Sofa,
  PawPrint,
  Cigarette,
  CreditCard,
  Lock,
  Unlock,
  Eye,
  ArrowRight,
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import ImageSlider from '@/components/ImageSlider';
import PaymentForm from '@/components/PaymentForm';
import { usePaymentVerification, PaymentRequired } from '../hooks/usePaymentVerification';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAccommodations } from '../utils/api';
import { useNavigation } from '../App';

// Separate component for property cards to avoid hooks in loops
const PropertyCard = ({ property, amenities, onPropertyClick, onViewDetails }) => {
  const { hasPaid: hasPaidForAccommodation, isLoading: paymentLoading } = usePaymentVerification('accommodation_details', property.id);
  
  return (
    <motion.div
      key={property.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-surface rounded-xl shadow-lg overflow-hidden"
    >
      <div className="h-48 w-full bg-bg-surface-alt flex items-center justify-center overflow-hidden">
        <ImageSlider 
          images={property.images} 
          autoplay={false}
          autoplayDelay={0}
        />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold">{property.title}</h3>
        <p className="text-sm text-text-muted">
          {property.university?.name || 'University'} — {property.campus?.name || 'Campus'}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <p className="font-semibold">${property.price_per_month}/month</p>
          <p className="text-sm text-text-muted">• {property.people_per_room ? `${property.people_per_room} ${property.people_per_room === 1 ? 'Person' : 'People'}/room` : 'N/A'}</p>
        </div>

        {/* Payment Status Indicator */}
        <div className="mt-2 mb-3">
          {paymentLoading ? (
            <div className="flex items-center text-sm text-text-secondary">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary mr-2"></div>
              Checking access...
            </div>
          ) : hasPaidForAccommodation ? (
            <div className="flex items-center text-sm text-success">
              <Unlock className="w-4 h-4 mr-1" />
              Full Access Unlocked
            </div>
          ) : (
            <div className="flex items-center text-sm text-warning">
              <Lock className="w-4 h-4 mr-1" />
              Limited Access - Payment Required
            </div>
          )}
        </div>

        {/* Amenities */}
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-2">Amenities:</h4>
          <div className="grid grid-cols-2 gap-2">
            {amenities.map((amenity) => {
              const isAvailable = property.accommodation_amenities?.[amenity.id] === true;
              
              return (
                <label 
                  key={amenity.id} 
                  className={`flex items-center space-x-2 text-sm ${isAvailable ? 'text-text-primary dark:text-text-primary' : 'text-text-muted dark:text-text-muted'}`}
                >
                  <div className={`flex items-center justify-center w-5 h-5 border rounded ${isAvailable ? 'border-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20' : 'border-border dark:border-border'}`}>
                    {isAvailable && (
                      <svg className="w-3 h-3 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">{amenity.icon}</span>
                    <span>{amenity.label}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Contact Information - Only show if paid */}
        {hasPaidForAccommodation ? (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <h5 className="font-semibold text-green-800 mb-2">Contact Information</h5>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Landlord:</strong> {property.landlord_name || 'Available after payment'}</p>
              <p><strong>Phone:</strong> {property.landlord_phone || 'Available after payment'}</p>
              <p><strong>Email:</strong> {property.landlord_email || 'Available after payment'}</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-700">
              <strong>Contact information</strong> and full details are available after payment
            </p>
          </div>
        )}

        <button
          onClick={() => onPropertyClick(property, hasPaidForAccommodation)}
          className="mt-4 w-full bg-brand-primary text-text-inverse rounded-lg hover:bg-brand-primary-dark transition-colors"
        >
          {hasPaidForAccommodation ? 'Apply Now' : 'Pay to Unlock & Apply'}
        </button>
        
        {/* View Details Button */}
        <button
          onClick={() => onViewDetails(property.id)}
          className="mt-2 w-full bg-bg-surface-alt text-text-primary rounded-lg hover:bg-bg-surface transition-colors flex items-center justify-center"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </button>
      </div>
    </motion.div>
  );
};

const Listings = () => {
  const { currentPage, navigate } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [applicationData, setApplicationData] = useState(null);

  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    moveInDate: '',
    message: '',
    termsAgreed: false,
  });

  const universities = [
    'University of Zimbabwe',
    'Midlands State University',
    'National University of Science and Technology',
    'Africa University',
    'Chinhoyi University of Technology',
  ];

  const campuses = [
    'Main Campus',
    'Medical Campus',
    'Engineering Campus',
    'Business School',
    'Arts Campus',
  ];

  const amenities = [
    { id: 'tv', label: 'TV', icon: <Tv2 className="w-4 h-4" /> },
    { id: 'wifi', label: 'WiFi', icon: <Wifi className="w-4 h-4" /> },
    { id: 'heating', label: 'Heating', icon: <Sun className="w-4 h-4" /> },
    { id: 'kitchen', label: 'Kitchen', icon: <Utensils className="w-4 h-4" /> },
    { id: 'laundry', label: 'Laundry', icon: <WashingMachine className="w-4 h-4" /> },
    { id: 'parking', label: 'Parking', icon: <Car className="w-4 h-4" /> },
    { id: 'furnished', label: 'Furnished', icon: <Sofa className="w-4 h-4" /> },
    { id: 'pets_allowed', label: 'Pets Allowed', icon: <PawPrint className="w-4 h-4" /> },
    { id: 'smoking_allowed', label: 'Smoking Allowed', icon: <Cigarette className="w-4 h-4" /> },
  ];

  /* =======================
     DATA FETCH
  ======================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchAccommodations({
          university: selectedUniversity,
          campus: selectedCampus,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
        });

        const normalized = (data || []).map((p) => {
          const normalizedAmenities =
            p.amenities ??
            p.accommodation_amenities?.[0] ??
            p.accommodation_amenities ??
            {};

          const normalizedImages =
            (p.images ?? p.accommodation_images?.map((img) => img.image_url) ?? [])
              .map(url => url?.trim())
              .filter(url => url && url.length > 0);

          return {
            ...p,
            accommodation_amenities: normalizedAmenities,
            images: normalizedImages,
          };
        });

        setAccommodations(normalized);
      } catch (err) {
        console.error('Error loading accommodations:', err);
        setError('Failed to load accommodations.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedUniversity, selectedCampus, priceRange]);

  /* =======================
     FILTERING
  ======================= */
  const toggleAmenity = (id) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const filteredProperties = accommodations.filter((p) => {
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    if (
      selectedAmenities.length &&
      selectedAmenities.some((a) => !p.accommodation_amenities?.[a])
    )
      return false;

    return true;
  });

  /* =======================
     FORM HANDLERS
  ======================= */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApplicationForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Store application data and show payment form
    setApplicationData(applicationForm);
    setShowApplicationForm(false);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    // Payment successful - reset forms and show success
    setShowPaymentForm(false);
    setApplicationData(null);
    setApplicationForm({
      fullName: '',
      email: '',
      phone: '',
      moveInDate: '',
      message: ''
    });
    // You could show a success message or redirect
    alert('Payment successful! Your booking has been confirmed.');
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
    setApplicationData(null);
  };

  const handlePropertyClick = (property, hasPaidForAccommodation) => {
    setSelectedProperty(property);
    if (hasPaidForAccommodation) {
      // If already paid, show application form directly
      setShowApplicationForm(true);
    } else {
      // If not paid, show payment form
      setShowPaymentForm(true);
    }
  };

  const handleViewDetails = (propertyId) => {
    navigate(`property-details/${propertyId}`);
  };

  /* =======================
     UI STATES
  ======================= */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center">{error}</div>;
  }

  /* =======================
     RENDER
  ======================= */
  return (
    <AnimatedBackground variant="morphing">
      <div className="min-h-screen pt-24 pb-16 px-6">

        {/* Header / Filters */}
        <div className="bg-bg-surface rounded-2xl shadow-card p-6 mb-10">
          <h1 className="text-3xl font-bold mb-6">Find Your Perfect Student Accommodation</h1>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
            <input
              className="w-full pl-10 py-3 rounded-lg border bg-input dark:bg-input"
              placeholder="Search by property name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Top Filters */}
          <div className="grid md:grid-cols-4 gap-4">
            <select className="p-2 rounded-lg" value={selectedUniversity} onChange={(e) => setSelectedUniversity(e.target.value)}>
              <option value="">All Universities</option>
              {universities.map((u) => <option key={u}>{u}</option>)}
            </select>

            <select className="p-2 rounded-lg" value={selectedCampus} onChange={(e) => setSelectedCampus(e.target.value)}>
              <option value="">All Campuses</option>
              {campuses.map((c) => <option key={c}>{c}</option>)}
            </select>

            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, Number(e.target.value)])}
            />

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-brand-primary text-text-inverse rounded-lg flex items-center justify-center gap-2 hover:bg-brand-primary-dark transition-colors"
            >
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>

          {/* Amenities */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {amenities.map((a) => (
                <button
                  key={a.id}
                  onClick={() => toggleAmenity(a.id)}
                  className={`p-2 rounded-lg border ${
                    selectedAmenities.includes(a.id)
                      ? 'bg-blue-100 text-blue-700'
                      : ''
                  }`}
                >
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="grid md:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              amenities={amenities}
              onPropertyClick={handlePropertyClick}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </div>

      {/* APPLICATION MODAL */}
      <AnimatePresence>
        {showApplicationForm && selectedProperty && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.form
              onSubmit={handleSubmit}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-bg-surface p-6 rounded-xl max-w-xl w-full"
            >
              <h2 className="text-2xl font-bold mb-4">
                Apply for {selectedProperty.title}
                <div className="text-sm text-text-muted mt-1">
                  {selectedProperty.university?.name || 'University'} — {selectedProperty.campus?.name || 'Campus'}
                </div>
              </h2>

              <input name="fullName" placeholder="Full Name" onChange={handleInputChange} className="w-full mb-2 p-2" required />
              <input name="email" placeholder="Email" onChange={handleInputChange} className="w-full mb-2 p-2" required />
              <input name="phone" placeholder="Phone" onChange={handleInputChange} className="w-full mb-2 p-2" required />
              <input type="date" name="moveInDate" onChange={handleInputChange} className="w-full mb-2 p-2" required />

              <textarea name="message" placeholder="Additional notes" className="w-full mb-3 p-2" />

              <button className="w-full bg-brand-primary text-text-inverse py-2 rounded-lg">
                Submit Application
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAYMENT MODAL */}
      <AnimatePresence>
        {showPaymentForm && applicationData && selectedProperty && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-bg-surface p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <PaymentForm
                accommodation={selectedProperty}
                onPaymentSuccess={handlePaymentSuccess}
                onCancel={handleCancelPayment}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedBackground>
  );
};

export default Listings;
