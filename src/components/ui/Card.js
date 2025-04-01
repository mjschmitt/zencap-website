export default function Card({ 
  children, 
  className = '', 
  padding = true, 
  shadow = true,
  border = true,
  rounded = true
}) {
  // Base styles
  const baseStyles = 'bg-white dark:bg-navy-800';
  
  // Optional styles
  const paddingStyles = padding ? 'p-6' : '';
  const shadowStyles = shadow ? 'shadow-md dark:shadow-navy-900/30' : '';
  const borderStyles = border ? 'border border-gray-200 dark:border-navy-700' : '';
  const roundedStyles = rounded ? 'rounded-lg' : '';
  
  // Combined styles
  const cardStyles = `${baseStyles} ${paddingStyles} ${shadowStyles} ${borderStyles} ${roundedStyles} ${className}`;
  
  return (
    <div className={cardStyles}>
      {children}
    </div>
  );
}