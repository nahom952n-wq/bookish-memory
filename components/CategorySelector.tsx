'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedId?: string;
  onSelect: (categoryId: string) => void;
  onCreateNew?: (name: string, icon: string, color: string) => void;
}

export default function CategorySelector({
  categories,
  selectedId,
  onSelect,
  onCreateNew,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📁');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  const selected = categories.find((c) => c.id === selectedId);

  const icons = ['🍔', '🚗', '💡', '🎬', '🛍️', '🏥', '💰', '📈', '📁'];
  const colors = [
    '#F59E0B',
    '#3B82F6',
    '#10B981',
    '#8B5CF6',
    '#EC4899',
    '#EF4444',
    '#14B8A6',
    '#F97316',
    '#6366F1',
  ];

  const handleCreateCategory = () => {
    if (newCategoryName.trim() && onCreateNew) {
      onCreateNew(newCategoryName, selectedIcon, selectedColor);
      setNewCategoryName('');
      setShowCreate(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          {selected ? (
            <>
              <span className="text-2xl">{selected.icon}</span>
              <span className="text-gray-800 font-medium">{selected.name}</span>
            </>
          ) : (
            <span className="text-gray-500">Select Category</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-600 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="max-h-64 overflow-y-auto p-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  onSelect(category.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                  selectedId === category.id
                    ? 'bg-blue-100 border border-blue-500'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="flex-1 text-left text-gray-800 font-medium">{category.name}</span>
              </button>
            ))}
          </div>

          {onCreateNew && (
            <>
              <div className="border-t border-gray-200 p-2">
                {!showCreate ? (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                  >
                    + Add New Category
                  </button>
                ) : (
                  <div className="space-y-3 p-2">
                    <input
                      type="text"
                      placeholder="Category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />

                    <div>
                      <label className="text-xs font-semibold text-gray-600">Icon</label>
                      <div className="grid grid-cols-5 gap-2 mt-1">
                        {icons.map((icon) => (
                          <button
                            key={icon}
                            onClick={() => setSelectedIcon(icon)}
                            className={`text-2xl p-2 rounded-lg transition ${
                              selectedIcon === icon ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-100'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600">Color</label>
                      <div className="grid grid-cols-5 gap-2 mt-1">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`w-8 h-8 rounded-full transition ${
                              selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCreate(false)}
                        className="flex-1 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateCategory}
                        disabled={!newCategoryName.trim()}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
