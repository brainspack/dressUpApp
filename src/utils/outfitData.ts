import { OutfitIcons } from '../components/OutfitIcons';

// Define the OutfitType interface
export interface OutfitType {
  id: string;
  name: string;
  gender: 'female' | 'male';
  category: string;
  icon: React.ReactNode;
}

// Human-friendly labels for outfit names
export const formatOutfitLabel = (raw: string): string => {
  const map: Record<string, string> = {
    'ethnic_jacket': 'Ethnic Jacket',
    'women_western_suit': 'Women Western Suit',
    'women_co_ord_set': 'Women Co-ord Set',
    'co_ord_set': 'Co-ord Set',
    'womenssuit': 'Women Suit',
    'saree+blouse': 'Saree + Blouse',
    'indo_western': 'Indo Western',
    'kurta_pajama': 'Kurta Pajama',
    'women_blazer': 'Women Blazer',
    'waistcost': 'Waistcoat',
    'nehrujacket': 'Nehru Jacket',
    'tshirt': 'T-Shirt',
  };
  const withoutCount = (raw || '').replace(/\s*\(\d+\)\s*$/, ''); // e.g., "shirt (1)" -> "shirt"
  if (map[withoutCount]) return map[withoutCount];
  const withSpaces = withoutCount.replace(/_/g, ' ').replace(/\s{2,}/g, ' ').trim();
  const normalized = withSpaces.replace(/\bco ord set\b/i, 'Co-ord Set');
  return normalized
    .split(' ')
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '')
    .join(' ');
};

// Get outfit types from orderTypeOptions.ts data with proper icons - ALL OPTIONS INCLUDED
export const getFemaleOutfits = (): OutfitType[] => [
  { id: 'f1', name: 'saree', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.saree },
  { id: 'f2', name: 'kurti', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.kurti },
  { id: 'f3', name: 'camisole', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.camisole },
  { id: 'f4', name: 'ethnic_jacket', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.ethnic_jacket },
  { id: 'f5', name: 'jacket', gender: 'female', category: 'Western Wear', icon: OutfitIcons.jacket },
  { id: 'f6', name: 'nighty', gender: 'female', category: 'Night Wear', icon: OutfitIcons.nighty },
  { id: 'f7', name: 'slip', gender: 'female', category: 'Inner Wear', icon: OutfitIcons.slip },
  { id: 'f8', name: 'skirt', gender: 'female', category: 'Western Wear', icon: OutfitIcons.skirt },
  { id: 'f9', name: 'shrug', gender: 'female', category: 'Outerwear', icon: OutfitIcons.shrug },
  { id: 'f10', name: 'cape', gender: 'female', category: 'Outerwear', icon: OutfitIcons.cape },
  { id: 'f11', name: 'top', gender: 'female', category: 'Western Wear', icon: OutfitIcons.top },
  { id: 'f12', name: 'women_western_suit', gender: 'female', category: 'Western Wear', icon: OutfitIcons.women_western_suit },
  { id: 'f13', name: 'jumpsuit', gender: 'female', category: 'Western Wear', icon: OutfitIcons.jumpsuit },
  { id: 'f14', name: 'kaftan', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.kaftan },
  { id: 'f15', name: 'women_blazer', gender: 'female', category: 'Western Wear', icon: OutfitIcons.women_blazer },
  { id: 'f16', name: 'women_co_ord_set', gender: 'female', category: 'Western Wear', icon: OutfitIcons.women_co_ord_set },
  { id: 'f17', name: 'sharara', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.sharara },
  { id: 'f18', name: 'lehenga', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.lehenga },
  { id: 'f19', name: 'underskirt', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.underskirt },
  { id: 'f20', name: 'womenssuit', gender: 'female', category: 'Western Wear', icon: OutfitIcons.womenssuit },
  { id: 'f21', name: 'gown', gender: 'female', category: 'Western Wear', icon: OutfitIcons.gown },
  { id: 'f22', name: 'saree+blouse', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.sareeBlouse },
  { id: 'f23', name: 'dress', gender: 'female', category: 'Western Wear', icon: OutfitIcons.dress },
  { id: 'f24', name: 'tshirt', gender: 'female', category: 'Western Wear', icon: OutfitIcons.tshirt },
];

