import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BarChart3, CheckCircle2, Leaf, MapPin, Shield, Sparkles, Star, Thermometer, Truck, Users } from 'lucide-react';
import { PRODUCE_DB, getProduceEmoji } from '../utils/produceDB';

const features = [
  { icon: Thermometer, title: 'Smart Storage Guide', desc: 'Optimal conditions for 24 crops' },
  { icon: Truck, title: 'Logistics Network', desc: 'Connect with verified transporters' },
  { icon: Users, title: 'Direct Deals', desc: 'Farmer-to-dealer without middlemen' },
  { icon: MapPin, title: 'Route Visibility', desc: 'Track handoffs and delivery paths clearly' },
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

const rolePaths = [
  {
    role: 'Farmer Portal',
    desc: 'List produce, review offers, and request transport support.',
    state: { role: 'farmer' },
    accent: 'bg-green/10 text-green border-green/30',
  },
  {
    role: 'Dealer Portal',
    desc: 'Browse available crops, send offers, and track all deals in one flow.',
    state: { role: 'dealer' },
    accent: 'bg-gold/10 text-gold-dark border-gold/30',
  },
  {
    role: 'Transport Portal',
    desc: 'Accept delivery jobs, manage routes, and report incidents quickly.',
    state: { role: 'transport' },
    accent: 'bg-blue-100 text-blue-700 border-blue-200',
  },
];

const heroHighlights = [
  'Lower post-harvest loss with guided storage',
  'Move produce faster with transparent logistics',
  'Negotiate directly with dealers and transporters',
];

const heroStats = [
  { value: '500+', label: 'Farmers onboarded' },
  { value: '24', label: 'Crops tracked' },
  { value: '4', label: 'Districts covered' },
  { value: '0%', label: 'Commission' },
];

const impactCards = [
  { title: 'Storage first', text: 'Practical guidance for temperature, humidity, and shelf life.' },
  { title: 'Faster deals', text: 'Reduce negotiation friction with role-specific workflows.' },
  { title: 'Operations view', text: 'See produce, deals, and transport from one clean dashboard.' },
];

const trustSignals = [
  { title: 'Verified actors', text: 'Role-based access keeps users in the right workflow.' },
  { title: 'Built for Bangladesh', text: 'Supports local produce types, routes, and working patterns.' },
  { title: 'Designed for scale', text: 'Prepared for larger inventory and more active users.' },
];

export default function Home() {
  const featuredCrops = PRODUCE_DB.slice(0, 8);

  return (
    <div className="min-h-screen bg-ivory text-forest">
      {/* Hero */}
      <section className="relative overflow-hidden pt-10 pb-20 lg:pt-14 lg:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,213,186,0.35),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(230,126,34,0.12),_transparent_32%),linear-gradient(180deg,_#ffffff_0%,_#f8f9f4_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/70" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid items-start gap-14 lg:items-center lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-8 animate-fade-in-up motion-reduce:animate-none">
              <div className="inline-flex items-center gap-2 rounded-full border border-green/20 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-green shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4" />
                FreshNest platform
              </div>

              <div className="space-y-5">
                <h1 className="max-w-2xl text-4xl font-bold leading-tight text-forest sm:text-5xl lg:text-6xl">
                  Turn post-harvest operations into a clean, trusted marketplace.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate sm:text-xl">
                  FreshNest helps farmers, dealers, and transporters reduce loss, move produce faster, and manage deals with a premium workflow built for everyday operations.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  state={{ role: 'farmer' }}
                  className="inline-flex items-center gap-2 rounded-full bg-green px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(39,174,96,0.24)] transition duration-200 hover:-translate-y-0.5 hover:bg-green-dark"
                >
                  Start as Farmer
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/register"
                  state={{ role: 'dealer' }}
                  className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-white px-6 py-3.5 text-sm font-semibold text-forest shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-forest hover:text-white"
                >
                  Browse as Dealer
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <ul className="grid gap-3 sm:grid-cols-3">
                {heroHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green" />
                    <span className="text-sm leading-6 text-slate">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <p className="text-3xl font-bold text-forest">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in-up delay-100 motion-reduce:animate-none lg:pl-6">
              <div className="absolute -left-4 top-8 hidden h-24 w-24 rounded-full bg-green/20 blur-3xl lg:block" />
              <div className="absolute -right-6 bottom-12 hidden h-28 w-28 rounded-full bg-gold/20 blur-3xl lg:block" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_32px_80px_rgba(27,67,50,0.12)] backdrop-blur">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green">Live marketplace view</p>
                    <p className="mt-1 text-sm text-slate">A quick snapshot of the active flow.</p>
                  </div>
                  <div className="rounded-full bg-mint/30 px-3 py-1 text-xs font-semibold text-forest">Active</div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-gradient-to-br from-forest to-green-dark p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm uppercase tracking-[0.18em] text-white/70">Today</span>
                      <Leaf className="h-5 w-5 text-mint" />
                    </div>
                    <p className="mt-8 text-4xl font-bold">18</p>
                    <p className="mt-2 text-sm text-white/75">new produce listings</p>
                  </div>

                  <div className="rounded-3xl border border-gray-100 bg-ivory p-5 shadow-sm">
                    <p className="text-sm font-semibold text-forest">Priority route</p>
                    <div className="mt-5 space-y-3 text-sm text-slate">
                      <div className="flex items-center justify-between rounded-2xl bg-white p-3">
                        <span>Rajshahi</span>
                        <ArrowRight className="h-4 w-4 text-green" />
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-white p-3">
                        <span>Dhaka market</span>
                        <span className="text-xs font-semibold text-green">Verified transport</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-forest">Trusted operations</p>
                      <p className="text-sm text-slate">Built around clear accountability.</p>
                    </div>
                    <div className="flex -space-x-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-green text-white shadow-sm">F</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-gold text-white shadow-sm">D</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-forest text-white shadow-sm">T</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-white/70 bg-white/70">
        <div className="max-w-7xl mx-auto grid gap-4 px-4 py-6 sm:grid-cols-3">
          {trustSignals.map((item) => (
            <div key={item.title} className="rounded-2xl bg-ivory px-5 py-4 shadow-sm">
              <p className="text-sm font-semibold text-forest">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid gap-6 rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green">About FreshNest</p>
              <h2 className="mt-3 text-3xl font-bold text-forest sm:text-4xl">Designed to make post-harvest work feel organized.</h2>
            </div>
            <div className="space-y-4 text-slate">
              <p className="text-lg leading-8">
                FreshNest is a role-based marketplace for farmers, dealers, and transporters. It combines produce tracking, storage guidance, deal management, and transport coordination in one place.
              </p>
              <p className="text-lg leading-8">
                The interface is built to be calm, clear, and production-ready so users can focus on moving produce instead of navigating a heavy system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green">Platform strengths</p>
            <h2 className="mt-3 text-3xl font-bold text-forest sm:text-4xl">Clear product value, without the clutter.</h2>
            <p className="mt-4 text-lg leading-8 text-slate">
              The landing page should explain outcome first, then show capability. These cards keep the message direct and professional.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[2rem] border border-gray-100 bg-white p-7 shadow-sm md:col-span-2 xl:col-span-2">
              <div className="flex items-center justify-between">
                <Sparkles className="h-8 w-8 text-green" />
                <span className="rounded-full bg-green/10 px-3 py-1 text-xs font-semibold text-green">Outcome</span>
              </div>
              <h3 className="mt-10 text-2xl font-bold text-forest">Reduce spoilage with guided storage.</h3>
              <p className="mt-3 max-w-xl text-slate">
                Temperature-aware storage guidance helps users keep produce in better condition before it reaches the market.
              </p>
            </div>

            <div className="rounded-[2rem] border border-gray-100 bg-gradient-to-br from-forest to-green-dark p-7 text-white shadow-[0_24px_60px_rgba(27,67,50,0.18)]">
              <BarChart3 className="h-8 w-8 text-mint" />
              <h3 className="mt-8 text-xl font-bold">Visibility for decisions</h3>
              <p className="mt-3 text-sm leading-6 text-white/80">Role-based analytics give each user a clearer picture of supply, demand, and status.</p>
            </div>

            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <feature.icon className="h-10 w-10 text-green" />
                <h3 className="mt-6 text-lg font-semibold text-forest">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals */}
      <section className="py-24 bg-ivory/70">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green">Role-based access</p>
              <h2 className="mt-3 text-3xl font-bold text-forest sm:text-4xl">A dedicated portal for every workflow.</h2>
              <p className="mt-4 text-lg leading-8 text-slate">
                Each stakeholder lands in a focused experience with the actions they need most, and nothing extra.
              </p>
            </div>
            <Link to="/register" className="inline-flex items-center gap-2 self-start rounded-full border border-forest/15 bg-white px-5 py-3 text-sm font-semibold text-forest shadow-sm transition hover:-translate-y-0.5 hover:bg-forest hover:text-white">
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {rolePaths.map((item, index) => (
              <Link
                key={item.role}
                to="/register"
                state={item.state}
                className={`group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl ${
                  index === 1 ? 'lg:translate-y-4' : ''
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-mint/20 opacity-0 transition group-hover:opacity-100" />
                <div className="relative">
                  <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${item.accent}`}>
                    {item.role}
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-forest">{item.role}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-slate">{item.desc}</p>
                  <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-forest">
                    Open portal
                    <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green">Simple flow</p>
            <h2 className="mt-3 text-3xl font-bold text-forest sm:text-4xl">A short path from listing to movement.</h2>
            <p className="mt-4 text-lg leading-8 text-slate">
              The process is intentionally compact: users register, add or browse produce, then negotiate and move produce with confidence.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-[2rem] border border-gray-100 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green/10 text-green">
                    <step.icon className="h-7 w-7" />
                  </div>
                  <span className="text-sm font-semibold text-slate">0{index + 1}</span>
                </div>
                <h3 className="mt-8 text-xl font-bold text-forest">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Produce Showcase */}
      <section className="py-24 bg-ivory/70">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green">Storage guide preview</p>
              <h2 className="mt-3 text-3xl font-bold text-forest sm:text-4xl">Visual product cards that feel intentional.</h2>
            </div>
            <Link to="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-green transition hover:translate-x-0.5">
              View full guide <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredCrops.map((crop, index) => (
              <div key={crop.name} className={`rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${index === 0 ? 'xl:col-span-2' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-4xl">{getProduceEmoji(crop.name)}</div>
                    <h4 className="mt-4 text-lg font-bold text-forest">{crop.name}</h4>
                    <p className="mt-1 text-sm text-slate">{crop.category}</p>
                  </div>
                  <span className="rounded-full bg-green/10 px-3 py-1 text-xs font-semibold text-green">
                    {crop.temp}
                  </span>
                </div>
                <div className="mt-5 rounded-2xl bg-ivory p-4 text-sm text-slate">
                  Shelf life: <span className="font-semibold text-forest">{crop.days} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[linear-gradient(135deg,_#1B4332_0%,_#1E8449_100%)] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-mint">Social proof</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Built for people who need the platform to feel reliable.</h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <blockquote key={testimonial.name} className="rounded-[2rem] border border-white/10 bg-white/10 p-7 backdrop-blur-md">
                <p className="text-base leading-8 text-white/88">“{testimonial.quote}”</p>
                <footer className="mt-8 border-t border-white/10 pt-5">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-white/65">{testimonial.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 text-center shadow-[0_24px_70px_rgba(27,67,50,0.10)] sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green">Ready to start</p>
            <h2 className="mt-4 text-3xl font-bold text-forest sm:text-4xl">Join FreshNest and run the workflow more professionally.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate">
              Create a free account and start using the role-specific experience that matches your job, your produce, and your daily operations.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-green px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(39,174,96,0.24)] transition hover:-translate-y-0.5 hover:bg-green-dark">
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" state={{ role: 'transport' }} className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-ivory px-6 py-3.5 text-sm font-semibold text-forest transition hover:-translate-y-0.5 hover:bg-white">
                Explore transport flow
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}