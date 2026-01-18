import React, { useState, useEffect } from 'react';
import { useNavigation } from '../App';

const PaymentForm = ({ accommodation, onPaymentSuccess, onCancel }) => {
  const { navigate } = useNavigation();
  const [paymentMethod, setPaymentMethod] = useState('web'); // 'web' or 'mobile'
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    mobileMethod: 'ecocash', // 'ecocash' or 'onemoney'
    amount: accommodation.price_per_month,
    accommodationId: accommodation.id
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);

  const token = localStorage.getItem('token');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Please login to make a payment');
      navigate('auth');
      return;
    }

    if (paymentMethod === 'mobile' && !formData.phone) {
      setError('Phone number is required for mobile payments');
      return;
    }

    if (!formData.email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const paymentData = {
        accommodationId: formData.accommodationId,
        amount: formData.amount,
        email: formData.email,
        paymentMethod
      };

      if (paymentMethod === 'mobile') {
        paymentData.phone = formData.phone;
        paymentData.method = formData.mobileMethod;
      }

      const response = await fetch(`${API_BASE_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      if (data.success) {
        setPaymentStatus('initiated');
        
        if (paymentMethod === 'web' && data.redirectUrl) {
          // Redirect to PayNow for web payment
          window.location.href = data.redirectUrl;
        } else if (paymentMethod === 'mobile' && data.instructions) {
          // Show mobile payment instructions
          setPaymentStatus('instructions');
          // Store poll URL for status checking
          localStorage.setItem('paymentPollUrl', data.pollUrl);
          localStorage.setItem('paymentReference', data.reference);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!localStorage.getItem('paymentReference')) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/payments/status/${localStorage.getItem('paymentReference')}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success && data.status === 'paid') {
        setPaymentStatus('paid');
        localStorage.removeItem('paymentPollUrl');
        localStorage.removeItem('paymentReference');
        onPaymentSuccess && onPaymentSuccess(data);
      } else {
        setPaymentStatus('pending');
      }
    } catch (err) {
      console.error('Status check failed:', err);
    }
  };

  // Auto-check payment status every 10 seconds for mobile payments
  useEffect(() => {
    if (paymentStatus === 'instructions') {
      const interval = setInterval(checkPaymentStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [paymentStatus]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{accommodation.title}</h3>
          <p className="text-gray-600 mb-4">{accommodation.address}, {accommodation.city}</p>
          <div className="text-2xl font-bold text-blue-600">
            ${accommodation.price_per_month} USD/month
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {paymentStatus === 'paid' ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-green-600 mb-2">Payment Successful!</h3>
            <p className="text-gray-600">Your booking has been confirmed.</p>
            <button
              onClick={() => navigate('bookings')}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              View My Bookings
            </button>
          </div>
        ) : paymentStatus === 'instructions' ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Mobile Payment Instructions</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <p className="text-sm text-gray-700">
                Please follow the instructions sent to your phone to complete the payment.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                We're automatically checking for payment confirmation...
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={checkPaymentStatus}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Check Status
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('web')}
                  className={`p-3 border rounded-lg ${
                    paymentMethod === 'web'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-sm font-medium">Web Payment</div>
                  <div className="text-xs text-gray-500">Pay with card/bank</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mobile')}
                  className={`p-3 border rounded-lg ${
                    paymentMethod === 'mobile'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-sm font-medium">Mobile Money</div>
                  <div className="text-xs text-gray-500">EcoCash/OneMoney</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>

            {paymentMethod === 'mobile' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required={paymentMethod === 'mobile'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="077X XXX XXX or 071X XXX XXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Money Method
                  </label>
                  <select
                    name="mobileMethod"
                    value={formData.mobileMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ecocash">EcoCash</option>
                    <option value="onemoney">OneMoney</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Pay ${formData.amount} USD`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;
