
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PackageProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

const Package = ({ name, price, description, features, popular, color }: PackageProps) => {
  return (
    <div className={`package-card border-${color} ${popular ? 'scale-105 shadow-xl' : ''}`}>
      {popular && (
        <div className="absolute top-0 right-0 bg-secondary text-primary px-4 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
          Most Popular
        </div>
      )}
      <h3 className={`text-xl font-bold text-${color} mb-2`}>{name}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
      </div>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <span className={`text-${color} mr-2 mt-1`}><Check size={16} /></span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button className={`w-full bg-${color} hover:bg-${color}/90 text-white`}>Choose {name}</Button>
    </div>
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
    <section id="packages" className="bg-cream section-padding">
      <div className="container mx-auto container-padding">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Package</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect package to preserve your cherished memories for generations to come.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
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
