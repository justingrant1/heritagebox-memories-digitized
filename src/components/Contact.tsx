
import React from "react";
import { Box, Package } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="container mx-auto container-padding">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-primary text-center mb-8">Get In Touch</h1>
          <p className="text-center text-lg mb-12">Have questions or need assistance with preserving your memories? Our team is here to help!</p>

          {/* Ready to Preserve Banner */}
          <div className="mb-16 bg-white rounded-xl p-6 md:p-10 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2">
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Ready to Preserve Your Memories?</h2>
                <p className="text-gray-700 mb-6">Get started today and save 15% on your first order. Let us help you digitize and preserve your irreplaceable memories.</p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/package-selected?package=Popular">
                    <Button className="btn-primary flex items-center gap-2">
                      <Box size={18} />
                      Get Your Box
                    </Button>
                  </Link>
                  <Link to="/#packages">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                      View Packages
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-cream p-4 rounded-lg">
                <h3 className="font-bold text-xl mb-2">Limited Time Offer</h3>
                <p className="mb-2">Use code <span className="font-bold text-secondary">HERITAGE15</span> at checkout for 15% off your first order.</p>
                <p className="text-sm text-gray-500">*Offer valid for new customers only. Expires on December 31, 2025.</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4 text-primary">Contact Information</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="font-medium">Address:</span>
                  <address className="not-italic">
                    123 Memory Lane<br />
                    Heritage City, HC 12345
                  </address>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Phone:</span>
                  <a href="tel:+11234567890" className="text-secondary hover:underline">(123) 456-7890</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Email:</span>
                  <a href="mailto:info@heritagebox.com" className="text-secondary hover:underline">info@heritagebox.com</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Hours:</span>
                  <div>
                    Monday - Friday: 9am - 6pm EST<br />
                    Saturday: 10am - 4pm EST<br />
                    Sunday: Closed
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4 text-primary">Send Us a Message</h3>
              <form>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                  <input type="text" id="name" className="w-full p-2 border rounded-md" />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" id="email" className="w-full p-2 border rounded-md" />
                </div>
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                  <textarea id="message" rows={4} className="w-full p-2 border rounded-md"></textarea>
                </div>
                <Button className="w-full">Send Message</Button>
              </form>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden">
            <AspectRatio ratio={16/9}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2062952883845!2d-73.98750652334057!3d40.74881897138627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b30eac9f%3A0xaca8d8280f1bc7d4!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1682928525392!5m2!1sen!2sus"
                width="600" 
                height="450" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="HeritageBox Location"
                className="w-full h-full"
              ></iframe>
            </AspectRatio>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
