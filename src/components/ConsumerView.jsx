import React, { useState } from 'react';
import { 
  QrCode, 
  ShoppingCart, 
  Star, 
  ShieldCheck, 
  CheckCircle, 
  MapPin, 
  Award, 
  Calendar, 
  Info,
  Carrot,
  Apple,
  Egg,
  PackageCheck,
  Sprout
} from 'lucide-react';

export default function ConsumerView({ 
  products, 
  categories, 
  searchQuery, 
  addToCart, 
  onOpenTraceability 
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.batchCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Carrot': return <Carrot className="w-4 h-4" />;
      case 'Apple': return <Apple className="w-4 h-4" />;
      case 'Egg': return <Egg className="w-4 h-4" />;
      case 'PackageCheck': return <PackageCheck className="w-4 h-4" />;
      default: return <Sprout className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-10 shadow-xl border border-emerald-700/40">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-15 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            100% Nông sản Sạch - Minh Bạch Nguồn Gốc Lô Hàng
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Nông Sản Sạch Tươi Ngon Từ Trang Trại Tới Bàn Ăn
          </h2>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Hệ thống kết nối trực tiếp Nhà sản xuất - Nhà cung cấp - Người tiêu dùng. Truy xuất minh bạch nguồn gốc lô thu hoạch bằng mã QR chuẩn hóa.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Chứng nhận VietGAP & Organic
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Giao hàng nhanh trong 24h
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Thanh toán VietQR tiện lợi
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm transition-all whitespace-nowrap ${
                active 
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20 scale-[1.02]' 
                  : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
              }`}
            >
              {getCategoryIcon(cat.icon)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Danh Sách Nông Sản Sạch
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {filteredProducts.length} sản phẩm
            </span>
          </h3>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
            <p className="text-slate-500 font-medium">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {product.certifications.map((cert, idx) => (
                      <span key={idx} className="badge badge-emerald shadow-sm">
                        <Award className="w-3 h-3" /> {cert}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => onOpenTraceability(product)}
                    className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md text-xs px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 shadow-lg transition-all border border-white/20"
                    title="Truy xuất nguồn gốc lô hàng qua mã QR"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mã QR Nguồn Gốc</span>
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="flex items-center gap-1 font-medium text-emerald-700">
                        <MapPin className="w-3 h-3" /> {product.farmName}
                      </span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" /> {product.rating}
                      </span>
                    </div>

                    <h4 
                      onClick={() => setSelectedProduct(product)}
                      className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer"
                    >
                      {product.name}
                    </h4>
                    
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-lg font-black text-emerald-700">
                        {product.price.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-xs text-slate-400 font-medium ml-1">/ {product.unit}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                        title="Xem chi tiết"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => addToCart(product)}
                        className="btn btn-primary text-xs py-2 px-3 shadow-md"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Thêm</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Mã Lô Hàng: {selectedProduct.batchCode}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{selectedProduct.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name} 
                className="w-full h-56 object-cover rounded-2xl shadow-md"
              />
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Giá bán niêm yết:</span>
                  <div className="text-2xl font-black text-emerald-700">
                    {selectedProduct.price.toLocaleString('vi-VN')} đ <span className="text-xs font-normal text-slate-500">/ {selectedProduct.unit}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <strong>Cơ sở sản xuất:</strong> {selectedProduct.farmName}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <strong>Ngày thu hoạch:</strong> {selectedProduct.harvestDate}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <strong>Chứng nhận:</strong> {selectedProduct.certifications.join(', ')}
                  </div>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed pt-2 border-t">
                  {selectedProduct.description}
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-600 text-white rounded-xl">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-bold text-emerald-900 text-sm">Truy xuất Nguồn gốc 4 Bước</h5>
                  <p className="text-xs text-emerald-700">Xem toàn bộ lịch sử từ trang trại tới phân phối</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  onOpenTraceability(selectedProduct);
                }}
                className="btn btn-primary text-xs"
              >
                Mở Mã QR & Hành Trình
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="btn btn-secondary text-xs"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="btn btn-amber text-xs"
              >
                <ShoppingCart className="w-4 h-4" /> Thêm Vào Giỏ Hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
