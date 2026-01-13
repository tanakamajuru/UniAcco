import { useState, useEffect } from 'react';
import { Search, MapPin, Star } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import ImageSlider from '@/components/ImageSlider';
import { motion } from 'framer-motion';
import { fetchAccommodations } from '../utils/api';
import '../styles/brand-colors.css';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch properties from API
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const data = await fetchAccommodations();
        
        // Normalize the data and take first 3 as featured
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
            id: p.id,
            name: p.title,
            campus: p.city || 'Unknown',
            distance: 'N/A',
            price: p.price_per_month,
            rating: 4.5, // Default rating
            images: normalizedImages,
            amenities: Object.keys(normalizedAmenities).filter(key => normalizedAmenities[key]).slice(0, 3),
            available: p.people_per_room || 1
          };
        }).slice(0, 3); // Take first 3 properties as featured

        setFeaturedListings(normalized);
      } catch (err) {
        console.error('Error loading properties:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

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

  const stats = [
    { label: 'Active Listings', value: '500+' },
    { label: 'Happy Students', value: '2,000+' },
    { label: 'Campus Locations', value: '15+' },
    { label: 'Average Rating', value: '4.7★' }
  ];

  const prevSlide = () => setCurrentSlide((s) => Math.max(0, s - 1));
  const nextSlide = () => setCurrentSlide((s) => Math.min(featuredListings.length - 1, s + 1));

  return (
    <>
      <AnimatedBackground variant="morphing">
        <div className="min-h-screen overflow-y-auto snap-y snap-mandatory">
          {/* Hero Section */}
          <section className="h-screen snap-start flex items-center justify-center px-6 pt-24 relative overflow-hidden">
            {/* Brand Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F5F7FA] via-[#E8EEF4] to-[#D1DDE8] dark:from-[#0F1419] dark:via-[#1A1F2E] dark:to-[#2E4057]"></div>
            <div className="absolute inset-0 bg-white/40 dark:bg-black/20"></div>

            <div className="container mx-auto max-w-7xl relative z-10 px-4">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                  Find Your Perfect
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Student Home
                  </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Discover comfortable, affordable accommodation near your campus. Your home away from home awaits.
                </p>
              </motion.div>
            </div>

            {/* Search Filters */}
            <div className="container mx-auto max-w-5xl relative z-10 px-4">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* University Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select University</label>
                    <select
                      value={selectedUniversity}
                      onChange={(e) => setSelectedUniversity(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Universities</option>
                      {universities.map((uni) => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </select>
                  </div>

                  {/* Campus Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campus/Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={selectedCampus}
                        onChange={(e) => setSelectedCampus(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Campuses</option>
                        {campuses.map((campus) => (
                          <option key={campus} value={campus}>{campus}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Search Box */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Location or Property</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Enter area, street name, or property..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition font-semibold">
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </AnimatedBackground>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-[#1A1F2E]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings Slider */}
      <section className="py-16 bg-gray-50 dark:bg-[#1A1F2E]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
              <p className="text-gray-600 mt-2">Handpicked accommodations for you</p>
            </div>
            <button className="text-blue-600 font-semibold hover:text-blue-700">View All →</button>
          </div>

          <div className="relative">
            {/* Slider Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featuredListings.map((listing) => (
                  <div key={listing.id} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <div className="relative h-48">
                        <ImageSlider 
                          images={listing.images} 
                          autoplay={true}
                          autoplayDelay={3000}
                        />
                        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-900 shadow-lg z-10">
                          ${listing.price}/mo
                        </div>
                        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                          {listing.available} Available
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.name}</h3>

                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{listing.campus} • {listing.distance}</span>
                        </div>

                        <div className="flex items-center mb-4">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm font-semibold text-gray-900">{listing.rating}</span>
                          <span className="ml-1 text-sm text-gray-600">(120 reviews)</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {listing.amenities.map((amenity, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                              {amenity}
                            </span>
                          ))}
                        </div>

                        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition">
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
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide >= featuredListings.length - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    currentSlide === index ? 'bg-blue-600 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Own a Property Near Campus?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">List your accommodation and connect with students looking for their perfect home</p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition">List Your Property</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm">
            <p> 2023 CampusStay. All rights reserved.</p>
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