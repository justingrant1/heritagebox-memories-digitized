
import { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next midnight
      
      const difference = midnight.getTime() - now.getTime();
      
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      return { hours, minutes, seconds };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Initialize immediately
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number): string => {
    return time.toString().padStart(2, '0');
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-secondary via-secondary-light to-secondary rounded-2xl p-6 shadow-2xl mx-4 my-6 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-secondary-light/80"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-full">
              <Zap className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-white font-semibold text-sm uppercase tracking-wider">
              Flash Sale Ends In
            </span>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-white/70 hover:text-white transition-colors text-xl font-light"
          >
            ×
          </button>
        </div>

        {/* Main content */}
        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              15% OFF Everything!
            </h3>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-white text-sm">Use code:</span>
              <span className="bg-white text-secondary font-bold px-3 py-1 rounded-full text-sm tracking-wider">
                SAVE15
              </span>
            </div>
          </div>

          {/* Countdown display */}
          <div className="flex justify-center items-center gap-2 md:gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4 min-w-[70px] md:min-w-[80px]">
              <div className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                {formatTime(timeLeft.hours)}
              </div>
              <div className="text-xs md:text-sm text-white/80 uppercase tracking-wide">
                Hours
              </div>
            </div>
            
            <div className="text-white/60 text-xl md:text-2xl font-light animate-pulse">:</div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4 min-w-[70px] md:min-w-[80px]">
              <div className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                {formatTime(timeLeft.minutes)}
              </div>
              <div className="text-xs md:text-sm text-white/80 uppercase tracking-wide">
                Minutes
              </div>
            </div>
            
            <div className="text-white/60 text-xl md:text-2xl font-light animate-pulse">:</div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4 min-w-[70px] md:min-w-[80px]">
              <div className="text-2xl md:text-3xl font-bold text-white tabular-nums animate-pulse">
                {formatTime(timeLeft.seconds)}
              </div>
              <div className="text-xs md:text-sm text-white/80 uppercase tracking-wide">
                Seconds
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center gap-2 text-white/90">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Sale resets daily at midnight</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
