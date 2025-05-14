
import NavBar from "@/components/NavBar";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SEOHelmet from "@/components/SEOHelmet";

const ContactPage = () => {
  return (
    <div className="min-h-screen">
      <SEOHelmet 
        title="Contact HeritageBox® | Get Help With Your Memory Preservation"
        description="Contact our team of memory preservation specialists at HeritageBox®. We're here to answer your questions about digitizing your family photos, videos, and more."
        keywords="contact heritagebox, memory digitization help, photo scanning questions, vhs conversion support, digitization customer service"
      />
      <NavBar />
      <main>
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
