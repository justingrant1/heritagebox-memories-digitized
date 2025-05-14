
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHelmet from "@/components/SEOHelmet";

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHelmet 
        title="About Us | HeritageBox® Memory Preservation Specialists"
        description="Learn about HeritageBox®'s mission to preserve family memories and connect generations through innovative digitization technology."
        keywords="about heritagebox, memory preservation company, family archiving, digitization experts, photo scanning service, vhs conversion professionals"
      />
      <NavBar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">Our Story</h1>
              <p className="text-lg md:text-xl font-light mb-8">
                Preserving memories and connecting generations through innovative technology
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">Our Mission</h2>
              <p className="mb-6">
                At HeritageBox, our mission is to preserve the irreplaceable memories that connect families across generations. We believe that every photograph, home video, and recorded moment represents a piece of your unique family history that deserves to be protected and shared.
              </p>
              <p className="mb-6">
                Founded in 2015 by a team of archivists, photographers, and technology enthusiasts, HeritageBox was born from a simple observation: as technology evolves, the ability to access older media formats diminishes, putting precious memories at risk of being lost forever.
              </p>
              <p>
                Today, we've helped over 50,000 families across America safeguard their legacy by converting outdated media formats into accessible digital files that can be easily shared, stored, and enjoyed for generations to come.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/lovable-uploads/c9c3910b-c1ef-4cb5-9a7e-e1df6afdf7f3.png" 
                alt="Family looking at photo album together" 
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-primary text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4 text-secondary">Preservation</h3>
                  <p>
                    We treat every item with exceptional care, understanding that each photo or video represents an irreplaceable moment in your family's story.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4 text-secondary">Innovation</h3>
                  <p>
                    We continually evolve our technology and processes to provide the highest quality digital conversions for all media formats.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4 text-secondary">Connection</h3>
                  <p>
                    We believe in the power of shared memories to strengthen relationships and build bridges between generations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-primary text-center">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 rounded-full overflow-hidden mx-auto w-32 h-32">
                    <img 
                      src="/lovable-uploads/49950c00-87a9-4b47-ab2b-ac89e4f79cb3.png" 
                      alt="Sarah Johnson - Founder & CEO" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-center">Sarah Johnson</h3>
                  <p className="text-sm text-gray-500 mb-2 text-center">Founder & CEO</p>
                  <p className="text-sm text-center">
                    Former archivist with 15+ years of experience in media preservation
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 rounded-full overflow-hidden mx-auto w-32 h-32">
                    <img 
                      src="/lovable-uploads/b448b3fc-ae42-4ba5-b66a-caecc548b7dc.png" 
                      alt="David Chen - Technical Director" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-center">David Chen</h3>
                  <p className="text-sm text-gray-500 mb-2 text-center">Technical Director</p>
                  <p className="text-sm text-center">
                    Digital conversion specialist with background in photography
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 rounded-full overflow-hidden mx-auto w-32 h-32">
                    <img 
                      src="/lovable-uploads/ddab1909-1056-4ba3-b659-01c0cd97369f.png" 
                      alt="Maria Rodriguez - Customer Relations" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-center">Maria Rodriguez</h3>
                  <p className="text-sm text-gray-500 mb-2 text-center">Customer Relations</p>
                  <p className="text-sm text-center">
                    Passionate about helping families preserve their heritage
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 rounded-full overflow-hidden mx-auto w-32 h-32">
                    <img 
                      src="/lovable-uploads/c9c3910b-c1ef-4cb5-9a7e-e1df6afdf7f3.png" 
                      alt="James Wilson - Lead Technician" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-center">James Wilson</h3>
                  <p className="text-sm text-gray-500 mb-2 text-center">Lead Technician</p>
                  <p className="text-sm text-center">
                    Expert in restoration and enhancement of damaged media
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">Ready to Preserve Your Memories?</h2>
            <p className="mb-8 max-w-2xl mx-auto">
              Join thousands of families who have trusted HeritageBox with their precious memories. Our team is ready to help you preserve your legacy.
            </p>
            <Link to="/package-selected?package=Popular">
              <Button className="bg-secondary text-primary hover:bg-secondary-light font-medium px-8 py-6 h-auto text-base">
                Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
