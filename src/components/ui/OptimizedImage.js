// src/components/ui/OptimizedImage.js
import Image from 'next/image';

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  objectFit = 'cover',
  placeholder = 'blur',
  blurDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJ5AbJ5xQAAAABJRU5ErkJggg=='
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        style={{ objectFit }}
        className="transition-all duration-500"
      />
    </div>
  );
}