import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Check, ShoppingBag, CreditCard, Truck, Lock, Plus, Minus, Cloud, Usb, CreditCard as PaymentIcon, Calendar } from 'lucide-react';
import SquarePayment from '@/components/SquarePayment';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  const [usbDrives, setUsbDrives] = useState(1);
  const [cloudBackup, setCloudBackup] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'paypal'
  const [digitizingSpeed, setDigitizingSpeed] = useState('standard'); // 'standard', 'expedited', or 'rush'

  // Define digitizing time options
  const digitizingOptions = [
    {
      id: 'standard',
      name: 'Standard',
      price: 0,
      time: '4-6 weeks',
      description: 'Our standard digitizing service'
    },
    {
      id: 'expedited',
      name: 'Expedited',
      price: 29.99,
      time: '2-3 weeks',
      description: 'Faster processing of your memories'
    },
    {
      id: 'rush',
      name: 'Rush',
      price: 64.99,
      time: '10 business days',
      description: 'Priority handling for urgent projects'
    }
  ];

  // Define all packages (updated with new prices)
  const allPackages = [
    {
      name: "Starter",
      price: "$69",
      numericPrice: 69,
      description: "Perfect for a small collection of memories",
      color: "primary",
      features: [
        "Digitize up to 3 media items OR up to 75 photos",
        "1 media item = 25 photos",
        "Online access to digital files",
        "Free shipping both ways"
      ]
    },
    {
      name: "Popular",
      price: "$179",
      numericPrice: 179,
      description: "Our most popular package for families",
      color: "secondary",
      popular: true,
      features: [
        "Digitize up to 10 media items OR up to 250 photos",
        "1 media item = 25 photos",
        "Online access to digital files",
        "Free shipping both ways",
        "Online Backup (1 Year Free)"
      ]
    },
    {
      name: "Dusty Rose",
      price: "$349",
      numericPrice: 349,
      description: "Great for larger collections",
      color: "rose-dark",
      features: [
        "Digitize up to 20 media items OR up to 500 photos",
        "1 media item = 25 photos",
        "Online access to digital files",
        "Free shipping both ways",
        "Online Backup (1 Year Free)"
      ]
    },
    {
      name: "Eternal",
      price: "$599",
      numericPrice: 599,
      description: "For preserving a lifetime of memories",
      color: "primary-light",
      features: [
        "Digitize up to 40 media items OR up to 1000 photos",
        "1 media item = 25 photos",
        "Online access to digital files",
        "Free shipping both ways",
        "Online Backup (1 Year Free)"
      ]
    }
  ];
  
  // Get selected package details
  const getPackageDetails = () => {
    return allPackages.find(pkg => pkg.name === packageType) || allPackages[1];
  };

  const packageDetails = getPackageDetails();

  // USB drive price
  const USB_DRIVE_PRICE = 24.95;
  const CLOUD_BACKUP_PRICE = 0; // Updated price to zero

  // Get selected digitizing option
  const getSelectedDigitizingOption = () => {
    return digitizingOptions.find(option => option.id === digitizingSpeed) || digitizingOptions[0];
  };

  // Calculate total price
  const calculateTotal = () => {
    const packagePrice = packageDetails.numericPrice || parseFloat(packageDetails.price.replace('$', ''));
    const usbTotal = usbDrives * USB_DRIVE_PRICE;
    const cloudTotal = cloudBackup * CLOUD_BACKUP_PRICE;
    const digitizingOption = getSelectedDigitizingOption();
    const speedPrice = digitizingOption ? digitizingOption.price : 0;
    
    return (packagePrice + usbTotal + cloudTotal + speedPrice).toFixed(2);
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

  const handleUsbChange = (change: number) => {
    setUsbDrives(prev => {
      const newValue = prev + change;
      return newValue >= 0 ? newValue : 0;
    });
  };

  // Updated to toggle cloud backup between 0 and 1 only
  const handleCloudChange = (change: number) => {
    setCloudBackup(prev => {
      // If current is 0 and change is positive, set to 1
      if (prev === 0 && change > 0) return 1;
      // If current is 1 and change is negative, set to 0
      if (prev === 1 && change < 0) return 0;
      // Otherwise keep the same value
      return prev;
    });
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
    console.log("USB drives added:", usbDrives);
    console.log("Cloud backup years:", cloudBackup);
    console.log("Digitizing speed:", digitizingSpeed);
    
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Payment successful!", {
        description: "Thank you for your order. You will receive a confirmation email shortly.",
        position: "top-center",
      });
      
      // Pass parameters to order confirmation page
      const params = new URLSearchParams();
      params.append('package', packageType);
      if (usbDrives > 0) {
        params.append('usbDrives', usbDrives.toString());
      }
      if (cloudBackup > 0) {
        params.append('cloudBackup', cloudBackup.toString());
      }
      params.append('digitizingSpeed', digitizingSpeed);
      
      // Navigate to confirmation page with customer info in state
      navigate('/order-confirmation?' + params.toString(), {
        state: {
          customerInfo: {
            firstName: formState.firstName,
            lastName: formState.lastName,
            email: formState.email,
            address: formState.address,
            city: formState.city,
            state: formState.state,
            zipCode: formState.zipCode
          }
        }
      });
    }, 2000);
  };

  const handlePayPalPayment = () => {
    setIsProcessing(true);
    
    // For demo purposes, we'll simulate a successful PayPal payment after a short delay
    console.log("Processing PayPal payment for:", formState.email);
    console.log("Amount:", calculateTotal());
    console.log("USB drives added:", usbDrives);
    console.log("Cloud backup years:", cloudBackup);
    console.log("Digitizing speed:", digitizingSpeed);
    
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("PayPal payment successful!", {
        description: "Thank you for your order. You will receive a confirmation email shortly.",
        position: "top-center",
      });
      
      // Pass parameters to order confirmation page
      const params = new URLSearchParams();
      params.append('package', packageType);
      if (usbDrives > 0) {
        params.append('usbDrives', usbDrives.toString());
      }
      if (cloudBackup > 0) {
        params.append('cloudBackup', cloudBackup.toString());
      }
      params.append('digitizingSpeed', digitizingSpeed);
      
      // Navigate to confirmation page with customer info in state
      navigate('/order-confirmation?' + params.toString(), {
        state: {
          customerInfo: {
            firstName: formState.firstName,
            lastName: formState.lastName,
            email: formState.email,
            address: formState.address,
            city: formState.city,
            state: formState.state,
            zipCode: formState.zipCode
          }
        }
      });
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

                  {/* Digitizing Time Selection */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center">
                      <Calendar className="mr-2" /> Digitizing Time
                    </h2>
                    
                    <RadioGroup 
                      value={digitizingSpeed} 
                      onValueChange={setDigitizingSpeed}
                      className="space-y-4"
                    >
                      {digitizingOptions.map((option) => (
                        <div 
                          key={option.id}
                          className={`flex items-center justify-between border rounded-lg p-4 transition-all ${
                            digitizingSpeed === option.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <RadioGroupItem 
                              value={option.id} 
                              id={`speed-${option.id}`} 
                              className="mt-1"
                            />
                            <div>
                              <Label 
                                htmlFor={`speed-${option.id}`} 
                                className="font-medium cursor-pointer"
                              >
                                {option.name} ({option.time})
                                {option.id === 'standard' && <span className="ml-2 text-green-600 font-medium">Free</span>}
                              </Label>
                              <p className="text-sm text-gray-500 mt-1">
                                {option.description}
                              </p>
                            </div>
                          </div>
                          {option.id !== 'standard' && (
                            <span className="font-medium text-gray-900">
                              ${option.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
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
                        <CreditCard className="mr-2" /> Payment Method
                      </h2>
                      
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                          <Button
                            type="button"
                            onClick={() => setPaymentMethod('card')}
                            className={`flex-1 flex items-center justify-center gap-2 py-6 ${
                              paymentMethod === 'card' 
                                ? getButtonClass()
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            }`}
                          >
                            <CreditCard className="h-5 w-5" />
                            <span className="text-lg">Credit Card</span>
                          </Button>
                          
                          <Button
                            type="button"
                            onClick={() => setPaymentMethod('paypal')}
                            className={`flex-1 flex items-center justify-center gap-2 py-6 ${
                              paymentMethod === 'paypal' 
                                ? 'bg-[#0070BA] hover:bg-[#003087] text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            }`}
                          >
                            <PaymentIcon className="h-5 w-5" />
                            <span className="text-lg">PayPal</span>
                          </Button>
                        </div>
                        
                        {paymentMethod === 'card' ? (
                          <SquarePayment 
                            onSuccess={handlePaymentSuccess}
                            buttonColorClass={getButtonClass()}
                            isProcessing={isProcessing}
                            amount={`$${calculateTotal()}`}
                          />
                        ) : (
                          <div className="space-y-4">
                            <div className="p-4 border rounded-md bg-[#f5f7fa]">
                              <div className="flex items-center justify-center">
                                <PaymentIcon className="h-10 w-10 text-[#0070BA] mr-2" />
                                <p className="text-lg font-medium">
                                  Continue to PayPal checkout to complete your purchase
                                </p>
                              </div>
                            </div>
                            <div className="text-center md:text-left">
                              <Button 
                                onClick={handlePayPalPayment}
                                className={`px-8 py-6 text-lg bg-[#0070BA] hover:bg-[#003087] text-white`}
                                disabled={isProcessing}
                              >
                                {isProcessing ? "Processing..." : `Pay with PayPal $${calculateTotal()}`}
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500 mt-4">
                          <Lock size={16} className="mr-1" />
                          <span>Your payment information is secure and encrypted</span>
                        </div>
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
                  
                  {/* Add-ons Section */}
                  <div className="border-t border-gray-100 py-4 mb-4">
                    <h3 className="font-medium mb-3">Add-ons</h3>
                    
                    {/* USB Drive Add-on */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium flex items-center">
                          <Usb className="mr-2 h-4 w-4" />
                          Custom USB Drive
                        </p>
                        <p className="text-sm text-gray-500">Store your memories safely</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleUsbChange(-1)}
                          disabled={usbDrives === 0}
                        >
                          <Minus className="h-4 w-4" />
                          <span className="sr-only">Decrease</span>
                        </Button>
                        <span className="w-8 text-center">{usbDrives}</span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleUsbChange(1)}
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Increase</span>
                        </Button>
                      </div>
                    </div>
                    {usbDrives > 0 && (
                      <div className="flex justify-between text-sm mb-4">
                        <span className="text-gray-600">{usbDrives} × $24.95</span>
                        <span className="font-medium">${(usbDrives * USB_DRIVE_PRICE).toFixed(2)}</span>
                      </div>
                    )}
                    
                    {/* Cloud Backup Add-on */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium flex items-center">
                          <Cloud className="mr-2 h-4 w-4" />
                          Online Media Gallery & Cloud Backup
                        </p>
                        <p className="text-sm text-gray-500">1 year included</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleCloudChange(-1)}
                          disabled={cloudBackup === 0}
                        >
                          <Minus className="h-4 w-4" />
                          <span className="sr-only">Decrease</span>
                        </Button>
                        <span className="w-8 text-center">{cloudBackup}</span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleCloudChange(1)}
                          disabled={cloudBackup === 1} // Disable the plus button when quantity is 1
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Increase</span>
                        </Button>
                      </div>
                    </div>
                    {cloudBackup > 0 && (
                      <div className="flex justify-between text-sm mb-4">
                        <span className="text-gray-600">{cloudBackup} × $0.00</span>
                        <span className="font-medium">$0.00</span>
                      </div>
                    )}

                    {/* Digitizing Speed Display in Summary */}
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-medium flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          Digitizing Speed
                        </p>
                        <p className="text-sm text-gray-500">
                          {getSelectedDigitizingOption().name} ({getSelectedDigitizingOption().time})
                        </p>
                      </div>
                      <span className="font-medium">
                        {getSelectedDigitizingOption().price === 0 
                          ? <span className="text-green-600">Free</span> 
                          : `$${getSelectedDigitizingOption().price.toFixed(2)}`
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal</span>
                      <span>${calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="font-bold">${calculateTotal()}</span>
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
