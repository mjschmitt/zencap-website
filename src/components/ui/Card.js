export default function Card({ 
  children, 
  className = '', 
  padding = true, 
  shadow = true,
  border = true,
  rounded = true
}) {
  // Base styles
  const baseStyles = 'bg-white';
  
  // Optional styles
  const paddingStyles = padding ? 'p-6' : '';
  const shadowStyles = shadow ? 'shadow-md' : '';
  const borderStyles = border ? 'border border-gray-200' : '';
  const roundedStyles = rounded ? 'rounded-lg' : '';
  
  // Combined styles
  const cardStyles = `${baseStyles} ${paddingStyles} ${shadowStyles} ${borderStyles} ${roundedStyles} ${className}`;
  
  return (
    <div className={cardStyles}>
      {children}
    </div>
  );
}