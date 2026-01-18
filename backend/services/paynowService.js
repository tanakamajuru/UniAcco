const { Paynow } = require('paynow');

class PayNowService {
  constructor() {
    // You'll need to get these from your PayNow dashboard
    this.integrationId = process.env.PAYNOW_INTEGRATION_ID || 'YOUR_INTEGRATION_ID';
    this.integrationKey = process.env.PAYNOW_INTEGRATION_KEY || 'YOUR_INTEGRATION_KEY';
    this.testMode = process.env.PAYNOW_TEST_MODE === 'true';
    
    this.paynow = new Paynow(this.integrationId, this.integrationKey);
    
    // Set test mode if enabled
    if (this.testMode) {
      this.paynow.resultUrl = `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/payments/webhook`;
      this.paynow.returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-return`;
      console.log('🧪 PayNow running in TEST MODE');
    } else {
      this.paynow.resultUrl = `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/payments/webhook`;
      this.paynow.returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-return`;
      console.log('🚀 PayNow running in PRODUCTION MODE');
    }
  }

  /**
   * Create a new payment for accommodation booking
   * @param {Object} bookingDetails - Booking information
   * @param {string} bookingDetails.reference - Unique booking reference
   * @param {string} bookingDetails.email - Customer email
   * @param {number} bookingDetails.amount - Payment amount
   * @param {string} bookingDetails.description - Payment description
   * @param {string} bookingDetails.accommodationTitle - Title of accommodation
   */
  async createPayment(bookingDetails) {
    try {
      const { reference, email, amount, description, accommodationTitle } = bookingDetails;
      
      // Create payment
      const payment = this.paynow.createPayment(reference, email);
      
      // Add accommodation booking as item
      payment.add(accommodationTitle || `Accommodation Booking`, amount);
      
      // Send payment to PayNow
      const response = await this.paynow.send(payment);
      
      if (response.success) {
        return {
          success: true,
          redirectUrl: response.redirectUrl,
          pollUrl: response.pollUrl,
          reference: reference
        };
      } else {
        return {
          success: false,
          error: response.error || 'Payment initiation failed'
        };
      }
    } catch (error) {
      console.error('PayNow payment creation error:', error);
      return {
        success: false,
        error: 'Payment service error'
      };
    }
  }

  /**
   * Create a mobile payment (EcoCash/OneMoney)
   * @param {Object} bookingDetails - Booking information
   * @param {string} bookingDetails.phone - Customer phone number
   * @param {string} bookingDetails.method - 'ecocash' or 'onemoney'
   */
  async createMobilePayment(bookingDetails) {
    try {
      const { reference, email, amount, description, accommodationTitle, phone, method } = bookingDetails;
      
      // Create payment
      const payment = this.paynow.createPayment(reference, email);
      
      // Add accommodation booking as item
      payment.add(accommodationTitle || `Accommodation Booking`, amount);
      
      // Send mobile payment to PayNow
      const response = await this.paynow.sendMobile(payment, phone, method);
      
      if (response.success) {
        return {
          success: true,
          instructions: response.instructions,
          pollUrl: response.pollUrl,
          reference: reference,
          testMode: this.testMode // Add test mode indicator
        };
      } else {
        return {
          success: false,
          error: response.error || 'Mobile payment initiation failed'
        };
      }
    } catch (error) {
      console.error('PayNow mobile payment creation error:', error);
      return {
        success: false,
        error: 'Mobile payment service error'
      };
    }
  }

  /**
   * Check payment status using poll URL
   * @param {string} pollUrl - The poll URL from payment response
   */
  async checkPaymentStatus(pollUrl) {
    try {
      const status = await this.paynow.pollTransaction(pollUrl);
      
      return {
        paid: status.paid(),
        status: status.status(),
        reference: status.reference(),
        paidAt: status.paidAt()
      };
    } catch (error) {
      console.error('PayNow status check error:', error);
      return {
        error: 'Status check failed'
      };
    }
  }

  /**
   * Process PayNow webhook notification
   * @param {Object} webhookData - Webhook data from PayNow
   */
  processWebhook(webhookData) {
    try {
      // Verify webhook authenticity (you may need to implement signature verification)
      const { reference, status, hash } = webhookData;
      
      return {
        reference,
        status,
        paid: status === 'paid'
      };
    } catch (error) {
      console.error('PayNow webhook processing error:', error);
      return null;
    }
  }
}

module.exports = PayNowService;
