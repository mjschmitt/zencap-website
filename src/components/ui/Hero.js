import Button from './Button';

export default function Hero({
  title,
  subtitle,
  buttonText,
  buttonLink,
  secondaryButtonText,
  secondaryButtonLink,
  backgroundImage,
  overlay = true,
  fullHeight = false,
  alignment = 'center'
}) {
  // Background styles
  const backgroundStyles = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}; // We'll use a class instead for solid color
  
  // Overlay class
  const overlayClass = overlay ? 'relative bg-gradient-to-r from-navy-900/80 to-navy-900/60' : '';
  
  // Height styles
  const heightClass = fullHeight ? 'min-h-screen' : 'py-20';
  
  // Alignment styles
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  };
  
  return (
    <div 
      className={`${heightClass} flex flex-col justify-center ${overlayClass} bg-navy-700`} 
      style={backgroundStyles}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className={`flex flex-col ${alignmentClasses[alignment]} max-w-4xl mx-auto`}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-xl sm:text-2xl text-gray-200 mb-8">
              {subtitle}
            </p>
          )}
          
          <div className={`flex ${alignment === 'center' ? 'justify-center' : ''} space-x-4 flex-wrap`}>
            {buttonText && (
              <div className="mb-4">
                <Button href={buttonLink} variant="accent" size="lg">
                  {buttonText}
                </Button>
              </div>
            )}
            
            {secondaryButtonText && (
              <div className="mb-4">
                <Button href={secondaryButtonLink} variant="secondary" size="lg">
                  {secondaryButtonText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}