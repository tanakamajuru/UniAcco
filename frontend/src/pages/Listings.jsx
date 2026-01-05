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
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAccommodations } from '../utils/api';

const Listings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

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
        
        const normalized = data.map((p) => ({
          ...p,
          accommodation_amenities: p.accommodation_amenities?.[0] ?? {},
        }));
        
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Application:', { ...applicationForm, propertyId: selectedProperty.id });
    setShowApplicationForm(false);
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
        <div className="bg-white dark:bg-[#1A1F2E] rounded-2xl shadow-xl p-6 mb-10">
          <h1 className="text-3xl font-bold mb-6">Find Your Perfect Student Accommodation</h1>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              className="w-full pl-10 py-3 rounded-lg border dark:bg-[#2E4057]"
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
              className="bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
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
          {filteredProperties.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-lg overflow-hidden"
            >
              <div className="h-48 w-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {p.accommodation_images?.length > 0 ? (
                  <img 
                    src={p.accommodation_images[0].image_url} 
                    alt={p.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="text-gray-500">No image available</div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold">{p.title}</h3>
                <p className="text-sm text-gray-500">{p.campus}</p>
                <div className="flex items-center gap-4 mt-2">
                  <p className="font-semibold">${p.price_per_month}/month</p>
                  <p className="text-sm text-gray-500">• {p.people_per_room ? `${p.people_per_room} ${p.people_per_room === 1 ? 'Person' : 'People'}/room` : 'N/A'}</p>
                </div>

                {/* Amenities */}
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-2">Amenities:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {amenities.map((amenity) => {
                      const isAvailable = p.accommodation_amenities?.[amenity.id] === true;
                      
                      return (
                        <label 
                          key={amenity.id} 
                          className={`flex items-center space-x-2 text-sm ${isAvailable ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}
                        >
                          <div className={`flex items-center justify-center w-5 h-5 border rounded ${isAvailable ? 'border-blue-500 bg-blue-100 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'}`}>
                            {isAvailable && (
                              <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
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

                <button
                  onClick={() => {
                    setSelectedProperty(p);
                    setShowApplicationForm(true);
                  }}
                  className="mt-4 w-full bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* APPLICATION MODAL (UI preserved) */}
      <AnimatePresence>
        {showApplicationForm && selectedProperty && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.form
              onSubmit={handleSubmit}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-[#1A1F2E] p-6 rounded-xl max-w-xl w-full"
            >
              <h2 className="text-2xl font-bold mb-4">
                Apply for {selectedProperty.title}
              </h2>

              <input name="fullName" placeholder="Full Name" onChange={handleInputChange} className="w-full mb-2 p-2" required />
              <input name="email" placeholder="Email" onChange={handleInputChange} className="w-full mb-2 p-2" required />
              <input name="phone" placeholder="Phone" onChange={handleInputChange} className="w-full mb-2 p-2" required />
              <input type="date" name="moveInDate" onChange={handleInputChange} className="w-full mb-2 p-2" required />

              <textarea name="message" placeholder="Additional notes" className="w-full mb-3 p-2" />

              <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
                Submit Application
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedBackground>
  );
};

export default Listings;
