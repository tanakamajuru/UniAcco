import { useState } from 'react';
import { Search, MapPin, Star, Filter, Home as HomeIcon, Wifi, Utensils, BookOpen, Droplets, Dumbbell, WashingMachine, Snowflake, Tv2, X, Check, User, Mail, Phone, Calendar, Info } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { motion, AnimatePresence } from 'framer-motion';

const Listings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
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
    'Chinhoyi University of Technology'
  ];

  const campuses = [
    'Main Campus',
    'Medical Campus',
    'Engineering Campus',
    'Business School',
    'Arts Campus'
  ];

  const amenities = [
    { id: 'wifi', label: 'WiFi', icon: <Wifi className="w-4 h-4" /> },
    { id: 'meals', label: 'Meals Included', icon: <Utensils className="w-4 h-4" /> },
    { id: 'study', label: 'Study Room', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'water', label: '24/7 Water', icon: <Droplets className="w-4 h-4" /> },
    { id: 'gym', label: 'Gym', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'laundry', label: 'Laundry', icon: <WashingMachine className="w-4 h-4" /> },
    { id: 'ac', label: 'Air Conditioning', icon: <Snowflake className="w-4 h-4" /> },
    { id: 'tv', label: 'TV Lounge', icon: <Tv2 className="w-4 h-4" /> },
  ];

  const properties = [
    {
      id: 1,
      name: 'Sunrise Student Residences',
      campus: 'Main Campus',
      distance: '0.5 km',
      price: 350,
      rating: 4.8,
      reviews: 128,
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=500&fit=crop',
      description: 'Modern student accommodation with all necessary amenities. Located just 5 minutes walk from the main campus. Features 24/7 security, study rooms, and a vibrant student community.',
      amenities: ['wifi', 'meals', 'study', 'water', 'gym', 'laundry'],
      availableUnits: 5,
      minStay: '6 months'
    },
    {
      id: 2,
      name: 'Campus View Lodge',
      campus: 'Engineering Campus',
      distance: '0.3 km',
      price: 420,
      rating: 4.9,
      reviews: 95,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop',
      amenities: ['wifi', 'gym', 'laundry', 'ac'],
      available: 3
    },
    {
      id: 3,
      name: "Scholar's Haven",
      campus: 'Main Campus',
      distance: '1.2 km',
      price: 290,
      rating: 4.6,
      reviews: 87,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop',
      amenities: ['wifi', 'meals', 'laundry', 'tv'],
      available: 8
    },
    {
      id: 4,
      name: 'University Heights',
      campus: 'Medical Campus',
      distance: '0.7 km',
      price: 380,
      rating: 4.7,
      reviews: 112,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop',
      amenities: ['wifi', 'study', 'water', 'ac'],
      available: 2
    },
    {
      id: 5,
      name: 'The Student Hub',
      campus: 'Business School',
      distance: '0.4 km',
      price: 410,
      rating: 4.9,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop',
      amenities: ['wifi', 'study', 'gym', 'laundry'],
      available: 1
    },
    {
      id: 6,
      name: 'Campus Living',
      campus: 'Arts Campus',
      distance: '0.9 km',
      price: 320,
      rating: 4.5,
      reviews: 64,
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=500&fit=crop',
      amenities: ['wifi', 'meals', 'water', 'tv'],
      available: 4
    },
  ];

  const toggleAmenity = (amenityId) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const filteredProperties = properties.filter(property => {
    // Filter by search query
    if (searchQuery && !property.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by university and campus
    if (selectedUniversity && property.university !== selectedUniversity) {
      return false;
    }
    
    if (selectedCampus && property.campus !== selectedCampus) {
      return false;
    }
    
    // Filter by price range
    if (property.price < priceRange[0] || property.price > priceRange[1]) {
      return false;
    }
    
    // Filter by amenities
    if (selectedAmenities.length > 0 && 
        !selectedAmenities.every(amenity => property.amenities.includes(amenity))) {
      return false;
    }
    
    return true;
  });

  const handleApplyNow = (property) => {
    setSelectedProperty(property);
    setShowApplicationForm(true);
  };

  const handleApplicationSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Application submitted:', { ...applicationForm, propertyId: selectedProperty.id });
    // Reset form and close modal
    setShowApplicationForm(false);
    setApplicationForm({
      fullName: '',
      email: '',
      phone: '',
      moveInDate: '',
      message: '',
      termsAgreed: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <AnimatedBackground variant="morphing">
      <div className="min-h-screen pt-24 pb-16 w-full">
        {/* Search and Filter Section */}
        <div className="w-full px-4 sm:px-6 lg:px-8 mb-12">
          <div className="bg-white dark:bg-[#1A1F2E] rounded-2xl shadow-xl p-6 w-full">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Find Your Perfect Student Accommodation</h1>
            
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2E4057] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by property name, area, or street..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* University Selector */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">University</label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2E4057] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Universities</option>
                  {universities.map((uni) => (
                    <option key={uni} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Campus Selector */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campus</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={selectedCampus}
                    onChange={(e) => setSelectedCampus(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2E4057] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Campuses</option>
                    {campuses.map((campus) => (
                      <option key={campus} value={campus}>
                        {campus}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Price Range */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              {/* Toggle Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  {showFilters ? 'Hide Filters' : 'More Filters'}
                </button>
              </div>
            </div>
            
            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {amenities.map((amenity) => (
                    <button
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                        selectedAmenities.includes(amenity.id)
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200'
                          : 'bg-white dark:bg-[#2E4057] border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2E4057]'
                      }`}
                    >
                      {amenity.icon}
                      <span>{amenity.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Results Section */}
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="w-full flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Found
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2E4057] text-gray-900 dark:text-white px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
                <option>Distance</option>
              </select>
            </div>
          </div>
          
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <motion.div 
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-[#1A1F2E] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden w-full">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-[#2E4057]/90 text-gray-900 dark:text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                    ${property.price}<span className="text-xs text-gray-500 dark:text-gray-400">/month</span>
                  </div>
                  {property.availableUnits > 0 && (
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {property.availableUnits} {property.availableUnits === 1 ? 'Room' : 'Rooms'} Left
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{property.name}</h3>
                    <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded text-sm">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      {property.rating}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{property.campus} • {property.distance} from campus</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.amenities.map((amenityId) => {
                      const amenity = amenities.find(a => a.id === amenityId);
                      return amenity ? (
                        <span 
                          key={amenityId}
                          className="flex items-center gap-1 bg-gray-100 dark:bg-[#2E4057] text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
                        >
                          {amenity.icon}
                          <span className="ml-1">{amenity.label}</span>
                        </span>
                      ) : null;
                    })}
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-gray-600 text-sm mb-1">Available Units: {property.availableUnits}</p>
                    <p className="text-gray-600 text-sm mb-2">Minimum Stay: {property.minStay}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {property.amenities.map(amenityId => {
                        const amenity = amenities.find(a => a.id === amenityId);
                        return amenity ? (
                          <span key={amenityId} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {amenity.icon}
                            <span className="ml-1">{amenity.label}</span>
                          </span>
                        ) : null;
                      })}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-gray-600 text-sm">From</p>
                        <p className="text-lg font-semibold">${property.price}<span className="text-sm font-normal text-gray-500">/month</span></p>
                      </div>
                      <button 
                        onClick={() => handleApplyNow(property)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <HomeIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No properties found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Application Form Modal */}
      <AnimatePresence>
        {showApplicationForm && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#1A1F2E] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Apply for {selectedProperty.name}
                </h2>
                <button 
                  onClick={() => setShowApplicationForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleApplicationSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={applicationForm.fullName}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[#2E4057] dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={applicationForm.email}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[#2E4057] dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={applicationForm.phone}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[#2E4057] dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Move-in Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="moveInDate"
                        value={applicationForm.moveInDate}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[#2E4057] dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Additional Information</label>
                  <textarea
                    name="message"
                    value={applicationForm.message}
                    onChange={handleInputChange}
                    rows="3"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[#2E4057] dark:text-white"
                    placeholder="Any special requirements or questions..."
                  ></textarea>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="termsAgreed"
                      type="checkbox"
                      checked={applicationForm.termsAgreed}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#2E4057]"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="font-medium text-gray-700 dark:text-gray-300">
                      I agree to the <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">Terms and Conditions</a>
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">By submitting this form, you agree to our privacy policy and terms of service.</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2E4057] hover:bg-gray-50 dark:hover:bg-[#3a4d6a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatedBackground>
  );
};

export default Listings;
