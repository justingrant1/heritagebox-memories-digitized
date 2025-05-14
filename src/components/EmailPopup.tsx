
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { sendEmailToHeritageBox } from '@/utils/emailUtils';

const EmailPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if the user has seen the popup before
    const hasSeenPopup = localStorage.getItem('hasSeenEmailPopup');
    
    if (!hasSeenPopup) {
      // Wait a moment before showing the popup
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send email to info@heritagebox.com using our utility function
      await sendEmailToHeritageBox({ email, referrer: document.referrer }, 'welcome-popup');
      
      // Mark that the user has seen the popup
      localStorage.setItem('hasSeenEmailPopup', 'true');
      
      // Show success message
      toast.success("Thank you! Your 15% discount code has been sent to your email.");
      
      // Close the dialog
      setOpen(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error("There was a problem processing your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    localStorage.setItem('hasSeenEmailPopup', 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-primary">Save 15% on Your First Order</DialogTitle>
          <DialogDescription className="text-lg mt-2">
            Sign up for updates and receive a 15% discount code for your first order.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="popup-email">Email</Label>
            <Input 
              id="popup-email"
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full bg-secondary text-primary hover:bg-secondary-light"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Get My 15% Off"}
            </Button>
            <button 
              type="button"
              onClick={handleClose}
              className="text-sm text-gray-500 hover:text-gray-700 mt-2"
              disabled={isSubmitting}
            >
              No thanks, I'll pay full price
            </button>
          </div>
        </form>
        
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default EmailPopup;
