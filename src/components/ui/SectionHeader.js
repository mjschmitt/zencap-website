// src/components/ui/SectionHeader.js
import Motion from './Motion';

export default function SectionHeader({
  title,
  subtitle,
  centered = true,
  dark = false,
  animation = true
}) {
  const Component = ({ children }) => {
    if (animation) {
      return (
        <Motion animation="fade" direction="up">
          {children}
        </Motion>
      );
    }
    return <>{children}</>;
  };

  return (
    <div className={`mb-12 ${centered ? 'text-center' : 'text-left'}`}>
      <Component>
        <h2 className={`text-3xl md:text-4xl font-bold font-serif mb-4 ${dark ? 'text-white' : 'text-navy-700'} dark:text-white`}>
          {title}
        </h2>
      </Component>
      
      {subtitle && (
        <Component>
          <p className={`text-lg md:text-xl max-w-3xl ${centered ? 'mx-auto' : ''} ${dark ? 'text-gray-300' : 'text-gray-600'} dark:text-gray-300`}>
            {subtitle}
          </p>
        </Component>
      )}
    </div>
  );
}