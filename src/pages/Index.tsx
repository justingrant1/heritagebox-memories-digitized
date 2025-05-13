
import NavBar from '@/components/NavBar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import PackageComparison from '@/components/PackageComparison';
import About from '@/components/About';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import EmailPopup from '@/components/EmailPopup';
import EmailSignup from '@/components/EmailSignup';

const Index = () => {
  return (
    <div className="min-h-screen">
      <EmailPopup />
      <NavBar />
      <main>
        <Hero />
        <HowItWorks />
        <PackageComparison />
        <About />
        <Testimonials />
        <EmailSignup />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
