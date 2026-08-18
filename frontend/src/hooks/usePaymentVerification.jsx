import { useState, useEffect } from 'react';

/**
 * Hook to check if user has paid for specific features
 * @param {string} featureName - Name of the feature to check
 * @param {string} accommodationId - Optional accommodation ID for accommodation-specific features
 * @returns {Object} - { hasPaid, isLoading, error }
 */
export const usePaymentVerification = (featureName, accommodationId = null) => {
  const [hasPaid, setHasPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        // Check if user has any successful payments
        const response = await fetch(`${API_BASE_URL}/api/payments/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to check payment status');
        }

        const data = await response.json();
        const payments = data.payments || [];

        // Check if user has any paid payments
        const hasSuccessfulPayments = payments.some(payment => 
          payment.status === 'paid' && 
          (!accommodationId || payment.accommodation_id === accommodationId)
        );

        // Feature-specific logic
        let featureUnlocked = false;
        
        switch (featureName) {
          case 'booking':
            // User can book if they have any successful payment
            featureUnlocked = hasSuccessfulPayments;
            break;
            
          case 'messaging':
            // Messaging unlocked after first successful payment
            featureUnlocked = hasSuccessfulPayments;
            break;
            
          case 'advanced_search':
            // Advanced search unlocked after any payment
            featureUnlocked = hasSuccessfulPayments;
            break;
            
          case 'premium_support':
            // Premium support unlocked after successful payment
            featureUnlocked = hasSuccessfulPayments;
            break;
            
          case 'accommodation_details':
            // Full details unlocked for paid accommodations
            if (accommodationId) {
              featureUnlocked = payments.some(payment => 
                payment.status === 'paid' && 
                payment.accommodation_id === accommodationId
              );
            }
            break;
            
          default:
            // Default: any successful payment unlocks the feature
            featureUnlocked = hasSuccessfulPayments;
        }

        setHasPaid(featureUnlocked);
        setError(null);
        
      } catch (err) {
        setError(err.message);
        setHasPaid(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPaymentStatus();

    // Listen for payment successful events
    const handlePaymentSuccess = (event) => {
      const { reference, data } = event.detail;
      
      // Update localStorage with new payment info
      localStorage.setItem('paymentSuccess', 'true');
      localStorage.setItem('paymentReference', reference);
      if (data.accommodationId) {
        localStorage.setItem('paidAccommodationId', data.accommodationId);
      }
      
      // Re-check payment status
      checkPaymentStatus();
    };

    window.addEventListener('paymentSuccessful', handlePaymentSuccess);

    return () => {
      window.removeEventListener('paymentSuccessful', handlePaymentSuccess);
    };
  }, [featureName, accommodationId]);

  return { hasPaid, isLoading, error };
};

/**
 * Hook to check if user has paid for specific accommodation
 * @param {string} accommodationId - ID of the accommodation
 * @returns {Object} - { hasPaid, isLoading, error }
 */
export const useAccommodationPayment = (accommodationId) => {
  return usePaymentVerification('accommodation_details', accommodationId);
};

/**
 * Hook to check if user has made any payment (general features)
 * @returns {Object} - { hasPaid, isLoading, error }
 */
export const useGeneralPayment = () => {
  return usePaymentVerification('booking');
};

/**
 * Component to show payment required message
 * @param {Object} props - Component props
 * @param {string} props.featureName - Name of the locked feature
 * @param {Function} props.onUpgrade - Callback when user wants to upgrade
 */
export const PaymentRequired = ({ featureName, onUpgrade, message = null }) => {
  const { hasPaid, isLoading } = usePaymentVerification(featureName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primaryDark"></div>
        <span className="ml-2 text-text-secondary">Checking payment status...</span>
      </div>
    );
  }

  if (hasPaid) {
    // Feature is unlocked, don't show anything
    return null;
  }

  return (
    <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-4">
      <div className="flex items-center">
        <div className="text-warning mr-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-warning mb-1">
            {featureName} - Premium Feature
          </h3>
          <p className="text-warning text-sm mb-3">
            {message || `This is a premium feature. Please make a payment to unlock ${featureName}.`}
          </p>
          <button
            onClick={onUpgrade}
            className="bg-brand-primaryDark text-white px-4 py-2 rounded-lg hover:bg-brand-primary transition-colors"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default usePaymentVerification;
