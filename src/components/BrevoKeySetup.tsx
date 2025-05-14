
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Key } from 'lucide-react';

const BrevoKeySetup = () => {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderEmail, setSenderEmail] = useState('');

  // Check if API key is already stored
  useEffect(() => {
    const storedApiKey = localStorage.getItem('brevo_api_key');
    const storedRecipient = localStorage.getItem('brevo_recipient_email');
    const storedSender = localStorage.getItem('brevo_sender_email');
    
    if (storedApiKey) setApiKey(storedApiKey);
    if (storedRecipient) setRecipientEmail(storedRecipient);
    if (storedSender) setSenderEmail(storedSender || 'website@example.com');
  }, []);

  const handleSave = () => {
    if (!apiKey) {
      toast.error("API key is required");
      return;
    }
    
    if (!recipientEmail || !recipientEmail.includes('@')) {
      toast.error("Valid recipient email is required");
      return;
    }
    
    if (!senderEmail || !senderEmail.includes('@')) {
      toast.error("Valid sender email is required");
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('brevo_api_key', apiKey);
    localStorage.setItem('brevo_recipient_email', recipientEmail);
    localStorage.setItem('brevo_sender_email', senderEmail);
    
    toast.success("Brevo settings saved successfully!");
    setOpen(false);
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
      >
        <Key size={16} />
        <span>Brevo Setup</span>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Brevo API Setup</DialogTitle>
            <DialogDescription>
              Enter your Brevo API key and email settings to enable form submissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Brevo API Key</Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="xkeysib-..."
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                This is where form submissions will be sent
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senderEmail">Sender Email</Label>
              <Input
                id="senderEmail"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="website@example.com"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Must be a verified sender in your Brevo account
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BrevoKeySetup;
