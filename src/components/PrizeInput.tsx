import React from 'react';
import { DollarSign, Gift, CreditCard, Ticket, Shirt, Package } from 'lucide-react';
import { Prize, PrizeType } from '../contexts/HackathonContext';

interface PrizeInputProps {
  prizes: Prize[];
  onChange: (prizes: Prize[]) => void;
  className?: string;
}

const PrizeInput: React.FC<PrizeInputProps> = ({ prizes, onChange, className = '' }) => {
  const addPrize = () => {
    onChange([...prizes, { type: 'cash', amount: 0, currency: '€', details: '' }]);
  };

  const updatePrize = (index: number, updates: Partial<Prize>) => {
    const newPrizes = prizes.map((prize, i) => 
      i === index ? { ...prize, ...updates } : prize
    );
    onChange(newPrizes);
  };

  const removePrize = (index: number) => {
    onChange(prizes.filter((_, i) => i !== index));
  };

  const getPrizeIcon = (type: PrizeType) => {
    switch (type) {
      case 'cash': return DollarSign;
      case 'credits': return CreditCard;
      case 'free_plan': return Gift;
      case 'coupon': return Ticket;
      case 'voucher': return Ticket;
      case 'swag': return Package;
      case 'shirt': return Shirt;
      default: return Gift;
    }
  };

  const prizeTypes: { value: PrizeType; label: string }[] = [
    { value: 'cash', label: 'Cash' },
    { value: 'credits', label: 'Credits' },
    { value: 'free_plan', label: 'Free Plan' },
    { value: 'coupon', label: 'Coupon' },
    { value: 'voucher', label: 'Voucher' },
    { value: 'swag', label: 'Swag' },
    { value: 'shirt', label: 'Shirt' }
  ];

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-300">Prizes</label>
        <button
          type="button"
          onClick={addPrize}
          className="px-3 py-1 text-purple-400 hover:bg-purple-500/20 rounded text-sm"
        >
          + Add Prize
        </button>
      </div>
      
      <div className="space-y-3">
        {prizes.map((prize, index) => {
          const Icon = getPrizeIcon(prize.type);
          return (
            <div key={index} className="p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-purple-400 mt-2" />
                
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={prize.type}
                      onChange={(e) => updatePrize(index, { type: e.target.value as PrizeType })}
                      className="px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
                    >
                      {prizeTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    
                    {(prize.type === 'cash' || prize.type === 'credits') && (
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={prize.amount || 0}
                          onChange={(e) => updatePrize(index, { amount: parseInt(e.target.value) || 0 })}
                          className="flex-1 px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
                          placeholder="Amount"
                        />
                        <select
                          value={prize.currency || '€'}
                          onChange={(e) => updatePrize(index, { currency: e.target.value })}
                          className="px-2 py-2 bg-black/30 border border-purple-500/30 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
                        >
                          <option value="€">€</option>
                          <option value="$">$</option>
                          <option value="£">£</option>
                        </select>
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="text"
                    value={prize.details}
                    onChange={(e) => updatePrize(index, { details: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
                    placeholder="Prize description (e.g., €50 cash prize, Free 6-month plan)"
                  />
                </div>
                
                {prizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrize(index)}
                    className="px-2 py-1 text-red-400 hover:bg-red-500/20 rounded text-sm"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          );
        })}
        
        {prizes.length === 0 && (
          <div className="p-4 border-2 border-dashed border-gray-600 rounded-lg text-center">
            <p className="text-gray-400 text-sm">No prizes added yet</p>
            <button
              type="button"
              onClick={addPrize}
              className="mt-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400 hover:bg-purple-500/30 transition-colors text-sm"
            >
              Add First Prize
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrizeInput;