import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, MapPin, Home, DollarSign, Maximize, BedDouble, Bath, 
  Wifi, Coffee, Dumbbell, PawPrint, Waves, Wind, ChevronRight, 
  Menu, X, Phone, Mail, CheckCircle2, Star, Clock, 
  ArrowRight, ShieldCheck, Heart, Share, PlayCircle,
  Facebook, Instagram, Map, Navigation, Upload, Trash2,
  LogOut, Plus, LoaderCircle, Pencil, Save, Building2, TrainFront,
  ChevronLeft, GripVertical, ImagePlus
} from 'lucide-react';
import {
  getMyProfile, hasSupabaseConfig, listApartments, supabase, uploadApartmentImages, usernameAuth
} from './src/lib/supabase';

const AMENITIES = {
  balcony: { icon: <Wind size={18} />, label: 'Ban công' },
  bathtub: { icon: <Bath size={18} />, label: 'Bồn tắm' },
  pool: { icon: <Waves size={18} />, label: 'Hồ bơi' },
  gym: { icon: <Dumbbell size={18} />, label: 'Phòng Gym' },
  pet: { icon: <PawPrint size={18} />, label: 'Pet Friendly' },
  washer: { icon: <Maximize size={18} />, label: 'Máy giặt riêng' },
  elevator: { icon: <Building2 size={18} />, label: 'Thang máy' },
  metro: { icon: <TrainFront size={18} />, label: 'Gần Metro' }
};

const DISTRICTS = [
  'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4',
  'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8',
  'Quận 9', 'Quận 10', 'Quận 11',
  'Quận Bình Thạnh', 'Quận Phú Nhuận', 'Quận Gò Vấp',
  'Quận Tân Bình', 'Quận Tân Phú'
];

const PRICE_RANGES = {
  '5-7': { min: 5, max: 7, label: '5 - 7 Triệu' },
  '7-10': { min: 7, max: 10, label: '7 - 10 Triệu' },
  '10-15': { min: 10, max: 15, label: '10 - 15 Triệu' },
  '15-20': { min: 15, max: 20, label: '15 - 20 Triệu' },
  '20-30': { min: 20, max: 30, label: '20 - 30 Triệu' },
  '30-plus': { min: 30, max: null, minExclusive: true, label: 'Trên 30 Triệu' },
};

const CONTACT = {
  facebook: 'https://www.facebook.com/profile.php?id=61591846062987',
  instagram: 'https://www.instagram.com/_khoathucnam/',
  zalo: 'https://zalo.me/0909180942',
  phoneDisplay: '0909 180 942',
  phoneHref: 'tel:+84909180942',
  email: 'nguyenthucnamkhoa3110@gmail.com',
  address: 'Số 2 Trần Quang Khải, Phường Tân Định, Quận 1, TP.HCM'
};

const useScrollToTop = (route) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);
};

const formatPrice = (price) => {
  return (price / 1000000).toLocaleString('vi-VN') + ' Triệu';
};

const optimizedImageUrl = (url, width = 1200) => {
  if (!url?.includes('.supabase.co/storage/v1/object/public/')) return url;
  const transformed = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
  const separator = transformed.includes('?') ? '&' : '?';
  return `${transformed}${separator}width=${width}&quality=82&resize=contain`;
};

