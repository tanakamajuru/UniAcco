import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { motion } from 'framer-motion';
import '../styles/brand-colors.css';

export default function Contacts() {
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    // Compile message for WhatsApp
    const whatsappMessage = `*New Contact Form Submission*%0A%0A` +
      `*Name:* ${firstName} ${lastName}%0A` +
      `*Email:* ${email}%0A` +
      `*Phone:* ${phone || 'Not provided'}%0A` +
      `*Subject:* ${subject}%0A%0A` +
      `*Message:*%0A${message}`;
    
    // Redirect to WhatsApp
    window.open(`https://wa.link/3looae?text=${whatsappMessage}`, '_blank');
  };

  return (
    <AnimatedBackground variant="morphing">
      <div className="min-h-screen bg-gradient-to-b from-[#F5F7FA]/80 to-white/80 dark:from-[#0F1419]/80 dark:to-[#1A1F2E]/80 backdrop-blur-sm pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-[#1A1F2E] dark:text-[#F5F7FA] mb-6">
            Get In <span className="text-[#4A90E2]">Touch</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#4A5568] dark:text-[#C7D2E0] max-w-4xl mx-auto leading-relaxed">
            Have a question or ready to start your project? We're here to help you every step of the way with expert guidance and support.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-white/95 dark:bg-[#1A1F2E]/95 backdrop-blur-sm border-[#D1DDE8] dark:border-[#2E4057] shadow-xl">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-[#1A1F2E] dark:text-[#F5F7FA]">Contact Information</CardTitle>
                  <CardDescription className="text-lg text-[#4A5568] dark:text-[#C7D2E0]">
                    Reach out to us through any of these channels
                  </CardDescription>
                </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#4A90E2] to-[#64B5F6] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Phone className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#1A1F2E] dark:text-[#F5F7FA] mb-2">Phone</h3>
                    <p className="text-[#4A5568] dark:text-[#C7D2E0] text-lg">+263 24 2701234</p>
                    <p className="text-[#4A5568] dark:text-[#C7D2E0] text-lg">+263 77 123 4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
                    <p className="text-gray-600 dark:text-gray-300">info@bluestrike.co.zw</p>
                    <p className="text-gray-600 dark:text-gray-300">sales@bluestrike.co.zw</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Office Location</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Bluestrike Investments Ltd<br />
                      123 Samora Machel Avenue<br />
                      Harare, Zimbabwe<br />
                      P.O. Box 4567, Harare
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Business Hours</h3>
                    <p className="text-gray-600 dark:text-gray-300">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p className="text-gray-600 dark:text-gray-300">Saturday: 9:00 AM - 2:00 PM</p>
                    <p className="text-gray-600 dark:text-gray-300">Sunday: Closed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>

            {/* Emergency Contact */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-[#4A90E2] to-[#1E88E5] text-white border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">24/7 Emergency Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90 mb-4 text-lg">
                    For urgent maintenance or technical support, call our emergency hotline:
                  </p>
                  <p className="text-3xl font-bold text-white">+263 71 234 5678</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-white/95 dark:bg-[#1A1F2E]/95 backdrop-blur-sm border-[#D1DDE8] dark:border-[#2E4057] shadow-xl">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-[#1A1F2E] dark:text-[#F5F7FA]">Send Us a Message</CardTitle>
                <CardDescription className="text-lg text-[#4A5568] dark:text-[#C7D2E0]">
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[#1A1F2E] dark:text-[#F5F7FA] font-medium">First Name *</Label>
                    <Input 
                      id="firstName" 
                      name="firstName"
                      placeholder="John" 
                      required 
                      className="bg-white dark:bg-[#2E4057] text-[#1A1F2E] dark:text-[#F5F7FA] border-[#D1DDE8] dark:border-[#4A5568] focus:border-[#4A90E2] dark:focus:border-[#64B5F6]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[#1A1F2E] dark:text-[#F5F7FA] font-medium">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      name="lastName"
                      placeholder="Doe" 
                      required 
                      className="bg-white dark:bg-[#2E4057] text-[#1A1F2E] dark:text-[#F5F7FA] border-[#D1DDE8] dark:border-[#4A5568] focus:border-[#4A90E2] dark:focus:border-[#64B5F6]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#1A1F2E] dark:text-[#F5F7FA] font-medium">Email *</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="john.doe@example.com" 
                    required 
                    className="bg-white dark:bg-[#2E4057] text-[#1A1F2E] dark:text-[#F5F7FA] border-[#D1DDE8] dark:border-[#4A5568] focus:border-[#4A90E2] dark:focus:border-[#64B5F6]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#1A1F2E] dark:text-[#F5F7FA] font-medium">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    type="tel" 
                    placeholder="+263 77 123 4567" 
                    className="bg-white dark:bg-[#2E4057] text-[#1A1F2E] dark:text-[#F5F7FA] border-[#D1DDE8] dark:border-[#4A5568] focus:border-[#4A90E2] dark:focus:border-[#64B5F6]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-[#1A1F2E] dark:text-[#F5F7FA] font-medium">Subject *</Label>
                  <Input 
                    id="subject" 
                    name="subject"
                    placeholder="How can we help you?" 
                    required 
                    className="bg-white dark:bg-[#2E4057] text-[#1A1F2E] dark:text-[#F5F7FA] border-[#D1DDE8] dark:border-[#4A5568] focus:border-[#4A90E2] dark:focus:border-[#64B5F6]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-[#1A1F2E] dark:text-[#F5F7FA] font-medium">Message *</Label>
                  <Textarea 
                    id="message" 
                    name="message"
                    placeholder="Tell us more about your project or inquiry..." 
                    rows={5}
                    required 
                    className="bg-white dark:bg-[#2E4057] text-[#1A1F2E] dark:text-[#F5F7FA] border-[#D1DDE8] dark:border-[#4A5568] focus:border-[#4A90E2] dark:focus:border-[#64B5F6] resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="!w-full !inline-flex !items-center !justify-center !gap-3 !bg-[#4A90E2] !text-[#FFFFFF] hover:!bg-[#1E88E5] hover:!text-[#FFFFFF] active:!bg-[#0D47A1] dark:!bg-[#4A90E2] dark:!text-[#FFFFFF] dark:hover:!bg-[#64B5F6] dark:hover:!text-[#FFFFFF] dark:active:!bg-[#90CAF9] dark:active:!text-[#1A1F2E] !px-6 !py-3 !text-base !font-semibold !shadow-xl hover:!shadow-2xl hover:!scale-105 !transition-all !duration-200 !rounded-lg !cursor-pointer !border-0 !outline-none"
                  style={{
                    width: '100%',
                    backgroundColor: '#4A90E2',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1E88E5';
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#4A90E2';
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <Send className="mr-3 h-6 w-6" />
                  Send Message
                </button>
              </form>
            </CardContent>
          </Card>
          </motion.div>
        </div>

        {/* Google Maps Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-white/95 dark:bg-[#1A1F2E]/95 backdrop-blur-sm border-[#D1DDE8] dark:border-[#2E4057] shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-[#1A1F2E] dark:text-[#F5F7FA]">Find Us on the Map</CardTitle>
              <CardDescription className="text-lg text-[#4A5568] dark:text-[#C7D2E0]">
                Visit our office at 123 Samora Machel Avenue, Harare
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full h-[450px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3798.2076842857844!2d31.047619!3d-17.829166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1931a4f0b8b0b0b1%3A0x1234567890abcdef!2sSamora%20Machel%20Avenue%2C%20Harare%2C%20Zimbabwe!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bluestrike Office Location"
                  className="dark:grayscale dark:invert-[0.1]"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </div>
    </AnimatedBackground>
  );
}
