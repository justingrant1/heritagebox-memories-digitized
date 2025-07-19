
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CreditCard as CardIcon, ShieldCheck } from 'lucide-react';
import styles from './SquarePayment.module.css';

// Define types for the Square SDK
interface Square {
  payments: (applicationId: string, locationId: string, options?: any) => SquarePayments;
}

interface SquarePayments {
  card: (options?: CardOptions) => Promise<SquareCard>;
}

interface CardOptions {
  style?: {
    fontSize?: string;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    lineHeight?: string;
    placeholderColor?: string;
    '.input-container'?: {
      borderRadius?: string;
      borderColor?: string;
      borderWidth?: string;
    };
    '.input-container.is-focus'?: {
      borderColor?: string;
    };
    '.input-container.is-error'?: {
      borderColor?: string;
    };
  };
}

interface SquareCard {
  attach: (selector: string, options?: any) => Promise<void>;
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
  destroy?: () => void;
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

// Environment-aware configuration
const getSquareConfig = () => {
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1' && 
                       !window.location.hostname.includes('preview');
  
  return {
    appId: 'sq0idp-1Zchx5RshtaZ74spcf2w0A',
    locationId: 'LPFZYDYB5G5GM',
    environment: isProduction ? 'production' : 'sandbox',
    jsUrl: 'https://web.squarecdn.com/v1/square.js'
  };
};

// Mobile detection utility
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (window.innerWidth <= 768);
};

