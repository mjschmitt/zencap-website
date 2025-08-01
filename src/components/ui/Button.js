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
  // Variant styles with consistent colors
  const variants = {
    primary: 'bg-navy-700 hover:bg-teal-600 text-white dark:bg-teal-500 dark:hover:bg-teal-400',
    secondary: 'bg-white border border-navy-700 text-navy-700 hover:bg-teal-50 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600',
    accent: 'bg-teal-500 hover:bg-teal-600 text-white',
    ghost: 'bg-transparent hover:bg-gray-50 text-navy-700'
  };
  
  // Size styles
  const sizes = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg'
  };
  
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition duration-150 ease-in-out';
  
  // Combined styles
  const buttonStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;
  
  // Return as link or button
  if (href) {
    return (
      <Link href={href} className={buttonStyles}>
        {children}
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