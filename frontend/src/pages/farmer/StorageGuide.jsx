import { useState } from 'react';
import { Thermometer, Sparkles } from 'lucide-react';
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
      <div className="p-6 space-y-6">
        <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">Storage knowledge</p>
              <h2 className="mt-2 text-2xl font-bold text-forest sm:text-3xl">Keep produce fresh with clearer storage guidance.</h2>
              <p className="mt-3 text-base leading-7 text-slate">
                Browse by category and see the temperature, freshness window, and handling tips that matter before you sell.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green/10 px-4 py-2 text-sm font-semibold text-green">
              <Sparkles className="h-4 w-4" />
              24 crops tracked
            </div>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === cat ? 'bg-forest text-white shadow-sm' : 'border border-gray-200 bg-white text-slate hover:border-green hover:text-forest'
                }`}
              >
                {cat === 'all' ? 'All crops' : cat}
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <article key={p.name} className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ivory text-4xl">{p.emoji}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-forest">{p.name}</h3>
                  <Badge status={p.category} className="mt-2" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-ivory p-4">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate"><Thermometer className="h-4 w-4 text-green" /> Temperature</p>
                  <p className="mt-2 text-sm font-semibold text-forest">{p.temp}</p>
                </div>
                <div className="rounded-2xl bg-ivory p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate">Fresh window</p>
                  <p className="mt-2 text-sm font-semibold text-forest">{p.days} days</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-forest p-4 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">Handling tips</p>
                <p className="mt-2 text-sm leading-6 text-white/88">{p.tips}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}