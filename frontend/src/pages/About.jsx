import { Button } from '@/components/ui/button';
import { Home, Users, Target, Award, Shield, Heart, Star } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { motion } from 'framer-motion';
import { useNavigation } from '../App';

export default function About() {
  const { navigate } = useNavigation();

  const stats = [
    { value: '500+', label: 'Active Listings' },
    { value: '2,000+', label: 'Happy Students' },
    { value: '15+', label: 'Campus Locations' },
    { value: '4.7★', label: 'Average Rating' },
  ];

  const features = [
    {
      icon: Home,
      title: 'Wide Range of Options',
      description:
        'Find the perfect accommodation that fits your needs and budget, from shared rooms to private apartments.',
    },
    {
      icon: Shield,
      title: 'Verified Listings',
      description: 'All our listings are thoroughly vetted to ensure quality and safety for our students.',
    },
    {
      icon: Heart,
      title: 'Student-Focused',
      description:
        'Designed specifically for students, with features like proximity to campus and student-friendly pricing.',
    },
    {
      icon: Star,
      title: 'Top-Rated',
      description: 'Join thousands of students who have found their perfect home through our platform.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Search & Filter',
      description: 'Use our advanced filters to find properties that match your preferences and budget.',
    },
    {
      number: '2',
      title: 'View Listings',
      description: 'Browse through verified listings with detailed descriptions, photos, and reviews.',
    },
    {
      number: '3',
      title: 'Contact & Visit',
      description: 'Reach out to property owners and schedule viewings at your convenience.',
    },
  ];

  const testimonials = [
    {
      quote: 'Found my perfect place just a 5-minute walk from campus. The process was so easy!',
      author: 'Tendai M., University of Zimbabwe',
      rating: 5,
    },
    {
      quote: "As a property owner, I've had great success renting to responsible students through UniAcco.",
      author: 'Mrs. Ndlovu, Property Owner',
      rating: 5,
    },
    {
      quote: 'The customer service is amazing. They helped me find accommodation even after hours!',
      author: 'Blessing K., Midlands State University',
      rating: 5,
    },
  ];

  const values = [
    { icon: Award, title: 'Excellence', description: 'We strive for excellence in everything we do, ensuring quality service and satisfaction.' },
    { icon: Users, title: 'Integrity', description: 'We conduct business with honesty, transparency, and respect for all our users.' },
    { icon: Target, title: 'Innovation', description: 'We embrace innovation to provide the best student accommodation experience.' },
  ];

  const teamMembers = [
    { name: 'Tanaka Majuru', role: 'CEO & Founder', bio: 'Passionate about solving student housing challenges with technology.' },
    { name: 'Hazel Makwinjah', role: 'Head of Operations', bio: 'Ensuring smooth operations and excellent user experiences.' },
    { name: 'Kai Majuru', role: 'Customer Support', bio: 'Dedicated to helping students find their perfect accommodation.' },
  ];

  return (
    <AnimatedBackground variant="morphing">
      <div className="min-h-screen overflow-y-auto bg-bg-page">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-bg-page via-bg-surface-alt to-bg-surface" />

          <div className="relative z-10 mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-16 text-center"
            >
              <h1 className="mb-6 text-4xl font-bold text-text-primary md:text-6xl">
                About <span className="text-brand-primaryDark">UniAcco</span>
              </h1>
              <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-text-secondary">
                Connecting students with safe, affordable, and convenient accommodation near their universities
                across Zimbabwe.
              </p>
              <Button
                onClick={() => navigate('listings')}
                className="bg-brand-primaryDark text-white hover:bg-brand-primary"
              >
                Find Your Home
              </Button>
            </motion.div>

            {/* Stats */}
            <div className="grid w-full grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-xl border border-border bg-bg-surface p-6 text-center shadow-card transition-shadow hover:shadow-lg"
                >
                  <div className="mb-2 text-3xl font-bold text-brand-primaryDark">{stat.value}</div>
                  <div className="text-text-secondary">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="bg-bg-surface-alt px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="rounded-2xl border border-border bg-bg-surface p-8 shadow-card transition-shadow hover:shadow-lg">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primaryDark shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="mb-4 text-2xl font-bold text-text-primary">Our Mission</h2>
                  <p className="leading-relaxed text-text-secondary">
                    To simplify the student housing search by providing a trusted platform that connects students
                    with safe, affordable, and convenient accommodation options near their universities across
                    Zimbabwe.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="rounded-2xl border border-border bg-bg-surface p-8 shadow-card transition-shadow hover:shadow-lg">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent shadow-lg">
                    <Award className="h-8 w-8 text-brand-primaryDark" />
                  </div>
                  <h2 className="mb-4 text-2xl font-bold text-text-primary">Our Vision</h2>
                  <p className="leading-relaxed text-text-secondary">
                    To become the leading student accommodation platform in Zimbabwe, known for reliability,
                    transparency, and exceptional service in helping students find their perfect home away from
                    home.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-bg-surface px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-text-primary">Why Choose UniAcco?</h2>
              <p className="mx-auto max-w-3xl text-xl text-text-secondary">
                We're committed to making your student housing search simple, safe, and stress-free.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="rounded-xl border border-border bg-bg-surface p-6 shadow-card transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                      <Icon className="h-6 w-6 text-brand-primaryDark" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-text-primary">{feature.title}</h3>
                    <p className="text-text-secondary">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-bg-surface-alt px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-text-primary">How It Works</h2>
              <p className="mx-auto max-w-3xl text-xl text-text-secondary">
                Find your perfect student accommodation in just a few simple steps
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative rounded-2xl border border-border bg-bg-surface p-8 pt-10 shadow-card transition-shadow hover:shadow-lg"
                >
                  <div className="absolute -top-6 left-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primaryDark text-xl font-bold text-white shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="mb-3 mt-4 text-xl font-semibold text-text-primary">{step.title}</h3>
                  <p className="text-text-secondary">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-bg-surface px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-text-primary">What Our Users Say</h2>
              <p className="mx-auto max-w-3xl text-xl text-text-secondary">
                Don't just take our word for it — hear from students and property owners who use UniAcco
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-xl border border-border bg-bg-surface p-6 shadow-card transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < testimonial.rating ? 'fill-current text-brand-accent' : 'text-border-strong'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mb-4 italic text-text-secondary">"{testimonial.quote}"</p>
                  <p className="text-sm font-medium text-text-primary">{testimonial.author}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="bg-brand-primaryDark px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white">Our Core Values</h2>
              <p className="mx-auto max-w-3xl text-xl text-white/80">
                The principles that guide everything we do at UniAcco
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm transition-shadow hover:shadow-xl"
                  >
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="mb-3 text-center text-xl font-semibold text-white">{value.title}</h3>
                    <p className="text-center text-white/80">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="bg-bg-surface px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-text-primary">Our Team</h2>
              <p className="mx-auto max-w-3xl text-xl text-text-secondary">Meet the dedicated team behind UniAcco</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-xl border border-border bg-bg-surface p-6 shadow-card transition-shadow hover:shadow-lg"
                >
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-brand-primaryDark text-2xl font-bold text-white">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <h3 className="mb-1 text-center text-xl font-semibold text-text-primary">{member.name}</h3>
                  <p className="mb-3 text-center font-medium text-brand-primaryDark">{member.role}</p>
                  <p className="text-center text-text-secondary">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Expertise */}
        <section className="bg-brand-primaryDark px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">Our Expertise</h2>
              <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-white/80">
                With years of experience in student accommodation, our team brings unparalleled expertise and
                innovation to every student's housing needs.
              </p>
            </motion.div>

            <div className="mb-12 grid w-full gap-8 md:grid-cols-3">
              {[
                { value: '10+', label: 'Years of Experience' },
                { value: '850+', label: 'Projects Completed' },
                { value: '98%', label: 'Client Satisfaction' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 * (index + 1) }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="mb-4 text-6xl font-bold text-white">{item.value}</div>
                  <p className="text-xl text-white/80">{item.label}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Button
                variant="outline"
                className="border-2 border-white bg-transparent text-white hover:bg-white/10"
                onClick={() => navigate('auth')}
              >
                Join Our Team
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-brand-accent px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-brand-primaryDark">
              Ready to Find Your Perfect Student Home?
            </h2>
            <p className="mx-auto mb-8 max-w-3xl text-xl text-brand-primaryDark/80">
              Join thousands of students who have already found their ideal accommodation through UniAcco
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                onClick={() => navigate('listings')}
                className="bg-brand-primaryDark px-8 py-6 text-lg font-semibold text-white hover:bg-brand-primary"
              >
                Browse Listings
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('list-your-property')}
                className="border-2 border-brand-primaryDark bg-transparent px-8 py-6 text-lg font-semibold text-brand-primaryDark hover:bg-brand-primaryDark/10"
              >
                List Your Property
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AnimatedBackground>
  );
}
