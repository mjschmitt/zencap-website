// src/components/ui/Accordion.js
import { useState } from 'react';

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {items.map((item, index) => (
        <div key={index} className="py-4">
          <button
            onClick={() => toggleItem(index)}
            className="flex justify-between items-center w-full text-left font-medium text-navy-700 focus:outline-none"
          >
            <span>{item.title}</span>
            <svg
              className={`w-5 h-5 ml-2 transform transition-transform duration-200 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            className={`mt-2 overflow-hidden transition-all duration-300 ${
              openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="text-gray-600 text-sm py-2">{item.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}