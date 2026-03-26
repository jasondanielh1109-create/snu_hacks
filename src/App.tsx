import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserData, HospitalProfile, Competitor, AnalysisResult, Notification } from './types';
import { runCompetitiveAnalysis } from './services/aiService';
import { 
  Activity, 
  Users, 
  BarChart3, 
  Target, 
  MessageSquare, 
  User, 
  RefreshCw, 
  Plus, 
  ChevronRight, 
  MapPin, 
  Star, 
  Check, 
  X, 
  LogOut, 
  Menu,
  Search,
  Zap,
  ArrowRight,
  TrendingUp,
  Send,
  Settings,
  Trash2,
  Download,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants ---
const GOOGLE_MAPS_API_KEY = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY;

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'warning' | 'info', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'border-accent-success text-accent-success',
    error: 'border-accent-danger text-accent-danger',
    warning: 'border-accent-warning text-accent-warning',
    info: 'border-accent-primary text-accent-primary'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-6 right-6 z-[100] glass px-6 py-4 rounded-2xl border-l-4 shadow-2xl ${colors[type]}`}
    >
      <div className="flex items-center gap-3">
        {type === 'success' && <Check size={20} />}
        {type === 'error' && <X size={20} />}
        {type === 'warning' && <Zap size={20} />}
        {type === 'info' && <TrendingUp size={20} />}
        <span className="font-medium text-text-primary">{message}</span>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [view, setView] = useState<'home' | 'signin' | 'signup' | 'hospital-details' | 'competitor-select' | 'dashboard'>('home');
  const [activeTab, setActiveTab] = useState<'overview' | 'competitors' | 'analysis' | 'strategy' | 'profile'>('overview');
  const [user, setUser] = useState<UserData | null>(null);
  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'success' | 'error' | 'warning' | 'info' }[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Initialization ---
  useEffect(() => {
    // Force user to home page on reload
    localStorage.removeItem('cliniciq_session');
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const saveUser = (updatedUser: UserData) => {
    const users = JSON.parse(localStorage.getItem('cliniciq_users') || '{}');
    users[updatedUser.email] = updatedUser;
    localStorage.setItem('cliniciq_users', JSON.stringify(users));
    setUser(updatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('cliniciq_session');
    setUser(null);
    setView('home');
  };

  const SignInView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('cliniciq_users') || '{}');
        const user = users[email];
        if (user && user.password === password) {
          localStorage.setItem('cliniciq_session', JSON.stringify({ email }));
          setUser(user);
          showToast('Welcome back!', 'success');
          if (user.setupComplete) setView('dashboard');
          else if (user.hospitalProfile) setView('competitor-select');
          else setView('hospital-details');
        } else {
          showToast('Invalid email or password', 'error');
        }
        setLoading(false);
      }, 800);
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <div className="mesh-gradient opacity-50" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-10 rounded-[32px] w-full max-w-md relative z-10"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Activity className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold font-display mb-2">Welcome Back</h2>
            <p className="text-text-secondary">Sign in to your Clinic IQ account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Registered Email</label>
              <input 
                type="email" 
                required 
                className="input-field" 
                placeholder="name@hospital.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[42px] text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex items-center gap-2 ml-1">
              <input type="checkbox" id="remember" className="rounded border-border-subtle bg-bg-secondary text-accent-primary focus:ring-accent-primary" />
              <label htmlFor="remember" className="text-sm text-text-secondary">Remember me</label>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
              {loading ? <RefreshCw className="animate-spin" size={20} /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-8 text-text-secondary">
            Don't have an account? <button onClick={() => setView('signup')} className="text-accent-primary font-semibold hover:underline">Sign Up</button>
          </p>
          <button onClick={() => setView('home')} className="mt-4 w-full text-text-muted text-sm hover:text-text-secondary transition-colors">← Back to Home</button>
        </motion.div>
      </div>
    );
  };

  const SignUpView = () => {
    const [nearbyHospitals, setNearbyHospitals] = useState<Competitor[]>([]);
    const [fetching, setFetching] = useState(true);
    const [selectedHospital, setSelectedHospital] = useState<Competitor | null>(null);

    const [formData, setFormData] = useState({
      email: '',
      password: '',
      confirmPassword: ''
    });

    useEffect(() => {
      const fetchHospitals = (location: { lat: number, lng: number }) => {
        const dummyDiv = document.createElement('div');
        const map = new (window as any).google.maps.Map(dummyDiv, { center: location, zoom: 15 });
        const service = new (window as any).google.maps.places.PlacesService(map);
        
        service.nearbySearch({
          location,
          radius: 10000,
          type: 'hospital'
        }, (results: any, status: any) => {
          if (status === (window as any).google.maps.places.PlacesServiceStatus.OK) {
            const hospitals = results.map((h: any) => ({
              placeId: h.place_id,
              name: h.name,
              address: h.vicinity,
              location: { lat: h.geometry.location.lat(), lng: h.geometry.location.lng() },
              rating: h.rating || 0,
              vicinity: h.vicinity
            }));
            setNearbyHospitals(hospitals);
          }
          setFetching(false);
        });
      };

      const initLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            fetchHospitals({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => {
            showToast('Geolocation denied. Showing default location.', 'warning');
            fetchHospitals({ lat: 40.7128, lng: -74.0060 });
          }
        );
      };

      if (!(window as any).google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.onload = initLocation;
        document.head.appendChild(script);
      } else {
        initLocation();
      }
    }, []);

    const passwordStrength = useMemo(() => {
      const p = formData.password;
      if (!p) return 0;
      let s = 0;
      if (p.length > 6) s++;
      if (/[A-Z]/.test(p)) s++;
      if (/[0-9]/.test(p)) s++;
      if (/[^A-Za-z0-9]/.test(p)) s++;
      return s;
    }, [formData.password]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedHospital) return showToast('Please select a hospital first', 'error');
      if (formData.password !== formData.confirmPassword) {
        return showToast('Passwords do not match', 'error');
      }
      if (passwordStrength < 2) {
        return showToast('Password is too weak', 'warning');
      }

      setLoading(true);
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('cliniciq_users') || '{}');
        if (users[formData.email]) {
          showToast('Account already exists', 'error');
          setLoading(false);
          return;
        }

        const newUser: UserData = {
          hospitalName: selectedHospital.name,
          email: formData.email,
          phone: '',
          password: formData.password,
          setupComplete: false,
          hospitalProfile: {
            type: 'General Hospital',
            beds: 0,
            doctors: 0,
            specializationsCount: 0,
            specializations: [],
            yearEstablished: new Date().getFullYear(),
            emergency: false,
            icu: false,
            open247: false,
            insurance: false,
            accreditations: [],
            rating: selectedHospital.rating,
            description: '',
            address: selectedHospital.address,
            location: selectedHospital.location
          },
          selectedRadius: 5000,
          competitors: [],
          analysisResults: null,
          chatHistory: [],
          notifications: [],
          lastCheckedCompetitors: Date.now()
        };

        saveUser(newUser);
        localStorage.setItem('cliniciq_session', JSON.stringify({ email: formData.email }));
        showToast('Account created successfully!', 'success');
        setView('competitor-select'); // Skip FindYourHospitalView
        setLoading(false);
      }, 800);
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <div className="mesh-gradient opacity-50" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-10 rounded-[32px] w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]"
        >
          <div className="text-center mb-8 flex-shrink-0">
            <h2 className="text-3xl font-bold font-display mb-2">Create Account</h2>
            <p className="text-text-secondary">
              {!selectedHospital ? "Select your facility from nearby hospitals" : "Verify your credentials as a hospital administrator"}
            </p>
          </div>

          {!selectedHospital ? (
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative">
              {fetching ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-24 w-full bg-white/5 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : nearbyHospitals.length > 0 ? (
                nearbyHospitals.map(h => (
                  <div 
                    key={h.placeId}
                    onClick={() => setSelectedHospital(h)}
                    className="p-6 rounded-2xl border border-border-subtle bg-bg-secondary hover:border-accent-primary hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">{h.name}</h3>
                      <div className="flex items-center gap-1 text-sm bg-white/5 px-2 py-1 rounded-lg">
                        <Star size={14} className="text-accent-warning" /> {h.rating}
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary flex items-center gap-2">
                      <MapPin size={14} /> {h.address}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-text-secondary">No hospitals found nearby. Please try again later.</div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 rounded-2xl border border-accent-primary bg-accent-primary/10 mb-6 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-text-primary">{selectedHospital.name}</h3>
                  <p className="text-sm text-text-secondary">{selectedHospital.address}</p>
                </div>
                <button onClick={() => setSelectedHospital(null)} className="text-xs bg-bg-primary px-3 py-1 rounded-full text-text-secondary hover:text-white">Change</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1 ml-1">Official Hospital ID (Email)</label>
                  <input 
                    type="email" required className="input-field" placeholder="admin@hospital.com"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1 ml-1">Password</label>
                  <input 
                    type="password" required className="input-field" placeholder="••••••••"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                  <div className="flex gap-1 mt-2 px-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? (passwordStrength <= 2 ? 'bg-accent-danger' : 'bg-accent-success') : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1 ml-1">Confirm Password</label>
                  <input 
                    type="password" required className="input-field" placeholder="••••••••"
                    value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-4 flex items-center justify-center gap-2">
                  {loading ? <RefreshCw className="animate-spin" size={20} /> : 'Verify & Continue'}
                </button>
              </form>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border-subtle flex-shrink-0 text-center">
            <p className="text-text-secondary mb-4">
              Already have an account? <button onClick={() => setView('signin')} className="text-accent-primary font-semibold hover:underline">Sign In</button>
            </p>
            <button onClick={() => setView('home')} className="w-full text-text-muted text-sm hover:text-text-secondary transition-colors">← Back to Home</button>
          </div>
        </motion.div>
      </div>
    );
  };
  const HomeView = () => (
    <div className="relative min-h-screen overflow-hidden">
      <div className="mesh-gradient" />
      <div className="grid-overlay" />
      
      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center glass border-b-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg">
            <Activity className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold font-display tracking-tight">Clinic <span className="text-accent-primary">IQ</span></span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setView('signin')} className="btn-ghost">Sign In</button>
          <button onClick={() => setView('signup')} className="btn-primary">Sign Up</button>
        </div>
      </nav>

      {/* Hero */}
      <main className="container mx-auto px-6 pt-40 pb-20 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-sm font-medium mb-8"
        >
          <Zap size={16} />
          AI-Powered Hospital Intelligence
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold font-display leading-tight mb-6"
        >
          Know Your Competition. <br />
          <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">Dominate Your Market.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto text-text-secondary text-lg md:text-xl mb-10 leading-relaxed"
        >
          Clinic IQ analyzes hospitals in your area, benchmarks your performance across 20+ clinical and operational parameters, and generates AI-powered strategies to help you lead your local healthcare market.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4 justify-center mb-20"
        >
          <button onClick={() => setView('signup')} className="btn-primary flex items-center gap-2">
            Get Started Free <ArrowRight size={20} />
          </button>
          <button className="btn-ghost" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            See How It Works
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { val: '500+', label: 'Hospitals Analyzed' },
            { val: '20+', label: 'Benchmarking Parameters' },
            { val: 'AI', label: 'Strategy Reports' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="glass p-8 rounded-3xl text-center"
            >
              <div className="text-4xl font-bold font-display text-accent-primary mb-2">{stat.val}</div>
              <div className="text-text-secondary font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <section id="features" className="mt-40 text-left">
          <h2 className="text-4xl font-bold font-display text-center mb-16">Everything You Need to Stay Ahead</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <MapPin className="text-accent-primary" />, title: 'Proximity Analysis', desc: 'Discover all hospitals within your chosen radius automatically using Google Places data.' },
              { icon: <Activity className="text-accent-secondary" />, title: 'AI Competitive Intelligence', desc: 'Deep LLM analysis across clinical, operational, reputational and strategic dimensions.' },
              { icon: <Target className="text-accent-success" />, title: 'Smart Strategy Engine', desc: 'Get a custom roadmap to market leadership based on your specific strengths and weaknesses.' },
              { icon: <TrendingUp className="text-accent-warning" />, title: 'Market Sentiment Tracking', desc: 'Monitor hospital reputations and patient feedback trends automatically in your area.' },
              { icon: <Target className="text-accent-primary" />, title: 'Strategic Roadmap Generator', desc: 'Get data-driven action plans to capture local market share and optimize care delivery.' },
              { icon: <Users className="text-accent-secondary" />, title: 'Granular Benchmarking', desc: 'Precisely benchmark your performance against specific peers for targeted growth.' }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="glass p-8 rounded-3xl border-border-subtle hover:border-accent-primary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold font-display mb-3">{f.title}</h3>
                <p className="text-text-secondary leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle py-12 px-6 text-center text-text-muted">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
          <Activity size={20} />
          <span className="font-bold font-display">Clinic IQ</span>
        </div>
        <p>© 2026 Clinic IQ. All rights reserved.</p>
      </footer>
    </div>
  );

  const DashboardView = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAddCompetitorModalOpen, setIsAddCompetitorModalOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [isChatStreaming, setIsChatStreaming] = useState(false);



    const CompetitorsSection = () => (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold font-display">Selected Competitors</h3>
          <button onClick={() => setIsAddCompetitorModalOpen(true)} className="btn-ghost py-2 text-sm flex items-center gap-2"><Plus size={16} /> Add More</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user?.competitors.map((comp, i) => {
            const profile = user.analysisResults?.competitorProfiles.find(p => p.name === comp.name);
            const rank = user.analysisResults?.overallRanking.find(r => r.hospitalName === comp.name)?.rank;
            return (
              <div key={i} className="glass p-8 rounded-[32px] border-border-subtle relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${rank === 1 ? 'bg-accent-warning shadow-[0_0_15px_rgba(255,181,71,0.3)]' : 'bg-bg-secondary border border-border-subtle'}`}>
                    {rank}
                  </div>
                </div>
                <h4 className="text-2xl font-bold font-display mb-2 pr-12">{comp.name}</h4>
                <div className="flex items-center gap-4 text-sm text-text-secondary mb-6">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {comp.vicinity}</span>
                  <span className="flex items-center gap-1"><Star size={14} className="text-accent-warning" /> {comp.rating}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-border-subtle">
                    <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Market Position</p>
                    <p className="text-sm font-semibold text-accent-primary">{profile?.marketPosition || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-border-subtle">
                    <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Est. Beds</p>
                    <p className="text-sm font-semibold text-accent-secondary">{profile?.estimatedBeds || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-text-secondary mb-2">Key Strengths</p>
                    <div className="flex flex-wrap gap-2">
                      {profile?.strengths.map((s, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-accent-success/10 text-accent-success text-[10px] font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-secondary mb-2">Key Services</p>
                    <div className="flex flex-wrap gap-2">
                      {profile?.keyServices.map((s, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-[10px] font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

    const AnalysisSection = () => (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SWOT */}
          <div className="glass p-8 rounded-[32px] border-border-subtle">
            <h3 className="text-xl font-bold font-display mb-6">Market SWOT Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Strengths', items: user?.analysisResults?.comparativeAnalysis.userStrengths, color: 'text-accent-success', bg: 'bg-accent-success/5' },
                { label: 'Weaknesses', items: user?.analysisResults?.comparativeAnalysis.userWeaknesses, color: 'text-accent-danger', bg: 'bg-accent-danger/5' },
                { label: 'Opportunities', items: user?.analysisResults?.comparativeAnalysis.opportunities, color: 'text-accent-primary', bg: 'bg-accent-primary/5' },
                { label: 'Threats', items: user?.analysisResults?.comparativeAnalysis.threats, color: 'text-accent-warning', bg: 'bg-accent-warning/5' }
              ].map((cell, i) => (
                <div key={i} className={`p-6 rounded-2xl ${cell.bg} border border-white/5`}>
                  <p className={`text-sm font-bold mb-3 ${cell.color}`}>{cell.label}</p>
                  <ul className="space-y-2">
                    {cell.items?.map((item, idx) => (
                      <li key={idx} className="text-xs text-text-secondary flex gap-2">
                        <span className="mt-1 w-1 h-1 rounded-full bg-current flex-shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Score Distribution */}
          <div className="glass p-8 rounded-[32px] border-border-subtle overflow-hidden">
            <h3 className="text-xl font-bold font-display mb-6">Performance Comparison</h3>
            <div className="space-y-6">
              {['clinicalQuality', 'patientExperience', 'operationalEfficiency', 'technologyAdoption'].map((param, i) => {
                const userScore = user?.analysisResults?.radarScores.userHospital[param] || 0;
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-secondary capitalize font-medium">{param.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-accent-primary font-bold">{userScore}%</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${userScore}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full relative z-10"
                      />
                      {user?.analysisResults?.radarScores.competitors.map((c, idx) => {
                        const compScore = c[param] || 0;
                        return (
                          <motion.div 
                            key={idx}
                            initial={{ left: 0 }}
                            animate={{ left: `${compScore}%` }}
                            className="absolute top-0 w-0.5 h-full bg-white/30 z-20"
                            title={`${c.name}: ${compScore}%`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 pt-6 border-t border-border-subtle flex flex-wrap gap-4">
               <div className="flex items-center gap-2 text-[10px] text-text-muted">
                 <div className="w-4 h-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full" /> Your performance
               </div>
               <div className="flex items-center gap-2 text-[10px] text-text-muted">
                 <div className="w-0.5 h-3 bg-white/30" /> Competitor benchmark
               </div>
            </div>
          </div>
        </div>
      </div>
    );

    const StrategySection = () => (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="glass p-8 rounded-[32px] border-l-8 border-accent-primary">
          <h3 className="text-2xl font-bold font-display mb-4">Executive Summary</h3>
          <p className="text-text-secondary leading-relaxed italic">"{user?.analysisResults?.strategyReport.executiveSummary}"</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-xl font-bold font-display px-2">Priority Actions</h3>
            {user?.analysisResults?.strategyReport.priorityActions.map((action, i) => (
              <div key={i} className="glass p-8 rounded-[32px] border border-border-subtle relative group hover:border-accent-primary/30 transition-all">
                <div className="flex gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-xl ${action.priority === 1 ? 'bg-accent-danger text-white' : action.priority === 2 ? 'bg-accent-warning text-white' : 'bg-accent-primary text-white'}`}>
                    {action.priority}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold font-display">{action.title}</h4>
                      <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold uppercase tracking-wider text-text-muted">{action.category}</span>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed mb-4">{action.description}</p>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1 text-xs text-accent-primary font-medium"><RefreshCw size={14} /> {action.timeframe}</span>
                      <span className="flex items-center gap-1 text-xs text-accent-success font-medium"><TrendingUp size={14} /> {action.expectedImpact} Impact</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="glass p-8 rounded-[32px] bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border-accent-primary/30">
              <p className="text-xs font-bold uppercase tracking-widest text-accent-primary mb-4">Leadership Projection</p>
              <div className="text-4xl font-bold font-display mb-2">{user?.analysisResults?.strategyReport.estimatedTimeToLeadership}</div>
              <p className="text-sm text-text-secondary">Estimated time to achieve market leadership based on current trajectory.</p>
            </div>
            
            <div className="glass p-8 rounded-[32px] border-border-subtle">
              <h4 className="text-lg font-bold font-display mb-4">Long-term Vision</h4>
              <p className="text-sm text-text-secondary leading-relaxed">{user?.analysisResults?.strategyReport.longTermVision}</p>
            </div>
          </div>
        </div>
      </div>
    );
    const OverviewSection = () => (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Your Rank', val: user?.analysisResults?.userHospitalRank === 1 ? '1st' : `${user?.analysisResults?.userHospitalRank}th`, icon: <TrendingUp className="text-accent-primary" /> },
            { label: 'Competitors', val: user?.competitors.length, icon: <Users className="text-accent-secondary" /> },
            { label: 'Strengths', val: user?.analysisResults?.comparativeAnalysis.userStrengths.length, icon: <Check className="text-accent-success" /> },
            { label: 'Improvement Areas', val: user?.analysisResults?.comparativeAnalysis.userWeaknesses.length, icon: <Zap className="text-accent-warning" /> }
          ].map((stat, i) => (
            <div key={i} className="glass p-6 rounded-3xl border-border-subtle">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">{stat.icon}</div>
              </div>
              <div className="text-3xl font-bold font-display mb-1">{stat.val}</div>
              <div className="text-text-secondary text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-[32px] border-border-subtle">
            <h3 className="text-xl font-bold font-display mb-6">Market Standing</h3>
            <div className="space-y-8 py-4">
              {user?.analysisResults?.overallRanking.map((item, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-black font-display ${item.hospitalName === user.hospitalName ? 'text-accent-primary' : 'text-text-muted opacity-50'}`}>0{item.rank}</span>
                      <span className={`font-bold ${item.hospitalName === user.hospitalName ? 'text-text-primary' : 'text-text-secondary italic'}`}>{item.hospitalName}</span>
                    </div>
                    <span className="text-sm font-bold text-text-muted">{item.overallScore}/100</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.overallScore}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className={`h-full rounded-full ${item.hospitalName === user.hospitalName ? 'bg-gradient-to-r from-accent-primary to-accent-secondary shadow-[0_0_20px_rgba(0,212,255,0.3)]' : 'bg-white/10'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold font-display px-2">Quick Insights</h3>
            {user?.analysisResults?.quickInsights.map((insight, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-2xl border-l-4 border-accent-primary flex gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={16} className="text-accent-primary" />
                </div>
                <p className="text-text-primary text-sm leading-relaxed">{insight}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );


    const ProfileSection = () => {
      const [isEditing, setIsEditing] = useState(false);
      const [profileData, setProfileData] = useState(user?.hospitalProfile);

      const handleSave = () => {
        if (!user) return;
        const updatedUser = { ...user, hospitalProfile: profileData };
        saveUser(updatedUser);
        setIsEditing(false);
        showToast('Profile updated successfully', 'success');
      };

      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div className="glass p-8 rounded-[32px] border-border-subtle">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold font-display">Hospital Information</h3>
                  <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="btn-ghost py-2 text-sm flex items-center gap-2">
                    {isEditing ? <><Check size={16} /> Save Changes</> : <><Settings size={16} /> Edit Profile</>}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Hospital Name</label>
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={user?.hospitalName}
                      className="w-full bg-white/5 border border-border-subtle rounded-xl px-4 py-3 text-sm disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Hospital Type</label>
                    <select 
                      disabled={!isEditing}
                      value={profileData?.type}
                      onChange={(e) => setProfileData(prev => prev ? { ...prev, type: e.target.value } : null)}
                      className="w-full bg-white/5 border border-border-subtle rounded-xl px-4 py-3 text-sm disabled:opacity-50"
                    >
                      <option value="General">General Hospital</option>
                      <option value="Specialized">Specialized Clinic</option>
                      <option value="Teaching">Teaching Hospital</option>
                      <option value="Private">Private Medical Center</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Beds</label>
                    <input 
                      type="number" 
                      disabled={!isEditing}
                      value={profileData?.beds}
                      onChange={(e) => setProfileData(prev => prev ? { ...prev, beds: parseInt(e.target.value) } : null)}
                      className="w-full bg-white/5 border border-border-subtle rounded-xl px-4 py-3 text-sm disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Doctors</label>
                    <input 
                      type="number" 
                      disabled={!isEditing}
                      value={profileData?.doctors}
                      onChange={(e) => setProfileData(prev => prev ? { ...prev, doctors: parseInt(e.target.value) } : null)}
                      className="w-full bg-white/5 border border-border-subtle rounded-xl px-4 py-3 text-sm disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-[32px] border-border-subtle">
                <h3 className="text-xl font-bold font-display mb-6">Specializations</h3>
                <div className="flex flex-wrap gap-3">
                  {profileData?.specializations.map((spec, i) => (
                    <span key={i} className="px-4 py-2 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-sm font-medium">
                      {spec}
                    </span>
                  ))}
                  {isEditing && (
                    <button className="px-4 py-2 rounded-xl border border-dashed border-border-subtle text-text-muted text-sm hover:border-accent-primary hover:text-accent-primary transition-all">
                      + Add New
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">

              <div className="glass p-8 rounded-[32px] border-border-subtle">
                <h3 className="text-xl font-bold font-display mb-6">Account Settings</h3>
                <div className="space-y-4">
                  <button className="w-full btn-ghost justify-start py-4 px-6 text-sm flex items-center gap-3">
                    <Shield size={18} /> Safety & Security
                  </button>
                  <button onClick={() => showToast('Preference management coming soon', 'info')} className="w-full btn-ghost justify-start py-4 px-6 text-sm flex items-center gap-3">
                    <Settings size={18} /> Account Preferences
                  </button>
                  <button className="w-full btn-ghost justify-start py-4 px-6 text-sm flex items-center gap-3 text-accent-danger hover:bg-accent-danger/10">
                    <Trash2 size={18} /> Delete Account
                  </button>
                </div>
              </div>

              <div className="glass p-8 rounded-[32px] bg-accent-primary/5 border-accent-primary/20">
                <h3 className="text-xl font-bold font-display mb-4">Data Export</h3>
                <p className="text-sm text-text-secondary mb-6">Download your intelligence reports and competitor data in PDF or CSV format.</p>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => showToast('Exporting PDF...', 'success')} className="btn-ghost text-xs py-3">Export PDF</button>
                  <button onClick={() => showToast('Exporting CSV...', 'success')} className="btn-ghost text-xs py-3">Export CSV</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const AddCompetitorModal = () => {
      const [searchQuery, setSearchQuery] = useState('');
      const [results, setResults] = useState<Competitor[]>([]);
      const [isSearching, setIsSearching] = useState(false);

      const handleSearch = () => {
        if (!searchQuery.trim() || !user || !(window as any).google) return;
        setIsSearching(true);
        
        const mapDiv = document.createElement('div');
        const mapInstance = new (window as any).google.maps.Map(mapDiv, {
          center: user.hospitalProfile?.location || { lat: 0, lng: 0 },
          zoom: 15
        });
 
        const service = new (window as any).google.maps.places.PlacesService(mapInstance);
        service.nearbySearch({
          location: user.hospitalProfile?.location,
          radius: 5000,
          keyword: searchQuery,
          type: 'hospital'
        }, (results: any, status: any) => {
          if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && results) {
            const competitors: Competitor[] = results.map((h: any) => ({
              placeId: h.place_id,
              name: h.name,
              address: h.vicinity,
              location: { lat: h.geometry.location.lat(), lng: h.geometry.location.lng() },
              rating: h.rating || 0,
              vicinity: h.vicinity
            }));
            setResults(competitors);
          }
          setIsSearching(false);
        });
      };

      const handleAdd = (comp: Competitor) => {
        if (!user) return;
        if (user.competitors.some(c => c.placeId === comp.placeId)) {
          showToast('Competitor already added', 'warning');
          return;
        }

        const updatedUser = { ...user, competitors: [...user.competitors, comp] };
        // `cliniciq_users` is stored as an object keyed by email (see `saveUser`).
        // Keep this consistent to avoid crashes / silent failures.
        const stored = JSON.parse(localStorage.getItem('cliniciq_users') || '{}');
        if (Array.isArray(stored)) {
          // Back-compat for older persisted shapes.
          const userIdx = stored.findIndex((u: any) => u.email === user.email);
          if (userIdx !== -1) stored[userIdx] = updatedUser;
          else stored.push(updatedUser);
          localStorage.setItem('cliniciq_users', JSON.stringify(stored));
        } else {
          stored[user.email] = updatedUser;
          localStorage.setItem('cliniciq_users', JSON.stringify(stored));
        }
        setUser(updatedUser);
        showToast(`${comp.name} added to analysis`, 'success');
      };

      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddCompetitorModalOpen(false)}
            className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl glass rounded-[40px] border border-border-subtle shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-8 border-b border-border-subtle flex justify-between items-center">
              <h3 className="text-2xl font-bold font-display">Add Competitor</h3>
              <button onClick={() => setIsAddCompetitorModalOpen(false)} className="p-2 rounded-full hover:bg-white/5 text-text-muted"><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input 
                  type="text" 
                  placeholder="Search for hospitals nearby..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-white/5 border border-border-subtle rounded-2xl pl-12 pr-4 py-4 focus:border-accent-primary transition-all"
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 text-sm"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              <div className="space-y-3">
                {results.length > 0 ? (
                  results.map((comp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-border-subtle hover:border-accent-primary/30 transition-all">
                      <div>
                        <p className="font-bold">{comp.name}</p>
                        <p className="text-xs text-text-muted flex items-center gap-1"><MapPin size={10} /> {comp.vicinity}</p>
                      </div>
                      <button 
                        onClick={() => handleAdd(comp)}
                        disabled={user?.competitors.some(c => c.placeId === comp.placeId)}
                        className={`p-2 rounded-xl transition-all ${user?.competitors.some(c => c.placeId === comp.placeId) ? 'bg-accent-success/20 text-accent-success' : 'bg-white/5 hover:bg-accent-primary/20 text-text-muted hover:text-accent-primary'}`}
                      >
                        {user?.competitors.some(c => c.placeId === comp.placeId) ? <Check size={20} /> : <Plus size={20} />}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-text-muted">
                    <Search size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Search for a hospital to add it to your analysis.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      );
    };



    const navItems = [
      { id: 'overview', label: 'Overview', icon: <Activity size={20} /> },
      { id: 'competitors', label: 'Competitors', icon: <Users size={20} /> },
      { id: 'analysis', label: 'Analysis', icon: <BarChart3 size={20} /> },
      { id: 'strategy', label: 'Strategy', icon: <Target size={20} /> },
      { id: 'profile', label: 'Profile', icon: <User size={20} /> }
    ];

    const handleRefreshAnalysis = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const results = await runCompetitiveAnalysis(user);
        const updatedUser = { ...user, analysisResults: results };
        // `cliniciq_users` is stored as an object keyed by email (see `saveUser`).
        const stored = JSON.parse(localStorage.getItem('cliniciq_users') || '{}');
        if (Array.isArray(stored)) {
          // Back-compat for older persisted shapes.
          const userIdx = stored.findIndex((u: any) => u.email === user.email);
          if (userIdx !== -1) stored[userIdx] = updatedUser;
          else stored.push(updatedUser);
          localStorage.setItem('cliniciq_users', JSON.stringify(stored));
        } else {
          stored[user.email] = updatedUser;
          localStorage.setItem('cliniciq_users', JSON.stringify(stored));
        }
        setUser(updatedUser);
        showToast('Analysis refreshed successfully', 'success');
      } catch (error) {
        console.error('Refresh Error:', error);
        showToast('Failed to refresh analysis', 'error');
      } finally {
        setLoading(false);
      }
    };



    return (
      <div className="min-h-screen flex bg-bg-primary">
        {/* Sidebar */}
        <aside className={`fixed md:relative z-40 h-screen transition-all duration-300 border-r border-border-subtle bg-bg-secondary flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
              <Activity className="text-white" size={24} />
            </div>
            {isSidebarOpen && <span className="text-xl font-bold font-display tracking-tight">Clinic <span className="text-accent-primary">IQ</span></span>}
          </div>

          <nav className="flex-1 px-3 space-y-1 mt-6">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-accent-primary/10 text-accent-primary shadow-[inset_0_0_10px_rgba(0,212,255,0.05)]' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'}`}
              >
                {item.icon}
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border-subtle">
            <button onClick={() => setView('home')} className="w-full flex items-center gap-3 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors mb-2">
              <span className="w-6 flex justify-center">←</span>
              {isSidebarOpen && <span className="font-medium text-sm">Back to Home</span>}
            </button>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-bold">
                {user?.hospitalName[0]}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{user?.hospitalName}</p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
              )}
              {isSidebarOpen && <button onClick={handleLogout} className="text-text-muted hover:text-accent-danger transition-colors"><LogOut size={18} /></button>}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 h-screen overflow-y-auto relative">
          <header className="sticky top-0 z-30 glass border-b border-border-subtle px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-white/5 text-text-secondary"><Menu size={20} /></button>
              <h2 className="text-2xl font-bold font-display capitalize">{activeTab}</h2>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleRefreshAnalysis} disabled={loading} className="btn-ghost py-2 text-sm flex items-center gap-2">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 
                {loading ? 'Analyzing...' : 'Refresh Analysis'}
              </button>

            </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto">
            {activeTab === 'overview' && <OverviewSection />}
            {activeTab === 'competitors' && <CompetitorsSection />}
            {activeTab === 'analysis' && <AnalysisSection />}
            {activeTab === 'strategy' && <StrategySection />}
            {activeTab === 'profile' && <ProfileSection />}
          </div>

          <AnimatePresence>
            {isAddCompetitorModalOpen && <AddCompetitorModal />}
          </AnimatePresence>
        </main>
      </div>
    );
  };
  const CompetitorSelectView = () => {
    const [radius, setRadius] = useState(5000);
    const [nearbyHospitals, setNearbyHospitals] = useState<Competitor[]>([]);
    const [selectedCompetitors, setSelectedCompetitors] = useState<Competitor[]>([]);
    const [map, setMap] = useState<any>(null);
    const [markers, setMarkers] = useState<any[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

    const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    useEffect(() => {
      if (!(window as any).google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        initMap();
      }
    }, []);

    const initMap = () => {
      if (user?.hospitalProfile?.location) {
        setupMapWithLocation(user.hospitalProfile.location);
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setupMapWithLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => {
             showToast('Geolocation denied. Showing default location.', 'warning');
             setupMapWithLocation({ lat: 40.7128, lng: -74.0060 });
          }
        );
      }
    };

    const setupMapWithLocation = (location: { lat: number, lng: number }) => {
      setUserLocation(location);
      const mapInstance = new (window as any).google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 14,
        styles: [
          { "elementType": "geometry", "stylers": [{ "color": "#141B2D" }] },
          { "elementType": "labels.text.stroke", "stylers": [{ "color": "#141B2D" }] },
          { "elementType": "labels.text.fill", "stylers": [{ "color": "#8892AA" }] },
          { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#F0F4FF" }] },
          { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#00D4FF" }] },
          { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#0F1629" }] },
          { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0A0E1A" }] }
        ]
      });
      setMap(mapInstance);

      // User Marker
      new (window as any).google.maps.Marker({
        position: location,
        map: mapInstance,
        title: user?.hospitalName || "Your Hospital",
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#00D4FF",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
        }
      });

      searchHospitals(location, mapInstance, radius);
    };

    const searchHospitals = (location: any, mapInstance: any, r: number) => {
      const service = new (window as any).google.maps.places.PlacesService(mapInstance);
      service.nearbySearch({
        location: location,
        radius: r,
        type: 'hospital'
      }, (results: any, status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK) {
          const hospitals = results.map((h: any) => ({
            placeId: h.place_id,
            name: h.name,
            address: h.vicinity,
            location: { lat: h.geometry.location.lat(), lng: h.geometry.location.lng() },
            rating: h.rating || 0,
            vicinity: h.vicinity
          }));
          setNearbyHospitals(hospitals);
          updateMarkers(hospitals, mapInstance);
        }
      });
    };

    const updateMarkers = (hospitals: Competitor[], mapInstance: any) => {
      markers.forEach(m => m.setMap(null));
      const newMarkers = hospitals.map(h => {
        const isSelected = selectedCompetitors.some(c => c.placeId === h.placeId);
        return new (window as any).google.maps.Marker({
          position: h.location,
          map: mapInstance,
          title: h.name,
          icon: {
            path: (window as any).google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: isSelected ? "#00E5A0" : "#7B61FF",
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "#FFFFFF",
          }
        });
      });
      setMarkers(newMarkers);
    };

    const toggleCompetitor = (h: Competitor) => {
      setSelectedCompetitors(prev => {
        const exists = prev.find(c => c.placeId === h.placeId);
        if (exists) return prev.filter(c => c.placeId !== h.placeId);
        return [...prev, h];
      });
    };

    useEffect(() => {
      if (map && userLocation) {
        searchHospitals(userLocation, map, radius);
      }
    }, [radius]);

    useEffect(() => {
      if (map) updateMarkers(nearbyHospitals, map);
    }, [selectedCompetitors]);

    const handleRunAnalysis = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const updatedUser = { 
          ...user, 
          competitors: selectedCompetitors, 
          selectedRadius: radius,
          setupComplete: true 
        };
        const results = await runCompetitiveAnalysis(updatedUser);
        updatedUser.analysisResults = results;
        saveUser(updatedUser);
        setView('dashboard');
        showToast('Analysis complete!', 'success');
      } catch (err: any) {
        showToast(err?.message || 'Analysis failed. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-50 bg-bg-primary p-6 md:p-8 flex flex-col gap-6">
            <div className="h-10 w-1/4 bg-white/5 rounded-2xl animate-pulse mb-4" />
            <div className="flex flex-col md:flex-row gap-8 h-full">
              <div className="w-full md:w-64 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
              </div>
              <div className="flex-1 space-y-6">
                <div className="h-64 bg-white/5 rounded-[32px] animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-[32px] animate-pulse" />)}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Left Panel */}
        <div className="w-full md:w-[400px] bg-bg-secondary border-r border-border-subtle flex flex-col h-screen">
          <div className="p-6 border-b border-border-subtle">
            <h2 className="text-2xl font-bold font-display mb-4">Select Competitors</h2>
            <label className="block text-sm font-medium text-text-secondary mb-2">Search Radius: {radius / 1000}km</label>
            <input 
              type="range" min="1000" max="20000" step="1000" 
              className="w-full h-2 bg-bg-card rounded-lg appearance-none cursor-pointer accent-accent-primary"
              value={radius} onChange={e => setRadius(parseInt(e.target.value))}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {nearbyHospitals.map(h => {
              const isSelected = selectedCompetitors.some(c => c.placeId === h.placeId);
              const dist = userLocation ? haversine(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng).toFixed(1) : '0';
              return (
                <div 
                  key={h.placeId} 
                  onClick={() => toggleCompetitor(h)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-accent-primary/10 border-accent-primary shadow-[0_0_15px_rgba(0,212,255,0.1)]' : 'bg-bg-card border-border-subtle hover:border-text-muted'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-text-primary leading-tight pr-2">{h.name}</h3>
                    {isSelected && <Check size={18} className="text-accent-primary flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {dist}km</span>
                    <span className="flex items-center gap-1"><Star size={12} className="text-accent-warning" /> {h.rating}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-2 line-clamp-1">{h.address}</p>
                </div>
              );
            })}
          </div>

          <div className="p-6 glass border-t border-border-subtle">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-text-secondary">{selectedCompetitors.length} selected</span>
              <div className="flex gap-3">
                <button onClick={() => setSelectedCompetitors(nearbyHospitals)} className="text-xs text-accent-primary hover:underline">Select all</button>
                <button onClick={() => setSelectedCompetitors([])} className="text-xs text-text-muted hover:text-text-primary transition-colors">Clear all</button>
              </div>
            </div>
            <button 
              disabled={selectedCompetitors.length === 0 || loading}
              onClick={handleRunAnalysis}
              className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
            >
              {loading ? <RefreshCw className="animate-spin" size={20} /> : 'Run AI Analysis'}
            </button>
            <button onClick={() => setView('home')} className="w-full text-text-muted text-sm hover:text-text-secondary transition-colors">← Back to Home</button>
          </div>
        </div>

        {/* Map Panel */}
        <div id="map" className="flex-1 h-[400px] md:h-screen bg-bg-primary" />
      </div>
    );
  };


  // --- Render Logic ---
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent-primary/30">
      <AnimatePresence mode="wait">
        {view === 'home' && <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><HomeView /></motion.div>}
        {view === 'signin' && <motion.div key="signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SignInView /></motion.div>}
        {view === 'signup' && <motion.div key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SignUpView /></motion.div>}
        {view === 'competitor-select' && <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CompetitorSelectView /></motion.div>}
        {view === 'dashboard' && <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><DashboardView /></motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
