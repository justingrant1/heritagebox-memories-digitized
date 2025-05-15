
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
import SEOHelmet from '@/components/SEOHelmet';

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEOHelmet 
        title="HeritageBox® | Professional Memory Digitization Services"
        description="Don't let your precious memories fade away! HeritageBox® transforms your VHS tapes, photos, and slides into modern digital formats that will last for generations."
        keywords="memory preservation, digitize vhs, photo scanning, family archives, home videos, slide scanning, professional digitization"
        image="/lovable-uploads/dff425b2-3ade-48c8-acd8-e56366b3516d.png"
        canonical="https://heritagebox.com/" // Explicitly set canonical URL to prevent redirects
      />
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
