
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
              <Button className="btn-primary text-lg">Get Started</Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white text-lg">
                Learn More
              </Button>
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
                    src="/lovable-uploads/fbd7faa9-1409-4b8f-83d0-890cfea5a337.png" 
                    alt="Family looking at photo album together" 
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="overflow-hidden rounded-lg">
                  <AspectRatio ratio={1/1}>
                    <img 
                      src="/lovable-uploads/2c601208-3e17-4e1e-8999-5fab5c96ed24.png" 
                      alt="Protected family photos with shield" 
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                </div>
                <div className="overflow-hidden rounded-lg">
                  <AspectRatio ratio={1/1}>
                    <img 
                      src="/lovable-uploads/99117b25-0237-44c1-b6d2-561f1b5a37ef.png" 
                      alt="VHS tape and photographs" 
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                </div>
                <div className="overflow-hidden rounded-lg">
                  <AspectRatio ratio={1/1}>
                    <img 
                      src="/lovable-uploads/0d217c0f-0b4f-40fc-b400-5ec460102ee3.png" 
                      alt="Technician digitizing media" 
                      className="object-cover w-full h-full"
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
