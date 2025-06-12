
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

const CTA = () => {
  return (
    <section className="section-padding bg-primary relative overflow-hidden">
      <div className="container mx-auto container-padding relative z-10">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
                Ready to Preserve Your Memories?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Get started today and save 15% on your first order. Let us help you digitize and preserve your irreplaceable memories.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="btn-secondary text-lg flex items-center gap-2">
                  <Package size={18} />
                  Get Your Box
                </Button>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white text-lg">
                  View Packages
                </Button>
              </div>
            </div>
            
            <div className="bg-cream rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4 text-primary">Limited Time Offer</h3>
              <p className="text-gray-600 mb-4">
                Use code <span className="font-bold text-secondary">SAVE15</span> at checkout for 15% off your first order.
              </p>
              <p className="text-sm text-gray-500">
                *Offer valid for new customers only. Expires on December 31, 2025.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/30 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-light/40 rounded-full filter blur-3xl"></div>
    </section>
  );
};

export default CTA;
