import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Phone } from 'lucide-react';
import { countries, type Country } from '@/constants/countries';

interface CountryCodeSelectProps {
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
}

const getFlag = (countryCode: string) =>
  countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));

export const CountryCodeSelect = ({
  selectedCountry,
  onCountryChange,
  phoneNumber,
  onPhoneChange,
}: CountryCodeSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country: Country) => {
    onCountryChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Country Code <span className="text-pink-500">*</span>
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white transition-all flex items-center justify-between text-sm md:text-base"
        >
          <div className="flex items-center space-x-2 overflow-hidden">
            <span className="text-lg">{getFlag(selectedCountry.code)}</span>
            <span>{selectedCountry.dialCode}</span>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 max-h-64 overflow-hidden">
            <div className="p-3 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={`${country.code}-${country.dialCode}`}
                    onClick={() => handleCountrySelect(country)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-700 focus:bg-gray-700 transition-colors flex items-center space-x-3"
                  >
                    <span className="text-lg">{getFlag(country.code)}</span>
                    <span className="text-white text-sm truncate">{country.name}</span>
                    <span className="text-gray-400 text-sm ml-auto">{country.dialCode}</span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-gray-400 text-sm text-center">No countries found</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Phone Number <span className="text-pink-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="w-full p-3 pl-12 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white placeholder-gray-500 transition-all text-sm md:text-base"
            placeholder="Enter your phone number"
          />
        </div>
      </div>
    </div>
  );
};

