import { memo } from 'react';
import { IBarber } from '@/utils/types';

interface BarberCardProps {
  barber: IBarber;
  onSelect?: (barber: IBarber) => void;
  isSelected?: boolean;
}

export const BarberCard = memo<BarberCardProps>(({ 
  barber, 
  onSelect, 
  isSelected = false 
}) => {
  const handleClick = () => {
    onSelect?.(barber);
  };

  return (
    <div 
      className={`
        p-4 border rounded-lg cursor-pointer transition-all duration-200 
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
      `}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        {barber.avatar_url ? (
          <img 
            src={barber.avatar_url} 
            alt={barber.name}
            className="w-12 h-12 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {barber.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{barber.name}</h3>
          
          {barber.barber_details.barber_rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm text-gray-600">
                {barber.barber_details.barber_rating.toFixed(1)}
              </span>
            </div>
          )}
          
          {barber.services.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {barber.services.slice(0, 2).join(', ')}
                {barber.services.length > 2 && ` +${barber.services.length - 2}`}
              </p>
            </div>
          )}
          
          {barber.total_price && (
            <div className="mt-2">
              <span className="text-lg font-bold text-green-600">
                R$ {barber.total_price.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {barber.barber_details.description && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
          {barber.barber_details.description}
        </p>
      )}
    </div>
  );
});

BarberCard.displayName = 'BarberCard';