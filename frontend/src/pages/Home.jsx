import { Link } from 'react-router-dom';
import { ArrowRight, Thermometer, Truck, Users, AlertTriangle, BarChart3, Shield, Leaf, Star } from 'lucide-react';
import { PRODUCE_DB, getProduceEmoji } from '../utils/produceDB';

const features = [
  { icon: Thermometer, title: 'Smart Storage Guide', desc: 'Optimal conditions for 24 crops' },
  { icon: Truck, title: 'Logistics Network', desc: 'Connect with verified transporters' },
  { icon: Users, title: 'Direct Deals', desc: 'Farmer-to-dealer without middlemen' },
  { icon: AlertTriangle, title: 'Failure Reporting', desc: 'Real-time delivery incident tracking' },
  { icon: BarChart3, title: 'Dashboard Analytics', desc: 'Role-based insights' },
  { icon: Shield, title: 'Secure & Verified', desc: 'JWT-protected, role-based access' },
];

const steps = [
  { icon: Star, title: 'Register', desc: 'Choose your role as Farmer, Transporter, or Dealer' },
  { icon: Leaf, title: 'List or Browse', desc: 'Add produce or discover available stock' },
  { icon: Users, title: 'Connect & Deal', desc: 'Negotiate, transport, and trade with confidence' },
];

const testimonials = [
  { name: 'Md. Rahim', role: 'Farmer, Rajshahi', quote: 'FreshNest helped me reduce post-harvest losses by 40%. The storage guide is a game changer!' },
  { name: 'Fatema Begum', role: 'Dealer, Dhaka', quote: 'Direct connections with farmers without middlemen mean better margins for my business.' },
  { name: 'Karim Transport', role: 'Logistics Provider', quote: 'The app makes job management simple. I accept requests and track deliveries easily.' },
];

export default function Home() {
  const featuredCrops = PRODUCE_DB.slice(0, 8);

  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-mint/30 to-ivory" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-serif font-bold text-forest mb-6 leading-tight">
                Reduce Post-Harvest Loss.<br />Connect Farmers to Markets.
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                FreshNest is a comprehensive post-harvest storage & logistics management system for farmers, transporters, and dealers in Bangladesh. Save produce, streamline logistics, and trade directly.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" state={{ role: 'farmer' }} className="px-6 py-3 bg-green text-white font-semibold rounded-xl hover:bg-green-dark transition flex items-center gap-2">
                  Start as Farmer <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/register" state={{ role: 'dealer' }} className="px-6 py-3 border-2 border-forest text-forest font-semibold rounded-xl hover:bg-forest hover:text-white transition">
                  Browse as Dealer
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute top-10 left-10 animate-float text-6xl">🍅</div>
              <div className="absolute top-40 right-10 animate-float-delayed text-5xl">🥭</div>
              <div className="absolute bottom-20 left-20 animate-float text-5xl">🥬</div>
              <div className="absolute bottom-10 right-20 animate-float-delayed text-4xl">🍌</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-forest py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            <div><p className="text-3xl font-bold">500+</p><p className="text-green-light">Farmers</p></div>
            <div><p className="text-3xl font-bold">24</p><p className="text-green-light">Crops Tracked</p></div>
            <div><p className="text-3xl font-bold">4</p><p className="text-green-light">Districts</p></div>
            <div><p className="text-3xl font-bold">0%</p><p className="text-green-light">Commission</p></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-forest text-center mb-4">Features</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">Everything you need to manage your produce, logistics, and deals in one place.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 bg-ivory rounded-2xl hover:shadow-lg transition">
                <f.icon className="w-10 h-10 text-green mb-4" />
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-forest text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-green/30 -translate-y-1/2" />
            {steps.map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 bg-green text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <s.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Produce Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-serif font-bold text-forest">Storage Guide Preview</h2>
            <Link to="/register" className="text-green font-medium hover:underline flex items-center gap-1">
              View Full Guide <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {featuredCrops.map((crop) => (
              <div key={crop.name} className="min-w-[180px] bg-ivory rounded-xl p-4 border border-gray-100">
                <div className="text-4xl mb-2">{getProduceEmoji(crop.name)}</div>
                <h4 className="font-semibold">{crop.name}</h4>
                <p className="text-sm text-gray-500">{crop.temp} • {crop.days} days</p>
                <span className="inline-block mt-2 px-2 py-1 bg-green/10 text-green text-xs rounded-full">{crop.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-forest to-green-dark text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">What Users Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-6">
                <p className="text-white/80 mb-4 italic">"{t.quote}"</p>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-white/60 text-sm">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-green">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">Join FreshNest Today</h2>
          <p className="text-green-light mb-8">Start reducing post-harvest losses and connecting with farmers, transporters, and dealers across Bangladesh.</p>
          <Link to="/register" className="inline-block px-8 py-4 bg-white text-forest font-semibold rounded-xl hover:bg-ivory transition">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}