import React, { useState } from 'react';
import { usePaymentVerification, PaymentRequired } from '../hooks/usePaymentVerification';
import { useNavigation } from '../App';
import PaymentForm from './PaymentForm';

/**
 * Premium Features Component - Shows locked/unlocked features based on payment status
 */
const PremiumFeatures = ({ accommodationId = null }) => {
  const { navigate } = useNavigation();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState('');

  // Check payment status for different features
  const { hasPaid: hasBooked, isLoading: bookingLoading } = usePaymentVerification('booking');
  const { hasPaid: canMessage, isLoading: messagingLoading } = usePaymentVerification('messaging');
  const { hasPaid: hasAdvancedSearch, isLoading: searchLoading } = usePaymentVerification('advanced_search');
  const { hasPaid: hasPremiumSupport, isLoading: supportLoading } = usePaymentVerification('premium_support');
  const { hasPaid: hasAccommodationDetails, isLoading: detailsLoading } = usePaymentVerification('accommodation_details', accommodationId);

  const handleUpgrade = (featureName) => {
    setSelectedFeature(featureName);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedFeature('');
    // Refresh the page to show unlocked features
    window.location.reload();
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
    setSelectedFeature('');
  };

  if (bookingLoading || messagingLoading || searchLoading || supportLoading || detailsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Checking premium features...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Premium Features</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Feature */}
          <div className={`border rounded-lg p-4 ${hasBooked ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${hasBooked ? 'bg-green-500' : 'bg-gray-400'}`}>
                {hasBooked ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold">Accommodation Booking</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Book accommodations and manage your rental applications
            </p>
            <div className="text-sm">
              {hasBooked ? (
                <span className="text-green-600 font-medium">✓ Unlocked</span>
              ) : (
                <button
                  onClick={() => handleUpgrade('Accommodation Booking')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Unlock →
                </button>
              )}
            </div>
          </div>

          {/* Messaging Feature */}
          <div className={`border rounded-lg p-4 ${canMessage ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${canMessage ? 'bg-green-500' : 'bg-gray-400'}`}>
                {canMessage ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold">Direct Messaging</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Message landlords and other students directly
            </p>
            <div className="text-sm">
              {canMessage ? (
                <span className="text-green-600 font-medium">✓ Unlocked</span>
              ) : (
                <button
                  onClick={() => handleUpgrade('Direct Messaging')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Unlock →
                </button>
              )}
            </div>
          </div>

          {/* Advanced Search Feature */}
          <div className={`border rounded-lg p-4 ${hasAdvancedSearch ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${hasAdvancedSearch ? 'bg-green-500' : 'bg-gray-400'}`}>
                {hasAdvancedSearch ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold">Advanced Search</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Filter by distance, price range, and amenities
            </p>
            <div className="text-sm">
              {hasAdvancedSearch ? (
                <span className="text-green-600 font-medium">✓ Unlocked</span>
              ) : (
                <button
                  onClick={() => handleUpgrade('Advanced Search')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Unlock →
                </button>
              )}
            </div>
          </div>

          {/* Premium Support Feature */}
          <div className={`border rounded-lg p-4 ${hasPremiumSupport ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${hasPremiumSupport ? 'bg-green-500' : 'bg-gray-400'}`}>
                {hasPremiumSupport ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold">Premium Support</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Priority customer support and assistance
            </p>
            <div className="text-sm">
              {hasPremiumSupport ? (
                <span className="text-green-600 font-medium">✓ Unlocked</span>
              ) : (
                <button
                  onClick={() => handleUpgrade('Premium Support')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Unlock →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Accommodation-specific features */}
        {accommodationId && (
          <div className="mt-6 p-4 border rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold mb-3">This Accommodation</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Full Details & Contact Info</span>
                {hasAccommodationDetails ? (
                  <span className="text-green-600 text-sm font-medium">✓ Available</span>
                ) : (
                  <button
                    onClick={() => handleUpgrade('Accommodation Details')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Pay to Unlock →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Your Status</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Booking Access:</span>
              <span className={`ml-2 font-medium ${hasBooked ? 'text-green-600' : 'text-gray-500'}`}>
                {hasBooked ? 'Active' : 'Locked'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Messaging:</span>
              <span className={`ml-2 font-medium ${canMessage ? 'text-green-600' : 'text-gray-500'}`}>
                {canMessage ? 'Active' : 'Locked'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Advanced Search:</span>
              <span className={`ml-2 font-medium ${hasAdvancedSearch ? 'text-green-600' : 'text-gray-500'}`}>
                {hasAdvancedSearch ? 'Active' : 'Locked'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Premium Support:</span>
              <span className={`ml-2 font-medium ${hasPremiumSupport ? 'text-green-600' : 'text-gray-500'}`}>
                {hasPremiumSupport ? 'Active' : 'Locked'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Unlock {selectedFeature}</h3>
              <button
                onClick={handleCancelPayment}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <PaymentForm
              accommodation={accommodationId ? { id: accommodationId, title: selectedFeature, price_per_month: 50 } : null}
              onPaymentSuccess={handlePaymentSuccess}
              onCancel={handleCancelPayment}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumFeatures;
