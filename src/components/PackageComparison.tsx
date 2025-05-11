import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface PackageProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

const Package = ({ name, price, description, features, popular, color }: PackageProps) => {
  // Create a button class based on the package type
  const getButtonClass = () => {
    if (popular) {
      return 'bg-secondary hover:bg-secondary-light text-primary font-semibold';
    }
    
    // Custom handling for each color
    switch (color) {
      case 'primary':
        return 'bg-primary hover:bg-primary-light text-white';
      case 'rose-dark':
        return 'bg-rose-dark hover:bg-rose/90 text-white';
      case 'primary-light':
        return 'bg-primary-light hover:bg-primary-light/90 text-white';
      default:
        return `bg-${color} hover:bg-${color}/90 text-white`;
    }
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${popular ? 'transform-gpu scale-105 shadow-xl border-secondary' : 'hover:border-primary-light'}`}>
      {popular && (
        <div className="absolute top-0 right-0 bg-secondary text-primary px-4 py-1 text-sm font-semibold rounded-bl-lg">
          Most Popular
        </div>
      )}
      <CardHeader className={`pb-0 ${popular ? 'bg-secondary/10' : ''}`}>
        <h3 className={`text-xl font-bold mb-1 ${popular ? 'text-secondary' : `text-${color}`}`}>{name}</h3>
        <div className="mb-2">
          <span className="text-4xl font-bold">{price}</span>
        </div>
        <p className="text-gray-600">{description}</p>
      </CardHeader>
      <CardContent className="pt-6">
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className={`${popular ? 'text-secondary' : `text-${color}`} mr-3 mt-0.5 shrink-0`}>
                <Check size={18} className="stroke-[2.5]" />
              </span>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          className={`w-full ${getButtonClass()}`}
          asChild
        >
          <Link to={`/package-selected?package=${encodeURIComponent(name)}`}>
            Choose {name}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const PackageComparison = () => {
  const packages = [
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

  return (
    <section id="packages" className="bg-cream py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Choose Your Package</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect package to preserve your cherished memories for generations to come.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
          {packages.map((pkg, index) => (
            <Package
              key={index}
              name={pkg.name}
              price={pkg.price}
              description={pkg.description}
              features={pkg.features}
              popular={pkg.popular}
              color={pkg.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PackageComparison;
