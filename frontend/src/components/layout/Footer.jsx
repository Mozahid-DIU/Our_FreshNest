import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-forest text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌿</span>
              <span className="font-serif text-xl font-bold">FreshNest</span>
            </Link>
            <p className="text-green-light text-sm">Reducing post-harvest losses across Bangladesh. Connect farmers to markets with smart storage and logistics.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-green-light text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/#features" className="hover:text-white">Features</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-white">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-green-light text-sm">
              <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white">Register</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-green-light hover:text-white"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-green-light hover:text-white"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-green-light hover:text-white"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-green-light hover:text-white"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-green-dark mt-8 pt-8 text-center text-green-light text-sm">
          © {currentYear} FreshNest. MIT License.
        </div>
      </div>
    </footer>
  );
}

export default Footer;