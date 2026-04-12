import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Phone, Sprout } from 'lucide-react';
import { getProduceEmoji } from '../../utils/produceDB';
import { getBadgeColor, cn, formatDate } from '../../utils/helpers';

export function ProduceCard({ produce, onClick, disabled = false }) {
  const imageUrls = Array.isArray(produce.imageUrls) && produce.imageUrls.length > 0
    ? produce.imageUrls
    : produce.imageUrl
      ? [produce.imageUrl]
      : [];
  const emoji = imageUrls.length ? null : getProduceEmoji(produce.name);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const availableQuantity = produce.availableQuantity ?? produce.quantity;
  const rotationTimerRef = useRef(null);

  const stopRotation = (shouldReset = true) => {
    if (rotationTimerRef.current) {
      window.clearInterval(rotationTimerRef.current);
      rotationTimerRef.current = null;
    }
    if (shouldReset) {
      setActiveImageIndex(0);
    }
  };

  const startRotation = () => {
    if (imageUrls.length < 2 || rotationTimerRef.current) return;

    rotationTimerRef.current = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % imageUrls.length);
    }, 1800);
  };

  const handleMouseEnter = () => startRotation();
  const handleMouseLeave = () => stopRotation();

  useEffect(() => () => stopRotation(false), []);

  const activeImage = imageUrls[activeImageIndex] || imageUrls[0] || null;
  const isSoldOut = disabled || Number(availableQuantity || 0) <= 0 || String(produce.status || '').toLowerCase() === 'sold';
  const normalizedStatus = String(produce.status || 'available').toLowerCase();
  const displayStatus = normalizedStatus === 'reserved' ? 'available' : normalizedStatus;

  return (
    <div
      onClick={isSoldOut ? undefined : onClick}
      onMouseEnter={isSoldOut ? undefined : handleMouseEnter}
      onMouseLeave={isSoldOut ? undefined : handleMouseLeave}
      className={cn(
        'group relative bg-white rounded-2xl p-4 border border-forest/10 shadow-sm transition-all duration-200',
        !isSoldOut && 'hover:shadow-xl hover:-translate-y-0.5',
        onClick && !isSoldOut && 'cursor-pointer',
        isSoldOut && 'opacity-65 grayscale blur-[1px] cursor-not-allowed'
      )}
    >
      {isSoldOut && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-700">
          Sold Out
        </span>
      )}

      {activeImage ? (
        <img src={activeImage} alt={produce.name} className="w-full h-32 object-cover rounded-lg mb-3 transition-transform duration-500 group-hover:scale-[1.01]" />
      ) : (
        <div className="w-full h-32 bg-gradient-to-br from-ivory to-foam rounded-lg flex items-center justify-center text-5xl mb-3">{emoji}</div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-lg text-forest">{produce.name}</h4>
          <p className="text-sm text-slate">{availableQuantity} {produce.unit} available</p>
        </div>
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getBadgeColor(displayStatus))}>
          {String(displayStatus || '').charAt(0).toUpperCase() + String(displayStatus || '').slice(1)}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-xs text-slate">
        <p className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Harvest: {formatDate(produce.harvestDate)}</p>
        <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {produce.farmerPhone || 'Phone not shared'}</p>
        {produce.shortDescription && <p className="flex items-start gap-1.5"><Sprout className="w-3.5 h-3.5 mt-0.5" /> {produce.shortDescription}</p>}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="font-bold text-green-600">৳{produce.price}/{produce.unit}</span>
      </div>
    </div>
  );
}