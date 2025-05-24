import { useState } from "react";
import { SelectProps } from "./@types";

export const Select = ({
  options,
  onChange,
  className = "",
  defaultValue = "",
  placeholder = "Selecionar uma opção",
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
    if (onChange) onChange(value);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="w-full px-4 py-2 min-h-12 text-left border border-[#D8D6DE] rounded-md focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? selectedOption.label : placeholder}
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-[#D8D6DE] rounded-md shadow-lg">
          <ul className="overflow-auto text-base rounded-md max-h-60 focus:outline-none">
            {options.map((option) => (
              <li
                key={option.value}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  selectedValue === option.value
                    ? "bg-blue-50 text-blue-600"
                    : ""
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
