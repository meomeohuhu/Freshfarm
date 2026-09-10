// Mock Data for FreshFarm Platform (Supporting 13 Modules & 4 Roles)

export const INITIAL_CATEGORIES = [
  { id: 'all', name: 'Tất cả nông sản', icon: 'Sprout' },
  { id: 'veggies', name: 'Rau củ Hữu cơ', icon: 'Carrot' },
  { id: 'fruits', name: 'Trái cây VietGAP', icon: 'Apple' },
  { id: 'meat', name: 'Thịt & Trứng Sạch', icon: 'Egg' },
  { id: 'processed', name: 'Thực phẩm chế biến', icon: 'PackageCheck' },
];

export const INITIAL_PRODUCTS = [
  {
    id: 'P001',
    name: 'Rau Cải Thìa Hữu Cơ Đà Lạt',
    category: 'veggies',
    price: 32000,
    unit: 'Kg',
    stock: 150,
    rating: 4.9,
    reviewsCount: 38,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    description: 'Rau cải thìa trồng theo tiêu chuẩn hữu cơ USDA tại Trang trại GreenFarm Đà Lạt. Không phân bón hóa học, không thuốc trừ sâu.',
    farmName: 'Trang trại Hữu cơ GreenFarm Đà Lạt',
    farmLocation: 'Phường 7, TP. Đà Lạt, Lâm Đồng',
    supplierName: 'Công ty Nông sản Sạch Việt Nông',
    batchCode: 'LOT-20260901-CT',
    harvestDate: '2026-09-08',
    expiryDate: '2026-09-15',
    certifications: ['USDA Organic', 'VietGAP', 'HACCP'],
    journeySteps: [
      { step: 1, title: 'Xuống giống & Chăm sóc', detail: 'Đất phù sa Lâm Đồng, phân bón vi sinh trùn quế.', date: '2026-08-01' },
      { step: 2, title: 'Thu hoạch & Kiểm định', detail: 'Thu hoạch thủ công 5:00 AM, test nhanh tồn dư 0%.', date: '2026-09-08' },
      { step: 3, title: 'Vận chuyển lạnh & Lưu kho', detail: 'Xe lạnh 4°C chuyển về Kho Phân phối Việt Nông Đà Nẵng.', date: '2026-09-09' },
      { step: 4, title: 'Sẵn sàng niêm yết', detail: 'Đã niêm yết lên FreshFarm với mã QR xác thực.', date: '2026-09-10' }
    ]
  },
  {
    id: 'P002',
    name: 'Dưa Lưới Tách Lưới Huỳnh Long (VietGAP)',
    category: 'fruits',
    price: 85000,
    unit: 'Kg',
    stock: 80,
    rating: 5.0,
    reviewsCount: 52,
    image: 'https://images.unsplash.com/photo-1598170845058-12ef4a457539?auto=format&fit=crop&w=600&q=80',
    description: 'Dưa lưới vỏ vàng ruột cam giòn ngọt brix 14+, trồng trong nhà màng công nghệ cao Israel tại Nông trại Nắng Xanh.',
    farmName: 'Nông trại Công nghệ cao Nắng Xanh',
    farmLocation: 'Củ Chi, TP. Hồ Chí Minh',
    supplierName: 'Chuỗi Phân phối Nông sản Việt Nông',
    batchCode: 'LOT-20260905-DL',
    harvestDate: '2026-09-07',
    expiryDate: '2026-09-25',
    certifications: ['VietGAP', 'GlobalGAP'],
    journeySteps: [
      { step: 1, title: 'Thụ phấn nhân tạo', detail: 'Thụ phấn bằng ong mật trong nhà màng kiểm soát nhiệt độ.', date: '2026-07-20' },
      { step: 2, title: 'Thu hoạch đạt độ đường 14+', detail: 'Kiểm tra độ Brix đạt chuẩn 14%, cắt cuống chữ T.', date: '2026-09-07' },
      { step: 3, title: 'Bọc xốp bảo vệ & Dán tem', detail: 'Đóng hộp chống sốc, tem QR truy xuất nguồn gốc.', date: '2026-09-08' },
      { step: 4, title: 'Nhập kho cung ứng', detail: 'Sẵn sàng giao tới tay khách hàng.', date: '2026-09-09' }
    ]
  },
  {
    id: 'P003',
    name: 'Thịt Ba Chỉ Heo Thảo Mộc Đương Quy',
    category: 'meat',
    price: 165000,
    unit: 'Kg',
    stock: 45,
    rating: 4.8,
    reviewsCount: 29,
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80',
    description: 'Heo nuôi bằng thức ăn thảo dược (đương quy, đinh lăng), thịt thơm ngậy, không chất tăng trọng, bảo quản hút chân không.',
    farmName: 'Trang trại Chăn nuôi Thảo mộc An Tâm',
    farmLocation: 'Mộc Châu, Sơn La',
    supplierName: 'Công ty Thực phẩm Sạch An Tâm',
    batchCode: 'LOT-20260908-HM',
    harvestDate: '2026-09-09',
    expiryDate: '2026-09-16',
    certifications: ['VietGAP Chăn nuôi', 'ISO 22000'],
    journeySteps: [
      { step: 1, title: 'Chăn nuôi thảo mộc', detail: 'Khẩu phần ăn bột ngô, cám gạo và thảo dược trong 8 tháng.', date: '2026-01-10' },
      { step: 2, title: 'Tạm ngưng & Kiểm dịch', detail: 'Cơ quan Thú y cấp chứng nhận an toàn dịch bệnh.', date: '2026-09-08' },
      { step: 3, title: 'Mổ mát & Hút chân không', detail: 'Quy trình mổ mát tiêu chuẩn Châu Âu 0-4°C.', date: '2026-09-09' }
    ]
  },
  {
    id: 'P004',
    name: 'Cà Rốt Hữu Cơ Măng Đen',
    category: 'veggies',
    price: 45000,
    unit: 'Kg',
    stock: 200,
    rating: 4.7,
    reviewsCount: 19,
    image: 'https://images.unsplash.com/photo-1598170845058-12ef4a457539?auto=format&fit=crop&w=600&q=80',
    description: 'Cà rốt trồng trên thổ nhưỡng măng đen Kon Tum, củ ngọt đậm đà, giàu Vitamin A và Beta-carotene.',
    farmName: 'Hợp tác xã Nông nghiệp Măng Đen Organic',
    farmLocation: 'Kon Plông, Kon Tum',
    supplierName: 'Công ty Nông sản Sạch Việt Nông',
    batchCode: 'LOT-20260902-CR',
    harvestDate: '2026-09-06',
    expiryDate: '2026-09-27',
    certifications: ['Organic Vietnam', 'VietGAP'],
    journeySteps: [
      { step: 1, title: 'Gieo trồng cao nguyên', detail: 'Khí hậu lạnh Măng Đen tự nhiên không sâu bệnh.', date: '2026-06-01' },
      { step: 2, title: 'Thu hoạch & Sơ chế khô', detail: 'Rửa sạch bụi đất bằng nước khoáng tự nhiên.', date: '2026-09-06' }
    ]
  },
  {
    id: 'P005',
    name: 'Mật Ong Hoa Nhãn Sơn La Nguyên Chất',
    category: 'processed',
    price: 210000,
    unit: 'Hũ 500ml',
    stock: 60,
    rating: 4.9,
    reviewsCount: 64,
    image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    description: 'Mật ong khai thác từ hoa nhãn sông Mã, màu vàng óng, hương thơm tự nhiên không pha đường.',
    farmName: 'Làng nghề Nuôi ong Sông Mã',
    farmLocation: 'Sông Mã, Sơn La',
    supplierName: 'Nông sản Đặc sản Miền Bắc',
    batchCode: 'LOT-20260820-MO',
    harvestDate: '2026-08-20',
    expiryDate: '2028-08-20',
    certifications: ['OCOP 4 Sao', 'HACCP'],
    journeySteps: [
      { step: 1, title: 'Khai thác mật mùa hoa nhãn', detail: 'Quay mật thủ công khi ong đã luyện chín mật.', date: '2026-08-20' },
      { step: 2, title: 'Lọc tạp chất & Đóng chai', detail: 'Hệ thống hạ độ ẩm mật ong đạt chuẩn dưới 19%.', date: '2026-08-22' }
    ]
  }
];

