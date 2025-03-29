// src/components/ui/Button.js
import Link from 'next/link';

export default function Button({ 
  children, 
  href, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  fullWidth = false,
  type = 'button'
}) {
  // Variant styles
  const variants = {
    primary: 'bg-navy-700 hover:bg-navy-900 text-white',
    secondary: 'bg-white border border-navy-700 text-navy-700 hover:bg-gray-50',
    accent: 'bg-gold-500 hover:bg-gold-600 text-navy-900',
    ghost: 'bg-transparent hover:bg-gray-50 text-navy-700'
  };
  
  // Size styles
  const sizes = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg'
  };
  
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center rounded font-medium focus:outline-none transition duration-150 ease-in-out';
  
  // Combined styles
  const buttonStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;
  
  // Return as link or button
  if (href) {
    return (
      <Link href={href}>
        <div className={buttonStyles}>
          {children}
        </div>
      </Link>
    );
  }
  
  return (
    <button
      type={type}
      className={buttonStyles}
      onClick={onClick}
    >
      {children}
    </button>
  );
}