
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Check, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

const PackageSelected = () => {
  const [searchParams] = useSearchParams();
  const packageType = searchParams.get('package') || 'Popular';
  
  // Define all packages
  const allPackages = [
    {
      name: "Starter",
      price: "$69",
      description: "Perfect for preserving a small family collection of cherished memories",
      color: "primary",
      features: [
        "Digitize up to 3 tapes OR up to 75 photos",
        "High-quality digital conversion (480p for VHS)",
        "Online access to digital files",
        "Free shipping both ways with tracking"
      ]
    },
    {
      name: "Popular",
      price: "$179",
      description: "Our most popular package for families with moderate media collections",
      color: "secondary",
      popular: true,
      features: [
        "Digitize up to 10 tapes OR up to 250 photos",
        "Enhanced digital conversion (480p for VHS)",
        "Online access to digital files",
        "Free shipping both ways with tracking",
        "Online Backup (1 Year Free)"
      ]
    },
    {
      name: "Dusty Rose",
      price: "$349",
      description: "Ideal for larger collections with extended family memories",
      color: "rose-dark",
      features: [
        "Digitize up to 20 tapes OR up to 500 photos",
        "Premium digital conversion (480p for VHS)",
        "Online access to digital files",
        "Free priority shipping both ways",
        "Online Backup (1 Year Free)"
      ]
    },
    {
      name: "Eternal",
      price: "$599",
      description: "Complete preservation solution for extensive family archives",
      color: "primary-light",
      features: [
        "Digitize up to 40 tapes OR up to 1000 photos",
        "Premium digital conversion (480p for VHS)",
        "Online access to digital files",
        "Free expedited shipping both ways",
        "Online Backup (1 Year Free)"
      ]
    }
  ];
  
  // Function to get the currently selected package details
  const getPackageDetails = () => {
    const selectedPackage = allPackages.find(pkg => pkg.name === packageType);
    return selectedPackage || allPackages[1]; // Default to Popular if not found
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

  // Get button color class based on package type
  const getButtonClass = () => {
    switch(packageDetails.color) {
      case 'primary':
        return 'bg-primary hover:bg-primary/90 text-white';
      case 'rose-dark':
        return 'bg-rose-dark hover:bg-rose-dark/90 text-white';
      case 'primary-light':
        return 'bg-primary-light hover:bg-primary-light/90 text-white';
      case 'secondary':
        return 'bg-secondary hover:bg-secondary/90 text-primary';
      default:
        return 'bg-primary hover:bg-primary/90 text-white';
    }
  };

  const handlePackageSwitch = (newPackage: string) => {
    toast(`You've switched to the ${newPackage} package!`, {
      description: "Your new selection has been updated.",
      position: "top-center",
    });
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

            {/* Package Change Section */}
            <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-12">
              <h2 className="text-2xl font-bold mb-4">Change Your Package</h2>
              <p className="text-gray-600 mb-6">Not sure if this is the right package for you? You can change your selection below:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {allPackages.map((pkg) => (
                  <Link
                    key={pkg.name}
                    to={`/package-selected?package=${encodeURIComponent(pkg.name)}`}
                    onClick={() => handlePackageSwitch(pkg.name)}
                    className={`block ${pkg.name === packageType ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                  >
                    <Card className={`h-full transition-all duration-300 hover:shadow-md ${pkg.name === packageType ? 'border-2 border-gray-300' : 'hover:border-gray-300'}`}>
                      <CardHeader className="pb-2">
                        <h3 className={`text-lg font-bold ${pkg.popular ? 'text-secondary' : `text-${pkg.color}`}`}>
                          {pkg.name}
                          {pkg.name === packageType && <span className="ml-2 text-gray-500 text-sm">(Current)</span>}
                        </h3>
                        <p className="text-2xl font-bold">{pkg.price}</p>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                        <div className={`text-sm ${pkg.name !== packageType ? 'text-blue-600' : 'text-gray-400'} mt-2 flex items-center justify-end`}>
                          {pkg.name !== packageType ? (
                            <>Select <ArrowRight size={16} className="ml-1" /></>
                          ) : (
                            'Current selection'
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
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
              <Button 
                className={`px-8 py-6 text-lg ${getButtonClass()}`}
                asChild
              >
                <Link to={`/checkout?package=${encodeURIComponent(packageType)}`}>
                  Complete Your Order
                </Link>
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
