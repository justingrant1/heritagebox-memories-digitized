import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';

// Define types for the Square SDK
interface Square {
  payments: (applicationId: string, locationId: string, options?: any) => SquarePayments;
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

const SQUARE_APP_ID = process.env.REACT_APP_SQUARE_APP_ID;
const SQUARE_LOCATION_ID = process.env.REACT_APP_SQUARE_LOCATION_ID;
const SQUARE_JS_URL = process.env.REACT_APP_SQUARE_JS_URL;

const SquarePayment = ({ onSuccess, buttonColorClass, isProcessing, amount }: SquarePaymentProps) => {
  const [loaded, setLoaded] = useState(false);
  const [card, setCard] = useState<SquareCard | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clean up any previous script instances to prevent conflicts
    const existingScript = document.getElementById('square-script');
    if (existingScript) {
      document.body.removeChild(existingScript);
    }

    // Load the Square Web Payments SDK
    const script = document.createElement('script');
    script.id = 'square-script';
    script.src = SQUARE_JS_URL;
    script.async = true;
    script.onload = () => {
      console.log("Square SDK loaded successfully");
      setLoaded(true);
    };
    script.onerror = (e) => {
      console.error("Failed to load Square SDK:", e);
      setError("Failed to load payment processor");
      toast.error("Failed to load payment processor", {
        description: "Please refresh the page and try again",
      });
    };
    document.body.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('square-script');
      if (scriptToRemove) {
        document.body.removeChild(scriptToRemove);
      }
    };
  }, []);

  useEffect(() => {
    if (!loaded || card) return;

    async function initializeCard() {
      if (!window.Square) {
        console.error("Square SDK not available");
        setError("Payment processor not available");
        toast.error("Payment processor not available", {
          description: "Please refresh the page and try again",
        });
        return;
      }

      try {
        setCardLoading(true);
        console.log("Initializing Square Payments with app ID:", SQUARE_APP_ID, SQUARE_LOCATION_ID, process.env.NODE_ENV);

        // Initialize with proper configuration using app ID and location ID
        const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID, {
          environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        });

        console.log("Creating card instance");
        const cardInstance = await payments.card();

        // Make sure the container is ready before attaching
        const container = document.getElementById('card-container');
        if (!container) {
          throw new Error('Card container not found in DOM');
        }

        console.log("Attaching card to container");
        await cardInstance.attach('#card-container');
        console.log("Card attached successfully");

        setCard(cardInstance);
        setError(null);
      } catch (e) {
        console.error("Square initialization error:", e);
        setError("Failed to initialize payment form");
        toast.error("Failed to initialize payment form", {
          description: "Please try again or use a different payment method",
        });
      } finally {
        setCardLoading(false);
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
      console.error("Square payment error:", e);
      toast.error("Payment processing error", {
        description: "Please try again or use a different card",
      });
    }
  };

  const renderCardContainer = () => {
    /*if (cardLoading) {
      return (
        <div className="min-h-[100px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading payment form...</span>
        </div>
      );
    }*/

    if (error) {
      return (
        <div className="min-h-[100px] flex flex-col items-center justify-center text-red-500 p-4">
          <p className="font-medium">{error}</p>
          <p className="text-sm mt-2">Please refresh the page or try a different browser</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Refresh Page
          </Button>
        </div>
      );
    }

    if (!loaded) {
      return (
        <div className="min-h-[100px] flex items-center justify-center">
          <p className="text-gray-500">Loading payment form...</p>
        </div>
      );
    }

    return <div id="card-container" className="min-h-[100px]"></div>;
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-md bg-white">
        {renderCardContainer()}
      </div>
      <div className="text-center md:text-left">
        <Button
          onClick={handlePaymentSubmit}
          className={`px-8 py-6 text-lg ${buttonColorClass}`}
          disabled={isProcessing || !card || !!error}
        >
          {isProcessing ? "Processing..." : `Pay ${amount}`}
        </Button>
      </div>
    </div>
  );
};

export default SquarePayment;
