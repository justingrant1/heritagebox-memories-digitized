
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Check, Package } from 'lucide-react';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const packageType = searchParams.get('package') || 'Popular';
  
  // Get button color class based on package type
  const getButtonClass = () => {
    switch(packageType) {
      case 'Starter':
        return 'bg-primary hover:bg-primary/90 text-white';
      case 'Dusty Rose':
        return 'bg-rose-dark hover:bg-rose-dark/90 text-white';
      case 'Eternal':
        return 'bg-primary-light hover:bg-primary-light/90 text-white';
      case 'Popular':
      default:
        return 'bg-secondary hover:bg-secondary/90 text-primary';
    }
  };

  const getTextColorClass = () => {
    switch(packageType) {
      case 'Starter':
        return 'text-primary';
      case 'Dusty Rose':
        return 'text-rose-dark';
      case 'Eternal':
        return 'text-primary-light';
      case 'Popular':
      default:
        return 'text-secondary';
    }
  };

  // Generate a random order number
  const orderNumber = `MM-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getTextColorClass()} bg-green-100 mb-6`}>
                <Check size={40} className="stroke-[2.5]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Thank You for Your Order!
              </h1>
              <p className="text-lg text-gray-600">
                Your order has been received and is being processed.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Order Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <p className="text-gray-500 mb-1">Order Number:</p>
                  <p className="font-semibold">{orderNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Order Date:</p>
                  <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Package Type:</p>
                  <p className={`font-semibold ${getTextColorClass()}`}>{packageType} Package</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Shipping:</p>
                  <p className="font-semibold">Free Shipping</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 my-6 pt-6">
                <h3 className="text-xl font-semibold mb-4">What Happens Next?</h3>
                <ul className="space-y-4 text-left">
                  <li className="flex items-start">
                    <span className={`${getTextColorClass()} mr-3 mt-0.5 shrink-0`}>
                      <Package size={18} />
                    </span>
                    <span>
                      <strong>Shipping Kit:</strong> We'll send you a secure, prepaid shipping kit within 3-5 business days.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className={`${getTextColorClass()} mr-3 mt-0.5 shrink-0`}>
                      <Package size={18} />
                    </span>
                    <span>
                      <strong>Package Your Memories:</strong> Once you receive the kit, carefully pack your memories and send them back using the prepaid label.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className={`${getTextColorClass()} mr-3 mt-0.5 shrink-0`}>
                      <Package size={18} />
                    </span>
                    <span>
                      <strong>Digitization Process:</strong> Our team will carefully digitize your memories (typically takes 2-3 weeks).
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className={`${getTextColorClass()} mr-3 mt-0.5 shrink-0`}>
                      <Package size={18} />
                    </span>
                    <span>
                      <strong>Delivery:</strong> We'll send back your original items along with your digital copies.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            
            <p className="text-gray-600 mb-8">
              A confirmation email has been sent to your email address with all the details of your order.
              If you have any questions, please contact our customer support.
            </p>
            
            <Button asChild className={`${getButtonClass()} px-6 py-5 text-lg`}>
              <Link to="/">Return to Homepage</Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
