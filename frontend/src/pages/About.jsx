import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Users, Target, Award, Shield, Heart, Star } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { motion } from 'framer-motion';
import '../styles/brand-colors.css';

export default function About() {
  const stats = [
    { value: '500+', label: 'Active Listings' },
    { value: '2,000+', label: 'Happy Students' },
    { value: '15+', label: 'Campus Locations' },
    { value: '4.7★', label: 'Average Rating' }
  ];

  const features = [
    {
      icon: <Home className="w-8 h-8 text-blue-600" />,
      title: 'Wide Range of Options',
      description: 'Find the perfect accommodation that fits your needs and budget, from shared rooms to private apartments.'
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: 'Verified Listings',
      description: 'All our listings are thoroughly vetted to ensure quality and safety for our students.'
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: 'Student-Focused',
      description: 'Designed specifically for students, with features like proximity to campus and student-friendly pricing.'
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: 'Top-Rated',
      description: 'Join thousands of students who have found their perfect home through our platform.'
    }
  ];

  const testimonials = [
    {
      quote: "Found my perfect place just a 5-minute walk from campus. The process was so easy!",
      author: "Tendai M., University of Zimbabwe",
      rating: 5
    },
    {
      quote: "As a property owner, I've had great success renting to responsible students through UniAcco.",
      author: "Mrs. Ndlovu, Property Owner",
      rating: 5
    },
    {
      quote: "The customer service is amazing. They helped me find accommodation even after hours!",
      author: "Blessing K., Midlands State University",
      rating: 5
    }
  ];

  const teamMembers = [
    {
      name: 'Tendai Moyo',
      role: 'CEO & Founder',
      bio: 'Passionate about solving student housing challenges with technology.'
    },
    {
      name: 'Nomsa Ndlovu',
      role: 'Head of Operations',
      bio: 'Ensuring smooth operations and excellent user experiences.'
    },
    {
      name: 'Blessing Kambasha',
      role: 'Customer Support',
      bio: 'Dedicated to helping students find their perfect accommodation.'
    }
  ];

  const values = [
    {
      icon: <Award className="w-10 h-10 text-white" />,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, ensuring quality service and satisfaction.'
    },
    {
      icon: <Users className="w-10 h-10 text-white" />,
      title: 'Integrity',
      description: 'We conduct business with honesty, transparency, and respect for all our users.'
    },
    {
      icon: <Target className="w-10 h-10 text-white" />,
      title: 'Innovation',
      description: 'We embrace innovation to provide the best student accommodation experience.'
    }
  ];

  return (
    <AnimatedBackground variant="morphing">
      <div className="min-h-screen overflow-y-auto">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-[#0F1419] dark:via-[#1A1F2E] dark:to-[#2E4057]"></div>
          <div className="absolute inset-0 bg-white/40 dark:bg-black/20"></div>
          
          <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">UniAcco</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                Connecting students with safe, affordable, and convenient accommodation near their universities across Zimbabwe.
              </p>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Find Your Home
              </Button>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-[#1A1F2E] p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-gray-50 dark:bg-[#1A1F2E] px-4 sm:px-6 lg:px-8">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-white dark:bg-[#1A1F2E] p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100 dark:border-gray-800">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    To simplify the student housing search by providing a trusted platform that connects students with safe, 
                    affordable, and convenient accommodation options near their universities across Zimbabwe.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white dark:bg-[#1A1F2E] p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100 dark:border-gray-800">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    To become the leading student accommodation platform in Zimbabwe, known for reliability, 
                    transparency, and exceptional service in helping students find their perfect home away from home.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0F1419]">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose UniAcco?</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                We're committed to making your student housing search simple, safe, and stress-free.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 bg-white dark:bg-[#1A1F2E] rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-800"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50 dark:bg-[#1A1F2E] px-4 sm:px-6 lg:px-8">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Find your perfect student accommodation in just a few simple steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  number: '1',
                  title: 'Search & Filter',
                  description: 'Use our advanced filters to find properties that match your preferences and budget.'
                },
                {
                  number: '2',
                  title: 'View Listings',
                  description: 'Browse through verified listings with detailed descriptions, photos, and reviews.'
                },
                {
                  number: '3',
                  title: 'Contact & Visit',
                  description: 'Reach out to property owners and schedule viewings at your convenience.'
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative p-8 bg-white dark:bg-[#1A1F2E] rounded-2xl shadow-lg hover:shadow-xl transition-shadow group"
                >
                  <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0F1419]">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Our Users Say</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Don't just take our word for it - hear from students and property owners who use UniAcco
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-[#1A1F2E] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic mb-4">"{testimonial.quote}"</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{testimonial.author}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Find Your Perfect Student Home?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of students who have already found their ideal accommodation through UniAcco
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold">
                Browse Listings
              </Button>
              <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold">
                List Your Property
              </Button>
            </div>
          </div>
        </section>

      {/* Core Values Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Our Core Values</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              The principles that guide everything we do at UniAcco
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Award className="w-10 h-10 text-white" />,
                title: 'Excellence',
                description: 'We strive for excellence in everything we do, ensuring quality service and satisfaction.'
              },
              {
                icon: <Users className="w-10 h-10 text-white" />,
                title: 'Integrity',
                description: 'We conduct business with honesty, transparency, and respect for all our users.'
              },
              {
                icon: <Target className="w-10 h-10 text-white" />,
                title: 'Innovation',
                description: 'We embrace innovation to provide the best student accommodation experience.'
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                <p className="text-blue-50">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white dark:bg-[#0F1419] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Team</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Meet the dedicated team behind UniAcco
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Tendai Moyo',
                role: 'CEO & Founder',
                bio: 'Passionate about solving student housing challenges with technology.'
              },
              {
                name: 'Nomsa Ndlovu',
                role: 'Head of Operations',
                bio: 'Ensuring smooth operations and excellent user experiences.'
              },
              {
                name: 'Blessing Kambasha',
                role: 'Customer Support',
                bio: 'Dedicated to helping students find their perfect accommodation.'
              }
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-[#1A1F2E] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-800"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-1">{member.name}</h3>
                <p className="text-center text-blue-600 dark:text-blue-400 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-300 text-center">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Our Expertise
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              With years of experience in student accommodation, our team brings 
              unparalleled expertise and innovation to every student's housing needs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 w-full mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-6xl font-bold text-white mb-4">10+</div>
              <p className="text-xl text-white/90">Years of Experience</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-6xl font-bold text-white mb-4">850+</div>
              <p className="text-xl text-white/90">Projects Completed</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-6xl font-bold text-white mb-4">98%</div>
              <p className="text-xl text-white/90">Client Satisfaction</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <button 
              className="!inline-flex !items-center !justify-center !gap-2 !bg-transparent !text-[#4A90E2] !border-2 !border-[#4A90E2] hover:!bg-[#F5F7FA] hover:!text-[#1E88E5] hover:!border-[#1E88E5] dark:!bg-transparent dark:!text-[#64B5F6] dark:!border-[#64B5F6] dark:hover:!bg-[rgba(74,144,226,0.15)] dark:hover:!text-[#90CAF9] dark:hover:!border-[#90CAF9] !px-6 !py-3 !text-base !font-semibold hover:!scale-105 !transition-all !duration-200 !rounded-lg !cursor-pointer"
              style={{
                backgroundColor: 'transparent',
                color: '#4A90E2',
                border: '2px solid #4A90E2',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#F5F7FA';
                e.target.style.color = '#1E88E5';
                e.target.style.borderColor = '#1E88E5';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#4A90E2';
                e.target.style.borderColor = '#4A90E2';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Join Our Team
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  </AnimatedBackground>
  );
}
