import React, { useState } from 'react';
import { HelpCircle, AlertCircle, FileText, Mail, Phone, MessageSquare, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const SupportSection = () => {
  const [activeTab, setActiveTab] = useState('help');
  const [issueForm, setIssueForm] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_BASE_URL}/api/support/issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(issueForm)
      });

      if (response.ok) {
        alert('Issue submitted successfully!');
        setIssueForm({
          category: '',
          subject: '',
          description: '',
          priority: 'medium'
        });
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('Failed to submit issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      question: 'How do I book accommodation?',
      answer: 'Browse available properties, select your preferred accommodation, choose your dates, and complete the booking process with payment.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept credit/debit cards, bank transfers, and PayNow for local payments.'
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking according to the property\'s cancellation policy. Check the specific terms before booking.'
    },
    {
      question: 'How do premium features work?',
      answer: 'Premium features unlock unlimited messaging, reviews, price alerts, and priority support. Upgrade anytime from your account settings.'
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we use industry-standard encryption and security measures to protect your personal information and payment details.'
    }
  ];

  const helpCategories = [
    {
      title: 'Booking & Reservations',
      items: ['How to book', 'Cancellation policy', 'Payment issues', 'Booking confirmation']
    },
    {
      title: 'Account Management',
      items: ['Profile settings', 'Password reset', 'Subscription management', 'Privacy settings']
    },
    {
      title: 'Property Issues',
      items: ['Report listing', 'Property accuracy', 'Landlord communication', 'Dispute resolution']
    },
    {
      title: 'Technical Support',
      items: ['Website issues', 'Mobile app', 'Payment problems', 'Account access']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('help')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'help'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Help Center
          </button>
          <button
            onClick={() => setActiveTab('issue')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'issue'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Report an Issue
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'terms'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Terms & Privacy
          </button>
        </div>

        {/* Help Center Tab */}
        {activeTab === 'help' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                How can we help you?
              </h3>
              
              {/* Quick Help Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {helpCategories.map((category, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{category.title}</h4>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* FAQs */}
              <div>
                <h4 className="font-medium mb-4">Frequently Asked Questions</h4>
                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <details key={index} className="border rounded-lg p-4">
                      <summary className="font-medium cursor-pointer hover:text-blue-600">
                        {faq.question}
                      </summary>
                      <p className="text-gray-600 mt-2 text-sm">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Options */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Still need help?</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Mail className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h5 className="font-medium">Email Support</h5>
                  <p className="text-sm text-gray-600">support@uniacco.com</p>
                  <p className="text-xs text-gray-500">24-48 hour response</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Phone className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <h5 className="font-medium">Phone Support</h5>
                  <p className="text-sm text-gray-600">+1 234 567 8900</p>
                  <p className="text-xs text-gray-500">Mon-Fri, 9AM-6PM</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <h5 className="font-medium">Live Chat</h5>
                  <p className="text-sm text-gray-600">Available now</p>
                  <p className="text-xs text-gray-500">Instant response</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Report Issue Tab */}
        {activeTab === 'issue' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Report an Issue
            </h3>
            
            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Category
                </label>
                <select
                  value={issueForm.category}
                  onChange={(e) => setIssueForm({...issueForm, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="booking">Booking Issue</option>
                  <option value="payment">Payment Problem</option>
                  <option value="property">Property Issue</option>
                  <option value="account">Account Problem</option>
                  <option value="technical">Technical Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={issueForm.subject}
                  onChange={(e) => setIssueForm({...issueForm, subject: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({...issueForm, description: e.target.value})}
                  rows={5}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide detailed information about your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={issueForm.priority}
                  onChange={(e) => setIssueForm({...issueForm, priority: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Submit Issue'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Terms & Privacy Tab */}
        {activeTab === 'terms' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Terms of Service
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    By using UniAcco, you agree to our terms of service which govern your use of our platform and services.
                  </p>
                  <h4 className="font-medium text-gray-800">Key Points:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Accurate information requirement</li>
                    <li>Payment terms and conditions</li>
                    <li>Cancellation and refund policies</li>
                    <li>User responsibilities</li>
                    <li>Platform usage guidelines</li>
                  </ul>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Read Full Terms →
                  </button>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Privacy Policy
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    Your privacy is important to us. Learn how we collect, use, and protect your personal information.
                  </p>
                  <h4 className="font-medium text-gray-800">What We Collect:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Personal identification</li>
                    <li>Contact information</li>
                    <li>Payment details</li>
                    <li>Usage data</li>
                    <li>Communication records</li>
                  </ul>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Read Full Privacy Policy →
                  </button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h4 className="font-medium mb-3">Your Rights</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <h5 className="font-medium mb-1">Access</h5>
                  <p className="text-gray-600">Request access to your personal data</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <h5 className="font-medium mb-1">Correction</h5>
                  <p className="text-gray-600">Update or correct your information</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <h5 className="font-medium mb-1">Deletion</h5>
                  <p className="text-gray-600">Request deletion of your data</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SupportSection;
