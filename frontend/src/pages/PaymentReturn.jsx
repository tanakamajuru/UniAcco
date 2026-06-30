import React, { useState, useEffect } from 'react';
import { useNavigation } from '../App';

const PaymentReturn = () => {
  const { navigate } = useNavigation();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    // Pesepay returns ?referenceNumber=...; keep older params as fallbacks.
    const paymentReference =
      urlParams.get('referenceNumber') ||
      urlParams.get('reference') ||
      urlParams.get('merchantReference');

    if (!paymentReference) {
      setStatus('error');
      setMessage('No payment reference found');
      return;
    }

    setReference(paymentReference);
    checkPaymentStatus(paymentReference);
  }, []);

  const checkPaymentStatus = async (reference) => {
    const token = localStorage.getItem('token');
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/status/${reference}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        if (data.status === 'paid') {
          setStatus('success');
          setMessage('Payment successful! Your booking has been confirmed.');
          
          // Store payment success in localStorage for feature unlocking
          localStorage.setItem('paymentSuccess', 'true');
          localStorage.setItem('paymentReference', reference);
          localStorage.setItem('paidAccommodationId', data.accommodationId || '');
          
          // Trigger custom event for other components to listen
          window.dispatchEvent(new CustomEvent('paymentSuccessful', {
            detail: { reference, data }
          }));
        } else {
          setStatus('pending');
          setMessage('Payment is being processed. Please wait...');
          // Check again after 5 seconds
          setTimeout(() => checkPaymentStatus(reference), 5000);
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Payment verification failed');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Unable to verify payment status');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment.</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong>Reference:</strong> {reference}
              </p>
              <p className="text-xs text-green-600 mt-2">
                You will receive a confirmation email shortly.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('bookings')}
                className="w-full bg-btn-primary text-text-inverse py-3 px-4 rounded-lg hover:bg-btn-primary-hover"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate('home')}
                className="w-full bg-btn-secondary text-btn-secondary-text py-3 px-4 rounded-lg hover:bg-btn-secondary-hover"
              >
                Back to Home
              </button>
            </div>
          </div>
        );

      case 'pending':
        return (
          <div className="text-center">
            <div className="animate-pulse text-blue-600 text-6xl mb-4">⏳</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Payment Processing</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Reference:</strong> {reference}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                This page will automatically update when payment is confirmed.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => checkPaymentStatus(reference)}
                className="w-full bg-btn-primary text-text-inverse py-3 px-4 rounded-lg hover:bg-btn-primary-hover"
              >
                Check Status Again
              </button>
              <button
                onClick={() => navigate('home')}
                className="w-full bg-btn-secondary text-btn-secondary-text py-3 px-4 rounded-lg hover:bg-btn-secondary-hover"
              >
                Back to Home
              </button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">✕</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Reference:</strong> {reference}
              </p>
              <p className="text-xs text-red-600 mt-2">
                If you believe this is an error, please contact support.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('home')}
                className="w-full bg-btn-primary text-text-inverse py-3 px-4 rounded-lg hover:bg-btn-primary-hover"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('support')}
                className="w-full bg-btn-secondary text-btn-secondary-text py-3 px-4 rounded-lg hover:bg-btn-secondary-hover"
              >
                Contact Support
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Status</h1>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentReturn;
