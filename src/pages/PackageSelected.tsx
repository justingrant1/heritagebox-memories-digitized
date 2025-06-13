
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';
import { Check, Clock, Truck, Shield, Gift, Plus, Minus } from 'lucide-react';

const PackageSelected = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packageType = searchParams.get('package') || 'Popular';
  const [usbDrives, setUsbDrives] = useState(0);
  const [digitizingSpeed, setDigitizingSpeed] = useState('standard');

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const getPackageColor = (type: string) => {
    switch(type) {
      case 'Starter': return { bg: 'bg-primary', text: 'text-primary', accent: 'border-primary' };
      case 'Dusty Rose': return { bg: 'bg-rose-500', text: 'text-rose-500', accent: 'border-rose-500' };
      case 'Eternal': return { bg: 'bg-primary-light', text: 'text-primary-light', accent: 'border-primary-light' };
      case 'Popular': 
      default: return { bg: 'bg-secondary', text: 'text-secondary', accent: 'border-secondary' };
    }
  };

  const colors = getPackageColor(packageType);

  const getPackageDetails = (type: string) => {
    switch(type) {
      case 'Starter':
        return {
          subtitle: 'Perfect for getting started',
          content: 'Up to 10 tapes OR 300 photos',
          features: ['Basic digitization', 'Digital download', 'Standard quality']
        };
      case 'Dusty Rose':
        return {
          subtitle: 'For preserving precious moments',
          content: 'Up to 20 tapes OR 600 photos',
          features: ['Premium digitization', 'Cloud storage', 'Enhanced quality']
        };
      case 'Eternal':
        return {
          subtitle: 'For preserving a lifetime of memories',
          content: 'Up to 40 tapes OR 1000 photos',
          features: ['Professional digitization', 'Premium cloud storage', 'Highest quality', 'Priority processing']
        };
      case 'Popular':
      default:
        return {
          subtitle: 'Most chosen by our customers',
          content: 'Up to 25 tapes OR 750 photos',
          features: ['Professional digitization', 'Cloud storage', 'High quality', 'Fast processing']
        };
    }
  };

  const packageDetails = getPackageDetails(packageType);

  const digitizingOptions = [
    { id: 'standard', name: 'Standard', time: '6-8 weeks', price: 0 },
    { id: 'priority', name: 'Priority', time: '3-4 weeks', price: 29 },
    { id: 'express', name: 'Express', time: '1-2 weeks', price: 59 }
  ];

  const handleContinue = () => {
    const params = new URLSearchParams({
      package: packageType,
      usbDrives: usbDrives.toString(),
      digitizingSpeed
    });
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-white">
      <NavBar />
      
      <main className="flex-grow">
        <CountdownTimer />
        
        {/* Success Banner */}
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 md:p-6 mb-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-green-800 mb-1">
                    Great choice! You're almost done
                  </h2>
                  <p className="text-green-700 text-sm md:text-base">
                    You're one step closer to preserving your cherished memories for generations to come.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            
            {/* Header Section */}
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                Thank You for Choosing Our
              </h1>
              <div className={`inline-block ${colors.text} text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6`}>
                {packageType} Package
              </div>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {packageDetails.subtitle}
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
              <div className="flex items-center justify-center gap-3 bg-white rounded-xl p-4 md:p-6 shadow-sm border">
                <div className="bg-green-100 p-2 rounded-full">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-semibold text-gray-800 text-sm md:text-base">100% Satisfaction Guarantee</span>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white rounded-xl p-4 md:p-6 shadow-sm border">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-800 text-sm md:text-base">Free Shipping Both Ways</span>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white rounded-xl p-4 md:p-6 shadow-sm border">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-semibold text-gray-800 text-sm md:text-base">Fast Turnaround Time</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Package Details Card */}
              <Card className="bg-white shadow-xl border-0 overflow-hidden">
                <CardHeader className={`${colors.bg} text-white p-6 md:p-8`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl md:text-3xl font-bold mb-2">
                        {packageType}
                      </CardTitle>
                      <p className="text-white/90 text-sm md:text-base">
                        {packageDetails.subtitle}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-3 py-1">
                      Selected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-lg md:text-xl mb-3 flex items-center gap-2">
                        <Gift className={`w-5 h-5 ${colors.text}`} />
                        Digitize Content
                      </h3>
                      <p className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                        {packageDetails.content}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-base md:text-lg mb-3 text-gray-800">What's Included:</h4>
                      <ul className="space-y-2">
                        {packageDetails.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <Check className={`w-4 h-4 ${colors.text} shrink-0`} />
                            <span className="text-gray-700 text-sm md:text-base">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customization Options */}
              <div className="space-y-6">
                
                {/* USB Drives Add-on */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
                      <Gift className={`w-6 h-6 ${colors.text}`} />
                      Additional USB Drives
                    </CardTitle>
                    <p className="text-gray-600 text-sm md:text-base">Get physical copies of your digitized memories</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-base md:text-lg">USB Drive</p>
                        <p className="text-sm text-gray-600">$15 each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUsbDrives(Math.max(0, usbDrives - 1))}
                          className="w-8 h-8 p-0"
                          disabled={usbDrives === 0}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-lg">{usbDrives}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUsbDrives(usbDrives + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {usbDrives > 0 && (
                      <div className="text-right">
                        <span className="text-lg font-semibold text-gray-800">
                          Subtotal: ${usbDrives * 15}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Digitizing Speed */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
                      <Clock className={`w-6 h-6 ${colors.text}`} />
                      Digitizing Speed
                    </CardTitle>
                    <p className="text-gray-600 text-sm md:text-base">Choose how fast you want your memories back</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {digitizingOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          digitizingSpeed === option.id
                            ? `${colors.accent} bg-opacity-5`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setDigitizingSpeed(option.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              digitizingSpeed === option.id
                                ? `${colors.accent} ${colors.bg}`
                                : 'border-gray-300'
                            }`}>
                              {digitizingSpeed === option.id && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-base md:text-lg">{option.name}</p>
                              <p className="text-sm text-gray-600">{option.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {option.price > 0 ? (
                              <span className="font-semibold text-lg">+${option.price}</span>
                            ) : (
                              <span className="text-gray-500">Free</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Continue Button */}
                <div className="sticky bottom-4 lg:static lg:bottom-auto">
                  <Button 
                    onClick={handleContinue}
                    className={`w-full ${colors.bg} hover:opacity-90 text-white text-lg md:text-xl font-semibold py-4 md:py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}
                  >
                    Continue to Checkout
                  </Button>
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

export default PackageSelected;
