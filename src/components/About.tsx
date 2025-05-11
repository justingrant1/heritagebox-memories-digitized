
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <section id="about" className="bg-primary text-white section-padding">
      <div className="container mx-auto container-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About HeritageBox</h2>
            <p className="mb-4 text-lg">
              HeritageBox was founded with a simple mission: to help people preserve and share their most precious memories for generations to come.
            </p>
            <p className="mb-4">
              We understand that your old photos, VHS tapes, film reels, and slides aren't just media—they're irreplaceable treasures that tell your family's unique story. That's why our team of skilled technicians treats every item with the utmost care and attention.
            </p>
            <p className="mb-8">
              With decades of combined experience in media preservation and digital conversion, we've helped thousands of families across America save their memories from deterioration and make them accessible for future generations.
            </p>
            <Button className="bg-secondary text-primary hover:bg-secondary-light">Learn More About Us</Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-cream h-48 rounded-lg shadow-lg"></div>
              <div className="bg-rose h-64 rounded-lg shadow-lg"></div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="bg-secondary h-64 rounded-lg shadow-lg"></div>
              <div className="bg-primary-light h-48 rounded-lg shadow-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
