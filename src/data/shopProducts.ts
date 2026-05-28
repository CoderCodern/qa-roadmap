export interface ShopProduct {
  id: number
  name: string
  nameVi: string
  description: string
  descriptionVi: string
  image: string
  price: string
  points: number
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 1,
    name: 'Matcha Latte Thường Nhật',
    nameVi: 'Matcha Latte Thường Nhật',
    description: 'Everyday matcha latte — smooth, balanced, easy to love',
    descriptionVi: 'Matcha latte mỗi ngày — mịn màng, cân bằng, dễ uống',
    image: '/shop/matcha-latte-thuong-nhat.jpg',
    price: '50.000đ',
    points: 300,
  },
  {
    id: 2,
    name: 'Matcha Latte Cao Cấp',
    nameVi: 'Matcha Latte Cao Cấp',
    description: 'Premium Japanese matcha with a deep Umami finish',
    descriptionVi: 'Matcha Nhật cao cấp, hậu vị Umami đặc trưng',
    image: '/shop/matcha-latte-cao-cap.jpg',
    price: '70.000đ',
    points: 450,
  },
  {
    id: 3,
    name: 'Matcha Earlgrey',
    nameVi: 'Matcha Earlgrey',
    description: 'Matcha meets aromatic Earl Grey cream — floral and smooth',
    descriptionVi: 'Matcha kết hợp kem earl grey thơm — hoa cỏ và mịn màng',
    image: '/shop/matcha-earlgrey.jpg',
    price: '55.000đ',
    points: 350,
  },
  {
    id: 4,
    name: 'Matcha Muối',
    nameVi: 'Matcha Muối',
    description: 'Pure matcha topped with sweet-salty cream — the classic',
    descriptionVi: 'Matcha nguyên chất với kem mặn đặc trưng',
    image: '/shop/matcha-muoi.jpg',
    price: '55.000đ',
    points: 350,
  },
  {
    id: 5,
    name: 'Matcha Ngọc Lan',
    nameVi: 'Matcha Ngọc Lan',
    description: 'Matcha infused with delicate jasmine — fragrant and refreshing',
    descriptionVi: 'Matcha kết hợp hoa ngọc lan tinh tế — thơm mát',
    image: '/shop/matcha-ngoc-lan.jpg',
    price: '60.000đ',
    points: 380,
  },
  {
    id: 6,
    name: 'Houjicha Kem Mặn',
    nameVi: 'Houjicha Kem Mặn',
    description: 'Roasted houjicha with salted cream — warm, nutty, comforting',
    descriptionVi: 'Houjicha rang thơm với kem mặn — ấm áp, hơi đắng, dễ chịu',
    image: '/shop/houjicha-kem-man.jpg',
    price: '60.000đ',
    points: 380,
  },
  {
    id: 7,
    name: 'Usucha',
    nameVi: 'Usucha',
    description: 'Traditional thin matcha prepared whisked — clean and pure',
    descriptionVi: 'Matcha pha theo kiểu truyền thống — thuần khiết và tinh tế',
    image: '/shop/usucha.jpg',
    price: '65.000đ',
    points: 420,
  },
  {
    id: 8,
    name: 'Cacao Sữa',
    nameVi: 'Cacao Sữa',
    description: 'Rich cacao with creamy milk — deep chocolate comfort',
    descriptionVi: 'Cacao đậm đà kết hợp sữa tươi béo ngậy',
    image: '/shop/cacao-sua.jpg',
    price: '55.000đ',
    points: 350,
  },
  {
    id: 9,
    name: 'Cacao Kem Muối',
    nameVi: 'Cacao Kem Muối',
    description: 'Cacao with sweet-salty cream — the perfect contrast',
    descriptionVi: 'Cacao với kem mặn — vị ngọt mặn tương phản hoàn hảo',
    image: '/shop/cacao-kem-muoi.jpg',
    price: '60.000đ',
    points: 380,
  },
  {
    id: 10,
    name: 'Combo Must Try',
    nameVi: 'Combo Must Try',
    description: 'Matcha Dừa + Matcha Oreo Kem Mặn — the fan-favourite duo',
    descriptionVi: 'Matcha Dừa + Matcha Oreo Kem Mặn — combo được yêu thích nhất',
    image: '/shop/combo-must-try.jpg',
    price: '99.000đ',
    points: 650,
  },
]

/** Which shop product is awarded for completing each phase (free, no points). */
export const PHASE_REWARD_PRODUCTS: Record<number, number> = {
  1: 1,  // Phase 1 → Matcha Latte Thường Nhật
  2: 2,  // Phase 2 → Matcha Latte Cao Cấp
  3: 5,  // Phase 3 → Matcha Ngọc Lan
  4: 6,  // Phase 4 → Houjicha Kem Mặn
  5: 10, // Phase 5 → Combo Must Try
}
