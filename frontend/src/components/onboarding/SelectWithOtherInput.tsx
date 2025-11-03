import React, { useState } from 'react';

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
  const [isOtherSelected, setIsOtherSelected] = useState(selectedValue && !options.includes(selectedValue));
  const [customValue, setCustomValue] = useState(isOtherSelected ? selectedValue : '');

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'OTHER') {
      setIsOtherSelected(true);
      onChange(name, customValue);
    } else {
      setIsOtherSelected(false);
      setCustomValue('');
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
      <select
        id={name}
        name={name}
        value={isOtherSelected ? 'OTHER' : selectedValue}
        onChange={handleSelectChange}
        className="input-style w-full"
      >
        <option value="" disabled>{placeholder || `Select your ${label.toLowerCase()}`}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value="OTHER">Other</option>
      </select>
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
