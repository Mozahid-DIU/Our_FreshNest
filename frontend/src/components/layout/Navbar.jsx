import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (id) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Home', href: '/', onClick: () => { setIsOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { label: 'Features', href: '#features', onClick: () => scrollTo('features') },
    { label: 'How It Works', href: '#how-it-works', onClick: () => scrollTo('how-it-works') },
    { label: 'About', href: '#about', onClick: () => scrollTo('about') },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-14 lg:h-15">
          <Link to="/" className="flex items-center gap-1.5">
            <span className="text-xl">🌿</span>
            <span className="font-serif text-lg font-bold text-forest">FreshNest</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-4 lg:gap-5">
            {navLinks.map((link) => (
              link.href === '/' ? (
                <Link key={link.label} to={link.href} onClick={link.onClick} className="text-sm text-gray-600 hover:text-forest font-medium transition-colors">
                  {link.label}
                </Link>
              ) : (
                <button key={link.label} onClick={link.onClick || (() => window.scrollTo(0,0))} className="text-sm text-gray-600 hover:text-forest font-medium transition-colors">
                  {link.label}
                </button>
              )
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2.5 lg:gap-3">
            <Link to="/login" className="px-3.5 py-2 text-sm text-forest font-medium hover:bg-forest/5 rounded-lg transition">Sign In</Link>
            <Link to="/register" className="px-4 py-2 bg-green text-sm text-white font-medium rounded-lg hover:bg-green-dark transition">Get Started</Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation menu">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2.5 space-y-1.5">
            {navLinks.map((link) => (
              link.href === '/' ? (
                <Link key={link.label} to={link.href} onClick={link.onClick} className="block w-full text-left py-1.5 text-sm text-gray-600">
                  {link.label}
                </Link>
              ) : (
                <button key={link.label} onClick={link.onClick || (() => setIsOpen(false))} className="block w-full text-left py-1.5 text-sm text-gray-600">{link.label}</button>
              )
            ))}
            <div className="pt-2.5 border-t flex gap-2.5">
              <Link to="/login" className="flex-1 px-4 py-2 text-center border border-forest text-forest rounded-lg text-sm">Sign In</Link>
              <Link to="/register" className="flex-1 px-4 py-2 text-center bg-green text-white rounded-lg text-sm">Get Started</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;