import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, MapPin, Home, DollarSign, Maximize, BedDouble, Bath, 
  Wifi, Coffee, Dumbbell, PawPrint, Waves, Wind, ChevronRight, 
  Menu, X, Phone, Mail, CheckCircle2, Star, Clock, 
  ArrowRight, ShieldCheck, Heart, Share, PlayCircle,
  Facebook, Instagram, Twitter, Map, Navigation, Upload, Trash2,
  LogOut, Plus, LoaderCircle, Pencil, Save, Building2, TrainFront
} from 'lucide-react';
import { hasSupabaseConfig, listApartments, supabase, uploadApartmentImages } from './src/lib/supabase';

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

const DEFAULT_APARTMENTS = [
  {
    id: 1,
    title: 'The Cloud Oasis - Thảo Điền River View',
    type: '2PN',
    district: 'Quận 2',
    price: 25000000,
    area: 85,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1502672260266-1c1de2d93688?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800'
    ],
    amenities: ['balcony', 'pool', 'gym', 'pet', 'washer'],
    description: 'Trải nghiệm cuộc sống như một kỳ nghỉ dưỡng tại The Cloud Oasis. Căn hộ 2 phòng ngủ ngập tràn ánh sáng tự nhiên với ban công rộng nhìn toàn cảnh sông Sài Gòn. Nội thất được thiết kế đo ni đóng giày mang phong cách Wabi-Sabi tĩnh lặng, là chốn về hoàn hảo sau một ngày làm việc căng thẳng tại trung tâm.',
    featured: true,
    views: 1204
  },
  {
    id: 2,
    title: 'Urban Minimalist Studio Q1',
    type: 'Studio',
    district: 'Quận 1',
    price: 12000000,
    area: 35,
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800'
    ],
    amenities: ['washer', 'gym'],
    description: 'Nằm ngay lõi trung tâm Quận 1, bước chân xuống phố là hàng ngàn tiện ích. Căn studio được thiết kế thông minh, tối ưu không gian sống cho giới trẻ năng động hoặc Expat.',
    featured: false,
    views: 850
  },
  {
    id: 3,
    title: 'Sky Penthouse Landmark 81',
    type: 'Penthouse',
    district: 'Bình Thạnh',
    price: 120000000,
    area: 250,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'
    ],
    amenities: ['balcony', 'bathtub', 'pool', 'gym', 'washer'],
    description: 'Đẳng cấp thượng lưu trên đỉnh thành phố. View 360 độ ngắm toàn cảnh Sài Gòn phồn hoa. Hệ thống smarthome toàn diện và tiện ích 5 sao đặc quyền.',
    featured: true,
    views: 3200
  },
  {
    id: 4,
    title: 'Cozy Vintage Duplex Quận 3',
    type: 'Duplex',
    district: 'Quận 3',
    price: 18000000,
    area: 65,
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800'
    ],
    amenities: ['balcony', 'pet', 'washer'],
    description: 'Một nốt trầm xao xuyến giữa phố thị. Nằm trong con hẻm yên tĩnh rợp bóng cây xanh tại Quận 3. Thiết kế Duplex mộc mạc với gạch trần và ánh sáng vàng ấm áp.',
    featured: false,
    views: 640
  },
  {
    id: 5,
    title: 'Phu My Hung Green View 1BR',
    type: '1PN',
    district: 'Quận 7',
    price: 14000000,
    area: 50,
    images: [
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1499916078039-922301b0eb9b?auto=format&fit=crop&q=80&w=800'
    ],
    amenities: ['pool', 'gym', 'washer', 'balcony'],
    description: 'Sống chuẩn Hàn Quốc tại khu Nam Sài Gòn. Căn hộ 1PN thiết kế tinh gọn, view trực diện công viên nội khu xanh mát, an ninh 24/7.',
    featured: false,
    views: 520
  },
  {
    id: 6,
    title: 'The Botanica Serenity',
    type: '2PN',
    district: 'Tân Bình',
    price: 16000000,
    area: 72,
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'
    ],
    amenities: ['pool', 'gym', 'balcony'],
    description: 'Kề sát sân bay Tân Sơn Nhất và công viên Gia Định. Môi trường sống trong lành, thuận tiện di chuyển, lý tưởng cho phi hành đoàn và doanh nhân thường xuyên công tác.',
    featured: true,
    views: 950
  },
  { id: 7, title: 'Riverside Charm 1PN', type: '1PN', district: 'Quận 4', price: 15500000, area: 55, images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200'], amenities: ['balcony', 'pool', 'gym', 'washer'], description: 'View rạch Bến Nghé thơ mộng, chỉ 3 phút qua Quận 1.', featured: false, views: 400 },
  { id: 8, title: 'Thao Dien Art Studio', type: 'Studio', district: 'Quận 2', price: 11000000, area: 40, images: ['https://images.unsplash.com/photo-1541123437800-1c0c05a12972?auto=format&fit=crop&q=80&w=1200'], amenities: ['pet', 'washer'], description: 'Studio mang hơi hướng nghệ thuật đương đại, phù hợp freelancer.', featured: false, views: 350 },
  { id: 9, title: 'Masteri Thao Dien Family Home', type: '3PN', district: 'Quận 2', price: 32000000, area: 105, images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'], amenities: ['balcony', 'bathtub', 'pool', 'gym', 'washer'], description: 'Căn góc 3 phòng ngủ thoáng mát, kề cận Mega Mall và ga Metro.', featured: true, views: 1100 },
  { id: 10, title: 'Bitexco View Minimal', type: '1PN', district: 'Quận 1', price: 17000000, area: 48, images: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=1200'], amenities: ['gym', 'washer'], description: 'Tầm nhìn triệu đô về tòa tháp biểu tượng, thiết kế tối giản sang trọng.', featured: false, views: 780 },
  { id: 11, title: 'Sunrise City Premium 2BR', type: '2PN', district: 'Quận 7', price: 19000000, area: 76, images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1200'], amenities: ['pool', 'gym', 'balcony', 'washer'], description: 'Khu dân cư cao cấp mặt tiền Nguyễn Hữu Thọ, tiện ích chuẩn 5 sao.', featured: false, views: 500 },
  { id: 12, title: 'Estella Heights Resort Style', type: '2PN', district: 'Quận 2', price: 28000000, area: 89, images: ['https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1200'], amenities: ['balcony', 'bathtub', 'pool', 'gym', 'washer'], description: 'Resort giữa lòng thành phố với hệ thống hồ bơi lười tuyệt đẹp.', featured: true, views: 1500 },
  { id: 13, title: 'Vinhomes Central Park Modern', type: '1PN', district: 'Bình Thạnh', price: 16500000, area: 54, images: ['https://images.unsplash.com/photo-1502672260266-1c1de2d93688?auto=format&fit=crop&q=80&w=1200'], amenities: ['pool', 'gym', 'balcony', 'washer'], description: 'Thừa hưởng trọn vẹn công viên ven sông 14ha và tiện ích nội khu đẳng cấp.', featured: false, views: 890 },
  { id: 14, title: 'Saigon Pearl Classic 3BR', type: '3PN', district: 'Bình Thạnh', price: 35000000, area: 120, images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=1200'], amenities: ['balcony', 'bathtub', 'pool', 'gym', 'washer'], description: 'Thiết kế bán cổ điển sang trọng, môi trường sống tinh hoa bên sông.', featured: false, views: 420 },
  { id: 15, title: 'Tresor Rivergate 2BR', type: '2PN', district: 'Quận 4', price: 22000000, area: 75, images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200'], amenities: ['pool', 'gym', 'balcony', 'washer'], description: 'Vị trí đắc địa mặt tiền Bến Vân Đồn, sầm uất và nhộn nhịp.', featured: false, views: 600 },
  { id: 16, title: 'Lexington Residence Studio', type: 'Studio', district: 'Quận 2', price: 12500000, area: 48, images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200'], amenities: ['pool', 'gym', 'washer'], description: 'Studio rộng rãi, thiết kế thông minh, khu dân cư sầm uất.', featured: false, views: 380 },
  { id: 17, title: 'Gateway Thao Dien Duplex', type: 'Duplex', district: 'Quận 2', price: 45000000, area: 140, images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'], amenities: ['balcony', 'bathtub', 'pool', 'gym', 'pet', 'washer'], description: 'Không gian sống xa hoa với tầm nhìn panorama mãn nhãn.', featured: true, views: 2100 },
  { id: 18, title: 'City Garden Ellipse 2BR', type: '2PN', district: 'Bình Thạnh', price: 27000000, area: 104, images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'], amenities: ['balcony', 'bathtub', 'pool', 'gym', 'washer'], description: 'Thiết kế lượn sóng độc đáo, ban công vòng cung siêu rộng ấn tượng.', featured: true, views: 1800 },
  { id: 19, title: 'Happy Valley Peaceful 2BR', type: '2PN', district: 'Quận 7', price: 20000000, area: 82, images: ['https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&q=80&w=1200'], amenities: ['pool', 'gym', 'balcony', 'pet', 'washer'], description: 'Mật độ xanh cao, kề cận dòng sông hiền hòa và các trường quốc tế.', featured: false, views: 450 },
  { id: 20, title: 'Millennium Masteri 1BR', type: '1PN', district: 'Quận 4', price: 18500000, area: 53, images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200'], amenities: ['pool', 'gym', 'balcony', 'washer'], description: 'Biểu tượng mới của Quận 4, chất lượng hoàn thiện tuyệt hảo.', featured: false, views: 550 },
];

const useScrollToTop = (route) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);
};

const formatPrice = (price) => {
  return (price / 1000000).toLocaleString('vi-VN') + ' Triệu';
};

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl";
  const variants = {
    primary: "bg-[#0A2540] text-white hover:bg-[#0A2540]/90 shadow-md hover:shadow-xl",
    secondary: "bg-white text-[#0A2540] border border-gray-200 hover:border-[#0A2540] hover:bg-gray-50",
    accent: "bg-[#FF5A5F] text-white hover:bg-[#FF5A5F]/90 shadow-md hover:shadow-xl hover:scale-[1.02]",
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
    <div 
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 cursor-pointer flex flex-col h-full"
      onClick={() => onClick(data.id)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={data.images[0]} 
          alt={data.title} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-[#0A2540]">
          {data.type}
        </div>
        <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-[#FF5A5F] transition-colors">
          <Heart size={18} />
        </button>
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
          <Button variant="secondary" className="px-4 py-2 text-sm rounded-lg">
            Chi tiết
          </Button>
        </div>
      </div>
    </div>
  );
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

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('home')}
        >
          <div className="w-8 h-8 bg-[#FF5A5F] rounded-lg flex items-center justify-center transform rotate-3">
            <Home className="text-white" size={20} />
          </div>
          <span className={`text-xl font-bold tracking-tight ${isScrolled || currentRoute !== 'home' ? 'text-[#0A2540]' : 'text-white'}`}>
            Saigon<span className="text-[#FF5A5F]">Retreats</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => navigate(link.route)}
              className={`text-sm font-medium transition-colors hover:text-[#FF5A5F] ${
                currentRoute === link.route 
                  ? 'text-[#FF5A5F]' 
                  : (isScrolled || currentRoute !== 'home' ? 'text-gray-600' : 'text-white/90')
              }`}
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Button 
            variant={isScrolled || currentRoute !== 'home' ? 'primary' : 'secondary'} 
            className="hidden md:flex px-5 py-2.5 text-sm"
            onClick={() => navigate('contact')}
          >
            Ký gửi căn hộ
          </Button>
          
          <button 
            className={`md:hidden p-2 ${isScrolled || currentRoute !== 'home' ? 'text-gray-900' : 'text-white'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-xl py-4 flex flex-col md:hidden border-t border-gray-100">
          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => { navigate(link.route); setMobileMenuOpen(false); }}
              className={`py-3 px-6 text-left font-medium ${currentRoute === link.route ? 'text-[#FF5A5F] bg-gray-50' : 'text-gray-800'}`}
            >
              {link.name}
            </button>
          ))}
          <div className="px-6 pt-4 mt-2 border-t border-gray-100">
             <Button variant="primary" className="w-full py-3" onClick={() => { navigate('contact'); setMobileMenuOpen(false); }}>
              Ký gửi căn hộ
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

const Footer = () => (
  <footer className="bg-[#0A2540] text-gray-300 pt-20 pb-10">
    <div className="container mx-auto px-4 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#FF5A5F] rounded-lg flex items-center justify-center transform rotate-3">
              <Home className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Saigon<span className="text-[#FF5A5F]">Retreats</span>
            </span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            Chúng tôi định hình lại cách bạn tìm kiếm và trải nghiệm không gian sống tại TP.HCM. Cung cấp căn hộ cao cấp cho Expat, chuyên gia và người trẻ hiện đại.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF5A5F] hover:text-white transition-all"><Facebook size={18} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF5A5F] hover:text-white transition-all"><Instagram size={18} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF5A5F] hover:text-white transition-all"><Twitter size={18} /></a>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-6">Khám phá</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="hover:text-[#FF5A5F] transition-colors">Căn hộ Quận 1</a></li>
            <li><a href="#" className="hover:text-[#FF5A5F] transition-colors">Căn hộ Quận 2 (Thảo Điền)</a></li>
            <li><a href="#" className="hover:text-[#FF5A5F] transition-colors">Căn hộ Quận 3</a></li>
            <li><a href="#" className="hover:text-[#FF5A5F] transition-colors">Căn hộ Quận 7 (Phú Mỹ Hưng)</a></li>
            <li><a href="#" className="hover:text-[#FF5A5F] transition-colors">Căn hộ Bình Thạnh</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Thông tin</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="hover:text-[#FF5A5F] transition-colors">Về chúng tôi</a></li>
            <li><a href="#" className="hover:text-[#FF5A5F] transition-colors">Quy trình thuê nhà</a></li>
            <li><a href="#" className="hover:text-[#FF5A5F] transition-colors">Kinh nghiệm cho Expat</a></li>
            <li><a href="#" className="hover:text-[#FF5A5F] transition-colors">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:text-[#FF5A5F] transition-colors">Điều khoản sử dụng</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Liên hệ</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-[#FF5A5F] shrink-0 mt-0.5" />
              <span>Tầng 12, Tòa nhà Bitexco, Số 2 Hải Triều, Q.1, TP.HCM</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-[#FF5A5F] shrink-0" />
              <span>+84 90 123 4567</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-[#FF5A5F] shrink-0" />
              <span>hello@saigonretreats.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
        <p>&copy; 2026 Saigon Retreats. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Designed with ❤️ for a better living experience.</p>
      </div>
    </div>
  </footer>
);

const FloatingContact = () => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
    <button className="w-14 h-14 bg-blue-500 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform group relative">
      <span className="font-bold text-xl">Z</span>
      <span className="absolute right-full mr-4 bg-white text-gray-800 text-sm py-1.5 px-3 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Chat Zalo</span>
    </button>
    <button className="w-14 h-14 bg-[#FF5A5F] rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform group relative">
      <Phone size={24} />
      <span className="absolute right-full mr-4 bg-white text-gray-800 text-sm py-1.5 px-3 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Gọi ngay</span>
    </button>
  </div>
);

const HomePage = ({ navigate, apartments }) => {
  const featuredApts = apartments.filter(a => a.featured).slice(0, 3);
  
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
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl md:rounded-full max-w-4xl mx-auto shadow-2xl flex flex-col md:flex-row items-center gap-2 border border-white/20 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="flex-1 w-full bg-white rounded-xl md:rounded-full flex items-center px-6 py-4">
              <MapPin className="text-gray-400 mr-3 shrink-0" size={20} />
              <input type="text" placeholder="Bạn muốn thuê ở quận nào?" className="w-full outline-none text-gray-800 placeholder-gray-500 bg-transparent text-sm md:text-base" />
            </div>
            <Button variant="accent" className="w-full md:w-auto px-8 py-4 rounded-xl md:rounded-full text-base whitespace-nowrap" onClick={() => navigate('listings')}>
              <Search className="mr-2" size={18} /> Tìm căn hộ
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm font-medium animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full cursor-pointer hover:bg-white hover:text-[#0A2540] transition-colors" onClick={() => navigate('listings')}>Quận 1</span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full cursor-pointer hover:bg-white hover:text-[#0A2540] transition-colors" onClick={() => navigate('listings')}>Thảo Điền</span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full cursor-pointer hover:bg-white hover:text-[#0A2540] transition-colors" onClick={() => navigate('listings')}>Phú Mỹ Hưng</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredApts.map(apt => (
              <ApartmentCard key={apt.id} data={apt} onClick={(id) => navigate('detail', id)} />
            ))}
          </div>
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

const ListingsPage = ({ navigate, apartments }) => {
  const [filters, setFilters] = useState({
    district: '', type: '', priceRange: '', amenities: []
  });
  
  const handleAmenityChange = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity) 
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const filteredApts = useMemo(() => {
    return apartments.filter(apt => {
      if (
        filters.district &&
        apt.district.replace(/^Quận\s+/i, '') !== filters.district.replace(/^Quận\s+/i, '')
      ) return false;
      if (filters.type && apt.type !== filters.type) return false;
      if (filters.priceRange) {
        if (filters.priceRange === 'low' && apt.price >= 15000000) return false;
        if (filters.priceRange === 'mid' && (apt.price < 15000000 || apt.price > 25000000)) return false;
        if (filters.priceRange === 'high' && apt.price <= 25000000) return false;
      }
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(a => apt.amenities.includes(a));
        if (!hasAllAmenities) return false;
      }
      return true;
    });
  }, [filters]);

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
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
              <h3 className="font-bold text-lg mb-6 flex items-center"><Search size={18} className="mr-2" /> Bộ lọc</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Khu vực</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0A2540] transition-colors"
                    value={filters.district}
                    onChange={(e) => setFilters({...filters, district: e.target.value})}
                  >
                    <option value="">Tất cả khu vực</option>
                    {DISTRICTS.map(district => <option key={district} value={district}>{district}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại phòng</label>
                  <select 
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0A2540] transition-colors"
                    value={filters.priceRange}
                    onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                  >
                    <option value="">Mọi mức giá</option>
                    <option value="low">Dưới 15 Triệu</option>
                    <option value="mid">15 - 25 Triệu</option>
                    <option value="high">Trên 25 Triệu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tiện ích</label>
                  <div className="space-y-3">
                    {Object.entries(AMENITIES).map(([key, data]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.amenities.includes(key) ? 'bg-[#FF5A5F] border-[#FF5A5F]' : 'border-gray-300 group-hover:border-[#FF5A5F]'}`}>
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
                  onClick={() => setFilters({ district: '', type: '', priceRange: '', amenities: [] })}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </aside>

          {/* Grid view */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
               <span className="text-sm text-gray-500">Sắp xếp theo:</span>
               <select className="border-none bg-transparent font-medium text-[#0A2540] outline-none cursor-pointer">
                 <option>Đề xuất</option>
                 <option>Giá thấp - cao</option>
                 <option>Giá cao - thấp</option>
                 <option>Mới nhất</option>
               </select>
            </div>

            {filteredApts.length > 0 ? (
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

const DetailPage = ({ id, navigate, apartments }) => {
  const apt = apartments.find(a => a.id === id);
  if (!apt) return <div>Not found</div>;

  const similarApts = apartments.filter(a => a.district === apt.district && a.id !== apt.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 md:px-8 py-8">
        
        {/* Header Area */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0A2540] mb-2">{apt.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center"><MapPin size={16} className="mr-1" /> {apt.district}, TP.HCM</span>
              <span className="flex items-center"><Star size={16} className="mr-1 text-yellow-400" /> 4.9 (128 đánh giá)</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="px-4 py-2 gap-2"><Share size={16} /> Chia sẻ</Button>
            <Button variant="secondary" className="px-4 py-2 gap-2"><Heart size={16} /> Lưu</Button>
          </div>
        </div>

        {/* Gallery - Airbnb Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 rounded-2xl overflow-hidden mb-12 h-[400px] md:h-[500px]">
          <div className="md:col-span-2 md:row-span-2 h-full relative cursor-pointer group">
            <img src={apt.images[0]} alt="Main" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
          </div>
          {apt.images[1] && (
             <div className="hidden md:block h-full relative cursor-pointer group">
               <img src={apt.images[1]} alt="Image 2" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
             </div>
          )}
          {apt.images[2] ? (
            <div className="hidden md:block h-full relative cursor-pointer group">
               <img src={apt.images[2]} alt="Image 3" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
             </div>
          ) : (
            <div className="hidden md:block h-full bg-gray-100"></div>
          )}
           <div className="hidden md:block h-full bg-gray-100"></div>
           <div className="hidden md:block h-full bg-gray-100 relative group cursor-pointer">
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-medium group-hover:bg-black/50 transition-colors">
                 Xem tất cả ảnh
              </div>
           </div>
        </div>

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
              <h3 className="text-xl font-bold text-[#0A2540] mb-4">Câu chuyện không gian</h3>
              <p className="text-gray-600 leading-relaxed text-lg font-light">{apt.description}</p>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bold text-[#0A2540] mb-6">Tiện ích nổi bật</h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                {apt.amenities.map(key => (
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
               <div className="w-full h-[300px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 border border-gray-200">
                  <Map size={48} className="mb-4 opacity-50" />
                  <p>Tích hợp Google Maps API tại đây</p>
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
                       <label className="text-[10px] font-bold uppercase text-gray-800 block mb-1">Ngày nhận phòng</label>
                       <input type="date" className="w-full text-sm outline-none text-gray-600" />
                    </div>
                    <div className="p-3 flex-1">
                       <label className="text-[10px] font-bold uppercase text-gray-800 block mb-1">Thời hạn thuê</label>
                       <select className="w-full text-sm outline-none text-gray-600 bg-transparent">
                         <option>6 tháng</option>
                         <option>1 năm</option>
                         <option>2 năm</option>
                       </select>
                    </div>
                 </div>
              </div>

              <Button variant="accent" className="w-full py-4 text-lg font-bold mb-4">Đặt lịch xem phòng</Button>
              <Button variant="secondary" className="w-full py-4 text-lg font-bold mb-6 gap-2">
                 <Phone size={20} /> Gọi tư vấn
              </Button>
              
              <p className="text-center text-sm text-gray-500">Không thu phí dịch vụ từ khách thuê</p>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm mb-3 text-gray-600">
                  <span>Tiền thuê x 12 tháng</span>
                  <span>{formatPrice(apt.price * 12)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-3 text-gray-600">
                  <span>Phí quản lý (ước tính)</span>
                  <span>1.5 Triệu / tháng</span>
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

const BlogPage = () => {
  const blogs = [
    { title: "Bí quyết chọn thuê căn hộ tại Quận 2 cho Expat", category: "Kinh nghiệm", img: "https://images.unsplash.com/photo-1542361345-89e58247f2d5?auto=format&fit=crop&q=80&w=800" },
    { title: "Chi phí sinh hoạt trung bình tại TP.HCM năm 2026", category: "Tài chính", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800" },
    { title: "Top 5 chung cư cao cấp có hồ bơi đẹp nhất Sài Gòn", category: "Khám phá", img: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800" },
    { title: "Hướng dẫn làm thủ tục tạm trú cho người nước ngoài", category: "Pháp lý", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800" },
    { title: "Phong cách Minimalism trong thiết kế căn hộ Studio", category: "Nội thất", img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800" },
    { title: "Làm thế nào để thương lượng giá thuê nhà tốt nhất?", category: "Kinh nghiệm", img: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=800" }
  ];

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-[#0A2540] mb-4">Blog & Cẩm nang</h1>
          <p className="text-gray-500">Kiến thức, xu hướng và kinh nghiệm sống tại các căn hộ cao cấp Sài Gòn.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <div className="h-48 overflow-hidden relative">
                <img src={blog.img} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-[#0A2540]">{blog.category}</div>
              </div>
              <div className="p-6">
                <p className="text-xs text-gray-400 mb-2">28 Tháng 7, 2026</p>
                <h3 className="font-bold text-lg text-[#0A2540] group-hover:text-[#FF5A5F] transition-colors mb-3 line-clamp-2">{blog.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">Những thông tin hữu ích giúp bạn có quyết định đúng đắn và trải nghiệm cuộc sống trọn vẹn hơn tại thành phố...</p>
                <div className="text-[#FF5A5F] font-medium text-sm flex items-center">Đọc tiếp <ChevronRight size={16} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
                   <h4 className="font-bold text-[#0A2540] mb-1">Hotline / Zalo / WhatsApp</h4>
                   <p className="text-gray-600">+84 90 123 4567</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#0A2540] shrink-0">
                   <Mail size={24} />
                </div>
                <div>
                   <h4 className="font-bold text-[#0A2540] mb-1">Email</h4>
                   <p className="text-gray-600">hello@saigonretreats.com</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#0A2540] shrink-0">
                   <MapPin size={24} />
                </div>
                <div>
                   <h4 className="font-bold text-[#0A2540] mb-1">Văn phòng chính</h4>
                   <p className="text-gray-600">Tầng 12, Tòa nhà Bitexco, Số 2 Hải Triều, Phường Bến Nghé, Quận 1, TP.HCM</p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <h3 className="text-2xl font-bold text-[#0A2540] mb-6">Gửi tin nhắn</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Họ & Tên</label>
                  <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0A2540]" placeholder="Nguyễn Văn A" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <input type="tel" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0A2540]" placeholder="0901234567" />
               </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Nhu cầu của bạn</label>
               <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0A2540]">
                  <option>Cần tìm thuê căn hộ</option>
                  <option>Ký gửi cho thuê căn hộ</option>
                  <option>Hợp tác / Khác</option>
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Lời nhắn</label>
               <textarea rows="4" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0A2540]" placeholder="Bạn cần hỗ trợ thêm thông tin gì?"></textarea>
            </div>
            <Button variant="accent" className="w-full py-4 text-lg mt-2">Gửi yêu cầu ngay</Button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

const AdminPage = ({ apartments, reloadApartments }) => {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '', type: '1PN', district: 'Quận 1', price: '', area: '',
    bathrooms: '1', furnishing: 'Đầy đủ nội thất',
    description: '', amenities: ['washer'], featured: false, status: 'available'
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
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
    setImages([]);
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
    setImages([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitApartment = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!editingId && !images.length) return setStatus('Vui lòng chọn ít nhất một hình ảnh.');
    setBusy(true);
    setStatus(editingId ? 'Đang lưu thay đổi...' : 'Đang tải ảnh và đăng căn hộ...');
    try {
      if (!supabase || !session?.user) throw new Error('Phiên đăng nhập đã hết hạn.');
      let imageData = null;
      if (images.length) {
        imageData = await uploadApartmentImages(images, session.user.id);
      }
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
        ...(imageData ? { images: imageData.publicUrls, image_paths: imageData.uploadedPaths } : {})
      };
      const query = editingId
        ? supabase.from('apartments').update(apartmentData).eq('id', editingId)
        : supabase.from('apartments').insert(apartmentData);
      const { error } = await query;
      if (error) throw error;
      await reloadApartments();
      const wasEditing = Boolean(editingId);
      resetForm(formElement);
      setStatus(wasEditing ? 'Đã lưu thay đổi trên website chính.' : 'Đã đăng căn hộ lên website chính.');
    } catch (error) {
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email quản trị</label>
          <input autoFocus required type="email" value={email} onChange={e => setEmail(e.target.value)}
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
              <Upload className="mx-auto mb-3 text-[#FF5A5F]" />
              <span className="font-semibold text-[#0A2540]">Chọn hình ảnh căn hộ</span>
              <span className="block text-sm text-gray-500 mt-1">Tối đa 8 ảnh, JPG/PNG/WebP, mỗi ảnh dưới 8 MB</span>
              <input required={!editingId} multiple accept="image/jpeg,image/png,image/webp" type="file" onChange={e => setImages(Array.from(e.target.files || []))} className="sr-only" />
              {images.length > 0 && <span className="block text-sm font-semibold text-green-700 mt-3">Đã chọn {images.length} ảnh</span>}
              {editingId && images.length === 0 && <span className="block text-sm text-gray-500 mt-3">Không chọn ảnh mới nếu muốn giữ nguyên ảnh hiện tại</span>}
            </label>
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

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(() => window.location.pathname.startsWith('/admin') ? 'admin' : 'home');
  const [selectedId, setSelectedId] = useState(null);
  const [apartments, setApartments] = useState(DEFAULT_APARTMENTS.map(item => ({ ...item, isDefault: true })));

  const reloadApartments = async () => {
    try {
      const data = await listApartments();
      setApartments([...data, ...DEFAULT_APARTMENTS.map(item => ({ ...item, isDefault: true }))]);
    } catch {
      // The bundled sample listings remain available if Supabase is not configured or unavailable.
    }
  };

  useEffect(() => { reloadApartments(); }, []);

  useScrollToTop(currentRoute);
  useScrollToTop(selectedId);

  const navigate = (route, id = null) => {
    setCurrentRoute(route);
    if (id) setSelectedId(id);
  };

  const renderContent = () => {
    switch (currentRoute) {
      case 'home': return <HomePage navigate={navigate} apartments={apartments} />;
      case 'listings': return <ListingsPage navigate={navigate} apartments={apartments} />;
      case 'detail': return <DetailPage id={selectedId} navigate={navigate} apartments={apartments} />;
      case 'about': return <AboutPage />;
      case 'blog': return <BlogPage />;
      case 'contact': return <ContactPage />;
      case 'admin': return <AdminPage apartments={apartments} reloadApartments={reloadApartments} />;
      default: return <HomePage navigate={navigate} apartments={apartments} />;
    }
  };

  return (
    <div className="font-sans text-gray-900 selection:bg-[#FF5A5F] selection:text-white flex flex-col min-h-screen">
      {currentRoute !== 'admin' && <Header currentRoute={currentRoute} navigate={navigate} />}
      
      <main className="flex-grow">
        {renderContent()}
      </main>

      {currentRoute !== 'admin' && <Footer />}
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
