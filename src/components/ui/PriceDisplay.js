export default function PriceDisplay({ 
  price, 
  size = 'md', 
  showCurrency = true,
  className = '',
  originalPrice = null // For showing discounts
}) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl'
  };

  const formatPrice = (amount) => {
    if (!amount) return 'Contact';
    return amount.toLocaleString();
  };

  return (
    <div className={`flex items-baseline ${className}`}>
      {originalPrice && originalPrice > price && (
        <span className="text-sm text-gray-500 line-through mr-2">
          ${formatPrice(originalPrice)}
        </span>
      )}
      
      <span className={`font-bold text-teal-500 ${sizes[size]}`}>
        {showCurrency && '$'}{formatPrice(price)}
      </span>
      
      {showCurrency && price && (
        <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
          USD
        </span>
      )}
    </div>
  );
}