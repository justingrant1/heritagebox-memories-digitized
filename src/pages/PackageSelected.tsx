
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Check } from 'lucide-react';

const PackageSelected = () => {
  const [searchParams] = useSearchParams();
  const packageType = searchParams.get('package') || 'Popular';
  
  // Define package details based on the selected package
  const getPackageDetails = () => {
    switch(packageType) {
      case 'Starter':
        return {
          name: "Starter",
          price: "$69",
          description: "Perfect for a small collection of memories",
          color: "primary",
          features: [
            "Digitize up to 2 media items",
            "Online access to digital files",
            "Free shipping both ways",
            "Free media organizing"
          ]
        };
      case 'Dusty Rose':
        return {
          name: "Dusty Rose",
          price: "$279",
          description: "Great for larger collections",
          color: "rose-dark",
          features: [
            "Digitize up to 20 media items",
            "Online access to digital files",
            "Free shipping both ways",
            "Free media organizing",
            "Custom USB drive included",
            "Digital photo frame included"
          ]
        };
      case 'Eternal':
        return {
          name: "Eternal",
          price: "$399",
          description: "For preserving a lifetime of memories",
          color: "primary-light",
          features: [
            "Digitize up to 40 media items",
            "Online access to digital files",
            "Free shipping both ways",
            "Free media organizing",
            "Custom USB drive included",
            "Digital photo frame included",
            "Premium storage box for originals"
          ]
        };
      case 'Popular':
      default:
        return {
          name: "Popular",
          price: "$159",
          description: "Our most popular package for families",
          color: "secondary",
          features: [
            "Digitize up to 10 media items",
            "Online access to digital files",
            "Free shipping both ways",
            "Free media organizing",
            "Custom USB drive included"
          ]
        };
    }
  };

  const packageDetails = getPackageDetails();
  
  // Get background color class based on package type
  const getBgColorClass = () => {
    switch(packageDetails.color) {
      case 'primary':
        return 'bg-primary/10';
      case 'rose-dark':
        return 'bg-rose-dark/10';
      case 'primary-light':
        return 'bg-primary-light/10';
      case 'secondary':
        return 'bg-secondary/10';
      default:
        return 'bg-gray-50';
    }
  };
  
  // Get text color class based on package type
  const getTextColorClass = () => {
    switch(packageDetails.color) {
      case 'primary':
        return 'text-primary';
      case 'rose-dark':
        return 'text-rose-dark';
      case 'primary-light':
        return 'text-primary-light';
      case 'secondary':
        return 'text-secondary';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Thank You for Choosing Our <span className={getTextColorClass()}>{packageDetails.name}</span> Package!
              </h1>
              <p className="text-lg text-gray-600">
                You're one step closer to preserving your cherished memories for generations to come.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-12">
              <div className={`${getBgColorClass()} p-6 md:p-8`}>
                <h2 className="text-2xl font-bold mb-2">Your Selected Package</h2>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 className={`${getTextColorClass()} text-3xl font-bold`}>
                      {packageDetails.name} Package
                    </h3>
                    <p className="text-gray-600 mt-1">{packageDetails.description}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className="text-4xl font-bold">{packageDetails.price}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-semibold mb-4">What's Included:</h3>
                <ul className="space-y-3">
                  {packageDetails.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className={`${getTextColorClass()} mr-3 mt-0.5 shrink-0`}>
                        <Check size={18} className="stroke-[2.5]" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-12">
              <h2 className="text-2xl font-bold mb-6">Next Steps</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className={`${getBgColorClass()} ${getTextColorClass()} rounded-full w-8 h-8 flex items-center justify-center mr-4 shrink-0 font-bold`}>1</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Complete Your Order</h3>
                    <p className="text-gray-600">Fill out your shipping information and payment details to complete your order.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`${getBgColorClass()} ${getTextColorClass()} rounded-full w-8 h-8 flex items-center justify-center mr-4 shrink-0 font-bold`}>2</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Receive Your Kit</h3>
                    <p className="text-gray-600">We'll send you a secure, prepaid shipping kit to safely package your memories.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`${getBgColorClass()} ${getTextColorClass()} rounded-full w-8 h-8 flex items-center justify-center mr-4 shrink-0 font-bold`}>3</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Ship Back Your Memories</h3>
                    <p className="text-gray-600">Use the prepaid shipping label to send your memories to our digitization lab.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`${getBgColorClass()} ${getTextColorClass()} rounded-full w-8 h-8 flex items-center justify-center mr-4 shrink-0 font-bold`}>4</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Enjoy Your Digitized Memories</h3>
                    <p className="text-gray-600">We'll carefully digitize your items and return both the originals and digital copies.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button className={`px-8 py-6 text-lg ${getTextColorClass() === 'text-secondary' ? 'bg-secondary hover:bg-secondary/90 text-primary' : getTextColorClass() === 'text-primary' ? 'bg-primary hover:bg-primary/90 text-white' : getTextColorClass() === 'text-rose-dark' ? 'bg-rose-dark hover:bg-rose-dark/90 text-white' : 'bg-primary-light hover:bg-primary-light/90 text-white'}`}>
                Complete Your Order
              </Button>
              
              <p className="mt-6 text-gray-500">
                Have questions? <Link to="/" className={getTextColorClass()}>Contact our customer support</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PackageSelected;
