
import { Package, Upload, Archive } from 'lucide-react';

const StepCard = ({ 
  number, 
  title, 
  description, 
  icon: Icon 
}: { 
  number: number; 
  title: string; 
  description: string; 
  icon: any 
}) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="bg-secondary rounded-full w-16 h-16 flex items-center justify-center mb-4">
        <Icon size={32} className="text-primary" />
      </div>
      <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mb-4 -mt-10 ml-8">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Pack Your Memories",
      description: "Select your package, then gather and pack your media in our custom box.",
      icon: Package
    },
    {
      number: 2,
      title: "We Digitize Everything",
      description: "Our technicians carefully handle and digitize your precious memories.",
      icon: Upload
    },
    {
      number: 3,
      title: "Enjoy & Share Forever",
      description: "Access your digitized memories online and through included media.",
      icon: Archive
    }
  ];

  return (
    <section id="how-it-works" className="section-padding">
      <div className="container mx-auto container-padding">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Preserving your memories is easy with our simple 3-step process.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <StepCard 
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
