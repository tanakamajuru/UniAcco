import { Home as HomeIcon, Users, Target, Award, Shield, Heart, Star } from 'lucide-react';
import { useNavigation } from '../App';
import { Card, PrimaryBtn, OutlineBtn } from '../components/kit';

const FEATURES = [
  { Icon: HomeIcon, title: 'Wide Range of Options', d: 'From shared rooms to private apartments.' },
  { Icon: Shield, title: 'Verified Listings', d: 'Thoroughly vetted for quality and safety.' },
  { Icon: Heart, title: 'Student-Focused', d: 'Proximity to campus, student-friendly pricing.' },
  { Icon: Star, title: 'Top-Rated', d: 'Thousands of students found their home here.' },
];
const VALUES = [
  { Icon: Award, title: 'Excellence', d: 'Quality service and satisfaction, always.' },
  { Icon: Users, title: 'Integrity', d: 'Honesty, transparency, and respect.' },
  { Icon: Target, title: 'Innovation', d: 'The best student accommodation experience.' },
];

export default function About() {
  const { navigate } = useNavigation();
  return (
    <div>
      <section className="relative overflow-hidden px-6 pb-14 pt-16 text-center">
        <div className="relative z-10">
          <h1 className="font-display mb-5 text-[38px] font-bold text-text-primary md:text-[48px]">
            About <span className="text-brand-primary">UniAcco</span>
          </h1>
          <p className="mx-auto mb-6 max-w-xl text-lg text-text-secondary">
            Connecting students with safe, affordable, and convenient accommodation near their universities across Zimbabwe.
          </p>
          <PrimaryBtn onClick={() => navigate('listings')}>Find Your Home</PrimaryBtn>
        </div>
      </section>

      <section className="bg-bg-surface-alt px-6 py-14">
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <Card className="p-7">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primaryDark">
              <Target className="h-7 w-7 text-white" />
            </div>
            <h2 className="font-display mb-2 text-xl font-bold text-text-primary">Our Mission</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              To simplify the student housing search by providing a trusted platform that connects students with safe,
              affordable accommodation near their universities.
            </p>
          </Card>
          <Card className="p-7">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent">
              <Award className="h-7 w-7 text-brand-primaryDark" />
            </div>
            <h2 className="font-display mb-2 text-xl font-bold text-text-primary">Our Vision</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              To become the leading student accommodation platform in Zimbabwe — known for reliability, transparency, and service.
            </p>
          </Card>
        </div>
      </section>

      <section className="px-6 py-14 text-center">
        <h2 className="font-display mb-2 text-[26px] font-bold text-text-primary">Why Choose UniAcco?</h2>
        <p className="mx-auto mb-8 max-w-md text-sm text-text-secondary">
          We're committed to making your student housing search simple, safe, and stress-free.
        </p>
        <div className="mx-auto grid max-w-5xl gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10">
                <f.Icon className="h-5 w-5 text-brand-primary" />
              </div>
              <h3 className="mb-1 text-sm font-bold text-text-primary">{f.title}</h3>
              <p className="text-xs text-text-secondary">{f.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-brand-primaryDark px-6 py-14 text-center">
        <h2 className="font-display mb-2 text-[26px] font-bold text-white">Our Core Values</h2>
        <p className="mx-auto mb-8 max-w-md text-sm text-white/80">The principles that guide everything we do</p>
        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-white/20 bg-white/10 p-6">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <v.Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-white">{v.title}</h3>
              <p className="text-xs text-white/80">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-accent px-6 py-14 text-center">
        <h2 className="font-display mb-2 text-[26px] font-bold text-brand-primaryDark">
          Ready to Find Your Perfect Student Home?
        </h2>
        <p className="mx-auto mb-6 max-w-md text-sm text-brand-primaryDark/75">
          Join thousands of students who found their ideal accommodation.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <PrimaryBtn onClick={() => navigate('listings')}>Browse Listings</PrimaryBtn>
          <OutlineBtn onClick={() => navigate('list-your-property')}>List Your Property</OutlineBtn>
        </div>
      </section>
    </div>
  );
}