const restoreOriginalImage = (event, originalUrl) => {
  if (event.currentTarget.src === originalUrl) return;
  event.currentTarget.onerror = null;
  event.currentTarget.src = originalUrl;
};

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl";
  const variants = {
    primary: "bg-[#0A2540] text-white hover:bg-[#0A2540]/90 shadow-md hover:shadow-xl",
    secondary: "bg-white text-[#0A2540] border border-gray-200 hover:border-[#0A2540] hover:bg-gray-50",
    accent: "bg-[#D83A42] text-white hover:bg-[#BE2E36] shadow-md hover:shadow-xl hover:scale-[1.02]",
    ghost: "bg-transparent text-gray-600 hover:text-[#0A2540] hover:bg-gray-100"
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const ApartmentCard = ({ data, onClick }) => {
  return (
    <a
      href={pathForRoute('detail', data.id)}
      aria-label={`Xem chi tiết căn hộ ${data.title}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 cursor-pointer flex flex-col h-full"
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        onClick(data.id);
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {data.images?.[0] ? (
          <img
            src={optimizedImageUrl(data.images[0], 800)}
            alt={data.title}
            loading="lazy"
            decoding="async"
            onError={(event) => restoreOriginalImage(event, data.images[0])}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-sm text-slate-500">Chưa có hình ảnh</div>
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-[#0A2540]">
          {data.type}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-1 group-hover:text-[#FF5A5F] transition-colors">
            {data.title}
          </h3>
        </div>
        
        <p className="text-gray-500 text-sm flex items-center mb-4">
          <MapPin size={14} className="mr-1" /> {data.district}, TP.HCM
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center"><Maximize size={16} className="mr-1.5 text-gray-400" /> {data.area}m²</div>
          <div className="flex items-center"><BedDouble size={16} className="mr-1.5 text-gray-400" /> {data.type}</div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block mb-0.5">Giá thuê</span>
            <span className="text-xl font-bold text-[#FF5A5F]">{formatPrice(data.price)}<span className="text-sm font-normal text-gray-500">/tháng</span></span>
          </div>
          <span className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-lg bg-white text-[#0A2540] border border-gray-200 group-hover:border-[#0A2540] group-hover:bg-gray-50 transition-colors">
            Chi tiết
          </span>
        </div>
      </div>
    </a>
  );
};

const handleRouteLink = (event, callback) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  callback();
};

const Header = ({ currentRoute, navigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Trang chủ', route: 'home' },
    { name: 'Thuê căn hộ', route: 'listings' },
    { name: 'Giới thiệu', route: 'about' },
    { name: 'Blog', route: 'blog' },
    { name: 'Liên hệ', route: 'contact' },
  ];
  const isActive = (route) => currentRoute === route
    || (route === 'listings' && currentRoute === 'detail')
    || (route === 'blog' && currentRoute === 'blog-detail');

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          aria-label="Saigon Retreats - Trang chủ"
          className="flex items-center gap-2 cursor-pointer"
          onClick={(event) => handleRouteLink(event, () => navigate('home'))}
        >
          <div className="w-8 h-8 bg-[#FF5A5F] rounded-lg flex items-center justify-center transform rotate-3">
            <Home className="text-white" size={20} />
          </div>
          <span className={`text-xl font-bold tracking-tight ${isScrolled || currentRoute !== 'home' ? 'text-[#0A2540]' : 'text-white'}`}>
            Saigon<span className="text-[#FF5A5F]">Retreats</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Điều hướng chính">
          {navLinks.map((link) => (
            <a
              key={link.route}
              href={pathForRoute(link.route)}
              aria-current={isActive(link.route) ? 'page' : undefined}
              onClick={(event) => handleRouteLink(event, () => navigate(link.route))}
              className={`text-sm font-medium transition-colors hover:text-[#FF5A5F] ${
                isActive(link.route)
                  ? 'text-[#FF5A5F]'
                  : (isScrolled || currentRoute !== 'home' ? 'text-gray-600' : 'text-white/90')
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <a
            href={CONTACT.zalo}
            target="_blank"
            rel="noreferrer"
            className={`hidden md:inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-md ${isScrolled || currentRoute !== 'home' ? 'bg-[#0A2540] text-white hover:bg-[#123b61]' : 'bg-white text-[#0A2540] hover:bg-gray-50'}`}
          >
            Ký gửi căn hộ
          </a>
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
            aria-expanded={mobileMenuOpen}
            className={`md:hidden p-2 ${isScrolled || currentRoute !== 'home' ? 'text-gray-900' : 'text-white'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="absolute top-full left-0 w-full bg-white shadow-xl py-4 flex flex-col md:hidden border-t border-gray-100" aria-label="Điều hướng di động">
          {navLinks.map((link) => (
            <a
              key={link.route}
              href={pathForRoute(link.route)}
              aria-current={isActive(link.route) ? 'page' : undefined}
              onClick={(event) => handleRouteLink(event, () => { navigate(link.route); setMobileMenuOpen(false); })}
              className={`py-3 px-6 text-left font-medium ${isActive(link.route) ? 'text-[#FF5A5F] bg-gray-50' : 'text-gray-800'}`}
            >
              {link.name}
            </a>
          ))}
          <div className="px-6 pt-4 mt-2 border-t border-gray-100">
            <a href={CONTACT.zalo} target="_blank" rel="noreferrer" className="w-full py-3 rounded-xl bg-[#0A2540] text-white font-semibold flex items-center justify-center">
              Ký gửi căn hộ
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};

const Footer = ({ navigate }) => (
  <footer className="bg-[#0A2540] text-gray-300 pt-20 pb-10">
    <div className="container mx-auto px-4 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1">
          <a href="/" onClick={(event) => handleRouteLink(event, () => navigate('home'))} className="flex items-center gap-2 mb-6" aria-label="Saigon Retreats - Trang chủ">
            <div className="w-8 h-8 bg-[#FF5A5F] rounded-lg flex items-center justify-center transform rotate-3">
              <Home className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Saigon<span className="text-[#FF5A5F]">Retreats</span>
            </span>
          </a>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            Chúng tôi định hình lại cách bạn tìm kiếm và trải nghiệm không gian sống tại TP.HCM. Cung cấp căn hộ cao cấp cho Expat, chuyên gia và người trẻ hiện đại.
          </p>
          <div className="flex items-center gap-4">
            <a href={CONTACT.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF5A5F] hover:text-white transition-all"><Facebook size={18} /></a>
            <a href={CONTACT.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF5A5F] hover:text-white transition-all"><Instagram size={18} /></a>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-6">Khám phá</h4>
          <ul className="space-y-4 text-sm">
            <li><a href={pathForRoute('listings', 'Quận 1')} onClick={(event) => handleRouteLink(event, () => navigate('listings', 'Quận 1'))} className="hover:text-[#FF5A5F] transition-colors">Căn hộ Quận 1</a></li>
            <li><a href={pathForRoute('listings', 'Quận 2')} onClick={(event) => handleRouteLink(event, () => navigate('listings', 'Quận 2'))} className="hover:text-[#FF5A5F] transition-colors">Căn hộ Quận 2 (Thảo Điền)</a></li>
            <li><a href={pathForRoute('listings', 'Quận 3')} onClick={(event) => handleRouteLink(event, () => navigate('listings', 'Quận 3'))} className="hover:text-[#FF5A5F] transition-colors">Căn hộ Quận 3</a></li>
            <li><a href={pathForRoute('listings', 'Quận 7')} onClick={(event) => handleRouteLink(event, () => navigate('listings', 'Quận 7'))} className="hover:text-[#FF5A5F] transition-colors">Căn hộ Quận 7 (Phú Mỹ Hưng)</a></li>
            <li><a href={pathForRoute('listings', 'Quận Bình Thạnh')} onClick={(event) => handleRouteLink(event, () => navigate('listings', 'Quận Bình Thạnh'))} className="hover:text-[#FF5A5F] transition-colors">Căn hộ Bình Thạnh</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Thông tin</h4>
          <ul className="space-y-4 text-sm">
            <li><a href={pathForRoute('about')} onClick={(event) => handleRouteLink(event, () => navigate('about'))} className="hover:text-[#FF5A5F] transition-colors">Về chúng tôi</a></li>
            <li><a href={pathForRoute('rental-process')} onClick={(event) => handleRouteLink(event, () => navigate('rental-process'))} className="hover:text-[#FF5A5F] transition-colors">Quy trình thuê nhà</a></li>
            <li><a href={pathForRoute('expat-guide')} onClick={(event) => handleRouteLink(event, () => navigate('expat-guide'))} className="hover:text-[#FF5A5F] transition-colors">Kinh nghiệm cho Expat</a></li>
            <li><a href={pathForRoute('privacy')} onClick={(event) => handleRouteLink(event, () => navigate('privacy'))} className="hover:text-[#FF5A5F] transition-colors">Chính sách bảo mật</a></li>
            <li><a href={pathForRoute('terms')} onClick={(event) => handleRouteLink(event, () => navigate('terms'))} className="hover:text-[#FF5A5F] transition-colors">Điều khoản sử dụng</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Liên hệ</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-[#FF5A5F] shrink-0 mt-0.5" />
              <span>{CONTACT.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-[#FF5A5F] shrink-0" />
              <a href={CONTACT.phoneHref} className="hover:text-[#FF5A5F] transition-colors">{CONTACT.phoneDisplay}</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-[#FF5A5F] shrink-0" />
              <a href={`mailto:${CONTACT.email}`} className="hover:text-[#FF5A5F] transition-colors">{CONTACT.email}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-300">
        <p>&copy; 2026 Saigon Retreats. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Designed with ❤️ for a better living experience.</p>
      </div>
    </div>
  </footer>
);

const FloatingContact = () => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
    <a href={CONTACT.zalo} target="_blank" rel="noreferrer" aria-label="Chat Zalo" className="w-14 h-14 bg-blue-500 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform group relative">
      <span className="font-bold text-xl">Z</span>
      <span className="absolute right-full mr-4 bg-white text-gray-800 text-sm py-1.5 px-3 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Chat Zalo</span>
    </a>
    <a href={CONTACT.phoneHref} aria-label="Gọi ngay" className="w-14 h-14 bg-[#FF5A5F] rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform group relative">
      <Phone size={24} />
      <span className="absolute right-full mr-4 bg-white text-gray-800 text-sm py-1.5 px-3 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Gọi ngay</span>
    </a>
  </div>
);

const HomePage = ({ navigate, apartments, loading }) => {
  const markedFeatured = apartments.filter(a => a.featured);
  const featuredApts = (markedFeatured.length ? markedFeatured : apartments).slice(0, 3);
  const [districtQuery, setDistrictQuery] = useState('');
  const [searchNotice, setSearchNotice] = useState('');

  const searchByDistrict = (event) => {
    event?.preventDefault();
    const normalize = (value) => value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    const query = normalize(districtQuery);
    const aliases = [
      ...DISTRICTS.map(district => [normalize(district), district]),
      ['binh thanh', 'Quận Bình Thạnh'],
      ['phu nhuan', 'Quận Phú Nhuận'],
      ['go vap', 'Quận Gò Vấp'],
      ['tan binh', 'Quận Tân Bình'],
      ['tan phu', 'Quận Tân Phú'],
      ['thao dien', 'Quận 2'],
      ['phu my hung', 'Quận 7'],
    ].sort((a, b) => b[0].length - a[0].length);
    const isWholePhrase = (text, phrase) => {
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`).test(text);
    };
    const matchedDistrict = aliases.find(([alias]) => query === alias || isWholePhrase(query, alias))?.[1];
    if (!matchedDistrict) {
      setSearchNotice('Vui lòng nhập khu vực theo mẫu, ví dụ: Quận 1, Quận 7 hoặc Bình Thạnh.');
      return;
    }
    setSearchNotice('');
    navigate('listings', matchedDistrict);
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A2540]/80 via-[#0A2540]/50 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
            Tìm không gian sống lý tưởng <br className="hidden md:block"/> tại Sài Gòn
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-light animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Khám phá bộ sưu tập các căn hộ cao cấp được tuyển chọn khắt khe dành riêng cho bạn.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={searchByDistrict} className="bg-white/10 backdrop-blur-md p-2 rounded-2xl md:rounded-full max-w-4xl mx-auto shadow-2xl flex flex-col md:flex-row items-center gap-2 border border-white/20 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="flex-1 w-full bg-white rounded-xl md:rounded-full flex items-center px-6 py-4">
              <MapPin className="text-gray-400 mr-3 shrink-0" size={20} />
              <label htmlFor="home-district-search" className="sr-only">Khu vực muốn thuê</label>
              <input id="home-district-search" value={districtQuery} onChange={event => { setDistrictQuery(event.target.value); setSearchNotice(''); }} type="text" placeholder="Bạn muốn thuê ở quận nào?" className="w-full outline-none text-gray-800 placeholder-gray-500 bg-transparent text-sm md:text-base" />
            </div>
            <Button type="submit" variant="accent" className="w-full md:w-auto px-8 py-4 rounded-xl md:rounded-full text-base whitespace-nowrap">
              <Search className="mr-2" size={18} /> Tìm căn hộ
            </Button>
          </form>
          {searchNotice && <p className="mt-4 text-sm text-white bg-[#0A2540]/70 rounded-xl px-4 py-2 inline-block" role="alert">{searchNotice}</p>}

          <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm font-medium animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full cursor-pointer hover:bg-white hover:text-[#0A2540] transition-colors" onClick={() => navigate('listings', 'Quận 1')}>Quận 1</button>
            <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full cursor-pointer hover:bg-white hover:text-[#0A2540] transition-colors" onClick={() => navigate('listings', 'Quận 3')}>Quận 3</button>
            <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full cursor-pointer hover:bg-white hover:text-[#0A2540] transition-colors" onClick={() => navigate('listings', 'Quận 10')}>Quận 10</button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540] mb-4">Căn hộ nổi bật</h2>
              <p className="text-gray-500 max-w-xl">Những không gian sống được yêu thích nhất với thiết kế độc đáo và tiện ích vượt trội.</p>
            </div>
            <Button variant="ghost" className="mt-4 md:mt-0 group" onClick={() => navigate('listings')}>
              Xem tất cả <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white border border-gray-100 p-12 text-center text-gray-500">Đang tải danh sách căn hộ...</div>
          ) : featuredApts.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredApts.map(apt => <ApartmentCard key={apt.id} data={apt} onClick={(id) => navigate('detail', id)} />)}
            </div>
          ) : (
            <div className="rounded-3xl bg-white border border-gray-100 p-12 text-center">
              <h3 className="text-xl font-bold text-[#0A2540] mb-2">Danh sách căn hộ đang được cập nhật</h3>
              <p className="text-gray-500 mb-6">Vui lòng liên hệ Zalo để nhận danh sách căn hộ mới nhất.</p>
              <a href={CONTACT.zalo} target="_blank" rel="noreferrer" className="inline-flex px-5 py-3 rounded-xl bg-[#0A2540] text-white font-semibold">Liên hệ Zalo</a>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540] mb-4">Tại sao chọn Saigon Retreats?</h2>
            <p className="text-gray-500">Chúng tôi không chỉ cho thuê nhà, chúng tôi trao bạn một trải nghiệm sống đẳng cấp, an tâm và tiện lợi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <ShieldCheck size={32} />, title: "Tuyển chọn khắt khe", desc: "100% căn hộ được kiểm duyệt trực tiếp, đảm bảo hình ảnh thực tế và chất lượng sống tốt nhất." },
              { icon: <Clock size={32} />, title: "Hỗ trợ 24/7", desc: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng giải quyết mọi vấn đề phát sinh trong quá trình lưu trú." },
              { icon: <Star size={32} />, title: "Trải nghiệm liền mạch", desc: "Thủ tục hợp đồng rõ ràng, minh bạch. Hỗ trợ đăng ký tạm trú cho người nước ngoài nhanh chóng." }
            ].map((feature, idx) => (
              <div key={idx} className="bg-slate-50 rounded-3xl p-8 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#FF5A5F] mx-auto mb-6 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0A2540] mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const ListingsPage = ({ navigate, apartments, initialFilters, initialSort, onStateChange, loading }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  useEffect(() => { onStateChange(filters, sort); }, [filters, sort]);
  useEffect(() => {
    const currentKey = JSON.stringify(filters);
    const initialKey = JSON.stringify(initialFilters);
    if (currentKey !== initialKey) setFilters(initialFilters);
    if (sort !== initialSort) setSort(initialSort);
  }, [initialFilters, initialSort]);
  
  const handleAmenityChange = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity) 
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const minPrice = filters.minPrice === '' ? null : Number(filters.minPrice);
  const maxPrice = filters.maxPrice === '' ? null : Number(filters.maxPrice);
  const hasInvalidCustomPrice = minPrice !== null && maxPrice !== null && minPrice > maxPrice;

  const filteredApts = useMemo(() => {
    const result = apartments.filter(apt => {
      if (
        filters.district &&
        apt.district.replace(/^Quận\s+/i, '') !== filters.district.replace(/^Quận\s+/i, '')
      ) return false;
      if (filters.type && apt.type !== filters.type) return false;
      const selectedRange = PRICE_RANGES[filters.priceRange];
      if (selectedRange) {
        if (selectedRange.minExclusive ? apt.price <= selectedRange.min * 1000000 : apt.price < selectedRange.min * 1000000) return false;
        if (selectedRange.max !== null && apt.price > selectedRange.max * 1000000) return false;
      }
      if (hasInvalidCustomPrice) return false;
      if (minPrice !== null && apt.price < minPrice * 1000000) return false;
      if (maxPrice !== null && apt.price > maxPrice * 1000000) return false;
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(a => (apt.amenities || []).includes(a));
        if (!hasAllAmenities) return false;
      }
      return true;
    });
    return [...result].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'newest') return String(b.created_at || '').localeCompare(String(a.created_at || ''));
      return Number(b.featured) - Number(a.featured) || (b.views || 0) - (a.views || 0);
    });
  }, [filters, apartments, sort, minPrice, maxPrice, hasInvalidCustomPrice]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header & Breadcrumb */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0A2540] mb-2">Khám phá Căn hộ</h1>
          <p className="text-gray-500">Tìm thấy {filteredApts.length} không gian phù hợp với bạn</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:overscroll-contain">
              <h3 className="font-bold text-lg mb-6 flex items-center"><Search size={18} className="mr-2" /> Bộ lọc</h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="listing-district" className="block text-sm font-medium text-gray-700 mb-2">Khu vực</label>
                  <select 
                    id="listing-district"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0A2540] transition-colors"
                    value={filters.district}
                    onChange={(e) => setFilters({...filters, district: e.target.value})}
                  >
                    <option value="">Tất cả khu vực</option>
                    {DISTRICTS.map(district => <option key={district} value={district}>{district}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="listing-type" className="block text-sm font-medium text-gray-700 mb-2">Loại phòng</label>
                  <select 
                    id="listing-type"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0A2540] transition-colors"
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                  >
                    <option value="">Tất cả</option>
                    <option value="Studio">Studio</option>
                    <option value="1PN">1 Phòng Ngủ</option>
                    <option value="2PN">2 Phòng Ngủ</option>
                    <option value="3PN">3 Phòng Ngủ</option>
                    <option value="Duplex">Duplex</option>
                    <option value="Penthouse">Penthouse</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="listing-price" className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá</label>
                  <select 
                    id="listing-price"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0A2540] transition-colors"
                    value={filters.priceRange}
                    onChange={(e) => setFilters({...filters, priceRange: e.target.value, minPrice: '', maxPrice: ''})}
                  >
                    <option value="">Mọi mức giá</option>
                    {Object.entries(PRICE_RANGES).map(([value, range]) => <option key={value} value={value}>{range.label}</option>)}
                  </select>
                  <fieldset className="mt-4 pt-4 border-t border-gray-200">
                    <legend className="text-xs font-semibold text-gray-600 px-1">Lọc giá nâng cao</legend>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <label htmlFor="listing-min-price" className="text-xs text-gray-600">Giá Min
                        <div className="relative mt-1">
                          <input
                            id="listing-min-price"
                            type="number"
                            min="0"
                            step="0.1"
                            inputMode="decimal"
                            value={filters.minPrice}
                            onChange={(e) => setFilters({...filters, priceRange: '', minPrice: e.target.value})}
                            placeholder="6"
                            className="w-full py-2.5 pl-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0A2540]"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">Triệu</span>
                        </div>
                      </label>
                      <label htmlFor="listing-max-price" className="text-xs text-gray-600">Giá Max
                        <div className="relative mt-1">
                          <input
                            id="listing-max-price"
                            type="number"
                            min="0"
                            step="0.1"
                            inputMode="decimal"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({...filters, priceRange: '', maxPrice: e.target.value})}
                            placeholder="9"
                            className="w-full py-2.5 pl-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0A2540]"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">Triệu</span>
                        </div>
                      </label>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">Ví dụ: nhập 6 và 9 để tìm căn từ 6–9 triệu.</p>
                    {hasInvalidCustomPrice && <p role="alert" className="text-xs text-red-600 mt-2">Giá Min không được lớn hơn Giá Max.</p>}
                  </fieldset>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tiện ích</label>
                  <div className="space-y-3">
                    {Object.entries(AMENITIES).map(([key, data]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={filters.amenities.includes(key)}
                          onChange={() => handleAmenityChange(key)}
                        />
                        <div aria-hidden="true" className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.amenities.includes(key) ? 'bg-[#FF5A5F] border-[#FF5A5F]' : 'border-gray-300 group-hover:border-[#FF5A5F]'}`}>
                          {filters.amenities.includes(key) && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <span className="text-gray-600 text-sm group-hover:text-gray-900 flex items-center gap-2">
                          <span className="text-gray-400">{data.icon}</span> {data.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <Button 
                  variant="secondary" 
                  className="w-full py-2.5 mt-2"
                   onClick={() => { setFilters({ district: '', type: '', priceRange: '', minPrice: '', maxPrice: '', amenities: [] }); setSort('recommended'); }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </aside>

          {/* Grid view */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
               <label htmlFor="listing-sort" className="text-sm text-gray-500">Sắp xếp theo:</label>
               <select id="listing-sort" value={sort} onChange={event => setSort(event.target.value)} className="border-none bg-transparent font-medium text-[#0A2540] outline-none cursor-pointer">
                 <option value="recommended">Đề xuất</option>
                 <option value="price-asc">Giá thấp - cao</option>
                 <option value="price-desc">Giá cao - thấp</option>
                 <option value="newest">Mới nhất</option>
               </select>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100 text-gray-500">Đang tải căn hộ...</div>
            ) : filteredApts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredApts.map(apt => (
                  <ApartmentCard key={apt.id} data={apt} onClick={(id) => navigate('detail', id)} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-300" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy kết quả</h3>
                <p className="text-gray-500">Vui lòng thử thay đổi bộ lọc hoặc khu vực tìm kiếm.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailPage = ({ id, navigate, apartments, loading }) => {
  const [showConsultationPhone, setShowConsultationPhone] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [moveInDate, setMoveInDate] = useState('');
  const [leaseTerm, setLeaseTerm] = useState('6 tháng');
  const [notice, setNotice] = useState('');
  const [bookingReady, setBookingReady] = useState(false);
  const closeGalleryButtonRef = useRef(null);
  const apt = apartments.find(a => String(a.id) === String(id));

  useEffect(() => {
    if (!showGallery) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => { if (event.key === 'Escape') setShowGallery(false); };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    closeGalleryButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [showGallery]);

  if (loading) return <div className="min-h-screen pt-36 text-center text-gray-500">Đang tải thông tin căn hộ...</div>;
  if (!apt) return (
    <div className="min-h-screen pt-36 text-center px-4">
      <h1 className="text-4xl font-bold text-[#0A2540] mb-4">Không tìm thấy căn hộ</h1>
      <p className="text-gray-500 mb-8">Căn hộ có thể đã được gỡ hoặc không còn hiển thị.</p>
      <Button onClick={() => navigate('listings')} className="px-6 py-3">Xem danh sách căn hộ</Button>
    </div>
  );

  const similarApts = apartments.filter(a => a.district === apt.district && a.id !== apt.id).slice(0, 3);
  const images = Array.isArray(apt.images) ? apt.images.filter(Boolean) : [];
  const leaseMonths = leaseTerm === '6 tháng' ? 6 : leaseTerm === '1 năm' ? 12 : 24;
  const shareApartment = async () => {
    const shareData = { title: apt.title, text: `Xem căn hộ ${apt.title} tại Saigon Retreats`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setNotice('Đã sao chép đường dẫn căn hộ.');
      }
    } catch {
      setNotice('Không thể mở trình chia sẻ. Vui lòng sao chép đường dẫn trên thanh địa chỉ.');
    }
  };
  const openBookingZalo = () => {
    if (!moveInDate) {
      setNotice('Vui lòng chọn ngày nhận phòng trước khi liên hệ Zalo.');
      return;
    }
    setBookingReady(true);
    setNotice(`Ngày nhận phòng ${moveInDate}, thời hạn ${leaseTerm}. Hãy mở Zalo và gửi hai thông tin này cho Saigon Retreats.`);
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 md:px-8 py-8">
        
        {/* Header Area */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0A2540] mb-2">{apt.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center"><MapPin size={16} className="mr-1" /> {apt.district}, TP.HCM</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={shareApartment} className="px-4 py-2 gap-2"><Share size={16} /> Chia sẻ</Button>
          </div>
        </div>

        {/* Gallery - Airbnb Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 rounded-2xl overflow-hidden mb-12 h-[400px] md:h-[500px]">
          <div className="md:col-span-2 md:row-span-2 h-full relative cursor-pointer group">
            {images[0] ? <img src={optimizedImageUrl(images[0], 1400)} onError={(event) => restoreOriginalImage(event, images[0])} alt={`${apt.title} - ảnh chính`} fetchPriority="high" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500">Căn hộ chưa có hình ảnh</div>}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
          </div>
          {images[1] && (
             <div className="hidden md:block h-full relative cursor-pointer group">
               <img src={optimizedImageUrl(images[1], 700)} onError={(event) => restoreOriginalImage(event, images[1])} alt={`${apt.title} - ảnh 2`} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
             </div>
          )}
          {images[2] ? (
            <div className="hidden md:block h-full relative cursor-pointer group">
               <img src={optimizedImageUrl(images[2], 700)} onError={(event) => restoreOriginalImage(event, images[2])} alt={`${apt.title} - ảnh 3`} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
             </div>
          ) : (
            <div className="hidden md:block h-full bg-gray-100"></div>
          )}
           <div className="hidden md:block h-full bg-gray-100">
              {images[3] && <img src={optimizedImageUrl(images[3], 700)} onError={(event) => restoreOriginalImage(event, images[3])} alt={`${apt.title} - ảnh 4`} loading="lazy" decoding="async" className="w-full h-full object-cover" />}
           </div>
           {images.length > 0 && <button type="button" onClick={() => setShowGallery(true)} className="hidden md:block h-full bg-gray-100 relative group cursor-pointer text-left">
               {images[4] && <img src={optimizedImageUrl(images[4], 700)} onError={(event) => restoreOriginalImage(event, images[4])} alt={`${apt.title} - ảnh 5`} loading="lazy" decoding="async" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/45 flex items-center justify-center text-white font-semibold group-hover:bg-black/55 transition-colors">
                 Xem tất cả {images.length} ảnh
              </div>
           </button>}
        </div>

        {images.length > 0 && <button type="button" onClick={() => setShowGallery(true)} className="md:hidden w-full -mt-8 mb-10 py-3 rounded-xl border border-gray-200 font-semibold text-[#0A2540]">
          Xem tất cả {images.length} ảnh
        </button>}

        {showGallery && (
          <div className="fixed inset-0 z-[100] bg-white overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="gallery-title">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200">
              <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                <div>
                  <h2 id="gallery-title" className="font-bold text-xl text-[#0A2540]">Hình ảnh căn hộ</h2>
                  <p className="text-sm text-gray-500">{images.length} ảnh · {apt.title}</p>
                </div>
                <button ref={closeGalleryButtonRef} type="button" onClick={() => setShowGallery(false)} aria-label="Đóng thư viện ảnh" className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100">
                  <X size={22} />
                </button>
              </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                   src={optimizedImageUrl(image, index === 0 ? 1800 : 1400)}
                   alt={`${apt.title} - ảnh ${index + 1}`}
                   loading={index === 0 ? 'eager' : 'lazy'}
                   decoding="async"
                   onError={(event) => restoreOriginalImage(event, image)}
                  className={`w-full rounded-2xl object-cover bg-gray-100 ${index === 0 ? 'md:col-span-2 md:max-h-[700px]' : 'h-auto md:min-h-[320px] md:max-h-[520px]'}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Info */}
          <div className="flex-1 lg:max-w-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 pb-8 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#0A2540] mb-1">Toàn bộ căn hộ {apt.type}</h2>
                <p className="text-gray-500">
                  {apt.area}m² · {apt.bathrooms || 1} nhà vệ sinh · {apt.furnishing || 'Đầy đủ nội thất'}
                </p>
              </div>
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=Host&background=0A2540&color=fff`} alt="Host" />
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bold text-[#0A2540] mb-4">Mô tả</h3>
              <p className="text-gray-600 leading-relaxed text-lg font-light">{apt.description}</p>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bold text-[#0A2540] mb-6">Tiện ích nổi bật</h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                {(apt.amenities || []).filter(key => AMENITIES[key]).map(key => (
                  <div key={key} className="flex items-center gap-4 text-gray-700">
                    <span className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full text-gray-500">{AMENITIES[key].icon}</span>
                    <span className="font-medium">{AMENITIES[key].label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Map Placeholder */}
            <div className="mb-10">
               <h3 className="text-xl font-bold text-[#0A2540] mb-4">Vị trí trên bản đồ</h3>
               <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-gray-200 relative">
                 <iframe
                   title={`Bản đồ khu vực ${apt.district}`}
                   src={`https://www.google.com/maps?q=${encodeURIComponent(`${apt.district}, TP.HCM`)}&output=embed`}
                   className="w-full h-full border-0"
                   loading="lazy"
                   referrerPolicy="no-referrer-when-downgrade"
                 />
                 <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${apt.district}, TP.HCM`)}`} className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-xl shadow-md text-sm font-semibold text-[#0A2540]">
                   Mở Google Maps
                 </a>
               </div>
            </div>
          </div>

          {/* Sticky Booking Sidebar */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-28 bg-white border border-gray-200 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-2xl font-bold text-[#0A2540]">{formatPrice(apt.price)}</span>
                  <span className="text-gray-500 ml-1">/tháng</span>
                </div>
              </div>
              
              <div className="border border-gray-300 rounded-xl overflow-hidden mb-6 flex flex-col">
                 <div className="flex border-b border-gray-300">
                    <div className="p-3 border-r border-gray-300 flex-1">
                       <label htmlFor="move-in-date" className="text-[10px] font-bold uppercase text-gray-800 block mb-1">Ngày nhận phòng</label>
                       <input id="move-in-date" value={moveInDate} min={new Date().toISOString().slice(0, 10)} onChange={event => { setMoveInDate(event.target.value); setBookingReady(false); }} type="date" className="w-full text-sm outline-none text-gray-600" />
                    </div>
                    <div className="p-3 flex-1">
                       <label htmlFor="lease-term" className="text-[10px] font-bold uppercase text-gray-800 block mb-1">Thời hạn thuê</label>
                       <select id="lease-term" value={leaseTerm} onChange={event => { setLeaseTerm(event.target.value); setBookingReady(false); }} className="w-full text-sm outline-none text-gray-600 bg-transparent">
                         <option>6 tháng</option>
                         <option>1 năm</option>
                         <option>2 năm</option>
                       </select>
                    </div>
                 </div>
              </div>

              <Button variant="accent" onClick={openBookingZalo} className="w-full py-4 text-lg font-bold mb-4">Đặt lịch xem phòng</Button>
              {bookingReady && <a href={CONTACT.zalo} target="_blank" rel="noreferrer" className="w-full py-3 mb-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center">Mở Zalo để nhắn lịch xem phòng</a>}
              {showConsultationPhone ? (
                <a
                  href={CONTACT.phoneHref}
                  className="w-full py-4 text-lg font-bold mb-6 gap-2 rounded-xl border border-gray-200 text-[#0A2540] hover:border-[#FF5A5F] hover:text-[#FF5A5F] transition-colors flex items-center justify-center"
                >
                  <Phone size={20} /> {CONTACT.phoneDisplay}
                </a>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full py-4 text-lg font-bold mb-6 gap-2"
                  onClick={() => setShowConsultationPhone(true)}
                >
                  <Phone size={20} /> Gọi tư vấn
                </Button>
              )}
              
              <p className="text-center text-sm text-gray-500">Không thu phí dịch vụ từ khách thuê</p>
              {notice && <p className="mt-3 text-center text-sm text-[#FF5A5F]" role="status">{notice}</p>}
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm mb-3 text-gray-600">
                  <span>Tiền thuê x {leaseMonths} tháng</span>
                  <span>{formatPrice(apt.price * leaseMonths)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Apartments */}
      {similarApts.length > 0 && (
        <div className="bg-gray-50 py-16 mt-12">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-bold text-[#0A2540] mb-8">Căn hộ tương tự tại {apt.district}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarApts.map(sim => (
                <ApartmentCard key={sim.id} data={sim} onClick={(id) => navigate('detail', id)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AboutPage = () => (
  <div className="min-h-screen pt-24 bg-white">
    <div className="container mx-auto px-4 md:px-8 max-w-5xl py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#0A2540] mb-6">Định hình phong cách sống mới</h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto font-light">Saigon Retreats ra đời với sứ mệnh mang đến không gian lưu trú tinh tế, tiện nghi và cảm hứng cho cộng đồng người trẻ, chuyên gia và Expat tại Việt Nam.</p>
      </div>
      <div className="rounded-3xl overflow-hidden h-[400px] mb-20 relative">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" alt="Office" className="w-full h-full object-cover" />
      </div>
      <div className="grid md:grid-cols-2 gap-16 mb-20">
        <div>
          <h2 className="text-3xl font-bold text-[#0A2540] mb-6">Tầm nhìn của chúng tôi</h2>
          <p className="text-gray-600 leading-relaxed mb-4">Chúng tôi tin rằng ngôi nhà không chỉ là nơi để ở, mà là nơi nuôi dưỡng tinh thần và khởi nguồn cho những thành công.</p>
          <p className="text-gray-600 leading-relaxed">Loại bỏ những rắc rối của việc thuê nhà truyền thống, chúng tôi áp dụng công nghệ và tư duy dịch vụ khách hàng từ ngành khách sạn để tạo ra trải nghiệm mượt mà nhất.</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
           <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="text-4xl font-bold text-[#FF5A5F] mb-2">500+</div>
              <div className="text-sm text-gray-600">Căn hộ chất lượng</div>
           </div>
           <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="text-4xl font-bold text-[#FF5A5F] mb-2">98%</div>
              <div className="text-sm text-gray-600">Khách hàng hài lòng</div>
           </div>
           <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="text-4xl font-bold text-[#FF5A5F] mb-2">24/7</div>
              <div className="text-sm text-gray-600">Hỗ trợ liên tục</div>
           </div>
           <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="text-4xl font-bold text-[#FF5A5F] mb-2">5+</div>
              <div className="text-sm text-gray-600">Năm kinh nghiệm</div>
           </div>
        </div>
      </div>
    </div>
  </div>
);

const BLOGS = [
  {
    id: 'chon-can-ho-quan-2',
    title: 'Bí quyết chọn thuê căn hộ tại Quận 2 cho Expat',
    category: 'Kinh nghiệm',
    img: 'https://images.unsplash.com/photo-1542361345-89e58247f2d5?auto=format&fit=crop&q=80&w=1200',
    intro: 'Quận 2, đặc biệt là Thảo Điền và An Phú, là lựa chọn quen thuộc của cộng đồng người nước ngoài nhờ môi trường sống xanh, tiện nghi và kết nối thuận lợi.',
    sections: [
      ['Ưu tiên vị trí phù hợp lịch sinh hoạt', 'Nếu thường xuyên làm việc tại Quận 1, hãy chọn căn hộ gần Xa lộ Hà Nội, cầu Sài Gòn hoặc ga Metro. Thảo Điền phù hợp với người thích nhà hàng, trường quốc tế và không gian sống sôi động; An Phú yên tĩnh hơn và thuận tiện đi về phía Đông thành phố.'],
      ['Kiểm tra căn hộ trước khi đặt cọc', 'Hãy kiểm tra điều hòa, máy nước nóng, áp lực nước, thiết bị bếp, cách âm và tình trạng nội thất. Nên chụp ảnh hiện trạng, lập biên bản bàn giao và ghi rõ danh sách thiết bị đi kèm trong hợp đồng.'],
      ['Đọc kỹ chi phí và điều khoản thuê', 'Ngoài tiền thuê, cần hỏi rõ phí quản lý, phí gửi xe, điện nước, internet, thời hạn báo trước và điều kiện hoàn cọc. Với người nước ngoài, chủ nhà cũng cần hỗ trợ đăng ký tạm trú đúng quy định.']
    ]
  },
  {
    id: 'chi-phi-sinh-hoat-tphcm',
    title: 'Chi phí sinh hoạt trung bình tại TP.HCM năm 2026',
    category: 'Tài chính',
    img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200',
    intro: 'Ngân sách sinh hoạt tại TP.HCM phụ thuộc nhiều vào khu vực, loại căn hộ và thói quen cá nhân. Dưới đây là khung tham khảo giúp người thuê chủ động lập kế hoạch.',
    sections: [
      ['Tiền thuê và phí cố định', 'Căn hộ studio hoặc một phòng ngủ thường là lựa chọn tiết kiệm nhất. Ngoài tiền thuê hàng tháng, người thuê nên dự trù phí quản lý, gửi xe, internet và các dịch vụ riêng của tòa nhà.'],
      ['Điện, nước và ăn uống', 'Chi phí điện tăng đáng kể nếu sử dụng điều hòa thường xuyên. Tự nấu ăn giúp tối ưu ngân sách, trong khi ăn tại nhà hàng quốc tế hoặc đặt món hàng ngày sẽ khiến tổng chi phí cao hơn đáng kể.'],
      ['Đi lại và khoản dự phòng', 'Metro, xe buýt và xe công nghệ đều thuận tiện tại khu vực trung tâm. Một ngân sách tốt nên dành thêm khoảng 10–15% cho y tế, giải trí, sửa chữa nhỏ và các khoản phát sinh.']
    ]
  },
  {
    id: 'chung-cu-ho-boi-dep',
    title: 'Top 5 chung cư cao cấp có hồ bơi đẹp nhất Sài Gòn',
    category: 'Khám phá',
    img: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1200',
    intro: 'Hồ bơi đẹp không chỉ phục vụ luyện tập mà còn tạo nên trải nghiệm nghỉ dưỡng ngay tại nhà. Đây là năm khu căn hộ thường được khách thuê cao cấp quan tâm.',
    sections: [
      ['Vinhomes Central Park và Landmark 81', 'Khu đô thị ven sông nổi bật với hồ bơi ngoài trời, cảnh quan rộng và hệ tiện ích đồng bộ. Vị trí Bình Thạnh giúp di chuyển nhanh về trung tâm.'],
      ['Masteri Thảo Điền và Estella Heights', 'Hai lựa chọn nổi bật tại khu Đông với hồ bơi phong cách resort, nhiều mảng xanh, gần trung tâm thương mại và cộng đồng cư dân quốc tế.'],
      ['The Metropole Thủ Thiêm', 'Các tòa căn hộ mới tại Thủ Thiêm sở hữu hồ bơi hiện đại và tầm nhìn đẹp về trung tâm. Khi chọn thuê, nên kiểm tra quy định sử dụng tiện ích và số thẻ cư dân được cấp.']
    ]
  },
  {
    id: 'tam-tru-nguoi-nuoc-ngoai',
    title: 'Hướng dẫn làm thủ tục tạm trú cho người nước ngoài',
    category: 'Pháp lý',
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200',
    intro: 'Khai báo tạm trú là bước cần thiết khi người nước ngoài thuê và sinh sống tại Việt Nam. Chủ nhà hoặc đơn vị lưu trú thường là bên thực hiện thủ tục.',
    sections: [
      ['Chuẩn bị thông tin cần thiết', 'Thông thường cần hộ chiếu, thị thực hoặc giấy tờ cư trú còn hiệu lực, thông tin ngày nhập cảnh, địa chỉ căn hộ và hợp đồng thuê. Bản chụp cần rõ ràng và khớp với thông tin khai báo.'],
      ['Thực hiện khai báo', 'Chủ nhà có thể khai báo qua cổng thông tin quản lý xuất nhập cảnh hoặc thực hiện theo hướng dẫn của công an địa phương. Việc khai báo nên được hoàn thành ngay sau khi khách đến cư trú.'],
      ['Lưu ý cho người thuê', 'Hãy xác nhận trước khi ký hợp đồng rằng chủ nhà có thể hỗ trợ đăng ký tạm trú. Quy trình và yêu cầu hồ sơ có thể thay đổi, vì vậy nên kiểm tra lại với cơ quan có thẩm quyền tại thời điểm thực hiện.']
    ]
  },
  {
    id: 'minimalism-can-ho-studio',
    title: 'Phong cách Minimalism trong thiết kế căn hộ Studio',
    category: 'Nội thất',
    img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200',
    intro: 'Minimalism giúp căn hộ studio trở nên rộng, sáng và dễ sử dụng hơn bằng cách giảm chi tiết thừa và ưu tiên những món đồ có công năng rõ ràng.',
    sections: [
      ['Chọn bảng màu sáng và đồng nhất', 'Trắng, kem, be và màu gỗ nhạt giúp phản xạ ánh sáng tốt. Chỉ nên dùng một hoặc hai màu nhấn để không gian có chiều sâu mà vẫn giữ cảm giác gọn gàng.'],
      ['Tận dụng nội thất đa năng', 'Giường có ngăn kéo, bàn gấp, sofa nhỏ và tủ cao sát trần giúp tăng khả năng lưu trữ. Nên đo kỹ kích thước trước khi mua để giữ lối đi thông thoáng.'],
      ['Giảm đồ nhưng không giảm tiện nghi', 'Mỗi khu vực cần có chức năng rõ ràng. Ánh sáng nhiều lớp, rèm nhẹ và một vài cây xanh sẽ khiến căn hộ ấm áp hơn mà không làm mất tinh thần tối giản.']
    ]
  },
  {
    id: 'thuong-luong-gia-thue',
    title: 'Làm thế nào để thương lượng giá thuê nhà tốt nhất?',
    category: 'Kinh nghiệm',
    img: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=1200',
    intro: 'Một cuộc thương lượng hiệu quả cần dựa trên thông tin thị trường, sự rõ ràng về nhu cầu và một đề nghị hợp lý cho cả người thuê lẫn chủ nhà.',
    sections: [
      ['Khảo sát trước khi đưa ra mức giá', 'Hãy so sánh các căn hộ tương đương về vị trí, diện tích, nội thất và tiện ích. Căn đã để trống lâu hoặc cần sửa chữa nhỏ thường có nhiều dư địa thương lượng hơn.'],
      ['Tạo lợi thế bằng điều kiện thuê', 'Cam kết thuê dài hạn, thanh toán đúng hạn, giữ gìn căn hộ và có hồ sơ rõ ràng là những yếu tố chủ nhà đánh giá cao. Đôi khi xin thêm nội thất hoặc miễn phí quản lý sẽ thực tế hơn giảm tiền thuê.'],
      ['Ghi nhận mọi thỏa thuận', 'Mức giá, thời gian áp dụng, tiền cọc, ngày thanh toán và các hạng mục chủ nhà đồng ý bổ sung phải được ghi trong hợp đồng hoặc phụ lục trước khi chuyển tiền.']
    ]
  }
];

const BlogPage = ({ navigate }) => {

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-[#0A2540] mb-4">Blog & Cẩm nang</h1>
          <p className="text-gray-500">Kiến thức, xu hướng và kinh nghiệm sống tại các căn hộ cao cấp Sài Gòn.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOGS.map((blog) => (
            <article key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
              <a href={pathForRoute('blog-detail', blog.id)} onClick={(event) => handleRouteLink(event, () => navigate('blog-detail', blog.id))} className="block h-full" aria-label={`Đọc bài ${blog.title}`}>
              <div className="h-48 overflow-hidden relative">
                <img src={blog.img} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-[#0A2540]">{blog.category}</div>
              </div>
              <div className="p-6">
                <p className="text-xs text-gray-400 mb-2">28 Tháng 7, 2026</p>
                <h3 className="font-bold text-lg text-[#0A2540] group-hover:text-[#FF5A5F] transition-colors mb-3 line-clamp-2">{blog.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{blog.intro}</p>
                <span className="text-[#D83A42] font-medium text-sm flex items-center">Đọc tiếp <ChevronRight size={16} /></span>
              </div>
              </a>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

const BlogDetailPage = ({ id, navigate }) => {
  const blog = BLOGS.find(item => item.id === id);
  if (!blog) return <NotFoundPage navigate={navigate} />;

  return (
    <div className="min-h-screen pt-24 bg-white pb-20">
      <article className="max-w-4xl mx-auto px-4 md:px-8">
        <button type="button" onClick={() => navigate('blog')} className="mt-6 mb-8 text-sm font-semibold text-[#FF5A5F] hover:underline">
          ← Quay lại Blog & Cẩm nang
        </button>
        <div className="text-center mb-8">
          <span className="inline-block bg-red-50 text-[#FF5A5F] px-4 py-1.5 rounded-full text-sm font-bold mb-5">{blog.category}</span>
          <h1 className="text-3xl md:text-5xl leading-tight font-bold text-[#0A2540] mb-5">{blog.title}</h1>
          <p className="text-gray-400 text-sm">28 Tháng 7, 2026 · Saigon Retreats</p>
        </div>
        <img src={blog.img} alt={blog.title} className="w-full h-[300px] md:h-[480px] object-cover rounded-3xl mb-10" />
        <div className="max-w-3xl mx-auto">
          <p className="text-xl leading-8 text-gray-600 mb-10">{blog.intro}</p>
          {blog.sections.map(([heading, content]) => (
            <section key={heading} className="mb-9">
              <h2 className="text-2xl font-bold text-[#0A2540] mb-4">{heading}</h2>
              <p className="text-gray-600 text-lg leading-8">{content}</p>
            </section>
          ))}
          <div className="mt-12 p-7 md:p-9 rounded-2xl bg-[#0A2540] text-white">
            <h2 className="text-2xl font-bold mb-3">Bạn cần tư vấn căn hộ?</h2>
            <p className="text-white/70 mb-6">Saigon Retreats sẵn sàng hỗ trợ bạn tìm căn hộ phù hợp tại TP.HCM.</p>
            <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 bg-[#FF5A5F] px-5 py-3 rounded-xl font-bold">
              <Phone size={19} /> {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </article>
    </div>
  );
};

const ContactPage = () => (
  <div className="min-h-screen pt-24 bg-white pb-20">
    <div className="container mx-auto px-4 md:px-8">
      <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto mt-8">
        <div>
          <h1 className="text-4xl font-bold text-[#0A2540] mb-6">Liên hệ với Saigon Retreats</h1>
          <p className="text-gray-600 mb-10 text-lg">Bạn đang tìm kiếm không gian sống lý tưởng hay muốn ký gửi căn hộ? Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.</p>
          
          <div className="space-y-8 mb-10">
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#0A2540] shrink-0">
                   <Phone size={24} />
                </div>
                <div>
                   <h4 className="font-bold text-[#0A2540] mb-1">Hotline / Zalo</h4>
                    <p><a href={CONTACT.phoneHref} className="text-gray-600 hover:text-[#FF5A5F]">{CONTACT.phoneDisplay}</a></p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#0A2540] shrink-0">
                   <Mail size={24} />
                </div>
                <div>
                   <h4 className="font-bold text-[#0A2540] mb-1">Email</h4>
                    <p><a href={`mailto:${CONTACT.email}`} className="text-gray-600 hover:text-[#FF5A5F]">{CONTACT.email}</a></p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#0A2540] shrink-0">
                   <MapPin size={24} />
                </div>
                <div>
                   <h4 className="font-bold text-[#0A2540] mb-1">Văn phòng chính</h4>
                    <p className="text-gray-600">{CONTACT.address}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-[#0A2540] text-white rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-2xl font-bold mb-7">Z</div>
          <h2 className="text-3xl font-bold mb-4">Trao đổi trực tiếp qua Zalo</h2>
          <p className="text-white/75 leading-7 mb-8">Nhắn cho Saigon Retreats để hỏi tình trạng căn hộ, đặt lịch xem phòng hoặc ký gửi căn hộ. Chúng tôi sẽ phản hồi trực tiếp theo số 0909 180 942.</p>
          <a href={CONTACT.zalo} target="_blank" rel="noreferrer" className="w-full py-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold flex items-center justify-center transition-colors">
            Mở Zalo 0909 180 942
          </a>
          <a href={CONTACT.phoneHref} className="w-full py-4 mt-3 rounded-xl border border-white/25 hover:bg-white/10 text-white font-semibold flex items-center justify-center gap-2 transition-colors">
            <Phone size={20} /> Gọi trực tiếp
          </a>
        </div>
      </div>
    </div>
  </div>
);

const AuthPage = ({ mode, navigate }) => {
  const isRegister = mode === 'register';
  const googleAuthEnabled = import.meta.env.VITE_GOOGLE_AUTH_ENABLED === 'true';
  const [form, setForm] = useState({ username: '', displayName: '', email: '', password: '', confirmPassword: '' });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (isRegister && form.password !== form.confirmPassword) return setStatus('Mật khẩu xác nhận chưa khớp.');
    setBusy(true); setStatus('');
    try {
      await usernameAuth({
        action: isRegister ? 'register' : 'login',
        username: form.username,
        displayName: form.displayName,
        email: form.email,
        password: form.password,
      });
      setStatus(isRegister ? 'Đăng ký thành công. Nếu được yêu cầu, vui lòng xác nhận email.' : 'Đăng nhập thành công.');
      setTimeout(() => navigate('account'), 500);
    } catch (error) {
      setStatus(error.message || 'Không thể xử lý yêu cầu.');
    } finally { setBusy(false); }
  };
  const recover = async () => {
    if (!form.username) return setStatus('Vui lòng nhập tên đăng nhập trước.');
    setBusy(true);
    try {
      await usernameAuth({ action: 'recover', username: form.username, redirectTo: `${window.location.origin}/account` });
      setStatus('Đã gửi hướng dẫn đặt lại mật khẩu đến email khôi phục.');
    } catch (error) { setStatus(error.message); }
    finally { setBusy(false); }
  };
  const googleLogin = async () => {
    if (!supabase) return setStatus('Đăng nhập chưa được cấu hình.');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/account` },
    });
    if (error) setStatus(error.message);
  };
  return (
    <div className="min-h-screen pt-28 pb-20 bg-gray-50 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border shadow-sm">
        <h1 className="text-3xl font-bold text-[#0A2540] mb-2">{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</h1>
        <p className="text-gray-500 mb-7">Lưu và quản lý những căn hộ bạn quan tâm.</p>
        {googleAuthEnabled && <>
          <button type="button" onClick={googleLogin} className="w-full py-3 rounded-xl border font-semibold mb-5 hover:bg-gray-50">Tiếp tục với Google</button>
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-5"><span className="h-px bg-gray-200 flex-1" />hoặc<span className="h-px bg-gray-200 flex-1" /></div>
        </>}
        <form onSubmit={submit} className="space-y-4">
          {isRegister && <input required value={form.displayName} onChange={e => update('displayName', e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Họ và tên" />}
          <input required value={form.username} onChange={e => update('username', e.target.value.toLowerCase())} className="w-full p-3 border rounded-xl" placeholder="Tên đăng nhập" pattern="[a-z0-9_]{3,30}" />
          {isRegister && <input required type="email" value={form.email} onChange={e => update('email', e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Email khôi phục" />}
          <input required minLength={8} type="password" value={form.password} onChange={e => update('password', e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Mật khẩu (tối thiểu 8 ký tự)" />
          {isRegister && <input required minLength={8} type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Xác nhận mật khẩu" />}
          {status && <p role="status" className="text-sm text-[#FF5A5F]">{status}</p>}
          <Button disabled={busy} type="submit" variant="accent" className="w-full py-3">{busy ? 'Đang xử lý...' : (isRegister ? 'Đăng ký' : 'Đăng nhập')}</Button>
        </form>
        {!isRegister && <button disabled={busy} onClick={recover} className="mt-4 text-sm text-gray-500 hover:text-[#FF5A5F]">Quên mật khẩu?</button>}
        <button onClick={() => navigate(isRegister ? 'login' : 'register')} className="block mt-6 text-sm font-semibold text-[#0A2540]">
          {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
        </button>
      </div>
    </div>
  );
};

const SavedPage = ({ apartments, favoriteIds, navigate, onFavorite, profile }) => {
  if (!profile) return <AuthPage mode="login" navigate={navigate} />;
  const saved = apartments.filter(item => favoriteIds.includes(String(item.id)));
  return (
    <div className="min-h-screen pt-28 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-4xl font-bold text-[#0A2540] mb-2">Căn hộ đã lưu</h1>
        <p className="text-gray-500 mb-8">{saved.length} căn hộ trong danh sách của bạn</p>
        {saved.length ? <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">{saved.map(apt => (
          <ApartmentCard key={apt.id} data={apt} onClick={id => navigate('detail', id)} isFavorite onFavorite={onFavorite} />
        ))}</div> : <div className="bg-white rounded-2xl p-12 text-center"><Heart className="mx-auto mb-4 text-gray-300" size={40} /><p>Bạn chưa lưu căn hộ nào.</p></div>}
      </div>
    </div>
  );
};

const AccountPage = ({ profile, navigate, onSignOut }) => {
  if (!profile) return <AuthPage mode="login" navigate={navigate} />;
  return (
    <div className="min-h-screen pt-28 pb-20 bg-gray-50 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border">
        <h1 className="text-3xl font-bold text-[#0A2540] mb-6">Tài khoản của tôi</h1>
        <div className="space-y-4 text-gray-600">
          <p><strong className="text-[#0A2540]">Tên:</strong> {profile.display_name}</p>
          <p><strong className="text-[#0A2540]">Tên đăng nhập:</strong> {profile.username}</p>
        </div>
        <div className="flex gap-3 mt-8">
          <Button onClick={() => navigate('saved')} className="px-5 py-3">Căn hộ đã lưu</Button>
          <Button onClick={onSignOut} variant="secondary" className="px-5 py-3">Đăng xuất</Button>
        </div>
      </div>
    </div>
  );
};

const INFO_PAGES = {
  'rental-process': {
    title: 'Quy trình thuê nhà',
    intro: 'Saigon Retreats hỗ trợ bạn từ lúc chọn căn đến khi nhận bàn giao.',
    sections: [
      ['1. Xác định nhu cầu', 'Chọn khu vực, ngân sách, loại căn hộ, ngày chuyển vào và các tiện ích cần thiết.'],
      ['2. Xem căn hộ', 'Liên hệ Zalo để xác nhận tình trạng căn và sắp xếp thời gian xem thực tế.'],
      ['3. Thỏa thuận và hợp đồng', 'Kiểm tra giá thuê, tiền cọc, thời hạn thuê, phí quản lý và điều kiện hoàn cọc trước khi ký.'],
      ['4. Bàn giao', 'Hai bên lập biên bản hiện trạng, danh sách nội thất, chỉ số điện nước và số chìa khóa được giao.'],
    ],
  },
  'expat-guide': {
    title: 'Kinh nghiệm thuê nhà cho người nước ngoài',
    intro: 'Những lưu ý cơ bản giúp người nước ngoài thuê căn hộ thuận lợi tại TP.HCM.',
    sections: [
      ['Giấy tờ và tạm trú', 'Chuẩn bị hộ chiếu, thị thực hoặc giấy tờ cư trú hợp lệ và xác nhận chủ nhà hỗ trợ khai báo tạm trú.'],
      ['Hợp đồng song ngữ', 'Nên sử dụng hợp đồng có nội dung rõ ràng về tiền thuê, tiền cọc, thời hạn báo trước và trách nhiệm sửa chữa.'],
      ['Chi phí hàng tháng', 'Hỏi rõ phí quản lý, điện, nước, internet, gửi xe và quy định sử dụng tiện ích của tòa nhà.'],
    ],
  },
  privacy: {
    title: 'Chính sách bảo mật',
    intro: 'Saigon Retreats tôn trọng quyền riêng tư và chỉ sử dụng thông tin khi cần hỗ trợ khách hàng.',
    sections: [
      ['Dữ liệu trên website', 'Khách có thể xem thông tin căn hộ mà không cần đăng ký tài khoản. Website không lưu biểu mẫu liên hệ của khách.'],
      ['Liên hệ trực tiếp', 'Khi mở Zalo, gọi điện hoặc gửi email, thông tin trao đổi được xử lý trên dịch vụ tương ứng và theo chính sách của dịch vụ đó.'],
      ['Mục đích sử dụng', 'Thông tin khách chủ động cung cấp chỉ được dùng để tư vấn căn hộ, sắp xếp lịch xem phòng hoặc hỗ trợ ký gửi.'],
      ['Quyền của bạn', 'Bạn có thể liên hệ Saigon Retreats để yêu cầu kiểm tra, cập nhật hoặc xóa thông tin đã cung cấp trong quá trình tư vấn.'],
    ],
  },
  terms: {
    title: 'Điều khoản sử dụng',
    intro: 'Khi sử dụng website, bạn đồng ý với các nguyên tắc cơ bản dưới đây.',
    sections: [
      ['Thông tin căn hộ', 'Giá, tình trạng và hình ảnh có thể thay đổi; khách cần xác nhận lại trước khi đặt cọc hoặc ký hợp đồng.'],
      ['Sử dụng website', 'Người dùng không được khai thác website cho mục đích trái pháp luật, gây gián đoạn dịch vụ hoặc sao chép nội dung khi chưa được phép.'],
      ['Giao dịch', 'Website hỗ trợ kết nối và cung cấp thông tin; mọi thỏa thuận thuê cần được thể hiện trong hợp đồng giữa các bên.'],
      ['Giới hạn trách nhiệm', 'Nội dung cẩm nang chỉ mang tính tham khảo và không thay thế tư vấn pháp lý chuyên môn.'],
    ],
  },
};

const InfoPage = ({ page }) => {
  const content = INFO_PAGES[page];
  return (
    <div className="min-h-screen pt-28 pb-20 bg-white">
      <article className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-[#0A2540] mb-5">{content.title}</h1>
        <p className="text-xl text-gray-500 leading-8 mb-10">{content.intro}</p>
        {content.sections.map(([title, text]) => <section key={title} className="mb-8"><h2 className="text-2xl font-bold text-[#0A2540] mb-3">{title}</h2><p className="text-gray-600 leading-7">{text}</p></section>)}
      </article>
    </div>
  );
};

const MAX_APARTMENT_IMAGES = 8;
const MAX_APARTMENT_IMAGE_BYTES = 8 * 1024 * 1024;
const APARTMENT_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storagePathFromImageUrl = (url) => {
  if (!url) return '';
  const marker = '/storage/v1/object/public/apartment-images/';
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return '';
  try {
    return decodeURIComponent(url.slice(markerIndex + marker.length).split('?')[0]);
  } catch {
    return url.slice(markerIndex + marker.length).split('?')[0];
  }
};

const AdminPage = ({ apartments, reloadApartments }) => {
  const [session, setSession] = useState(null);
  const [adminAllowed, setAdminAllowed] = useState(null);
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '', type: '1PN', district: 'Quận 1', price: '', area: '',
    bathrooms: '1', furnishing: 'Đầy đủ nội thất',
    description: '', amenities: ['washer'], featured: false, status: 'available'
  });
  const [imageItems, setImageItems] = useState([]);
  const [draggedImageId, setDraggedImageId] = useState(null);
  const imageItemsRef = useRef([]);

  useEffect(() => {
    imageItemsRef.current = imageItems;
  }, [imageItems]);

  useEffect(() => () => {
    imageItemsRef.current.forEach(item => {
      if (item.kind === 'new') URL.revokeObjectURL(item.url);
    });
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const updateSession = async (nextSession) => {
      setSession(nextSession);
      if (!nextSession) return setAdminAllowed(null);
      try {
        const profileData = await getMyProfile();
        setAdminAllowed(profileData?.role === 'admin');
      } catch { setAdminAllowed(false); }
    };
    supabase.auth.getSession().then(({ data }) => updateSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setTimeout(() => updateSession(nextSession), 0));
    return () => data.subscription.unsubscribe();
  }, []);

  const updateField = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const toggleAmenity = (key) => updateField(
    'amenities',
    form.amenities.includes(key) ? form.amenities.filter(item => item !== key) : [...form.amenities, key]
  );

  const login = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      if (!supabase) throw new Error('Website chưa được kết nối với kho dữ liệu Supabase.');
      const identifier = loginName.trim().toLowerCase();
      if (identifier.includes('@')) {
        const { error } = await supabase.auth.signInWithPassword({ email: identifier, password });
        if (error) throw error;
      } else {
        await usernameAuth({ action: 'login', username: identifier, password });
      }
      setPassword('');
    } catch (error) {
      setStatus(error.message || 'Không thể đăng nhập.');
    } finally {
      setBusy(false);
    }
  };

  const emptyForm = {
    title: '', type: '1PN', district: 'Quận 1', price: '', area: '',
    bathrooms: '1', furnishing: 'Đầy đủ nội thất',
    description: '', amenities: ['washer'], featured: false, status: 'available'
  };

  const resetForm = (formElement = null) => {
    setEditingId(null);
    setForm(emptyForm);
    setImageItems(current => {
      current.forEach(item => {
        if (item.kind === 'new') URL.revokeObjectURL(item.url);
      });
      return [];
    });
    setDraggedImageId(null);
    formElement?.reset();
  };

  const beginEdit = (apartment) => {
    if (apartment.isDefault) return;
    setEditingId(apartment.id);
    setForm({
      title: apartment.title,
      type: apartment.type,
      district: apartment.district,
      price: String(apartment.price),
      area: String(apartment.area),
      bathrooms: String(apartment.bathrooms || 1),
      furnishing: apartment.furnishing || 'Đầy đủ nội thất',
      description: apartment.description,
      amenities: apartment.amenities || [],
      featured: Boolean(apartment.featured),
      status: apartment.status || 'available'
    });
    setImageItems(current => {
      current.forEach(item => {
        if (item.kind === 'new') URL.revokeObjectURL(item.url);
      });
      return (apartment.images || []).map((url, index) => ({
        id: `existing-${apartment.id}-${index}-${url}`,
        kind: 'existing',
        url,
        path: apartment.image_paths?.[index] || storagePathFromImageUrl(url)
      }));
    });
    setDraggedImageId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectImages = (event) => {
    const selectedFiles = Array.from(event.target.files || []) as File[];
    event.target.value = '';
    if (!selectedFiles.length) return;
    if (imageItems.length + selectedFiles.length > MAX_APARTMENT_IMAGES) {
      return setStatus(`Mỗi căn hộ chỉ được có tối đa ${MAX_APARTMENT_IMAGES} ảnh.`);
    }
    const unsupportedFile = selectedFiles.find(file => !APARTMENT_IMAGE_TYPES.has(file.type));
    if (unsupportedFile) {
      return setStatus(`Ảnh “${unsupportedFile.name}” không đúng định dạng JPG, PNG hoặc WebP.`);
    }
    const oversizedFile = selectedFiles.find(file => file.size > MAX_APARTMENT_IMAGE_BYTES);
    if (oversizedFile) {
      return setStatus(`Ảnh “${oversizedFile.name}” vượt quá dung lượng 8 MB.`);
    }
    const newItems = selectedFiles.map(file => ({
      id: `new-${crypto.randomUUID()}`,
      kind: 'new',
      url: URL.createObjectURL(file),
      file
    }));
    setImageItems(current => [...current, ...newItems]);
    setStatus('');
  };

  const moveImage = (id, direction) => {
    setImageItems(current => {
      const index = current.findIndex(item => item.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const makeCoverImage = (id) => {
    setImageItems(current => {
      const index = current.findIndex(item => item.id === id);
      if (index <= 0) return current;
      const next = [...current];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return next;
    });
  };

  const removeImage = (id) => {
    setImageItems(current => {
      const selected = current.find(item => item.id === id);
      if (selected?.kind === 'new') URL.revokeObjectURL(selected.url);
      return current.filter(item => item.id !== id);
    });
  };

  const dropImageBefore = (targetId) => {
    if (!draggedImageId || draggedImageId === targetId) return setDraggedImageId(null);
    setImageItems(current => {
      const sourceIndex = current.findIndex(item => item.id === draggedImageId);
      const targetIndex = current.findIndex(item => item.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = [...current];
      const [selected] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, selected);
      return next;
    });
    setDraggedImageId(null);
  };

  const submitApartment = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!imageItems.length) return setStatus('Vui lòng giữ lại hoặc chọn ít nhất một hình ảnh.');
    setBusy(true);
    setStatus(editingId ? 'Đang lưu thay đổi...' : 'Đang tải ảnh và đăng căn hộ...');
    let imageData = null;
    let databaseSaved = false;
    try {
      if (!supabase || !session?.user) throw new Error('Phiên đăng nhập đã hết hạn.');
      const newImageItems = imageItems.filter(item => item.kind === 'new');
      if (newImageItems.length) {
        imageData = await uploadApartmentImages(newImageItems.map(item => item.file), session.user.id);
      }
      let uploadedImageIndex = 0;
      const orderedImages = imageItems.map(item => {
        if (item.kind === 'existing') return { url: item.url, path: item.path || storagePathFromImageUrl(item.url) };
        const resolved = {
          url: imageData.publicUrls[uploadedImageIndex],
          path: imageData.uploadedPaths[uploadedImageIndex]
        };
        uploadedImageIndex += 1;
        return resolved;
      });
      const apartmentData = {
        title: form.title.trim(),
        type: form.type,
        district: form.district.trim(),
        price: Number(form.price),
        area: Number(form.area),
        bathrooms: Number(form.bathrooms),
        furnishing: form.furnishing,
        description: form.description.trim(),
        amenities: form.amenities,
        featured: form.featured,
        status: form.status,
        updated_at: new Date().toISOString(),
        images: orderedImages.map(item => item.url),
        image_paths: orderedImages.map(item => item.path).filter(Boolean)
      };
      const query = editingId
        ? supabase.from('apartments').update(apartmentData).eq('id', editingId)
        : supabase.from('apartments').insert(apartmentData);
      const { error } = await query;
      if (error) throw error;
      databaseSaved = true;

      if (editingId) {
        const originalApartment = apartments.find(item => item.id === editingId);
        const keptPaths = new Set(orderedImages.map(item => item.path).filter(Boolean));
        const originalPaths = (originalApartment?.images || []).map((url, index) =>
          originalApartment.image_paths?.[index] || storagePathFromImageUrl(url)
        ).filter(Boolean);
        const removedPaths = originalPaths.filter(path => !keptPaths.has(path));
        if (removedPaths.length) {
          const { error: storageError } = await supabase.storage.from('apartment-images').remove(removedPaths);
          if (storageError) console.error('Không thể dọn ảnh đã xóa:', storageError);
        }
      }

      await reloadApartments();
      const wasEditing = Boolean(editingId);
      resetForm(formElement);
      setStatus(wasEditing ? 'Đã lưu thay đổi trên website chính.' : 'Đã đăng căn hộ lên website chính.');
    } catch (error) {
      if (!databaseSaved && imageData?.uploadedPaths?.length && supabase) {
        await supabase.storage.from('apartment-images').remove(imageData.uploadedPaths);
      }
      setStatus(error.message || 'Không thể lưu căn hộ.');
    } finally {
      setBusy(false);
    }
  };

  const deleteApartment = async (id) => {
    if (!window.confirm('Xóa căn hộ này khỏi website?')) return;
    setBusy(true);
    try {
      if (!supabase) throw new Error('Supabase chưa được cấu hình.');
      const apartment = apartments.find(item => item.id === id);
      const { error } = await supabase.from('apartments').delete().eq('id', id);
      if (error) throw error;
      if (apartment?.image_paths?.length) {
        await supabase.storage.from('apartment-images').remove(apartment.image_paths);
      }
      await reloadApartments();
      if (editingId === id) resetForm();
      setStatus('Đã xóa căn hộ.');
    } catch (error) {
      setStatus(error.message || 'Không thể xóa căn hộ.');
    } finally {
      setBusy(false);
    }
  };

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-white p-8 rounded-3xl border border-amber-200 shadow-xl">
          <ShieldCheck className="text-amber-600 mb-5" size={42} />
          <h1 className="text-2xl font-bold text-[#0A2540] mb-3">Trang admin đang chờ kết nối</h1>
          <p className="text-gray-600">Hãy thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào Environment Variables của Vercel, sau đó triển khai lại website.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <form onSubmit={login} className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-[#0A2540] text-white flex items-center justify-center mb-6"><ShieldCheck /></div>
          <h1 className="text-3xl font-bold text-[#0A2540] mb-2">Quản trị căn hộ</h1>
          <p className="text-gray-500 mb-8">Đăng nhập để cập nhật nội dung trên Saigon Retreats.</p>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email hoặc tên đăng nhập quản trị</label>
          <input autoFocus required type="text" autoCapitalize="none" autoCorrect="off" value={loginName} onChange={e => setLoginName(e.target.value)}
            placeholder="VD: thichbocau"
            className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-[#0A2540] mb-4" />
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu quản trị</label>
          <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-[#0A2540] mb-4" />
          {status && <p className="text-sm text-red-600 mb-4">{status}</p>}
          <Button disabled={busy} className="w-full py-3.5">
            {busy ? <LoaderCircle className="animate-spin" /> : 'Đăng nhập'}
          </Button>
          <a href="/" className="block text-center text-sm text-gray-500 hover:text-[#FF5A5F] mt-5">← Về website chính</a>
        </form>
      </div>
    );
  }

  if (adminAllowed === false) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4"><div className="max-w-md bg-white p-8 rounded-3xl border text-center"><ShieldCheck className="mx-auto mb-4 text-red-500" size={42} /><h1 className="text-2xl font-bold text-[#0A2540] mb-3">Không có quyền quản trị</h1><p className="text-gray-500 mb-6">Tài khoản này chỉ được sử dụng cho chức năng khách hàng.</p><Button onClick={() => supabase?.auth.signOut()} className="px-5 py-3">Đăng xuất</Button></div></div>;
  }

  if (adminAllowed === null) {
    return <div className="min-h-screen flex items-center justify-center"><LoaderCircle className="animate-spin text-[#FF5A5F]" size={34} /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-[#0A2540] text-white">
        <div className="container mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
          <div><p className="text-white/60 text-sm">Saigon Retreats</p><h1 className="text-2xl font-bold">Quản lý căn hộ</h1></div>
          <div className="flex gap-3">
            <a href="/" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm">Xem website</a>
            <button onClick={() => supabase?.auth.signOut()} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20" aria-label="Đăng xuất"><LogOut size={19} /></button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-8 py-10 grid xl:grid-cols-[minmax(0,1fr)_420px] gap-8 items-start">
        <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-7">
            {editingId ? <Pencil className="text-[#FF5A5F]" /> : <Plus className="text-[#FF5A5F]" />}
            <h2 className="text-2xl font-bold text-[#0A2540]">{editingId ? 'Chỉnh sửa căn hộ' : 'Đăng căn hộ mới'}</h2>
          </div>
          <form onSubmit={submitApartment} className="grid md:grid-cols-2 gap-5">
            <label className="md:col-span-2 text-sm font-semibold text-gray-700">Tên căn hộ
              <input required value={form.title} onChange={e => updateField('title', e.target.value)} className="mt-2 w-full p-3 border rounded-xl font-normal" placeholder="VD: River View Apartment Thảo Điền" />
            </label>
            <label className="text-sm font-semibold text-gray-700">Loại căn hộ
              <select value={form.type} onChange={e => updateField('type', e.target.value)} className="mt-2 w-full p-3 border rounded-xl font-normal bg-white">
                {['Studio','1PN','2PN','3PN','Duplex','Penthouse'].map(item => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700">Khu vực
              <select required value={form.district} onChange={e => updateField('district', e.target.value)} className="mt-2 w-full p-3 border rounded-xl font-normal bg-white">
                {DISTRICTS.map(district => <option key={district} value={district}>{district}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700">Giá thuê / tháng (VNĐ)
              <input required min="0" type="number" value={form.price} onChange={e => updateField('price', e.target.value)} className="mt-2 w-full p-3 border rounded-xl font-normal" placeholder="25000000" />
            </label>
            <label className="text-sm font-semibold text-gray-700">Diện tích (m²)
              <input required min="1" type="number" value={form.area} onChange={e => updateField('area', e.target.value)} className="mt-2 w-full p-3 border rounded-xl font-normal" placeholder="85" />
            </label>
            <label className="text-sm font-semibold text-gray-700">Số nhà vệ sinh
              <input required min="1" max="20" type="number" value={form.bathrooms} onChange={e => updateField('bathrooms', e.target.value)} className="mt-2 w-full p-3 border rounded-xl font-normal" placeholder="1" />
            </label>
            <label className="text-sm font-semibold text-gray-700">Tình trạng nội thất
              <select required value={form.furnishing} onChange={e => updateField('furnishing', e.target.value)} className="mt-2 w-full p-3 border rounded-xl font-normal bg-white">
                <option value="Đầy đủ nội thất">Đầy đủ nội thất</option>
                <option value="Nội thất cơ bản">Nội thất cơ bản</option>
                <option value="Không nội thất">Không nội thất</option>
              </select>
            </label>
            <label className="md:col-span-2 text-sm font-semibold text-gray-700">Trạng thái
              <select value={form.status} onChange={e => updateField('status', e.target.value)} className="mt-2 w-full p-3 border rounded-xl font-normal bg-white">
                <option value="available">Còn trống</option>
                <option value="reserved">Đang giữ chỗ</option>
                <option value="rented">Đã cho thuê</option>
                <option value="hidden">Ẩn khỏi website</option>
              </select>
            </label>
            <label className="md:col-span-2 text-sm font-semibold text-gray-700">Mô tả
              <textarea required rows={5} value={form.description} onChange={e => updateField('description', e.target.value)} className="mt-2 w-full p-3 border rounded-xl font-normal resize-y" />
            </label>
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-semibold text-gray-700 mb-3">Tiện ích</legend>
              <div className="flex flex-wrap gap-2">
                {Object.entries(AMENITIES).map(([key, item]) => (
                  <button key={key} type="button" onClick={() => toggleAmenity(key)}
                    className={`px-3 py-2 rounded-xl text-sm border ${form.amenities.includes(key) ? 'bg-[#0A2540] text-white border-[#0A2540]' : 'bg-white text-gray-600 border-gray-200'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="md:col-span-2 border-2 border-dashed border-slate-300 rounded-2xl p-7 text-center cursor-pointer hover:border-[#FF5A5F] transition-colors">
              <ImagePlus className="mx-auto mb-3 text-[#FF5A5F]" />
              <span className="font-semibold text-[#0A2540]">Thêm hình ảnh căn hộ</span>
              <span className="block text-sm text-gray-500 mt-1">Tối đa 8 ảnh, JPG/PNG/WebP, mỗi ảnh dưới 8 MB</span>
              <input multiple accept="image/jpeg,image/png,image/webp" type="file" onChange={selectImages} className="sr-only" />
              <span className="block text-sm font-semibold text-green-700 mt-3">
                {imageItems.length ? `Đang có ${imageItems.length}/${MAX_APARTMENT_IMAGES} ảnh` : 'Chưa có ảnh nào'}
              </span>
            </label>
            {imageItems.length > 0 && (
              <section className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5" aria-labelledby="apartment-image-order-title">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
                  <div>
                    <h3 id="apartment-image-order-title" className="font-bold text-[#0A2540]">Thứ tự hiển thị ảnh</h3>
                    <p className="text-sm text-slate-500 mt-1">Kéo thả ảnh hoặc dùng nút mũi tên. Ảnh số 1 là ảnh đại diện.</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{imageItems.length}/{MAX_APARTMENT_IMAGES} ảnh</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {imageItems.map((item, index) => (
                    <article
                      key={item.id}
                      draggable={!busy}
                      onDragStart={() => setDraggedImageId(item.id)}
                      onDragEnd={() => setDraggedImageId(null)}
                      onDragOver={event => event.preventDefault()}
                      onDrop={() => dropImageBefore(item.id)}
                      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${draggedImageId === item.id ? 'opacity-50 border-[#FF5A5F]' : 'border-slate-200'}`}
                    >
                      <div className="relative aspect-[4/3] bg-slate-100 p-1">
                        <img
                          src={item.kind === 'new' ? item.url : optimizedImageUrl(item.url, 900)}
                          onError={event => item.kind === 'existing' && restoreOriginalImage(event, item.url)}
                          referrerPolicy="no-referrer"
                          alt={`Ảnh căn hộ số ${index + 1}`}
                          className="h-full w-full rounded-xl object-contain"
                        />
                        <div className="absolute left-2 top-2 flex items-center gap-2">
                          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#0A2540] px-2 text-sm font-bold text-white shadow">{index + 1}</span>
                          {index === 0 && <span className="rounded-full bg-[#D83A42] px-2.5 py-1.5 text-xs font-bold text-white shadow">Ảnh đại diện</span>}
                        </div>
                        <span className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow" aria-hidden="true"><GripVertical size={17} /></span>
                      </div>
                      <div className="p-3">
                        {index > 0 && (
                          <button type="button" disabled={busy} onClick={() => makeCoverImage(item.id)} className="mb-3 w-full rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-[#0A2540] hover:bg-slate-200 disabled:opacity-50">
                            Đặt làm ảnh đại diện
                          </button>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                          <button type="button" disabled={busy || index === 0} onClick={() => moveImage(item.id, -1)} className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30" aria-label={`Đưa ảnh ${index + 1} sang trước`}><ChevronLeft size={18} /></button>
                          <button type="button" disabled={busy || index === imageItems.length - 1} onClick={() => moveImage(item.id, 1)} className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30" aria-label={`Đưa ảnh ${index + 1} sang sau`}><ChevronRight size={18} /></button>
                          <button type="button" disabled={busy} onClick={() => removeImage(item.id)} className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50" aria-label={`Xóa ảnh ${index + 1}`}><Trash2 size={18} /></button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
            <label className="md:col-span-2 flex items-center gap-3 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={form.featured} onChange={e => updateField('featured', e.target.checked)} className="w-5 h-5 accent-[#FF5A5F]" />
              Hiển thị ở mục căn hộ nổi bật
            </label>
            {status && <p className={`md:col-span-2 text-sm ${status.startsWith('Đã') ? 'text-green-700' : 'text-gray-600'}`}>{status}</p>}
            <Button disabled={busy} variant="accent" className="md:col-span-2 py-4 gap-2">
              {busy ? <LoaderCircle className="animate-spin" /> : editingId ? <><Save size={19} /> Lưu thay đổi</> : <><Upload size={19} /> Đăng căn hộ lên website</>}
            </Button>
            {editingId && (
              <button type="button" onClick={() => resetForm()} className="md:col-span-2 py-3 rounded-xl border border-slate-300 text-slate-600">
                Hủy chỉnh sửa
              </button>
            )}
          </form>
        </section>
        <aside className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5"><h2 className="text-xl font-bold text-[#0A2540]">Đang hiển thị</h2><span className="text-sm bg-slate-100 px-3 py-1 rounded-full">{apartments.length} căn</span></div>
          <div className="space-y-3 max-h-[720px] overflow-auto pr-1">
            {apartments.map(apt => (
              <div key={apt.id} className="flex gap-3 p-3 rounded-2xl border border-slate-100">
                <img src={apt.images[0]} alt="" className="w-20 h-20 rounded-xl object-cover bg-slate-100" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-[#0A2540] line-clamp-2">{apt.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{apt.district} · {formatPrice(apt.price)}</p>
                </div>
                {!apt.isDefault && (
                  <div className="flex flex-col gap-1">
                    <button disabled={busy} onClick={() => beginEdit(apt)} className="p-2 text-gray-400 hover:text-blue-600" aria-label="Sửa căn hộ"><Pencil size={17} /></button>
                    <button disabled={busy} onClick={() => deleteApartment(apt.id)} className="p-2 text-gray-400 hover:text-red-600" aria-label="Xóa căn hộ"><Trash2 size={17} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

const readLocation = () => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const query = new URLSearchParams(window.location.search);
  const readPriceValue = (key) => {
    const value = query.get(key);
    const number = Number(value);
    return value !== null && value !== '' && Number.isFinite(number) && number >= 0 ? String(number) : '';
  };
  const requestedPriceRange = query.get('price') || '';
  const listingFilters = {
    district: query.get('district') || '',
    type: query.get('type') || '',
    priceRange: PRICE_RANGES[requestedPriceRange] ? requestedPriceRange : '',
    minPrice: readPriceValue('minPrice'),
    maxPrice: readPriceValue('maxPrice'),
    amenities: query.getAll('amenity').filter(key => AMENITIES[key]),
  };
  const requestedSort = query.get('sort') || 'recommended';
  const listingSort = ['recommended', 'price-asc', 'price-desc', 'newest'].includes(requestedSort) ? requestedSort : 'recommended';
  const base = { id: null, filters: { district: '', type: '', priceRange: '', minPrice: '', maxPrice: '', amenities: [] }, sort: 'recommended' };
  if (path === '/') return { ...base, route: 'home' };
  if (path === '/apartments') return { ...base, route: 'listings', filters: listingFilters, sort: listingSort };
  if (path.startsWith('/apartments/')) return { ...base, route: 'detail', id: decodeURIComponent(path.split('/')[2]) };
  if (path === '/blog') return { ...base, route: 'blog' };
  if (path.startsWith('/blog/')) return { ...base, route: 'blog-detail', id: decodeURIComponent(path.split('/')[2]) };
  const routes = {
    '/about': 'about', '/contact': 'contact', '/admin': 'admin',
    '/rental-process': 'rental-process', '/expat-guide': 'expat-guide',
    '/privacy': 'privacy', '/terms': 'terms',
  };
  return { ...base, route: routes[path] || 'not-found' };
};

const pathForRoute = (route, id) => {
  if (route === 'home') return '/';
  if (route === 'listings') {
    const state = typeof id === 'string'
      ? { filters: { district: id, type: '', priceRange: '', minPrice: '', maxPrice: '', amenities: [] }, sort: 'recommended' }
      : (id || { filters: { district: '', type: '', priceRange: '', minPrice: '', maxPrice: '', amenities: [] }, sort: 'recommended' });
    const filters = state.filters || state;
    const query = new URLSearchParams();
    if (filters.district) query.set('district', filters.district);
    if (filters.type) query.set('type', filters.type);
    if (filters.priceRange) query.set('price', filters.priceRange);
    if (filters.minPrice !== '' && filters.minPrice !== undefined) query.set('minPrice', filters.minPrice);
    if (filters.maxPrice !== '' && filters.maxPrice !== undefined) query.set('maxPrice', filters.maxPrice);
    (filters.amenities || []).forEach(amenity => query.append('amenity', amenity));
    if (state.sort && state.sort !== 'recommended') query.set('sort', state.sort);
    const search = query.toString();
    return `/apartments${search ? `?${search}` : ''}`;
  }
  if (route === 'detail') return `/apartments/${encodeURIComponent(id)}`;
  if (route === 'blog') return '/blog';
  if (route === 'blog-detail') return `/blog/${encodeURIComponent(id)}`;
  const paths = {
    about: '/about', contact: '/contact', admin: '/admin',
    'rental-process': '/rental-process', 'expat-guide': '/expat-guide',
    privacy: '/privacy', terms: '/terms',
  };
  return paths[route] || '/';
};

const NotFoundPage = ({ navigate }) => (
  <div className="min-h-screen pt-32 text-center px-4">
    <h1 className="text-5xl font-bold text-[#0A2540] mb-4">Không tìm thấy trang</h1>
    <p className="text-gray-500 mb-8">Đường dẫn này không tồn tại hoặc đã được thay đổi.</p>
    <Button onClick={() => navigate('home')} className="px-6 py-3">Về trang chủ</Button>
  </div>
);

const STATIC_META = {
  home: ['Saigon Retreats', 'Khám phá căn hộ cho thuê tại TP.HCM với hình ảnh thực tế, thông tin rõ ràng và hỗ trợ trực tiếp qua Zalo.'],
  listings: ['Căn hộ cho thuê tại TP.HCM', 'Xem danh sách căn hộ cho thuê theo khu vực, loại phòng, mức giá và tiện ích tại Saigon Retreats.'],
  about: ['Về Saigon Retreats', 'Tìm hiểu cách Saigon Retreats tuyển chọn và giới thiệu căn hộ cho thuê tại TP.HCM.'],
  blog: ['Blog & Cẩm nang thuê căn hộ', 'Kinh nghiệm thuê căn hộ, sinh sống và làm thủ tục tại TP.HCM.'],
  contact: ['Liên hệ Saigon Retreats', 'Liên hệ Saigon Retreats qua Zalo hoặc điện thoại để hỏi căn hộ và đặt lịch xem phòng.'],
  'rental-process': ['Quy trình thuê nhà', 'Các bước chọn căn, xem phòng, ký hợp đồng và nhận bàn giao căn hộ.'],
  'expat-guide': ['Kinh nghiệm thuê nhà cho người nước ngoài', 'Những lưu ý về hợp đồng, chi phí và tạm trú dành cho người nước ngoài thuê nhà tại TP.HCM.'],
  privacy: ['Chính sách bảo mật', 'Chính sách sử dụng và bảo vệ thông tin khách hàng của Saigon Retreats.'],
  terms: ['Điều khoản sử dụng', 'Điều khoản sử dụng website và thông tin căn hộ tại Saigon Retreats.'],
  'not-found': ['Không tìm thấy trang', 'Đường dẫn không tồn tại hoặc đã được thay đổi.'],
};

const setMetaContent = (selector, attributes, content) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement(attributes.tag || 'meta');
    Object.entries(attributes).forEach(([key, value]) => { if (key !== 'tag') element.setAttribute(key, value); });
    document.head.appendChild(element);
  }
  if (element.tagName === 'LINK') element.setAttribute('href', content);
  else element.setAttribute('content', content);
};

export default function App() {
  const initialLocation = readLocation();
  const [currentRoute, setCurrentRoute] = useState(initialLocation.route);
  const [selectedId, setSelectedId] = useState(initialLocation.id);
  const [listingFilters, setListingFilters] = useState(initialLocation.filters);
  const [listingSort, setListingSort] = useState(initialLocation.sort);
  const [apartments, setApartments] = useState([]);
  const [apartmentsLoading, setApartmentsLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState('');

  const reloadApartments = async () => {
    setApartmentsLoading(true);
    try {
      const data = await listApartments();
      setApartments(data);
      setDataStatus('');
    } catch {
      setApartments([]);
      setDataStatus('Không thể tải danh sách căn hộ. Vui lòng thử tải lại trang hoặc liên hệ Zalo.');
    } finally { setApartmentsLoading(false); }
  };

  useEffect(() => { reloadApartments(); }, []);
  useEffect(() => {
    const apartment = currentRoute === 'detail' ? apartments.find(item => String(item.id) === String(selectedId)) : null;
    const blog = currentRoute === 'blog-detail' ? BLOGS.find(item => item.id === selectedId) : null;
    const fallback = STATIC_META[currentRoute] || STATIC_META['not-found'];
    const title = apartment?.title || blog?.title || fallback[0];
    const description = (apartment?.description || blog?.intro || fallback[1]).slice(0, 160);
    const pageTitle = currentRoute === 'home' ? title : `${title} | Saigon Retreats`;
    const primaryOrigin = 'https://saigonretreats.web.app';
    const pageUrl = `${primaryOrigin}${window.location.pathname}`;
    const shareUrl = `${primaryOrigin}${window.location.pathname}${window.location.search}`;
    const image = apartment?.images?.[0] || blog?.img || `${primaryOrigin}/og.jpg`;
    const noIndex = currentRoute === 'not-found' || (currentRoute === 'detail' && !apartmentsLoading && !apartment) || (currentRoute === 'blog-detail' && !blog);

    document.title = pageTitle;
    setMetaContent('meta[name="description"]', { name: 'description' }, description);
    setMetaContent('meta[name="robots"]', { name: 'robots' }, noIndex ? 'noindex, nofollow' : 'index, follow');
    setMetaContent('link[rel="canonical"]', { tag: 'link', rel: 'canonical' }, pageUrl);
    setMetaContent('meta[property="og:title"]', { property: 'og:title' }, pageTitle);
    setMetaContent('meta[property="og:description"]', { property: 'og:description' }, description);
    setMetaContent('meta[property="og:type"]', { property: 'og:type' }, blog ? 'article' : 'website');
    setMetaContent('meta[property="og:url"]', { property: 'og:url' }, shareUrl);
    setMetaContent('meta[property="og:image"]', { property: 'og:image' }, image);
    setMetaContent('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
    setMetaContent('meta[name="twitter:title"]', { name: 'twitter:title' }, pageTitle);
    setMetaContent('meta[name="twitter:description"]', { name: 'twitter:description' }, description);
    setMetaContent('meta[name="twitter:image"]', { name: 'twitter:image' }, image);

    const existingStructuredData = document.getElementById('dynamic-structured-data');
    existingStructuredData?.remove();
    const structuredData = apartment ? {
      '@context': 'https://schema.org',
      '@type': 'Apartment',
      name: apartment.title,
      description,
      image: apartment.images || [],
      floorSize: { '@type': 'QuantitativeValue', value: apartment.area, unitCode: 'MTK' },
      address: { '@type': 'PostalAddress', addressLocality: apartment.district, addressRegion: 'TP.HCM', addressCountry: 'VN' },
      offers: { '@type': 'Offer', price: apartment.price, priceCurrency: 'VND', availability: 'https://schema.org/InStock', url: shareUrl },
    } : blog ? {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.title,
      description,
      image: blog.img,
      datePublished: '2026-07-28',
      author: { '@type': 'Organization', name: 'Saigon Retreats' },
      mainEntityOfPage: shareUrl,
    } : null;
    if (structuredData) {
      const script = document.createElement('script');
      script.id = 'dynamic-structured-data';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [currentRoute, selectedId, apartments, apartmentsLoading]);
  useEffect(() => {
    const onPopState = () => {
      const location = readLocation();
      setCurrentRoute(location.route);
      setSelectedId(location.id);
      if (location.route === 'listings') {
        setListingFilters(location.filters);
        setListingSort(location.sort);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useScrollToTop(currentRoute);
  useScrollToTop(selectedId);

  const navigate = (route, id = null) => {
    window.history.pushState({}, '', pathForRoute(route, id));
    setCurrentRoute(route);
    if (route === 'listings') {
      const nextLocation = readLocation();
      setListingFilters(nextLocation.filters);
      setListingSort(nextLocation.sort);
    }
    if (id && route !== 'listings') setSelectedId(id);
  };

  const renderContent = () => {
    switch (currentRoute) {
      case 'home': return <HomePage navigate={navigate} apartments={apartments} loading={apartmentsLoading} />;
      case 'listings': return <ListingsPage navigate={navigate} apartments={apartments} loading={apartmentsLoading} initialFilters={listingFilters} initialSort={listingSort} onStateChange={(nextFilters, nextSort) => {
        setListingFilters(nextFilters);
        setListingSort(nextSort);
        if (currentRoute === 'listings') {
          const nextPath = pathForRoute('listings', { filters: nextFilters, sort: nextSort });
          if (`${window.location.pathname}${window.location.search}` !== nextPath) window.history.replaceState({}, '', nextPath);
        }
      }} />;
      case 'detail': return <DetailPage id={selectedId} navigate={navigate} apartments={apartments} loading={apartmentsLoading} />;
      case 'about': return <AboutPage />;
      case 'blog': return <BlogPage navigate={navigate} />;
      case 'blog-detail': return <BlogDetailPage id={selectedId} navigate={navigate} />;
      case 'contact': return <ContactPage />;
      case 'rental-process':
      case 'expat-guide':
      case 'privacy':
      case 'terms': return <InfoPage page={currentRoute} />;
      case 'admin': return <AdminPage apartments={apartments} reloadApartments={reloadApartments} />;
      default: return <NotFoundPage navigate={navigate} />;
    }
  };

  return (
    <div className="font-sans text-gray-900 selection:bg-[#FF5A5F] selection:text-white flex flex-col min-h-screen">
      {currentRoute !== 'admin' && <Header currentRoute={currentRoute} navigate={navigate} />}
      
      <main className="flex-grow">
        {dataStatus && <div role="alert" className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-amber-50 text-amber-900 px-4 py-2 rounded-xl shadow text-sm">{dataStatus}</div>}
        {renderContent()}
      </main>

      {currentRoute !== 'admin' && <Footer navigate={navigate} />}
      {currentRoute !== 'admin' && <FloatingContact />}

      {/* Global Styles for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        /* Tối ưu scrollbar cho đẹp */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