const SquarePayment = ({ onSuccess, buttonColorClass, isProcessing, amount }: SquarePaymentProps) => {
  const [loaded, setLoaded] = useState(false);
  const [card, setCard] = useState<SquareCard | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile] = useState(isMobileDevice());
  const [config] = useState(getSquareConfig());

  // Cleanup function to destroy card instance
  const cleanupCard = () => {
    if (card && typeof card.destroy === 'function') {
      try {
        card.destroy();
      } catch (e) {
        console.warn("Error destroying card instance:", e);
      }
    }
  };

  useEffect(() => {
    // Clean up any previous script instances to prevent conflicts
    const existingScript = document.getElementById('square-script');
    if (existingScript) {
      document.body.removeChild(existingScript);
    }

    // Load the Square Web Payments SDK
    const script = document.createElement('script');
    script.id = 'square-script';
    script.src = config.jsUrl;
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
      cleanupCard();
      const scriptToRemove = document.getElementById('square-script');
      if (scriptToRemove) {
        try {
          document.body.removeChild(scriptToRemove);
        } catch (e) {
          console.warn("Script already removed:", e);
        }
      }
    };
  }, [config.jsUrl]);

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
        console.log("Initializing Square Payments:", config);

        // Wait for container to be in DOM before proceeding
        const waitForContainer = () => {
          return new Promise((resolve, reject) => {
            const checkContainer = () => {
              const container = document.getElementById('card-container');
              if (container) {
                resolve(container);
              } else {
                setTimeout(checkContainer, 100);
              }
            };
            checkContainer();
            
            // Timeout after 5 seconds to avoid infinite waiting
            setTimeout(() => reject(new Error('Container timeout')), 5000);
          });
        };

        await waitForContainer();

        // Initialize with environment-aware configuration
        const payments = window.Square.payments(config.appId, config.locationId, {
          environment: config.environment
        });

        console.log("Creating card instance with mobile optimization");
        
        // Mobile-optimized card configuration
        const cardOptions: CardOptions = {
          style: {
            fontSize: isMobile ? '16px' : '14px', // Prevent zoom on iOS
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: '1.5',
            color: '#374151',
            placeholderColor: '#9CA3AF',
            backgroundColor: '#ffffff',
            '.input-container': {
              borderRadius: '8px',
              borderColor: '#D1D5DB',
              borderWidth: '1px'
            },
            '.input-container.is-focus': {
              borderColor: '#3B82F6'
            },
            '.input-container.is-error': {
              borderColor: '#EF4444'
            }
          }
        };

        const cardInstance = await payments.card(cardOptions);

        // Double-check container is still available
        const container = document.getElementById('card-container');
        if (!container) {
          throw new Error('Card container not found in DOM');
        }

        // Add mobile-specific attributes to container
        if (isMobile) {
          container.style.minHeight = '120px';
          container.setAttribute('data-mobile', 'true');
        }

        console.log("Attaching card to container with mobile support");
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

    // Small delay to ensure DOM is ready
    setTimeout(initializeCard, 100);
  }, [loaded, card, config, isMobile]);

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
    if (cardLoading && !card) {
      return (
        <div className={`${styles.cardContainer} ${isMobile ? styles.mobileLoadingContainer : ''} flex items-center justify-center`}>
          <Loader2 className={`h-6 w-6 animate-spin text-gray-500 ${styles.loadingSpinner}`} />
          <span className="ml-2 text-gray-500">
            {isMobile ? 'Loading secure payment...' : 'Loading payment form...'}
          </span>
        </div>
      );
    }

    if (error) {
      return (
        <div className={`${styles.errorContainer} ${styles.cardContainer} flex flex-col items-center justify-center`}>
          <p className="font-medium">{error}</p>
          <p className="text-sm mt-2 text-center">
            {isMobile 
              ? "Please refresh the page or try a different browser" 
              : "Please refresh the page or try a different browser"
            }
          </p>
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
        <div className={`${styles.cardContainer} ${isMobile ? styles.mobileLoadingContainer : ''} flex items-center justify-center`}>
          <Loader2 className={`h-6 w-6 animate-spin text-gray-500 ${styles.loadingSpinner}`} />
          <p className="text-gray-500 ml-2">Loading payment form...</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div 
          id="card-container" 
          className={`${styles.cardContainer} relative`}
          data-mobile={isMobile ? 'true' : 'false'}
          style={{
            // Additional mobile optimizations
            ...(isMobile && {
              touchAction: 'manipulation',
              WebkitUserSelect: 'text',
              userSelect: 'text'
            })
          }}
        />
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <CardIcon size={14} className="mr-1" />
            <span>All major credit cards accepted</span>
          </div>
          {isMobile && (
            <div className={`text-green-600 font-medium ${styles.successIndicator}`}>
              <span>Autocomplete enabled</span>
            </div>
          )}
        </div>
        {isMobile && (
          <div className={`${styles.autocompleteHint}`}>
            💡 Tip: Your browser should offer to save and autofill card information for faster checkout.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${styles.squarePaymentContainer}`}>
      <div className={`p-4 md:p-6 border rounded-xl bg-white shadow-sm ${isMobile ? 'touch-manipulation' : ''}`}>
        <div className="mb-4 pb-3 border-b flex items-center justify-between">
          <div className="flex items-center">
            <CardIcon className="mr-2 text-gray-600" />
            <h3 className="font-medium">Card Information</h3>
          </div>
          {isMobile && (
            <div className={`text-xs text-green-600 font-medium ${styles.successIndicator}`}>
              Mobile Optimized
            </div>
          )}
        </div>
        {renderCardContainer()}
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className={`flex items-center justify-center md:justify-start space-x-2 text-sm text-gray-600 ${!isMobile ? styles.desktopSecurityInfo : ''}`}>
          <ShieldCheck size={16} className="text-green-600" />
          <span>Your payment information is secure and encrypted with 256-bit SSL</span>
        </div>
        <Button
          onClick={handlePaymentSubmit}
          className={`w-full md:w-auto px-8 py-3 ${buttonColorClass} rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all ${
            isMobile ? `min-h-[50px] text-base ${styles.mobilePayButton}` : ''
          }`}
          disabled={isProcessing || !card || !!error}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <Loader2 className={`animate-spin mr-2 h-5 w-5 ${styles.loadingSpinner}`} />
              Processing Payment...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              Pay {amount}
              <ShieldCheck className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SquarePayment;
