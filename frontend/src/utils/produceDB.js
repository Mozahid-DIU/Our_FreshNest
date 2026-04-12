export const PRODUCE_DB = [
  { emoji: '🥬', name: 'Spinach', category: 'Leafy Vegetable', temp: '0-2°C', days: 5, tips: 'High humidity (95%), store in plastic bags. Separate leaves to prevent decay.' },
  { emoji: '🥬', name: 'Lettuce', category: 'Leafy Vegetable', temp: '0-2°C', days: 7, tips: 'Keep heads intact. Mist occasionally. Avoid ethylene-producing foods nearby.' },
  { emoji: '🥬', name: 'Cabbage', category: 'Leafy Vegetable', temp: '0-4°C', days: 14, tips: 'Store in perforated plastic. Outer leaves protect inner heads.' },
  { emoji: '🥬', name: 'Cauliflower', category: 'Leafy Vegetable', temp: '0-2°C', days: 7, tips: 'Wrap outer leaves over head. Store in high humidity.' },
  { emoji: '🍅', name: 'Tomato', category: 'Vegetable', temp: '10-12°C', days: 7, tips: 'Ripen at room temp, then refrigerate. Store stem-side down.' },
  { emoji: '🍅', name: 'Potato', category: 'Vegetable', temp: '4-8°C', days: 60, tips: 'Store in dark, ventilated area. Keep away from onions.' },
  { emoji: '🥒', name: 'Cucumber', category: 'Vegetable', temp: '10-12°C', days: 7, tips: 'Wrap in plastic. Store upright to maintain firmness.' },
  { emoji: '🥒', name: 'Bitter Gourd', category: 'Vegetable', temp: '10-12°C', days: 5, tips: 'Store in breathable containers. Avoid stacking.' },
  { emoji: '🫑', name: 'Green Chili', category: 'Vegetable', temp: '8-10°C', days: 7, tips: 'Use perforated bags. Keep away from fruit.' },
  { emoji: '🥕', name: 'Carrot', category: 'Root Vegetable', temp: '0-4°C', days: 21, tips: 'Remove tops. Store in sand or sawdust.' },
  { emoji: '🥕', name: 'Radish', category: 'Root Vegetable', temp: '0-4°C', days: 14, tips: 'Remove leaves. Store in damp cloth.' },
  { emoji: '🧅', name: 'Onion', category: 'Root Vegetable', temp: '0-4°C', days: 30, tips: 'Keep in mesh bags. Store in cool, dry, dark place.' },
  { emoji: '🧅', name: 'Garlic', category: 'Root Vegetable', temp: '0-2°C', days: 60, tips: 'Do not refrigerate. Store in ventilated container.' },
  { emoji: '🍆', name: 'Eggplant', category: 'Vegetable', temp: '10-12°C', days: 7, tips: 'Store in single layer. Avoid cold temperatures below 8°C.' },
  { emoji: '🥔', name: 'Sweet Potato', category: 'Root Vegetable', temp: '12-15°C', days: 30, tips: 'Cure at 30°C for 4 days, then store in cool place.' },
  { emoji: '🍌', name: 'Banana', category: 'Fruit', temp: '13-15°C', days: 7, tips: 'Store away from other produce. Hang to prevent bruising.' },
  { emoji: '🍌', name: 'Green Banana', category: 'Fruit', temp: '13-15°C', days: 14, tips: 'Keep in cool, dark place. Peel and store in water.' },
  { emoji: '🥭', name: 'Mango', category: 'Fruit', temp: '10-12°C', days: 7, tips: 'Wrap in paper. Store stem-side down. Ripen at room temp.' },
  { emoji: '🍊', name: 'Orange', category: 'Fruit', temp: '4-8°C', days: 14, tips: 'Store in breathable bags. Check weekly for decay.' },
  { emoji: '🍊', name: 'Lemon', category: 'Fruit', temp: '10-12°C', days: 21, tips: 'Store at room temp or refrigerate. Juicing extends life.' },
  { emoji: '🍉', name: 'Watermelon', category: 'Fruit', temp: '10-15°C', days: 10, tips: 'Store whole. Cut pieces refrigerate in airtight container.' },
  { emoji: '🍈', name: 'Papaya', category: 'Fruit', temp: '10-12°C', days: 7, tips: 'Ripen at room temp. Refrigerate only when ripe.' },
  { emoji: '🥥', name: 'Coconut', category: 'Fruit', temp: '0-4°C', days: 30, tips: 'Store in cool, dry place. Check for liquid sound.' },
  { emoji: '🫘', name: 'Green Peas', category: 'Legume', temp: '0-2°C', days: 5, tips: 'Shell and store in plastic bags. Use quickly for best quality.' },
];

export const getProduceByName = (name) => PRODUCE_DB.find(p => p.name.toLowerCase() === name.toLowerCase());
export const getProduceEmoji = (name) => getProduceByName(name)?.emoji || '🌱';
export const getStorageTips = (name) => getProduceByName(name) || null;