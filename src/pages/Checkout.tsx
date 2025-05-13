import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Check, ShoppingBag, CreditCard, Truck, Lock } from 'lucide-react';
import SquarePayment from '@/components/SquarePayment';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const packageType = searchParams.get('package') || 'Popular';
  const navigate = useNavigate();
  
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  // Define all packages (same as in PackageSelected)
  const allPackages = [
    {
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
    },
    {
      name: "Popular",
      price: "$159",
      description: "Our most popular package for families",
      color: "secondary",
      popular: true,
      features: [
        "Digitize up to 10 media items",
        "Online access to digital files",
        "Free shipping both ways",
        "Free media organizing",
        "Custom USB drive included"
      ]
    },
    {
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
    },
    {
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
    }
  ];
  
  // Get selected package details
  const getPackageDetails = () => {
    return allPackages.find(pkg => pkg.name === packageType) || allPackages[1];
  };

  const packageDetails = getPackageDetails();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation for shipping info
    const requiredFields = [
      'firstName', 'lastName', 'email', 
      'address', 'city', 'state', 'zipCode'
    ];
    
    const missingFields = requiredFields.filter(field => !formState[field as keyof typeof formState]);
    
    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields", {
        description: "All fields are required to complete your order.",
        position: "top-center",
      });
      return;
    }
    
    // Show payment form after shipping info is validated
    setShowCardForm(true);
  };

  const handlePaymentSuccess = (token: string, details: any) => {
    // Process payment with Square token
    setIsProcessing(true);
    
    // Here you would typically send this token to your server to complete the payment
    // For demo purposes, we'll simulate a successful payment after a short delay
    console.log("Payment token received:", token);
    console.log("Card details:", details);
    
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Payment successful!", {
        description: "Thank you for your order. You will receive a confirmation email shortly.",
        position: "top-center",
      });
      navigate('/order-confirmation');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Complete Your Order</h1>
              <p className="text-lg text-gray-600">
                You're just a few steps away from preserving your cherished memories.
              </p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Checkout Form */}
              <div className="w-full lg:w-2/3">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center">
                      <Truck className="mr-2" /> Shipping Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formState.firstName}
                          onChange={handleInputChange}
                          className="w-full"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formState.lastName}
                          onChange={handleInputChange}
                          className="w-full"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formState.email}
                          onChange={handleInputChange}
                          className="w-full"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formState.address}
                          onChange={handleInputChange}
                          className="w-full"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formState.city}
                          onChange={handleInputChange}
                          className="w-full"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            name="state"
                            value={formState.state}
                            onChange={handleInputChange}
                            className="w-full"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            value={formState.zipCode}
                            onChange={handleInputChange}
                            className="w-full"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!showCardForm ? (
                    <div className="text-center md:text-left">
                      <Button 
                        type="submit" 
                        className={`px-8 py-6 text-lg ${getButtonClass()}`}
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-md p-6">
                      <h2 className="text-xl font-bold mb-6 flex items-center">
                        <CreditCard className="mr-2" /> Payment Information
                      </h2>
                      
                      <SquarePayment 
                        onSuccess={handlePaymentSuccess}
                        buttonColorClass={getButtonClass()}
                        isProcessing={isProcessing}
                        amount={getPackageDetails().price}
                      />
                      
                      <div className="flex items-center text-sm text-gray-500 mt-4">
                        <Lock size={16} className="mr-1" />
                        <span>Your payment information is secure and encrypted</span>
                      </div>
                    </div>
                  )}
                </form>
              </div>
              
              {/* Order Summary */}
              <div className="w-full lg:w-1/3">
                <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <ShoppingBag className="mr-2" /> Order Summary
                  </h2>
                  
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className={`font-semibold ${getTextColorClass()}`}>{packageDetails.name} Package</span>
                      <span className="font-semibold">{packageDetails.price}</span>
                    </div>
                    <p className="text-sm text-gray-500">{packageDetails.description}</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {packageDetails.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <span className={`${getTextColorClass()} mr-2 mt-0.5 shrink-0`}>
                          <Check size={16} className="stroke-[2.5]" />
                        </span>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal</span>
                      <span>{packageDetails.price}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="font-bold">{packageDetails.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;
