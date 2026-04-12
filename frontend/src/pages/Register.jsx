import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, MapPin, Truck, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { register as registerApi } from '../api/auth';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'farmer',
    location: '',
    vehicleType: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const presetRole = location.state?.role || 'farmer';

  useEffect(() => {
    if (presetRole === 'dealer' || presetRole === 'transport') {
      setFormData((prev) => ({ ...prev, role: presetRole }));
    }
  }, [presetRole]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    if (formData.role === 'transport' && !formData.vehicleType) {
      toast.error('Please enter vehicle type');
      return;
    }
    if ((formData.role === 'farmer' || formData.role === 'dealer') && !formData.location) {
      toast.error('Please enter your location');
      return;
    }

    setLoading(true);
    try {
      await registerApi({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        location: formData.location || '',
        vehicle: formData.role === 'transport' ? formData.vehicleType : '',
      });

      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'farmer', label: 'Farmer', emoji: '🌾' },
    { value: 'transport', label: 'Transport', emoji: '🚛' },
    { value: 'dealer', label: 'Dealer', emoji: '🏪' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-foam via-ivory to-white flex items-center justify-center p-4">
      <div className="pointer-events-none absolute -top-36 right-8 w-96 h-96 rounded-full bg-green/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-4 w-80 h-80 rounded-full bg-gold/15 blur-3xl" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-4xl">🌿</span>
            <span className="font-serif text-2xl font-bold text-forest">FreshNest</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-forest">Create Account</h1>
          <p className="text-slate mt-1">Join the network and start trading with confidence.</p>
        </div>

        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white p-6 animate-fade-in-up delay-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green/20 focus:border-green outline-none" placeholder="Your full name" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green/20 focus:border-green outline-none" placeholder="your@email.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green/20 focus:border-green outline-none" placeholder="••••••••" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green/20 focus:border-green outline-none" placeholder="e.g. +88017XXXXXXXX" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {roleOptions.map((opt) => (
                  <button type="button" key={opt.value} onClick={() => setFormData({ ...formData, role: opt.value })} className={`py-3 rounded-xl border-2 text-center font-medium transition ${formData.role === opt.value ? 'border-green bg-green/10 text-green' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <span className="block text-xl mb-1">{opt.emoji}</span>
                    <span className="text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {formData.role === 'transport' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green/20 focus:border-green outline-none" placeholder="e.g. Refrigerated Truck" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District / Location {formData.role === 'transport' ? '(Optional)' : ''}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green/20 focus:border-green outline-none" placeholder="e.g. Rajshahi" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-gold text-white font-semibold rounded-xl hover:bg-amber-600 transition disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-green font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}