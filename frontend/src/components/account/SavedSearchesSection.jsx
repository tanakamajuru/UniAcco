import React, { useState, useEffect } from 'react';
import { Search, Bell, TrendingDown, Home, Lock, Plus, X, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const SavedSearchesSection = ({ hasPremiumAccess }) => {
  const [savedSearches, setSavedSearches] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSearch, setNewSearch] = useState({
    name: '',
    location: '',
    priceMin: '',
    priceMax: '',
    propertyType: 'any',
    alerts: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedSearches();
    fetchAlerts();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_BASE_URL}/api/searches/saved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedSearches(data);
      }
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_BASE_URL}/api/alerts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const createSavedSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_BASE_URL}/api/searches/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSearch)
      });

      if (response.ok) {
        setShowCreateForm(false);
        setNewSearch({
          name: '',
          location: '',
          priceMin: '',
          priceMax: '',
          propertyType: 'any',
          alerts: false
        });
        fetchSavedSearches();
      }
    } catch (error) {
      console.error('Error creating saved search:', error);
    }
  };

  const deleteSavedSearch = async (searchId) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_BASE_URL}/api/searches/${searchId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchSavedSearches();
      }
    } catch (error) {
      console.error('Error deleting saved search:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Saved Searches */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Search className="w-5 h-5" />
            Saved Searches
          </h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Search
          </button>
        </div>

        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border rounded-lg p-4 mb-4"
          >
            <h4 className="font-medium mb-3">Create New Saved Search</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Search name"
                value={newSearch.name}
                onChange={(e) => setNewSearch({...newSearch, name: e.target.value})}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Location"
                value={newSearch.location}
                onChange={(e) => setNewSearch({...newSearch, location: e.target.value})}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Min price"
                value={newSearch.priceMin}
                onChange={(e) => setNewSearch({...newSearch, priceMin: e.target.value})}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max price"
                value={newSearch.priceMax}
                onChange={(e) => setNewSearch({...newSearch, priceMax: e.target.value})}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="alerts"
                checked={newSearch.alerts}
                onChange={(e) => setNewSearch({...newSearch, alerts: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="alerts" className="text-sm">Enable alerts</label>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={createSavedSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Search
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {savedSearches.length > 0 ? (
          <div className="space-y-3">
            {savedSearches.map((search) => (
              <motion.div
                key={search.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{search.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {search.location} • {search.propertyType}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${search.priceMin} - ${search.priceMax}
                    </p>
                    {search.alerts && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mt-2">
                        <Bell className="w-3 h-3" />
                        Alerts enabled
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteSavedSearch(search.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No saved searches yet</p>
        )}
      </div>

      {/* Alerts & Notifications */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Alerts & Notifications
        </h3>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert.type === 'availability' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{alert.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No new alerts</p>
        )}
      </div>

      {/* Availability Alerts - Premium Only */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Home className="w-5 h-5" />
          Availability Alerts
        </h3>
        {hasPremiumAccess ? (
          <div className="space-y-3">
            <p className="text-gray-600">
              Get notified when properties matching your criteria become available.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Configure Availability Alerts
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-3">Premium feature</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Upgrade to Premium
            </button>
          </div>
        )}
      </div>

      {/* Price Drop Alerts - Premium Only */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Price Drop Alerts
        </h3>
        {hasPremiumAccess ? (
          <div className="space-y-3">
            <p className="text-gray-600">
              Never miss a deal! Get notified when prices drop for your saved properties.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Configure Price Alerts
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-3">Premium feature</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Upgrade to Premium
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSearchesSection;
