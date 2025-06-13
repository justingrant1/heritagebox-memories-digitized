
import { Package, Upload, Archive, ArrowRight } from 'lucide-react';

const StepCard = ({ 
  number, 
  title, 
  description, 
  icon: Icon,
  isLast = false
}: { 
  number: number; 
  title: string; 
  description: string; 
  icon: any;
  isLast?: boolean;
}) => {
  return (
    <div className="flex flex-col items-center text-center relative">
      {/* Connection line */}
      {!isLast && (
        <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-secondary to-secondary-light z-0 transform translate-x-4">
          <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 w-4 h-4 text-secondary" />
        </div>
      )}
      
      <div className="relative z-10 mb-6">
        <div className="bg-gradient-to-br from-secondary to-secondary-light rounded-2xl w-20 h-20 flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Icon size={36} className="text-primary" />
        </div>
        <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center -mt-12 ml-10 shadow-lg font-bold text-lg">
          {number}
        </div>
      </div>
      
      <div className="space-y-3 max-w-sm">
        <h3 className="text-2xl font-bold text-primary">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Pack Your Memories",
      description: "Select your package, then gather and pack your media in our custom secure box with tracking.",
      icon: Package
    },
    {
      number: 2,
      title: "We Digitize Everything",
      description: "Our expert technicians carefully handle and digitize your precious memories using professional equipment.",
      icon: Upload
    },
    {
      number: 3,
      title: "Enjoy & Share Forever",
      description: "Access your digitized memories online and through included media. Share with family and friends easily.",
      icon: Archive
    }
  ];

  return (
    <section id="how-it-works" className="section-padding bg-gradient-to-b from-white to-cream/50">
      <div className="container mx-auto container-padding">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-secondary/10 rounded-full px-4 py-2 mb-6">
            <span className="text-secondary font-medium">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Preserving your memories is easy with our simple 3-step process. We handle everything with care and precision.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
          {steps.map((step, index) => (
            <StepCard 
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
              icon={step.icon}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
        
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 bg-primary/5 rounded-full px-6 py-3 border border-primary/10">
            <span className="text-primary font-medium">🔒 Your memories are safe with us - fully insured shipping both ways</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
