import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Gift, Package, Shirt, Ticket } from 'lucide-react';
import { useHackathon, Goodie, GoodieType } from '../contexts/HackathonContext';

interface GoodieEditorProps {
  onNavigate: (screen: string, data?: any) => void;
  uiState: string;
  formData: any;
  isInline?: boolean;
  onCancel?: () => void;
}

const GoodieEditor: React.FC<GoodieEditorProps> = ({ 
  onNavigate, 
  uiState, 
  formData,
  isInline = false,
  onCancel
}) => {
  const { state, updateGoodie, createGoodie } = useHackathon();
  const { goodies, currentUser } = state;
  const [goodie, setGoodie] = useState<Partial<Goodie>>({
    type: 'free_trial',
    title: '',
    description: '',
    details: '',
    quantity: undefined,
    forEveryone: true,
    sponsorId: currentUser?.id || ''
  });
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (formData?.goodieId) {
      const existingGoodie = goodies.find(g => g.id === formData.goodieId);
      if (existingGoodie) {
        setGoodie(existingGoodie);
        setIsEditing(true);
      }
    }
  }, [formData?.goodieId, goodies]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEditing && goodie.id) {
        await updateGoodie(goodie.id, goodie);
      } else {
        await createGoodie({
          ...goodie,
          sponsorId: currentUser?.id || ''
        } as Omit<Goodie, 'id'>);
      }
      if (isInline && onCancel) {
        onCancel();
      } else {
        onNavigate('sponsorDashboard');
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isInline && onCancel) {
      onCancel();
    } else {
      onNavigate('sponsorDashboard');
    }
  };

  const getGoodieIcon = (type: GoodieType) => {
    switch (type) {
      case 'free_trial': return Gift;
      case 'coupon': return Ticket;
      case 'swag': return Package;
      case 'shirt_pickup': return Shirt;
      default: return Gift;
    }
  };

  const goodieTypes: { value: GoodieType; label: string; description: string }[] = [
    { value: 'free_trial', label: 'Free Trial', description: 'Free trial access for everyone' },
    { value: 'coupon', label: 'Coupon', description: 'Discount coupon code' },
    { value: 'swag', label: 'Swag', description: 'Physical swag items' },
    { value: 'shirt_pickup', label: 'Shirt (Pickup)', description: 'T-shirts for pickup at event' }
  ];

  const Icon = getGoodieIcon(goodie.type || 'free_trial');

  return (
    <div className={isInline ? "space-y-6" : "quiz-panel"}>
      {!isInline && <div className="quiz-header">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? 'Edit Goodie' : 'New Goodie'}
            </h2>
          </div>
        </div>
      </div>}

      {isInline && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {isEditing ? 'Edit Goodie' : 'New Goodie'}
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="space-y-6 flex-1 overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Icon className="w-4 h-4 inline mr-2" />
            Goodie Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {goodieTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setGoodie(prev => ({ ...prev, type: type.value }))}
                className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                  goodie.type === type.value
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                    : 'bg-black/20 border-white/10 text-gray-400 hover:border-purple-500/30'
                }`}
              >
                <div className="font-medium">{type.label}</div>
                <div className="text-xs text-gray-500">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={goodie.title || ''}
              onChange={(e) => setGoodie(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="Enter goodie title"
            />
          </div>

          {(goodie.type === 'swag' || goodie.type === 'shirt_pickup') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={goodie.quantity || ''}
                onChange={(e) => setGoodie(prev => ({ ...prev, quantity: parseInt(e.target.value) || undefined }))}
                className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                placeholder="Available quantity"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={goodie.description || ''}
            onChange={(e) => setGoodie(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            placeholder="Describe the goodie"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Details
          </label>
          <input
            type="text"
            value={goodie.details || ''}
            onChange={(e) => setGoodie(prev => ({ ...prev, details: e.target.value }))}
            className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            placeholder="Additional details (e.g., coupon code, pickup instructions)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            URL (coupon / free trial / instructions)
          </label>
          <input
            type="url"
            value={goodie.url || ''}
            onChange={(e) => setGoodie(prev => ({ ...prev, url: e.target.value }))}
            className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            placeholder="https://example.com/redeem"
          />
        </div>

        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={goodie.forEveryone || false}
              onChange={(e) => setGoodie(prev => ({ ...prev, forEveryone: e.target.checked }))}
              className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
            />
            <span className="text-white">Available for everyone</span>
          </label>
          <p className="text-xs text-gray-400 mt-1">
            If unchecked, goodie will be limited by quantity or other restrictions
          </p>
        </div>
      </div>

      <div className={isInline ? "flex gap-2 justify-end" : "quiz-actions"}>
        {isInline && (
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 hover:bg-gray-500/30 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !goodie.title}
          className={isInline ? "px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50" : "quiz-btn primary"}
        >
          {!isInline && <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Goodie'}
        </button>
      </div>
    </div>
  );
};

export default GoodieEditor;