export const getMaleOutfits = (): OutfitType[] => [
  { id: 'm1', name: 'dhoti', gender: 'male', category: 'Traditional Wear', icon: OutfitIcons.dhoti },
  { id: 'm2', name: 'pajama', gender: 'male', category: 'Traditional Wear', icon: OutfitIcons.pajama },
  { id: 'm3', name: 'kurta', gender: 'male', category: 'Traditional Wear', icon: OutfitIcons.kurta },
  { id: 'm4', name: 'blazer', gender: 'male', category: 'Western/Formal Wear', icon: OutfitIcons.blazer },
  { id: 'm5', name: 'indo_western', gender: 'male', category: 'Fusion Wear', icon: OutfitIcons.indoWestern },
  { id: 'm6', name: 'sherwani', gender: 'male', category: 'Traditional Wear', icon: OutfitIcons.sherwani },
  { id: 'm7', name: 'waistcost', gender: 'male', category: 'Traditional Wear', icon: OutfitIcons.waistcost },
  { id: 'm8', name: 'nehrujacket', gender: 'male', category: 'Traditional Wear', icon: OutfitIcons.nehrujacket },
  { id: 'm9', name: 'co_ord_set', gender: 'male', category: 'Western Wear', icon: OutfitIcons.coOrdSet },
  { id: 'm10', name: 'pants', gender: 'male', category: 'Western/Formal Wear', icon: OutfitIcons.pants },
  { id: 'm11', name: 'kurta_pajama', gender: 'male', category: 'Traditional Wear', icon: OutfitIcons.kurtaPajama },
];

// Helper function to get outfit image source
export const getOutfitImageSource = (outfitName: string) => {
  const outfitImageMap: { [key: string]: any } = {
    saree: require('../assets/saree.png'),
    kurti: require('../assets/kurti.png'),
    camisole: require('../assets/camisole.png'),
    ethnic_jacket: require('../assets/ethnic_jacket.png'),
    jacket: require('../assets/jacket.png'),
    nighty: require('../assets/nighty.png'),
    slip: require('../assets/slip.png'),
    skirt: require('../assets/skirt.png'),
    shrug: require('../assets/shrug.png'),
    cape: require('../assets/cape.png'),
    top: require('../assets/top.png'),
    women_western_suit: require('../assets/women_western_suit.png'),
    jumpsuit: require('../assets/jumpsuit.png'),
    kaftan: require('../assets/kaftan.png'),
    women_blazer: require('../assets/women_blazer.png'),
    women_co_ord_set: require('../assets/women_co_ord_set.png'),
    sharara: require('../assets/sharara.jpg'),
    lehenga: require('../assets/lehenga.jpg'),
    underskirt: require('../assets/underskirt.jpg'),
    womenssuit: require('../assets/womenssuit.jpg'),
    gown: require('../assets/gown.png'),
    'saree+blouse': require('../assets/saree+blouse.jpg'),
    dress: require('../assets/dress.jpg'),
    co_ord_set: require('../assets/co_ord_set.png'),
    tshirt: require('../assets/tshirt.png'),
    dhoti: require('../assets/dhoti.png'),
    pajama: require('../assets/pajama.png'),
    kurta: require('../assets/kurta.png'),
    blazer: require('../assets/blazer.png'),
    indo_western: require('../assets/indo_western.jpg'),
    sherwani: require('../assets/sherwani.jpg'),
    waistcost: require('../assets/waistcost.jpg'),
    nehrujacket: require('../assets/nehrujacket.jpg'),
    'shirt (1)': require('../assets/shirt (1).jpg'),
    pants: require('../assets/pants.jpg'),
    kurta_pajama: require('../assets/kurta_pajama.png'),
    shirt: require('../assets/shirt.jpg')
  };
  const key = (outfitName || '').replace(/\s*\(\d+\)\s*$/, '');
  const imageSource = outfitImageMap[key];
  if (imageSource) {
    console.log(`Found image for ${outfitName}:`, imageSource);
    return imageSource;
  } else {
    console.log(`No image found for ${outfitName}, using fallback`);
    return require('../assets/dress.jpg'); // fallback
  }
};

