
import NavBar from '@/components/NavBar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import PackageComparison from '@/components/PackageComparison';
import About from '@/components/About';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main>
        <Hero />
        <HowItWorks />
        <PackageComparison />
        <Testimonials />
        <About />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
