
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 bg-cream relative overflow-hidden">
      <div className="container mx-auto container-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary">
              Preserve Your <span className="text-secondary">Precious Memories</span> Forever
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-lg">
              We digitize your VHS tapes, photos, and other media to keep your memories safe for generations to come.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/package-selected?package=Popular" className="inline-block">
                <Button className="bg-primary text-white hover:bg-primary/90 text-lg touch-manipulation select-none active:scale-95 transition-transform duration-75">
                  Get Started
                </Button>
              </Link>
              <Link to="/#how-it-works" className="inline-block">
                <Button 
                  className="border border-primary bg-transparent text-primary hover:bg-primary hover:text-white text-lg touch-manipulation select-none active:scale-95 transition-transform duration-75"
                >
                  Learn More
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center space-x-6">
              <div className="flex -space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-gray-500 border-2 border-white"></div>
              </div>
              <div>
                <p className="font-medium">Trusted by 10,000+ families</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-secondary">★</span>
                  ))}
                  <span className="ml-1 text-sm">4.9/5</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-secondary/20 absolute inset-0 rounded-3xl transform rotate-3"></div>
            <div className="bg-primary/10 absolute inset-0 rounded-3xl transform -rotate-3"></div>
            <div className="relative bg-white p-6 rounded-3xl shadow-xl">
              <div className="rounded-lg mb-4 overflow-hidden">
                <AspectRatio ratio={16/9} className="bg-gray-100">
                  <img 
                    src="/lovable-uploads/ad279416-58a2-4b0d-8d54-d7ef25d60e52.png" 
                    alt="Family gathered around TV watching digitized memories from HeritageBox conversion service" 
                    className="object-cover w-full h-full"
                    loading="eager" 
                    fetchPriority="high"
                  />
                </AspectRatio>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="overflow-hidden rounded-lg">
                  <AspectRatio ratio={1/1}>
                    <img 
                      src="/lovable-uploads/2d60a6ef-6368-475b-9e4f-86789351e721.png" 
                      alt="Vintage VHS tape labeled Summer '94 ready for digitization service" 
                      className="object-cover w-full h-full"
                      loading="eager"
                    />
                  </AspectRatio>
                </div>
                <div className="overflow-hidden rounded-lg">
                  <AspectRatio ratio={1/1}>
                    <img 
                      src="/lovable-uploads/f857465b-320f-4fe1-b778-9a8b0e233ce3.png" 
                      alt="Collection of vintage family photographs ready for professional scanning and preservation" 
                      className="object-cover w-full h-full"
                      loading="eager"
                    />
                  </AspectRatio>
                </div>
                <div className="overflow-hidden rounded-lg">
                  <AspectRatio ratio={1/1}>
                    <img 
                      src="/lovable-uploads/f089a63b-496c-42fc-97d1-fd43f38c9525.png" 
                      alt="Professional digitization process showing VHS conversion to digital format using specialized equipment" 
                      className="object-cover w-full h-full"
                      loading="eager"
                    />
                  </AspectRatio>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-rose/50 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-secondary/40 rounded-full filter blur-3xl"></div>
    </section>
  );
};

export default Hero;
