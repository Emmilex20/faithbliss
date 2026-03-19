import React, { useEffect, useMemo, useState } from 'react';
import AppDropdown from '@/components/AppDropdown';

interface SelectWithOtherInputProps {
  label: string;
  name: string;
  options: string[];
  selectedValue: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  invalid?: boolean;
}

const formatOptionLabel = (value: string) =>
  value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const SelectWithOtherInput: React.FC<SelectWithOtherInputProps> = ({
  label,
  name,
  options,
  selectedValue,
  onChange,
  placeholder,
  invalid = false,
}) => {
  const fieldLabel = label.trim() || placeholder || 'option';
  const [isOtherSelected, setIsOtherSelected] = useState(Boolean(selectedValue && !options.includes(selectedValue)));
  const [customValue, setCustomValue] = useState(isOtherSelected ? selectedValue : '');

  useEffect(() => {
    const otherSelected = Boolean(selectedValue && !options.includes(selectedValue));
    setIsOtherSelected(otherSelected);
    setCustomValue(otherSelected ? selectedValue : '');
  }, [options, selectedValue]);

  const dropdownOptions = useMemo(
    () => [
      ...options.map((option) => ({ value: option, label: formatOptionLabel(option) })),
      { value: 'OTHER', label: customValue.trim() ? `Other: ${customValue.trim()}` : 'Other' },
    ],
    [customValue, options]
  );

  const selectedDropdownValue = isOtherSelected ? 'OTHER' : selectedValue || '';

  const handleSelectValue = (value: string) => {
    if (value === 'OTHER') {
      setIsOtherSelected(true);
      onChange(name, customValue);
      return;
    }

    setIsOtherSelected(false);
    setCustomValue('');
    onChange(name, value);
  };

  const handleCustomInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCustomValue(value);
    onChange(name, value);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300">
        {label}
      </label>

      <AppDropdown
        id={name}
        value={selectedDropdownValue}
        options={dropdownOptions}
        onChange={handleSelectValue}
        placeholder={placeholder || `Select your ${label.toLowerCase()}`}
        searchable
        searchPlaceholder="Search options..."
        emptyText="No matching options."
        triggerClassName="input-style flex w-full items-center justify-between gap-3 text-left"
        invalid={invalid}
      />

      {isOtherSelected && (
        <input
          type="text"
          name={`${name}-other`}
          value={customValue}
        onChange={handleCustomInputChange}
          placeholder={`Enter your ${fieldLabel.toLowerCase()}`}
          className={`input-style mt-2 w-full ${invalid && !customValue.trim() ? 'border-red-400/70' : ''}`}
        />
      )}
    </div>
  );
};

export default SelectWithOtherInput;
