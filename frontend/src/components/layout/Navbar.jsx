import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const scrollTo = (id) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '#features', onClick: () => scrollTo('features') },
    { label: 'How It Works', href: '#how-it-works', onClick: () => scrollTo('how-it-works') },
    { label: 'About', href: '#about', onClick: () => scrollTo('about') },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-serif text-xl font-bold text-forest">FreshNest</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button key={link.label} onClick={link.onClick || (() => window.scrollTo(0,0))} className="text-gray-600 hover:text-forest font-medium">
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-forest font-medium hover:bg-forest/5 rounded-lg">Sign In</Link>
            <Link to="/register" className="px-4 py-2 bg-green text-white font-medium rounded-lg hover:bg-green-dark transition">Get Started</Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <button key={link.label} onClick={link.onClick || (() => setIsOpen(false))} className="block w-full text-left py-2 text-gray-600">{link.label}</button>
            ))}
            <div className="pt-3 border-t flex gap-3">
              <Link to="/login" className="flex-1 px-4 py-2 text-center border border-forest text-forest rounded-lg">Sign In</Link>
              <Link to="/register" className="flex-1 px-4 py-2 text-center bg-green text-white rounded-lg">Get Started</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;