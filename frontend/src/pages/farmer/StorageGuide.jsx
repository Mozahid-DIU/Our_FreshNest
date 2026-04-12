import { useState } from 'react';
import { Thermometer } from 'lucide-react';
import { PRODUCE_DB } from '../../utils/produceDB';
import { Topbar } from '../../components/layout/Topbar';
import { Badge } from '../../components/ui/Badge';

export default function StorageGuide() {
  const [filter, setFilter] = useState('all');
  const categories = ['all', 'Leafy Vegetable', 'Vegetable', 'Root Vegetable', 'Fruit', 'Legume'];
  const filtered = filter === 'all' ? PRODUCE_DB : PRODUCE_DB.filter(p => p.category === filter);

  return (
    <div>
      <Topbar title="Storage Guide" />
      <div className="p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === cat ? 'bg-forest text-white' : 'bg-white border border-gray-200 hover:border-forest'}`}>
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.name} className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-start gap-4">
                <span className="text-4xl">{p.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <Badge status={p.category} className="mt-1" />
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Thermometer className="w-4 h-4 text-green" />
                  <span>Optimal: {p.temp}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>Fresh for: {p.days} days</span>
                </div>
                <p className="text-gray-500 mt-2">{p.tips}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}