import React, { useState, useEffect } from 'react';
import { useNavigation } from '../App';
import { 
  Home, 
  Edit, 
  Trash2, 
  Plus, 
  Eye, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const MyListings = () => {
  const { navigate } = useNavigation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_BASE_URL}/api/properties/landlord`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const data = await response.json();
      setListings(data);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load your listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(id);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }

      // Remove the deleted listing from state
      setListings(listings.filter(listing => listing._id !== id));
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Failed to delete listing. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { text: 'Active', color: 'bg-success/15 text-success' },
      pending: { text: 'Pending Review', color: 'bg-warning/15 text-warning' },
      rejected: { text: 'Rejected', color: 'bg-error/15 text-error' },
      draft: { text: 'Draft', color: 'bg-bg-surface-alt text-text-primary' },
      rented: { text: 'Rented', color: 'bg-brand-primary/15 text-brand-primaryDark' }
    };

    const statusInfo = statusMap[status] || { text: status, color: 'bg-bg-surface-alt text-text-primary' };
    
    return (
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primaryDark"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="w-12 h-12 bg-error/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-error" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Listings</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={fetchListings}
            className="bg-brand-primaryDark text-white px-4 py-2 rounded-lg hover:bg-brand-primary transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-surface-alt py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Listings</h1>
            <p className="mt-1 text-sm text-text-muted">
              Manage your property listings and view their performance
            </p>
          </div>
          <button
            onClick={() => navigate('list-your-property')}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primaryDark hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add New Property
          </button>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <Home className="mx-auto h-12 w-12 text-text-muted" />
              <h3 className="mt-2 text-lg font-medium text-text-primary">No properties listed</h3>
              <p className="mt-1 text-sm text-text-muted">
                Get started by adding your first property.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('list-your-property')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primaryDark hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Add Property
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {listings.map((listing) => (
                <motion.li
                  key={listing._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16 bg-bg-surface-alt rounded-md overflow-hidden">
                          {listing.images && listing.images.length > 0 ? (
                            <img
                              className="h-full w-full object-cover"
                              src={listing.images[0]}
                              alt={listing.title}
                            />
                          ) : (
                            <div className="h-full w-full bg-bg-surface-alt flex items-center justify-center">
                              <Home className="h-8 w-8 text-text-muted" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-text-primary">{listing.title}</h3>
                            <div className="ml-2">
                              {getStatusBadge(listing.status || 'draft')}
                            </div>
                          </div>
                          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                            <div className="mt-2 flex items-center text-sm text-text-muted">
                              <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-text-muted" />
                              {listing.location?.city}, {listing.location?.country}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-text-muted">
                              <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-text-muted" />
                              ${listing.price?.toLocaleString()} {listing.rentalPeriod || 'per month'}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-text-muted">
                              <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-text-muted" />
                              {listing.capacity} {listing.capacity === 1 ? 'person' : 'people'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex space-x-2">
                        <button
                          onClick={() => navigate(`/property/${listing._id}`)}
                          className="p-2 rounded-full text-text-muted hover:text-text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                          <span className="sr-only">View</span>
                        </button>
                        <button
                          onClick={() => navigate(`/edit-property/${listing._id}`)}
                          className="p-2 rounded-full text-brand-primaryDark hover:text-brand-primaryDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(listing._id)}
                          disabled={isDeleting === listing._id}
                          className="p-2 rounded-full text-error hover:text-error focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          title="Delete"
                        >
                          {isDeleting === listing._id ? (
                            <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-text-muted">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-text-muted" />
                          Listed on {new Date(listing.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-text-muted sm:mt-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-primary/15 text-brand-primaryDark">
                          {listing.views || 0} views
                        </span>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/15 text-success">
                          {listing.enquiries || 0} enquiries
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
