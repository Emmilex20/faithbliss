/* eslint-disable react-refresh/only-export-components */
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Phone } from 'lucide-react';

export interface Country {
  name: string;
  code: string;
  dialCode: string;
}

// Global country list with dial codes
export const countries: Country[] = [
  { name: 'United States', code: 'US', dialCode: '+1' },
  { name: 'Canada', code: 'CA', dialCode: '+1' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
  { name: 'Australia', code: 'AU', dialCode: '+61' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64' },
  { name: 'Germany', code: 'DE', dialCode: '+49' },
  { name: 'France', code: 'FR', dialCode: '+33' },
  { name: 'Italy', code: 'IT', dialCode: '+39' },
  { name: 'Spain', code: 'ES', dialCode: '+34' },
  { name: 'Portugal', code: 'PT', dialCode: '+351' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31' },
  { name: 'Belgium', code: 'BE', dialCode: '+32' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41' },
  { name: 'Austria', code: 'AT', dialCode: '+43' },
  { name: 'Sweden', code: 'SE', dialCode: '+46' },
  { name: 'Norway', code: 'NO', dialCode: '+47' },
  { name: 'Denmark', code: 'DK', dialCode: '+45' },
  { name: 'Finland', code: 'FI', dialCode: '+358' },
  { name: 'Ireland', code: 'IE', dialCode: '+353' },
  { name: 'Poland', code: 'PL', dialCode: '+48' },
  { name: 'Czech Republic', code: 'CZ', dialCode: '+420' },
  { name: 'Romania', code: 'RO', dialCode: '+40' },
  { name: 'Greece', code: 'GR', dialCode: '+30' },
  { name: 'Turkey', code: 'TR', dialCode: '+90' },
  { name: 'Russia', code: 'RU', dialCode: '+7' },
  { name: 'Ukraine', code: 'UA', dialCode: '+380' },
  { name: 'India', code: 'IN', dialCode: '+91' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880' },
  { name: 'China', code: 'CN', dialCode: '+86' },
  { name: 'Japan', code: 'JP', dialCode: '+81' },
  { name: 'South Korea', code: 'KR', dialCode: '+82' },
  { name: 'Hong Kong', code: 'HK', dialCode: '+852' },
  { name: 'Singapore', code: 'SG', dialCode: '+65' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60' },
  { name: 'Thailand', code: 'TH', dialCode: '+66' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84' },
  { name: 'Philippines', code: 'PH', dialCode: '+63' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94' },
  { name: 'Nepal', code: 'NP', dialCode: '+977' },
  { name: 'UAE', code: 'AE', dialCode: '+971' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966' },
  { name: 'Qatar', code: 'QA', dialCode: '+974' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965' },
  { name: 'Israel', code: 'IL', dialCode: '+972' },
  { name: 'Jordan', code: 'JO', dialCode: '+962' },
  { name: 'Lebanon', code: 'LB', dialCode: '+961' },
  { name: 'Egypt', code: 'EG', dialCode: '+20' },
  { name: 'Morocco', code: 'MA', dialCode: '+212' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213' },
  { name: 'Tunisia', code: 'TN', dialCode: '+216' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27' },
  { name: 'Kenya', code: 'KE', dialCode: '+254' },
  { name: 'Ghana', code: 'GH', dialCode: '+233' },
  { name: 'Ethiopia', code: 'ET', dialCode: '+251' },
  { name: 'Uganda', code: 'UG', dialCode: '+256' },
  { name: 'Tanzania', code: 'TZ', dialCode: '+255' },
  { name: 'Rwanda', code: 'RW', dialCode: '+250' },
  { name: 'Zimbabwe', code: 'ZW', dialCode: '+263' },
  { name: 'Angola', code: 'AO', dialCode: '+244' },
  { name: 'Namibia', code: 'NA', dialCode: '+264' },
  { name: 'Botswana', code: 'BW', dialCode: '+267' },
  { name: 'Senegal', code: 'SN', dialCode: '+221' },
  { name: 'Cameroon', code: 'CM', dialCode: '+237' },
  { name: 'Ivory Coast', code: 'CI', dialCode: '+225' },
  { name: 'Argentina', code: 'AR', dialCode: '+54' },
  { name: 'Brazil', code: 'BR', dialCode: '+55' },
  { name: 'Chile', code: 'CL', dialCode: '+56' },
  { name: 'Colombia', code: 'CO', dialCode: '+57' },
  { name: 'Peru', code: 'PE', dialCode: '+51' },
  { name: 'Venezuela', code: 'VE', dialCode: '+58' },
  { name: 'Uruguay', code: 'UY', dialCode: '+598' },
  { name: 'Paraguay', code: 'PY', dialCode: '+595' },
  { name: 'Bolivia', code: 'BO', dialCode: '+591' },
  { name: 'Mexico', code: 'MX', dialCode: '+52' },
  { name: 'Guatemala', code: 'GT', dialCode: '+502' },
  { name: 'Costa Rica', code: 'CR', dialCode: '+506' },
  { name: 'Panama', code: 'PA', dialCode: '+507' },
  { name: 'Dominican Republic', code: 'DO', dialCode: '+1' },
  { name: 'Jamaica', code: 'JM', dialCode: '+1' },
];

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

// Default country (United States)
export const defaultCountry = countries[0];
