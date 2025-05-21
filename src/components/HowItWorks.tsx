
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How HeritageBox Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our simple 4-step process makes it easy to preserve your precious memories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="bg-cream rounded-xl p-6 text-center transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-primary text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Choose Your Package</h3>
            <p className="text-gray-600 mb-6">
              Select the package that best fits your digitization needs
            </p>
            <img
              src="/lovable-uploads/6be70ac4-77e8-4125-ad40-2c5b9793f9dd.png"
              alt="Family looking at photo album together"
              className="w-full h-40 object-contain rounded-lg mb-4"
            />
            <Link
              to="/package-selected?package=Popular"
              className="text-primary font-medium flex items-center justify-center gap-2 hover:underline"
            >
              View Packages <ArrowRight size={18} />
            </Link>
          </div>

          {/* Step 2 */}
          <div className="bg-cream rounded-xl p-6 text-center transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-primary text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Receive Your Kit</h3>
            <p className="text-gray-600 mb-6">
              We'll send you a secure shipping kit with everything you need
            </p>
            <img
              src="/lovable-uploads/c9c3910b-c1ef-4cb5-9a7e-e1df6afdf7f3.png"
              alt="Person preparing to digitize VHS tapes"
              className="w-full h-40 object-contain rounded-lg mb-4"
            />
            <span className="text-gray-500">Delivered in 3-5 business days</span>
          </div>

          {/* Step 3 */}
          <div className="bg-cream rounded-xl p-6 text-center transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-primary text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Ship Your Memories</h3>
            <p className="text-gray-600 mb-6">
              Pack your items in our kit and send them using the prepaid label
            </p>
            <img
              src="/lovable-uploads/ddab1909-1056-4ba3-b659-01c0cd97369f.png"
              alt="Person shipping memories in a secure box"
              className="w-full h-40 object-contain rounded-lg mb-4"
            />
            <span className="text-gray-500">Free 2-day shipping included</span>
          </div>

          {/* Step 4 */}
          <div className="bg-cream rounded-xl p-6 text-center transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-primary text-2xl font-bold">4</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Enjoy Your Digitized Memories</h3>
            <p className="text-gray-600 mb-6">
              Access your memories online and receive your originals back
            </p>
            <img
              src="/lovable-uploads/b448b3fc-ae42-4ba5-b66a-caecc548b7dc.png" 
              alt="Family enjoying digitized memories on a TV"
              className="w-full h-40 object-contain rounded-lg mb-4"
            />
            <span className="text-gray-500">Ready in 2-3 weeks</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
