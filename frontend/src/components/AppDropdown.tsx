import React from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface AppDropdownOption {
  value: string;
  label: string;
}

interface AppDropdownProps {
  id?: string;
  value?: string;
  options: AppDropdownOption[];
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  ariaLabel?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  selectedOptionClassName?: string;
  maxMenuHeightClassName?: string;
}

const cx = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

export const AppDropdown: React.FC<AppDropdownProps> = ({
  id,
  value = '',
  options,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Search options...',
  emptyText = 'No options found.',
  ariaLabel,
  className,
  triggerClassName,
  menuClassName,
  optionClassName,
  selectedOptionClassName,
  maxMenuHeightClassName,
}) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      return;
    }
    if (searchable) {
      searchInputRef.current?.focus();
    }
  }, [isOpen, searchable]);

  const selectedOption = React.useMemo(() => options.find((option) => option.value === value), [options, value]);

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchTerm.trim()) return options;
    const lowered = searchTerm.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(lowered));
  }, [options, searchTerm, searchable]);

  return (
    <div ref={wrapperRef} className={cx('relative', className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cx(
          'flex w-full items-center justify-between gap-3 rounded-xl border border-white/20 bg-slate-950/75 px-3 py-2.5 text-left text-sm text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/40 disabled:cursor-not-allowed disabled:opacity-60',
          triggerClassName
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span className={cx('truncate', selectedOption ? 'text-white' : 'text-slate-400')}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cx('h-4 w-4 shrink-0 text-slate-400 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div
          className={cx(
            'absolute left-0 right-0 top-[calc(100%+0.45rem)] z-50 overflow-hidden rounded-2xl border border-slate-600/60 bg-slate-900/98 shadow-2xl backdrop-blur-md',
            menuClassName
          )}
        >
          {searchable && (
            <div className="border-b border-slate-700/70 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-400 outline-none focus:border-pink-500"
                />
              </div>
            </div>
          )}

          <div className={cx('overflow-y-auto py-1', maxMenuHeightClassName || 'max-h-56')}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cx(
                      'w-full px-4 py-2.5 text-left text-sm transition sm:text-base',
                      isSelected ? 'bg-pink-500/20 text-pink-100' : 'text-slate-200 hover:bg-slate-800',
                      optionClassName,
                      isSelected && selectedOptionClassName
                    )}
                  >
                    {option.label}
                  </button>
                );
              })
            ) : (
              <p className="px-4 py-3 text-sm text-slate-400">{emptyText}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppDropdown;
