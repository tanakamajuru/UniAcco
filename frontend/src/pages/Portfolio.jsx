import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, Zap, Box, Building2, Factory, Home, ArrowRight, Award, Users, Calendar } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import ImageSlider from '@/components/ImageSlider';
import { motion } from 'framer-motion';

export default function Portfolio() {
  // Portfolio project categories with images  
  const portfolioCategories = [
    {
      id: "containers",
      title: "Container Solutions",
      icon: Box,
      description: "Custom container modifications and specialized housing solutions",
      color: "blue",
      images: [
        {
          src: "/src/assets/portfolio/Containers/IMG-20251006-WA0056.jpg",
          alt: "Custom Container Modification",
          title: "Industrial Container Solutions",
          description: "Specialized container modifications for industrial applications"
        },
        {
          src: "/src/assets/portfolio/Containers/IMG-20251006-WA0057.jpg",
          alt: "Container Housing Project",
          title: "Container Housing Development",
          description: "Modern container-based housing solutions with full amenities"
        },
        {
          src: "/src/assets/portfolio/Containers/IMG-20251006-WA0058.jpg",
          alt: "Commercial Container Setup",
          title: "Commercial Container Complex",
          description: "Multi-unit container facility for commercial operations"
        },
        {
          src: "/src/assets/portfolio/Containers/IMG-20251006-WA0059.jpg",
          alt: "Container Office Space",
          title: "Mobile Office Solutions",
          description: "Portable office containers with modern workspace design"
        },
        {
          src: "/src/assets/portfolio/Containers/IMG-20251006-WA0060.jpg",
          alt: "Container Storage Facility",
          title: "Storage Container Systems",
          description: "Secure storage solutions with climate control systems"
        },
        {
          src: "/src/assets/portfolio/Containers/IMG-20251006-WA0061.jpg",
          alt: "Container Workshop",
          title: "Workshop Container Units",
          description: "Fully equipped workshop containers for industrial use"
        }
      ],
      stats: {
        projects: "85+",
        capacity: "200+ Units",
        savings: "45%"
      }
    },
    {
      id: "generators",
      title: "Power Generation Systems",
      icon: Zap,
      description: "Industrial generators and reliable backup power solutions for critical operations",
      color: "green",
      images: [
        {
          src: "/src/assets/portfolio/Generators/IMG-20251006-WA0080.jpg",
          alt: "Industrial Generator Installation",
          title: "Heavy-Duty Industrial Generators",
          description: "High-capacity diesel generators for manufacturing facilities"
        },
        {
          src: "/src/assets/portfolio/Generators/IMG-20251006-WA0082.jpg",
          alt: "Generator Control Systems",
          title: "Advanced Control Systems",
          description: "Automated generator control panels with remote monitoring"
        },
        {
          src: "/src/assets/portfolio/Generators/IMG-20251006-WA0084.jpg",
          alt: "Commercial Generator Setup",
          title: "Commercial Power Solutions",
          description: "Reliable backup power for commercial buildings and offices"
        },
        {
          src: "/src/assets/portfolio/Generators/IMG-20251006-WA0085.jpg",
          alt: "Generator Installation Process",
          title: "Professional Installation",
          description: "Expert installation with full compliance and testing"
        },
        {
          src: "/src/assets/portfolio/Generators/IMG-20251006-WA0086.jpg",
          alt: "Multiple Generator Array",
          title: "Multi-Unit Generator Systems",
          description: "Parallel generator configurations for maximum reliability"
        },
        {
          src: "/src/assets/portfolio/Generators/IMG-20251006-WA0087.jpg",
          alt: "Generator Housing",
          title: "Weather-Protected Installations",
          description: "Custom housing solutions for outdoor generator installations"
        }
      ],
      stats: {
        projects: "200+",
        capacity: "35MW+",
        uptime: "99.9%"
      }
    },
    {
      id: "solar",
      title: "Solar Energy Solutions",
      icon: Sun,
      description: "Cutting-edge solar installations powering sustainable futures",
      color: "yellow",
      images: [
        {
          src: "/src/assets/portfolio/Containers/IMG-20251006-WA0070.jpg",
          alt: "Commercial Solar Installation",
          title: "Commercial Solar Array",
          description: "500kW rooftop solar system for manufacturing facility"
        },
        {
          src: "/src/assets/portfolio/Containers/IMG-20251006-WA0071.jpg",
          alt: "Solar Panel Installation",
          title: "Industrial Solar Project",
          description: "Large-scale solar installation with advanced monitoring systems"
        },
        {
          src: "/src/assets/portfolio/Containers/IMG-20251006-WA0072.jpg",
          alt: "Solar Farm Development",
          title: "Solar Farm Development",
          description: "Multi-megawatt solar farm providing clean energy to communities"
        },
        {
          src: "/src/assets/portfolio/Containers/IMG-20251006-WA0073.jpg",
          alt: "Residential Solar",
          title: "Residential Solar Solutions",
          description: "Home solar installations with battery storage systems"
        }
      ],
      stats: {
        projects: "150+",
        capacity: "50MW+",
        savings: "60%"
      }
    }
  ];

  const achievements = [
    {
      icon: Award,
      title: "Industry Excellence",
      description: "Recognized leader in sustainable energy solutions across East Africa"
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "50+ certified engineers and technicians with decades of experience"
    },
    {
      icon: Calendar,
      title: "Proven Track Record",
      description: "Over 10 years of successful project delivery and client satisfaction"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
    };
    return colors[color] || colors.blue;
  };

  const getBorderClasses = (color) => {
    const colors = {
      yellow: "border-yellow-200 dark:border-yellow-800",
      blue: "border-blue-200 dark:border-blue-800",
      purple: "border-purple-200 dark:border-purple-800"
    };
    return colors[color] || colors.blue;
  };

  return (
    <AnimatedBackground variant="morphing">
      <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-white/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-sm pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Empowering Innovation with
              <span className="block text-blue-600 dark:text-blue-400">
                Cutting-Edge Technology
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8">
              Discover our portfolio of successful projects spanning solar energy, power generation, 
              and custom container solutions across East Africa.
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-4 gap-6 mb-16"
          >
            <Card className="text-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-4xl font-bold text-blue-600 dark:text-blue-400">850+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Projects Delivered</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-4xl font-bold text-blue-600 dark:text-blue-400">150MW+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Solar Capacity Installed</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-4xl font-bold text-blue-600 dark:text-blue-400">300+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Generators Installed</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-4xl font-bold text-blue-600 dark:text-blue-400">1500+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Containers Fabricated</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Portfolio Categories */}
          <div className="space-y-20">
            {portfolioCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.section
                  key={category.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="space-y-8"
                >
                  {/* Category Header */}
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${getColorClasses(category.color)} mb-4`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      {category.title}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                      {category.description}
                    </p>
                  </div>

                  {/* Project Images Slider */}
                  <Card className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 ${getBorderClasses(category.color)} shadow-xl`}>
                    <CardContent className="p-8">
                      <ImageSlider 
                        images={category.images} 
                        autoplay={true}
                        autoplayDelay={5000}
                      />
                    </CardContent>
                  </Card>

                  {/* Category Stats */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {Object.entries(category.stats).map(([key, value], statIndex) => (
                      <Card key={key} className={`text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border ${getBorderClasses(category.color)}`}>
                        <CardContent className="p-6">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {value}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.section>
              );
            })}
          </div>

          {/* Achievements Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose BlueStrike?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our commitment to excellence and innovation sets us apart in the industry
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  >
                    <Card className="text-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                      <CardContent className="p-8">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                          {achievement.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {achievement.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-20 text-center bg-[#E8EEF4] dark:bg-[#2E4057] rounded-3xl p-12 shadow-2xl border border-[#D1DDE8] dark:border-[#4A5568]"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1F2E] dark:text-[#F5F7FA] mb-6">
              Ready to Start Your Next Project?
            </h2>
            <p className="text-xl text-[#2E4057] dark:text-[#E8EEF4] mb-8 max-w-3xl mx-auto leading-relaxed">
              Let's collaborate to bring your vision to life with our proven expertise and innovative solutions
            </p>
            <button 
              className="!inline-flex !items-center !gap-2 !bg-[#FFFFFF] !text-[#4A90E2] hover:!bg-[#F5F7FA] hover:!text-[#1E88E5] dark:!bg-[#1A1F2E] dark:!text-[#64B5F6] dark:hover:!bg-[#2E4057] dark:hover:!text-[#90CAF9] !px-8 !py-4 !rounded-xl !font-semibold !text-lg !transition-all !duration-200 !shadow-xl hover:!shadow-2xl hover:!scale-105 !cursor-pointer !border-0 !outline-none"
              style={{
                backgroundColor: '#4A90E2',
                color: '#FFFFFF',
                border: 'none',
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: '600',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1E88E5';
                e.target.style.color = '#FFFFFF';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#4A90E2';
                e.target.style.color = '#FFFFFF';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              }}
            >
              Get Started Today
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </div>
    </AnimatedBackground>
  );
}
