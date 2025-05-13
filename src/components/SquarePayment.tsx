
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Define types for the Square SDK
interface Square {
  payments: {
    Payments: new (applicationId: string) => SquarePayments;
  };
}

interface SquarePayments {
  card: () => Promise<SquareCard>;
}

interface SquareCard {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<{
    status: string;
    token?: string;
    details?: {
      card?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
      };
    };
  }>;
}

interface SquarePaymentProps {
  onSuccess: (token: string, details: any) => void;
  buttonColorClass: string;
  isProcessing: boolean;
  amount: string;
}

declare global {
  interface Window { Square: Square; }
}

const SQUARE_APP_ID = 'sq0idp-YOUR-PRODUCTION-APP-ID';
// Note: Replace 'sq0idp-YOUR-PRODUCTION-APP-ID' with your actual production Square application ID

const SquarePayment = ({ onSuccess, buttonColorClass, isProcessing, amount }: SquarePaymentProps) => {
  const [loaded, setLoaded] = useState(false);
  const [card, setCard] = useState<SquareCard | null>(null);

  useEffect(() => {
    // Load the Square Web Payments SDK (production URL)
    const script = document.createElement('script');
    script.src = 'https://web.squarecdn.com/v1/square.js';
    script.onload = () => setLoaded(true);
    script.onerror = () => {
      toast.error("Failed to load payment processor", {
        description: "Please refresh the page and try again",
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!loaded || card) return;

    async function initializeCard() {
      if (!window.Square) {
        toast.error("Payment processor not available", {
          description: "Please refresh the page and try again",
        });
        return;
      }

      try {
        const payments = new window.Square.payments.Payments(SQUARE_APP_ID);
        const cardInstance = await payments.card();
        await cardInstance.attach('#card-container');
        setCard(cardInstance);
      } catch (e) {
        toast.error("Failed to initialize payment form", {
          description: "Please try again or use a different payment method",
        });
        console.error("Square initialization error:", e);
      }
    }

    initializeCard();
  }, [loaded, card]);

  const handlePaymentSubmit = async () => {
    if (!card) {
      toast.error("Payment form not ready", {
        description: "Please wait for the payment form to load and try again",
      });
      return;
    }

    try {
      const result = await card.tokenize();
      if (result.status === 'OK' && result.token) {
        onSuccess(result.token, result.details);
      } else {
        toast.error("Payment processing failed", {
          description: "Please check your card details and try again",
        });
      }
    } catch (e) {
      toast.error("Payment processing error", {
        description: "Please try again or use a different card",
      });
      console.error("Square payment error:", e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-md bg-white">
        <div id="card-container" className="min-h-[100px] flex items-center justify-center">
          {!loaded && <p className="text-gray-500">Loading payment form...</p>}
        </div>
      </div>
      <div className="text-center md:text-left">
        <Button 
          onClick={handlePaymentSubmit}
          className={`px-8 py-6 text-lg ${buttonColorClass}`}
          disabled={isProcessing || !card}
        >
          {isProcessing ? "Processing..." : `Pay ${amount}`}
        </Button>
      </div>
    </div>
  );
};

export default SquarePayment;