export const INITIAL_BATCHES = [
  {
    id: 'LOT-20260901-CT',
    productName: 'Rau Cải Thìa Hữu Cơ Đà Lạt',
    producer: 'Trang trại Hữu cơ GreenFarm Đà Lạt',
    quantity: '500 Kg',
    harvestDate: '2026-09-08',
    status: 'Đã xuất kho phân phối',
    cert: 'USDA Organic #ORG-9921',
    area: 'Lô A3 - Diện tích 2.5 Ha'
  },
  {
    id: 'LOT-20260905-DL',
    productName: 'Dưa Lưới Tách Lưới Huỳnh Long',
    producer: 'Nông trại Công nghệ cao Nắng Xanh',
    quantity: '300 Kg',
    harvestDate: '2026-09-07',
    status: 'Đang kiểm định chất lượng',
    cert: 'VietGAP #VG-44021',
    area: 'Nhà màng N02 - Củ Chi'
  },
  {
    id: 'LOT-20260910-DTH',
    productName: 'Dâu Tây Giống Nhật Mới',
    producer: 'Trang trại Hữu cơ GreenFarm Đà Lạt',
    quantity: '120 Kg',
    harvestDate: '2026-09-10',
    status: 'Mới thu hoạch (Chờ duyệt)',
    cert: 'VietGAP #VG-88120',
    area: 'Lô B1 - Đà Lạt'
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ORD-20260910-88',
    customerName: 'Nguyễn Văn Hùng',
    phone: '0905 123 456',
    address: '124 Nguyễn Văn Linh, Q. Thanh Khê, Đà Nẵng',
    date: '2026-09-10 09:30',
    items: [
      { id: 'P001', name: 'Rau Cải Thìa Hữu Cơ Đà Lạt', qty: 2, price: 32000 },
      { id: 'P002', name: 'Dưa Lưới Huỳnh Long', qty: 1, price: 85000 }
    ],
    totalAmount: 149000,
    paymentMethod: 'VietQR (Napas)',
    paymentStatus: 'Đã thanh toán',
    orderStatus: 'Shipping', // Pending -> Preparing -> Shipping -> Completed
    statusText: 'Đang giao hàng'
  },
  {
    id: 'ORD-20260909-12',
    customerName: 'Lê Thị Diệu Tâm',
    phone: '0914 888 999',
    address: '45 Trần Phú, Q. Hải Châu, Đà Nẵng',
    date: '2026-09-09 14:15',
    items: [
      { id: 'P003', name: 'Thịt Ba Chỉ Heo Thảo Mộc', qty: 1, price: 165000 }
    ],
    totalAmount: 165000,
    paymentMethod: 'Thanh toán COD',
    paymentStatus: 'Chưa thanh toán',
    orderStatus: 'Preparing',
    statusText: 'Đang chuẩn bị hàng tại kho'
  }
];

export const BANK_INFO = {
  bankName: 'MBBank (Ngan hang Quan doi)',
  accountNo: '0388998899',
  accountName: 'FRESHFARM ECOMMERCE PLATFORM',
  bankCode: 'MB'
};
