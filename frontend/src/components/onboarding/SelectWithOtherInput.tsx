import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface SelectWithOtherInputProps {
  label: string;
  name: string;
  options: string[];
  selectedValue: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
}

const SelectWithOtherInput: React.FC<SelectWithOtherInputProps> = ({
  label,
  name,
  options,
  selectedValue,
  onChange,
  placeholder,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(selectedValue && !options.includes(selectedValue));
  const [customValue, setCustomValue] = useState(isOtherSelected ? selectedValue : '');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      return;
    }
    searchInputRef.current?.focus();
  }, [isOpen]);

  const formatOptionLabel = (value: string) =>
    value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const filteredOptions = useMemo(
    () => options.filter((option) => formatOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())),
    [options, searchTerm]
  );

  const handleSelectValue = (value: string) => {
    if (value === 'OTHER') {
      setIsOtherSelected(true);
      setIsOpen(false);
      onChange(name, customValue);
    } else {
      setIsOtherSelected(false);
      setCustomValue('');
      setIsOpen(false);
      onChange(name, value);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomValue(value);
    onChange(name, value);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div ref={dropdownRef} className="relative">
        <button
          id={name}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="input-style flex w-full items-center justify-between gap-3 text-left"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={`truncate ${selectedValue ? 'text-white' : 'text-slate-400'}`}>
            {isOtherSelected
              ? customValue || 'Other'
              : selectedValue
                ? formatOptionLabel(selectedValue)
                : placeholder || `Select your ${label.toLowerCase()}`}
          </span>
          <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-slate-600/60 bg-slate-900/98 shadow-2xl backdrop-blur-md">
            <div className="border-b border-slate-700/70 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-400 outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = !isOtherSelected && selectedValue === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelectValue(option)}
                      className={`w-full px-4 py-2.5 text-left text-sm transition sm:text-base ${
                        isSelected ? 'bg-pink-500/20 text-pink-100' : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {formatOptionLabel(option)}
                    </button>
                  );
                })
              ) : (
                <p className="px-4 py-3 text-sm text-slate-400">No matching options.</p>
              )}

              <button
                type="button"
                onClick={() => handleSelectValue('OTHER')}
                className={`w-full px-4 py-2.5 text-left text-sm transition sm:text-base ${
                  isOtherSelected ? 'bg-pink-500/20 text-pink-100' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                Other
              </button>
            </div>
          </div>
        )}
      </div>
      {isOtherSelected && (
        <input
          type="text"
          name={`${name}-other`}
          value={customValue}
          onChange={handleCustomInputChange}
          placeholder={`Enter your ${label.toLowerCase()}`}
          className="input-style w-full mt-2"
        />
      )}
    </div>
  );
};

export default SelectWithOtherInput;
