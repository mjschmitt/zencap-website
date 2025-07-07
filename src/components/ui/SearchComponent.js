import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const SearchComponent = ({ 
  placeholder = "Search models, insights, and solutions...", 
  onSearch,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sample search data - in a real app, this would come from an API
  const searchData = useMemo(() => [
    { title: 'Commercial Acquisition Model', type: 'model', url: '/models/commercial-acquisition-model', description: 'Real estate acquisition analysis' },
    { title: 'Tesla 3-Statement Model', type: 'model', url: '/models/tesla-3-statement-model', description: 'Financial modeling for Tesla' },
    { title: 'DCF Valuation Suite', type: 'model', url: '/models/dcf-valuation-suite', description: 'Discounted cash flow models' },
    { title: 'Financial Modeling Services', type: 'solution', url: '/solutions/financial-modeling', description: 'Custom financial modeling' },
    { title: 'Investment Infrastructure', type: 'solution', url: '/solutions/infrastructure', description: 'End-to-end investment systems' },
    { title: 'Industry Research', type: 'solution', url: '/solutions/research', description: 'Specialized market research' },
    { title: 'AI Impact on SaaS Valuations', type: 'insight', url: '/insights/ai-impact-saas-valuations', description: 'Market analysis and trends' },
    { title: 'Multifamily Investment Analysis', type: 'insight', url: '/insights/multifamily-investment-interest-rates', description: 'Interest rate impact study' },
  ], []);

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchQuery) => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const filteredResults = searchData.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setResults(filteredResults.slice(0, 8)); // Limit to 8 results
        setIsLoading(false);
      }, 300);
    },
    [searchData]
  );

  // Debounced version of the search function
  const debouncedSearchHandler = useMemo(
    () => debounce(debouncedSearch, 300),
    [debouncedSearch]
  );

  useEffect(() => {
    debouncedSearchHandler(query);
  }, [query, debouncedSearchHandler]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleResultClick = (result) => {
    setQuery('');
    setIsOpen(false);
    if (onSearch) {
      onSearch(result);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'model':
        return 'bg-blue-100 text-blue-800';
      case 'solution':
        return 'bg-green-100 text-green-800';
      case 'insight':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full px-4 py-2 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-teal-400"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600 max-h-96 overflow-y-auto"
          >
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <Link
                    key={index}
                    href={result.url}
                    className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {result.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {result.description}
                        </p>
                      </div>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                        {result.type}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : query.length > 1 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                No results found for &quot;{query}&quot;
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                Start typing to search...
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default SearchComponent;