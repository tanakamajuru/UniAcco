import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Lock, Crown, User, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const MessagesSection = ({ hasPremiumAccess }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          message: message
        })
      });

      if (response.ok) {
        setMessage('');
        // Refresh conversation
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!hasPremiumAccess) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <Lock className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
        <p className="text-text-secondary mb-4">
          Message landlords directly to get quick responses and negotiate better deals.
        </p>
        <button className="bg-brand-primaryDark text-white px-6 py-2 rounded-lg hover:bg-brand-primary transition-colors">
          Upgrade to Premium
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primaryDark mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="border-b p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Chat with Landlords
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 h-96">
        {/* Conversations List */}
        <div className="border-r lg:col-span-1 overflow-y-auto">
          {conversations.length > 0 ? (
            <div className="divide-y">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full p-4 text-left hover:bg-bg-surface-alt transition-colors ${ selectedConversation?.id === conversation.id ? 'bg-brand-primary/10' : '' }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-bg-surface-alt rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{conversation.landlordName}</h4>
                      <p className="text-sm text-text-secondary truncate">{conversation.lastMessage}</p>
                      <p className="text-xs text-text-muted">{conversation.timestamp}</p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-brand-primaryDark text-white text-xs rounded-full px-2 py-1">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-text-muted">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-text-muted" />
              <p>No conversations yet</p>
              <p className="text-sm">Start chatting with landlords when you make inquiries</p>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-bg-surface-alt rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedConversation.landlordName}</h4>
                    <p className="text-xs text-text-muted">Active now</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages?.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${ msg.sender === 'user' ? 'bg-brand-primaryDark text-white' : 'bg-bg-surface-alt text-text-primary' }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${ msg.sender === 'user' ? 'text-white/80' : 'text-text-muted' }`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-brand-primaryDark text-white p-2 rounded-lg hover:bg-brand-primary transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesSection;
