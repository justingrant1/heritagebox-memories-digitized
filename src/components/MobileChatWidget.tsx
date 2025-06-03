
import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const MobileChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      // For now, we'll just show a confirmation
      // In a real implementation, this would send to your support system
      alert('Thank you for your message! We\'ll get back to you soon.');
      setMessage('');
      setIsOpen(false);
      setHasStarted(false);
    }
  };

  const startChat = () => {
    if (email.trim()) {
      setHasStarted(true);
    }
  };

  return (
    <>
      {/* Chat Button - Fixed position for mobile */}
      <div className="fixed bottom-4 right-4 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-80 z-50">
          <div className="bg-white rounded-lg shadow-xl border">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="font-semibold">Chat with HeritageBox</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  setHasStarted(false);
                  setEmail('');
                  setMessage('');
                }}
                className="text-white hover:bg-blue-700 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Content */}
            <div className="p-4 h-64 md:h-80 overflow-y-auto">
              {!hasStarted ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Hi! We're here to help with your memory digitization needs. Please enter your email to start chatting.
                  </p>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                    />
                    <Button
                      onClick={startChat}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={!email.trim()}
                    >
                      Start Chat
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm">
                      Thanks for reaching out! How can we help you with your memory digitization project today?
                    </p>
                  </div>
                  <Textarea
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                    disabled={!message.trim()}
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileChatWidget;
