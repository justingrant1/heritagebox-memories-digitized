
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto flex justify-between items-center container-padding">
        <a href="/" className="flex items-center gap-2">
          <h1 className={`text-primary font-serif font-bold text-2xl`}>
            Heritage<span className="text-secondary">Box</span>
          </h1>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-primary hover:text-secondary transition-colors">How It Works</a>
          <a href="#packages" className="text-primary hover:text-secondary transition-colors">Packages</a>
          <a href="#about" className="text-primary hover:text-secondary transition-colors">About Us</a>
          <a href="#faq" className="text-primary hover:text-secondary transition-colors">FAQ</a>
          <Button className="btn-secondary">Get Started</Button>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-primary" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white w-full shadow-lg animate-fade-in">
          <div className="container mx-auto py-4 flex flex-col space-y-4 container-padding">
            <a href="#how-it-works" className="text-primary hover:text-secondary transition-colors py-2 border-b border-gray-100" onClick={toggleMenu}>How It Works</a>
            <a href="#packages" className="text-primary hover:text-secondary transition-colors py-2 border-b border-gray-100" onClick={toggleMenu}>Packages</a>
            <a href="#about" className="text-primary hover:text-secondary transition-colors py-2 border-b border-gray-100" onClick={toggleMenu}>About Us</a>
            <a href="#faq" className="text-primary hover:text-secondary transition-colors py-2 border-b border-gray-100" onClick={toggleMenu}>FAQ</a>
            <Button className="btn-secondary w-full">Get Started</Button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default NavBar;
