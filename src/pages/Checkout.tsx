import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { 
  Check, ShoppingBag, CreditCard, Truck, Lock, 
  Plus, Minus, Cloud, Usb, Calendar, 
  AlertCircle, ArrowRight, CreditCard as PaymentIcon,
  Loader2, Tag
} from 'lucide-react';
import SquarePayment from '@/components/SquarePayment';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { sendEmailToHeritageBox, generateOrderId } from '@/utils/emailUtils';
import { sendOrderToAirtable, parseAddOnDetails, parseSpeedDetails } from '@/utils/airtableUtils';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form validation schema
const shippingFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number").regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter your complete address"),
  city: z.string().min(2, "Please enter a valid city"),
  state: z.string().min(2, "Please enter a valid state"),
  zipCode: z.string().min(5, "Please enter a valid ZIP code").max(10)
});

// Define the form state type explicitly to avoid TypeScript errors
type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const packageType = searchParams.get('package') || 'Popular';
  const navigate = useNavigate();
  
  // Form validation using react-hook-form
  const form = useForm<z.infer<typeof shippingFormSchema>>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [usbDrives, setUsbDrives] = useState(1);
  const [cloudBackup, setCloudBackup] = useState(1);
  const [digitizingSpeed, setDigitizingSpeed] = useState('standard'); // 'standard', 'expedited', or 'rush'
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [formState, setFormState] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

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

  // Define all packages (updated with new prices and description)
  const allPackages = [
    {
      name: "Starter",
      price: "$69",
      numericPrice: 69,
      description: "Perfect for a small collection of memories",
      color: "primary",
      features: [
        "Digitize up to 3 tapes OR up to 75 photos",
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
        "Digitize up to 10 tapes OR up to 250 photos",
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
        "Digitize up to 20 tapes OR up to 500 photos",
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
        "Digitize up to 40 tapes OR up to 1000 photos",
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

  // Calculate subtotal before discount
  const calculateSubtotal = () => {
    const packagePrice = packageDetails.numericPrice || parseFloat(packageDetails.price.replace('$', ''));
    const usbTotal = usbDrives * USB_DRIVE_PRICE;
    const cloudTotal = cloudBackup * CLOUD_BACKUP_PRICE;
    const digitizingOption = getSelectedDigitizingOption();
    const speedPrice = digitizingOption ? digitizingOption.price : 0;
    
    return packagePrice + usbTotal + cloudTotal + speedPrice;
  };

  // Calculate total price with coupon discount
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = subtotal * (couponDiscount / 100);
    return (subtotal - discount).toFixed(2);
  };

  // Handle coupon code application
  const applyCouponCode = () => {
    const trimmedCode = couponCode.trim().toUpperCase();
    
    if (trimmedCode === 'SAVE15') {
      setAppliedCoupon(trimmedCode);
      setCouponDiscount(15);
      toast.success("Coupon applied!", {
        description: "You saved 15% on your order!",
        position: "top-center",
      });
    } else if (trimmedCode === '') {
      toast.error("Please enter a coupon code", {
        position: "top-center",
      });
    } else {
      toast.error("Invalid coupon code", {
        description: "Please check your coupon code and try again.",
        position: "top-center",
      });
    }
  };

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon('');
    setCouponDiscount(0);
    setCouponCode('');
    toast.success("Coupon removed", {
      position: "top-center",
    });
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

  const handleSubmit = (values: z.infer<typeof shippingFormSchema>) => {
    // Fix: Use proper typing to ensure all required fields are present
    setFormState({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      address: values.address,
      city: values.city,
      state: values.state,
      zipCode: values.zipCode,
    });
    setShowCardForm(true);
    
    // Smooth scroll to payment section after a short delay
    setTimeout(() => {
      const paymentSection = document.getElementById('payment-section');
      if (paymentSection) {
        paymentSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Function to send order details to Formspree
  const sendOrderDetailsToFormspree = async (orderInfo: any, paymentInfo?: string) => {
    try {
      console.log('🎯 CHECKOUT DEBUG - sendOrderDetailsToFormspree called');
      console.log('🎯 CHECKOUT DEBUG - Current formState:', formState);
      console.log('🎯 CHECKOUT DEBUG - orderInfo param:', orderInfo);
      console.log('🎯 CHECKOUT DEBUG - paymentInfo param:', paymentInfo);
      
      // Ensure we have all required customer info
      if (!formState.firstName || !formState.lastName || !formState.email) {
        console.error('❌ CHECKOUT ERROR - Missing required customer information:', formState);
        throw new Error('Missing required customer information');
      }
      
      const selectedDigitizingOption = getSelectedDigitizingOption();
      console.log('🎯 CHECKOUT DEBUG - Selected digitizing option:', selectedDigitizingOption);
      
      // Generate unique order ID
      const orderId = generateOrderId();
      console.log('🎯 CHECKOUT DEBUG - Generated Order ID:', orderId);
      
      const subtotal = calculateSubtotal();
      const discountAmount = subtotal * (couponDiscount / 100);
      
      const orderDetails = {
        orderId: orderId,
        customerInfo: {
          firstName: formState.firstName,
          lastName: formState.lastName,
          email: formState.email,
          phone: formState.phone,
          address: formState.address,
          city: formState.city,
          state: formState.state,
          zipCode: formState.zipCode,
          fullName: `${formState.firstName} ${formState.lastName}`
        },
        orderDetails: {
          package: packageType,
          packagePrice: `$${packageDetails.numericPrice.toFixed(2)}`,
          packageFeatures: packageDetails.features.join(", "),
          subtotal: `$${subtotal.toFixed(2)}`,
          couponCode: appliedCoupon || 'None',
          discountPercent: couponDiscount,
          discountAmount: `$${discountAmount.toFixed(2)}`,
          totalAmount: `$${calculateTotal()}`,
          digitizingSpeed: selectedDigitizingOption.name,
          digitizingTime: selectedDigitizingOption.time,
          digitizingPrice: selectedDigitizingOption.price === 0 ? "Free" : `$${selectedDigitizingOption.price.toFixed(2)}`,
          addOns: []
        },
        paymentMethod: paymentInfo || "Credit Card",
        timestamp: new Date().toISOString()
      };
      
      // Add USB drives to add-ons if any
      if (usbDrives > 0) {
        orderDetails.orderDetails.addOns.push(`${usbDrives} USB Drive(s) - $${(usbDrives * USB_DRIVE_PRICE).toFixed(2)}`);
      }
      
      // Add cloud backup to add-ons if any
      if (cloudBackup > 0) {
        orderDetails.orderDetails.addOns.push(`${cloudBackup} Year Cloud Backup - $0.00 (Included)`);
      }
      
      console.log("🎯 CHECKOUT DEBUG - Final order details object with Order ID:", JSON.stringify(orderDetails, null, 2));
      
      // Send the email with order details
      await sendEmailToHeritageBox(orderDetails, "Order Completed");
      console.log("✅ CHECKOUT SUCCESS - Order details sent successfully to Formspree with Order ID:", orderId);
      
      return orderId; // Return the order ID for potential use elsewhere
      
    } catch (error) {
      console.error("❌ CHECKOUT ERROR - Failed to send order details to Formspree:", error);
      // We don't want to show an error to the user here as the payment was successful
      // Just log the error for debugging purposes
    }
  };

  const handlePaymentSuccess = async (token: string, details: any) => {
    setIsProcessing(true);
    
    try {
      console.log('💳 PAYMENT SUCCESS - Starting payment processing');
      console.log('💳 PAYMENT SUCCESS - Current form state:', formState);
      
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          amount: parseFloat(calculateTotal()),
          orderDetails: {
            package: packageType,
            usbDrives,
            cloudBackup,
            digitizingSpeed,
            customerInfo: formState
          }
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Payment failed');
      }

      console.log('💳 PAYMENT SUCCESS - Payment processed, now sending email and saving to Airtable');

      // Prepare order data for both email and Airtable
      const selectedDigitizingOption = getSelectedDigitizingOption();
      
      // Generate unique order ID
      const orderId = generateOrderId();
      
      // Create add-ons array for legacy support
      const addOnsArray = [];
      if (usbDrives > 0) {
        addOnsArray.push(`${usbDrives} USB Drive(s) - $${(usbDrives * USB_DRIVE_PRICE).toFixed(2)}`);
      }
      if (cloudBackup > 0) {
        addOnsArray.push(`${cloudBackup} Year Cloud Backup - $0.00 (Included)`);
      }

      // Create detailed breakdown for Airtable
      const addOnDetails = {
        photoRestoration: { selected: false, cost: 0 },
        videoEnhancement: { selected: false, cost: 0 },
        digitalDelivery: { selected: false, cost: 0 },
        expressShipping: { selected: false, cost: 0 },
        storageUpgrade: { selected: usbDrives > 0, cost: usbDrives * USB_DRIVE_PRICE },
        backupCopies: { selected: cloudBackup > 0, cost: 0 } // Cloud backup is included
      };

      const speedDetails = parseSpeedDetails(`${selectedDigitizingOption.name} (${selectedDigitizingOption.time})`);

      const orderData = {
        orderId: orderId,
        customerInfo: {
          firstName: formState.firstName,
          lastName: formState.lastName,
          email: formState.email,
          phone: formState.phone,
          address: formState.address,
          city: formState.city,
          state: formState.state,
          zipCode: formState.zipCode,
          fullName: `${formState.firstName} ${formState.lastName}`
        },
        orderDetails: {
          package: packageType,
          packagePrice: `$${packageDetails.numericPrice.toFixed(2)}`,
          packageFeatures: packageDetails.features.join(", "),
          subtotal: `$${calculateSubtotal().toFixed(2)}`,
          couponCode: appliedCoupon || 'None',
          discountPercent: couponDiscount,
          discountAmount: `$${(calculateSubtotal() * (couponDiscount / 100)).toFixed(2)}`,
          totalAmount: `$${calculateTotal()}`,
          digitizingSpeed: selectedDigitizingOption.name,
          digitizingTime: selectedDigitizingOption.time,
          digitizingPrice: selectedDigitizingOption.price === 0 ? "Free" : `$${selectedDigitizingOption.price.toFixed(2)}`,
          addOns: addOnsArray,
          addOnDetails: addOnDetails,
          speedDetails: speedDetails
        },
        paymentMethod: `Credit Card (${details?.card?.brand} ending in ${details?.card?.last4})`,
        timestamp: new Date().toISOString()
      };

      // Send order details to Formspree
      await sendOrderDetailsToFormspree(orderData, "Order Completed");

      // Send order details to Airtable
      try {
        await sendOrderToAirtable(orderData);
        console.log('✅ AIRTABLE SUCCESS - Order saved to Airtable');
      } catch (airtableError) {
        console.error('❌ AIRTABLE ERROR - Failed to save to Airtable:', airtableError);
        // Don't fail the checkout process if Airtable fails
      }

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
      
      navigate('/order-confirmation?' + params.toString());
    } catch (error) {
      console.error('💳 PAYMENT ERROR:', error);
      toast.error("Payment failed", {
        description: error.message || "Please try again or use a different payment method",
        position: "top-center",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = () => {
    setIsProcessing(true);
    
    console.log('💰 PAYPAL - Starting PayPal payment processing');
    console.log('💰 PAYPAL - Current form state:', formState);
    
    // For demo purposes, we'll simulate a successful PayPal payment after a short delay
    console.log("Processing PayPal payment for:", formState.email);
    console.log("Amount:", calculateTotal());
    console.log("USB drives added:", usbDrives);
    console.log("Cloud backup years:", cloudBackup);
    console.log("Digitizing speed:", digitizingSpeed);
    
    setTimeout(async () => {
      console.log('💰 PAYPAL - Payment processed, now sending email and saving to Airtable');
      
      // Prepare order data for both email and Airtable
      const selectedDigitizingOption = getSelectedDigitizingOption();
      
      // Create add-ons array for legacy support
      const addOnsArray = [];
      if (usbDrives > 0) {
        addOnsArray.push(`${usbDrives} USB Drive(s) - $${(usbDrives * USB_DRIVE_PRICE).toFixed(2)}`);
      }
      if (cloudBackup > 0) {
        addOnsArray.push(`${cloudBackup} Year Cloud Backup - $0.00 (Included)`);
      }

      // Create detailed breakdown for Airtable
      const addOnDetails = {
        photoRestoration: { selected: false, cost: 0 },
        videoEnhancement: { selected: false, cost: 0 },
        digitalDelivery: { selected: false, cost: 0 },
        expressShipping: { selected: false, cost: 0 },
        storageUpgrade: { selected: usbDrives > 0, cost: usbDrives * USB_DRIVE_PRICE },
        backupCopies: { selected: cloudBackup > 0, cost: 0 } // Cloud backup is included
      };

      const speedDetails = parseSpeedDetails(`${selectedDigitizingOption.name} (${selectedDigitizingOption.time})`);

      const orderData = {
        customerInfo: {
          firstName: formState.firstName,
          lastName: formState.lastName,
          email: formState.email,
          phone: formState.phone,
          address: formState.address,
          city: formState.city,
          state: formState.state,
          zipCode: formState.zipCode,
          fullName: `${formState.firstName} ${formState.lastName}`
        },
        orderDetails: {
          package: packageType,
          packagePrice: `$${packageDetails.numericPrice.toFixed(2)}`,
          packageFeatures: packageDetails.features.join(", "),
          subtotal: `$${calculateSubtotal().toFixed(2)}`,
          couponCode: appliedCoupon || 'None',
          discountPercent: couponDiscount,
          discountAmount: `$${(calculateSubtotal() * (couponDiscount / 100)).toFixed(2)}`,
          totalAmount: `$${calculateTotal()}`,
          digitizingSpeed: selectedDigitizingOption.name,
          digitizingTime: selectedDigitizingOption.time,
          digitizingPrice: selectedDigitizingOption.price === 0 ? "Free" : `$${selectedDigitizingOption.price.toFixed(2)}`,
          addOns: addOnsArray,
          addOnDetails: addOnDetails,
          speedDetails: speedDetails
        },
        paymentMethod: "PayPal",
        timestamp: new Date().toISOString()
      };

      // Send order details to Formspree
      await sendOrderDetailsToFormspree(orderData, "Order Completed");

      // Send order details to Airtable
      try {
        await sendOrderToAirtable(orderData);
        console.log('✅ AIRTABLE SUCCESS - PayPal order saved to Airtable');
      } catch (airtableError) {
        console.error('❌ AIRTABLE ERROR - Failed to save PayPal order to Airtable:', airtableError);
        // Don't fail the checkout process if Airtable fails
      }
      
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
      
      navigate('/order-confirmation?' + params.toString());
    }, 2000);
  };

  // Get text color class based on package type
  const getTextColorClass = () => {
    switch(packageDetails.color) {
      case 'primary':
        return 'text-primary';
      case 'rose-dark':
        return 'text-rose-500';
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
        return 'bg-rose-500 hover:bg-rose-600 text-white';
      case 'primary-light':
        return 'bg-primary-light hover:bg-primary-light/90 text-white';
      case 'secondary':
        return 'bg-secondary hover:bg-secondary/90 text-primary';
      default:
        return 'bg-primary hover:bg-primary/90 text-white';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <main className="flex-grow pt-24 md:pt-28">
        <div className="container mx-auto px-4 py-6 md:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6 md:mb-10">
              <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Complete Your Order</h1>
              <p className="text-base md:text-lg text-gray-600">
                You're just a few steps away from preserving your cherished memories.
              </p>
            </div>
            
            {/* Progress indicator */}
            <div className="hidden md:flex justify-center mb-10">
              <div className="flex items-center w-full max-w-3xl">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-full">
                    <ShoppingBag size={16} />
                  </div>
                  <span className="text-xs mt-1 text-primary font-medium">Package</span>
                </div>
                <div className="flex-1 h-0.5 bg-primary mx-1"></div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-full">
                    <Truck size={16} />
                  </div>
                  <span className="text-xs mt-1 text-primary font-medium">Shipping</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-300 mx-1"></div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 flex items-center justify-center rounded-full">
                    <CreditCard size={16} />
                  </div>
                  <span className="text-xs mt-1 text-gray-500">Payment</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
              {/* Checkout Form */}
              <div className="w-full lg:w-2/3 order-2 lg:order-1">
                {!showCardForm ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                      <div className="checkout-section">
                        <h2 className="checkout-section-title">
                          <Truck className="mr-2 text-gray-600" /> Shipping Information
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="form-label">First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} className="form-input" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="form-label">Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} className="form-input" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="form-label">Email Address</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" className="form-input" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="form-label">Phone Number</FormLabel>
                                <FormControl>
                                  <Input {...field} type="tel" placeholder="(555) 123-4567" className="form-input" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="form-label">Street Address</FormLabel>
                                <FormControl>
                                  <Input {...field} className="form-input" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="form-label">City</FormLabel>
                                <FormControl>
                                  <Input {...field} className="form-input" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="form-label">State</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="form-input" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="zipCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="form-label">ZIP Code</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="form-input" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Digitizing Time Selection */}
                      <div className="checkout-section">
                        <h2 className="checkout-section-title">
                          <Calendar className="mr-2 text-gray-600" /> Digitizing Time
                        </h2>
                        
                        <RadioGroup 
                          value={digitizingSpeed} 
                          onValueChange={setDigitizingSpeed}
                          className="space-y-3"
                        >
                          {digitizingOptions.map((option) => (
                            <div 
                              key={option.id}
                              className={`flex items-center justify-between border rounded-lg p-3 md:p-4 transition-all cursor-pointer ${
                                digitizingSpeed === option.id 
                                  ? 'selected-option' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setDigitizingSpeed(option.id)}
                            >
                              <div className="flex items-start gap-2 md:gap-3">
                                <RadioGroupItem 
                                  value={option.id} 
                                  id={`speed-${option.id}`} 
                                  className="mt-1"
                                />
                                <div>
                                  <Label 
                                    htmlFor={`speed-${option.id}`} 
                                    className="font-medium cursor-pointer flex flex-wrap items-center"
                                  >
                                    <span className="mr-2">{option.name}</span>
                                    <span className="text-sm text-gray-700">({option.time})</span>
                                    {option.id === 'standard' && 
                                      <span className="ml-2 text-green-600 font-medium text-sm">Free</span>
                                    }
                                  </Label>
                                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                                    {option.description}
                                  </p>
                                </div>
                              </div>
                              {option.id !== 'standard' && (
                                <span className="font-medium text-gray-900 whitespace-nowrap">
                                  ${option.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      {/* Coupon Code Section */}
                      <div className="checkout-section">
                        <h2 className="checkout-section-title">
                          <Tag className="mr-2 text-gray-600" /> Coupon Code
                        </h2>
                        
                        {!appliedCoupon ? (
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <Input
                                type="text"
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="form-input"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={applyCouponCode}
                              className="px-6"
                            >
                              Apply
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                              <Tag className="h-4 w-4 text-green-600 mr-2" />
                              <span className="font-medium text-green-700">{appliedCoupon}</span>
                              <span className="text-sm text-green-600 ml-2">({couponDiscount}% off)</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeCoupon}
                              className="text-green-700 hover:text-green-800"
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => navigate(-1)}
                          className="text-gray-600"
                        >
                          Back
                        </Button>
                        
                        <Button 
                          type="submit" 
                          className={`px-5 py-2 md:px-8 md:py-2.5 ${getButtonClass()} gap-2`}
                        >
                          Continue to Payment
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div id="payment-section" className="space-y-6">
                    <div className="checkout-section">
                      <h2 className="checkout-section-title">
                        <Truck className="mr-2 text-gray-600" /> Shipping Information
                      </h2>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500">Name</div>
                          <div className="font-medium">{formState.firstName} {formState.lastName}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Email</div>
                          <div className="font-medium">{formState.email}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Phone</div>
                          <div className="font-medium">{formState.phone}</div>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="text-sm font-medium text-gray-500">Shipping Address</div>
                          <div className="font-medium">{formState.address}</div>
                          <div>{formState.city}, {formState.state} {formState.zipCode}</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button 
                          variant="link" 
                          onClick={() => setShowCardForm(false)}
                          className="text-sm p-0"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                    
                    <div className="checkout-section">
                      <h2 className="checkout-section-title">
                        <CreditCard className="mr-2 text-gray-600" /> Payment Information
                      </h2>
                      
                      <div className="space-y-6">
                        <SquarePayment 
                          onSuccess={handlePaymentSuccess}
                          buttonColorClass={getButtonClass()}
                          isProcessing={isProcessing}
                          amount={`$${calculateTotal()}`}
                        />
                        
                        <div className="flex items-center text-xs md:text-sm text-gray-500 mt-4 justify-center md:justify-start">
                          <Lock size={14} className="mr-1" />
                          <span>Your payment information is secure and encrypted</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Order Summary */}
              <div className="w-full lg:w-1/3 order-1 lg:order-2">
                <div className="checkout-section sticky top-6">
                  <h2 className="checkout-section-title">
                    <ShoppingBag className="mr-2 text-gray-600" /> Order Summary
                  </h2>
                  
                  <div className="mb-5 bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between mb-2">
                      <span className={`font-semibold ${getTextColorClass()}`}>{packageDetails.name} Package</span>
                      <span className="font-semibold">{packageDetails.price}</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600">{packageDetails.description}</p>
                    
                    <div className="mt-3 space-y-2">
                      {packageDetails.features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <span className={`${getTextColorClass()} mr-1.5 mt-0.5 shrink-0`}>
                            <Check size={14} />
                          </span>
                          <span className="text-xs text-gray-600">{feature}</span>
                        </div>
                      ))}
                      {packageDetails.features.length > 2 && (
                        <div className="text-xs text-primary font-medium cursor-pointer hover:underline">
                          + {packageDetails.features.length - 2} more features
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Add-ons Section */}
                  <div className="border-t border-gray-100 py-4 mb-4">
                    <h3 className="font-medium text-sm md:text-base mb-3">Add-ons</h3>
                    
                    {/* USB Drive Add-on */}
                    <div className="flex items-center justify-between mb-3 p-2 rounded-md hover:bg-gray-50">
                      <div>
                        <p className="font-medium flex items-center text-sm">
                          <Usb className="mr-1.5 h-3.5 w-3.5" />
                          Custom USB Drive
                        </p>
                        <p className="text-xs text-gray-500">Store your memories safely</p>
                      </div>
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 md:h-8 md:w-8 rounded-full"
                          onClick={() => handleUsbChange(-1)}
                          disabled={usbDrives === 0}
                        >
                          <Minus className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="sr-only">Decrease</span>
                        </Button>
                        <span className="w-5 text-center text-sm">{usbDrives}</span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 md:h-8 md:w-8 rounded-full"
                          onClick={() => handleUsbChange(1)}
                        >
                          <Plus className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="sr-only">Increase</span>
                        </Button>
                      </div>
                    </div>
                    {usbDrives > 0 && (
                      <div className="flex justify-between text-xs mb-3 text-gray-600 px-2">
                        <span>{usbDrives} × $24.95</span>
                        <span className="font-medium">${(usbDrives * USB_DRIVE_PRICE).toFixed(2)}</span>
                      </div>
                    )}
                    
                    {/* Cloud Backup Add-on */}
                    <div className="flex items-center justify-between mb-3 p-2 rounded-md hover:bg-gray-50">
                      <div>
                        <p className="font-medium flex items-center text-sm">
                          <Cloud className="mr-1.5 h-3.5 w-3.5" />
                          Online Media Gallery & Backup
                        </p>
                        <p className="text-xs text-gray-500">1 year included</p>
                      </div>
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 md:h-8 md:w-8 rounded-full"
                          onClick={() => handleCloudChange(-1)}
                          disabled={cloudBackup === 0}
                        >
                          <Minus className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="sr-only">Decrease</span>
                        </Button>
                        <span className="w-5 text-center text-sm">{cloudBackup}</span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 md:h-8 md:w-8 rounded-full"
                          onClick={() => handleCloudChange(1)}
                          disabled={cloudBackup === 1}
                        >
                          <Plus className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="sr-only">Increase</span>
                        </Button>
                      </div>
                    </div>
                    {cloudBackup > 0 && (
                      <div className="flex justify-between text-xs mb-3 text-gray-600 px-2">
                        <span>{cloudBackup} × $0.00</span>
                        <span className="font-medium">Included</span>
                      </div>
                    )}

                    {/* Digitizing Speed Display in Summary */}
                    <div className="flex justify-between p-2 rounded-md hover:bg-gray-50">
                      <div>
                        <p className="font-medium flex items-center text-sm">
                          <Calendar className="mr-1.5 h-3.5 w-3.5" />
                          Digitizing Speed
                        </p>
                        <p className="text-xs text-gray-500">
                          {getSelectedDigitizingOption().name} ({getSelectedDigitizingOption().time})
                        </p>
                      </div>
                      <span className="font-medium text-sm">
                        {getSelectedDigitizingOption().price === 0 
                          ? <span className="text-green-600">Free</span> 
                          : `$${getSelectedDigitizingOption().price.toFixed(2)}`
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3 mb-3">
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Subtotal</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between mb-1 text-sm text-green-600">
                        <span>Coupon ({appliedCoupon}) - {couponDiscount}% off</span>
                        <span>-${(calculateSubtotal() * (couponDiscount / 100)).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="font-bold">${calculateTotal()}</span>
                    </div>
                    
                    <div className="mt-4 flex items-center">
                      <div className="p-1.5 bg-green-100 rounded-full mr-2">
                        <Truck size={14} className="text-green-600" />
                      </div>
                      <span className="text-xs text-green-700">Free shipping both ways</span>
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
