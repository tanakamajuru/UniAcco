import { useState, useEffect } from 'react';
import { Search, MapPin, Star } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import ImageSlider from '@/components/ImageSlider';
import { motion } from 'framer-motion';
import { fetchAccommodations } from '../utils/api';
import { universityApi, campusApi, imageUrl } from '../services/api';
import { LABELS } from '../lib/amenityIcons';
import { useNavigation } from '../App';
import '../styles/brand-colors.css';

// Map an API accommodation into the shape the featured slider renders.
const toFeatured = (p) => ({
  id: p.id,
  name: p.title || p.name || 'Property',
  campus: p.suburb || p.city || 'Unknown',
  distance: p.walk_minutes ? `${p.walk_minutes} min walk` : p.university?.short || '',
  price: p.price_per_month ?? p.price ?? 0,
  rating: p.rating || 4.5,
  images: (p.images ?? []).map(imageUrl).filter(Boolean),
  amenities: (Array.isArray(p.amenities) ? p.amenities : []).slice(0, 3).map((a) => LABELS[a] || a),
  available: p.people_per_room || 1,
  description: p.description || '',
  location: p.city || 'Unknown',
  landlord: p.landlord?.name || 'Property Owner',
});

export default function Home() {
  const { navigate } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch universities and campuses on mount
  useEffect(() => {
    const fetchUniversitiesAndCampuses = async () => {
      try {
        const [universitiesData, campusesData] = await Promise.all([
          universityApi.getAll().catch(() => []),
          campusApi.getAll().catch(() => [])
        ]);

        setUniversities(universitiesData || []);
        setCampuses(campusesData || []);
      } catch (err) {
        console.error('Error fetching universities/campuses:', err);
        // Set fallback data if API fails
        setUniversities([
          { id: 1, name: 'University of Zimbabwe' },
          { id: 2, name: 'Midlands State University' },
          { id: 3, name: 'National University of Science and Technology' },
          { id: 4, name: 'Africa University' },
          { id: 5, name: 'Chinhoyi University of Technology' }
        ]);
        setCampuses([
          { id: 1, name: 'Main Campus' },
          { id: 2, name: 'Medical Campus' },
          { id: 3, name: 'Engineering Campus' },
          { id: 4, name: 'Business School' },
          { id: 5, name: 'Arts Campus' }
        ]);
      }
    };

    fetchUniversitiesAndCampuses();
  }, []);

  // Fetch properties from API
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build filters based on search criteria
        const filters = {
          is_available: true,
          ...(selectedUniversity && { university: selectedUniversity }),
          ...(selectedCampus && { campus: selectedCampus }),
          ...(searchQuery && { search: searchQuery }),
        };
        
        const data = await fetchAccommodations(filters);
        setFeaturedListings((data || []).slice(0, 6).map(toFeatured));
      } catch (err) {
        console.error('Error loading properties:', err);
        setError('Failed to load properties. Please try again later.');
        // Set empty array on error to prevent infinite loading
        setFeaturedListings([]);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [selectedUniversity, selectedCampus, searchQuery]);

  const stats = [
    { label: 'Active Listings', value: '500+' },
    { label: 'Happy Students', value: '2,000+' },
    { label: 'Campus Locations', value: universities.length || '15+' },
    { label: 'Average Rating', value: '4.7★' }
  ];

  const prevSlide = () => setCurrentSlide((s) => Math.max(0, s - 1));
  const nextSlide = () => setCurrentSlide((s) => Math.min(featuredListings.length - 1, s + 1));

  const handleSearch = () => {
    if (selectedUniversity) {
      localStorage.setItem('searchUniversity', selectedUniversity);
    }
    if (searchQuery) {
      localStorage.setItem('searchQuery', searchQuery);
    }
    navigate('listings');
  };

  return (
    <>
      <AnimatedBackground variant="morphing">
        <div className="min-h-screen overflow-y-auto snap-y snap-mandatory">
          {/* Hero Section */}
          <section className="h-screen snap-start flex items-center justify-center px-6 pt-24 relative overflow-hidden">
            {/* Brand Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-bg-page via-bg-surface-alt to-bg-surface dark:from-bg-page dark:via-bg-surface-alt dark:to-bg-surface"></div>
            <div className="absolute inset-0 bg-text-inverse/10 dark:bg-text-primary/20"></div>

            <div className="container mx-auto max-w-7xl relative z-10 px-4">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6">
                  Find Your Perfect
                  <span className="block bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                    Student Home
                  </span>
                </h1>
                <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                  Discover comfortable, affordable accommodation near your campus. Your home away from home awaits.
                </p>
              </motion.div>
            </div>

            {/* Search Filters */}
            <div className="container mx-auto max-w-5xl relative z-10 px-4">
              <div className="bg-bg-surface rounded-2xl shadow-card p-6 border border-border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* University Selector */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Select University</label>
                    <select
                      value={selectedUniversity}
                      onChange={(e) => setSelectedUniversity(e.target.value)}
                      className="w-full px-4 py-3 bg-bg-surface text-text-primary border border-border rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all duration-200 cursor-pointer"
                    >
                      <option value="">All Universities</option>
                      {universities.map((uni) => (
                        <option key={uni.id || uni} value={uni.short || uni.name || uni}>
                          {uni.name || uni}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Campus/Location Box */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Campus/Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                      <select
                        value={selectedCampus}
                        onChange={(e) => setSelectedCampus(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-bg-surface text-text-primary border border-border rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all duration-200 cursor-pointer"
                      >
                        <option value="">All Campuses</option>
                        {campuses.map((campus) => (
                          <option key={campus.id || campus} value={campus.name || campus}>
                            {campus.name || campus}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Search Box */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-2">Search Location or Property</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Enter area, street name, or property..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-bg-surface text-text-primary border border-border rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all duration-200"
                        />
                      </div>
                      <button 
                        onClick={handleSearch}
                        className="bg-gradient-to-r from-brand-primary to-brand-accent text-white px-8 py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-bold cursor-pointer"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-accent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </AnimatedBackground>

      {/* Stats Section */}
      <section className="py-16 bg-bg-surface">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-bg-surface rounded-xl p-6 text-center shadow-card hover:shadow-lg transition">
                <div className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-text-secondary text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings Slider */}
      <section className="py-16 bg-bg-surface-alt">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-text-primary">Featured Properties</h2>
              <p className="text-text-secondary mt-2">Handpicked accommodations for you</p>
            </div>
            <button onClick={() => navigate('listings')} className="text-brand-primary font-semibold hover:text-brand-primary-dark">View All →</button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-error mb-4">{error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-brand-primary text-text-inverse px-6 py-2 rounded-lg hover:bg-brand-primary-dark transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && featuredListings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-text-muted mb-4">No properties found matching your criteria.</div>
              <button 
                onClick={() => {
                  setSelectedUniversity('');
                  setSelectedCampus('');
                  setSearchQuery('');
                }}
                className="bg-brand-primary text-text-inverse px-6 py-2 rounded-lg hover:bg-brand-primary-dark transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Listings Slider */}
          {!loading && !error && featuredListings.length > 0 && (
            <div className="relative">
              {/* Slider Container */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {featuredListings.map((listing) => (
                    <div key={listing.id} className="w-full flex-shrink-0 px-4">
                      <div className="bg-bg-surface rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="relative h-48">
                          <ImageSlider 
                            images={listing.images} 
                            autoplay={true}
                            autoplayDelay={3000}
                          />
                          <div className="absolute top-4 right-4 bg-bg-elevated px-3 py-1 rounded-full text-sm font-semibold text-text-primary shadow-lg z-10">
                            ${listing.price}/mo
                          </div>
                          <div className="absolute top-4 left-4 bg-brand-primary text-text-inverse px-3 py-1 rounded-full text-xs font-semibold z-10">
                            {listing.available} Available
                          </div>
                        </div>

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-text-primary mb-2">{listing.name}</h3>

                          <div className="flex items-center text-sm text-text-secondary mb-3">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{listing.campus} • {listing.distance}</span>
                          </div>

                          <div className="flex items-center mb-4">
                            <Star className="w-4 h-4 text-brand-accent fill-current" />
                            <span className="ml-1 text-sm font-semibold text-text-primary">{listing.rating}</span>
                            <span className="ml-1 text-sm text-text-secondary">(120 reviews)</span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {listing.amenities.map((amenity, idx) => (
                              <span key={idx} className="bg-bg-surface-alt text-text-secondary px-3 py-1 rounded-full text-xs font-medium">
                                {amenity}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() => navigate('property-details', { id: listing.id })}
                            className="w-full bg-gradient-to-r from-brand-primary to-brand-accent text-text-inverse py-3 rounded-lg font-semibold hover:shadow-lg transition"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-bg-elevated rounded-full p-3 shadow-card hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                disabled={currentSlide >= featuredListings.length - 1}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-bg-elevated rounded-full p-3 shadow-card hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {featuredListings.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition ${
                      currentSlide === index ? 'bg-brand-primary w-8' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-brand-primary to-brand-accent py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-inverse mb-4">Own a Property Near Campus?</h2>
          <p className="text-xl text-brand-accent-soft mb-8 max-w-2xl mx-auto">List your accommodation and connect with students looking for their perfect home</p>
          <button onClick={() => navigate('list-your-property')} className="bg-bg-surface text-brand-primary px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition">List Your Property</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-surface text-text-muted py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm">
            <p>© 2026 UniAcco. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </>
  );
}