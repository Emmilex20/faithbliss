/* eslint-disable no-irregular-whitespace */
// src/components/FilterPanel.tsx (Vite/React Conversion)

/* eslint-disable @typescript-eslint/no-explicit-any */
// Removed: 'use client'; // 🌟 VITE FIX 1: Remove Next.js-specific directive

import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

export const FilterPanel = ({ onClose, onApplyFilters }: FilterPanelProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [distance, setDistance] = useState(25);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(35);
  const [faithJourney, setFaithJourney] = useState('');
  const [relationshipGoals, setRelationshipGoals] = useState('');
  const [denomination, setDenomination] = useState('');
  const [gender, setGender] = useState('');

  const handleApply = () => {
    onApplyFilters({
      maxDistance: distance,
      minAge,
      maxAge,
      preferredFaithJourney: faithJourney ? [faithJourney] : undefined,
      preferredRelationshipGoals: relationshipGoals ? [relationshipGoals] : undefined,
      preferredDenominations: denomination ? [denomination] : undefined,
      preferredGender: gender,
    });
    onClose();
  };

  const handleReset = () => {
    setDistance(25);
    setMinAge(18);
    setMaxAge(35);
    setFaithJourney('');
    setRelationshipGoals('');
    setDenomination('');
    setGender('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center">
              <Filter className="w-6 h-6 text-pink-400 mr-3" />
              Find Your Match
            </h3>
            <p className="text-gray-400 text-sm mt-1">Customize your discovery preferences</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        // 🌟 VITE FIX 2: You can keep these styles, but ensure your CSS setup includes 
        // Tailwind/PostCSS that recognizes custom utilities like 'scrollbar-thin' 
        // or rely on a global custom-scrollbar class for webkit/moz scrollbar styles.
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(236, 72, 153, 0.4) transparent'
        }}
      >
        {/* Gender Filter */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-2xl p-5 border border-indigo-500/20">
          <label className="block text-sm font-bold text-indigo-300 mb-3 uppercase tracking-wide">Gender</label>
          <select 
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-3 bg-gray-800/50 border border-indigo-500/30 rounded-xl text-white focus:border-indigo-400 focus:outline-none transition-colors"
          >
            <option value="">Any</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>

        {/* Distance Filter */}
        <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-2xl p-5 border border-pink-500/20">
          <label className="block text-sm font-bold text-pink-300 mb-3 uppercase tracking-wide">Distance Range</label>
          <input
            type="range"
            min="1"
            max="50"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>1 km</span>
            <span className="text-pink-400 font-semibold">{distance} km</span>
            <span>50 km</span>
          </div>
        </div>

        {/* Age Range */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-5 border border-blue-500/20">
          <label className="block text-sm font-bold text-blue-300 mb-3 uppercase tracking-wide">Age Range</label>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              placeholder="18"
              min="18"
              max="100"
              value={minAge}
              onChange={(e) => setMinAge(Number(e.target.value))}
              className="w-20 p-3 bg-gray-800/50 border border-blue-500/30 rounded-xl text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none transition-colors text-center"
            />
            <span className="text-gray-400 text-sm font-medium">to</span>
            <input
              type="number"
              placeholder="35"
              min="18"
              max="100"
              value={maxAge}
              onChange={(e) => setMaxAge(Number(e.target.value))}
              className="w-20 p-3 bg-gray-800/50 border border-blue-500/30 rounded-xl text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none transition-colors text-center"
            />
            <span className="text-gray-400 text-xs">years old</span>
          </div>
        </div>

        {/* Faith Journey */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-5 border border-emerald-500/20">
          <label className="block text-sm font-bold text-emerald-300 mb-3 uppercase tracking-wide">Faith Journey</label>
          <select 
            value={faithJourney}
            onChange={(e) => setFaithJourney(e.target.value)}
            className="w-full p-3 bg-gray-800/50 border border-emerald-500/30 rounded-xl text-white focus:border-emerald-400 focus:outline-none transition-colors"
          >
            <option value="">All faith levels</option>
            <option value="EXPLORING">🌱 Exploring Faith</option>
            <option value="GROWING">🌿 Growing in Faith</option>
            <option value="ROOTED">🌳 Rooted in Faith</option>
          </select>
        </div>

        {/* Relationship Goals */}
        <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-2xl p-5 border border-rose-500/20">
          <label className="block text-sm font-bold text-rose-300 mb-3 uppercase tracking-wide">Looking For</label>
          <select 
            value={relationshipGoals}
            onChange={(e) => setRelationshipGoals(e.target.value)}
            className="w-full p-3 bg-gray-800/50 border border-rose-500/30 rounded-xl text-white focus:border-rose-400 focus:outline-none transition-colors"
          >
            <option value="">Any relationship type</option>
            <option value="RELATIONSHIP">💕 Dating with Purpose</option>
            <option value="MARRIAGE_MINDED">💍 Marriage-Minded</option>
          </select>
        </div>

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-2xl text-white transition-all flex items-center justify-between group"
        >
          <span className="font-semibold">Advanced Filters</span>
          <ChevronDown className={`w-5 h-5 transition-transform group-hover:scale-110 ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 animate-in slide-in-from-top duration-300">
            <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-2xl p-5 border border-purple-500/20">
              <label className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wide">Denomination</label>
              <select 
                value={denomination}
                onChange={(e) => setDenomination(e.target.value)}
                className="w-full p-3 bg-gray-800/50 border border-purple-500/30 rounded-xl text-white text-sm focus:border-purple-400 focus:outline-none transition-colors"
              >
                <option value="">Any denomination</option>
                <option value="BAPTIST">🙏 Baptist</option>
                <option value="METHODIST">📖 Methodist</option>
                <option value="CATHOLIC">✝️ Catholic</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-700/50 space-y-3">
        <button 
          onClick={handleApply}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white py-2 rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
        >
          Apply Filters
        </button>
        <button 
          onClick={handleReset}
          className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 py-2 rounded-2xl font-medium transition-colors"
        >
          Reset All
        </button>
      </div>
    </div>
  );
};