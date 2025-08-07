import { motion } from 'framer-motion';

export default function LoadingSkeleton({ 
  variant = 'card', 
  count = 1, 
  className = '',
  animate = true 
}) {
  const shimmer = animate ? {
    animate: {
      x: ['0%', '100%'],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  } : {};

  const BaseDiv = animate ? motion.div : 'div';

  const variants = {
    // Model card skeleton
    card: (
      <div className={`bg-white dark:bg-navy-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <BaseDiv 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
            {...shimmer}
          />
        </div>
        <div className="p-6 space-y-3">
          <div className="flex justify-between items-center">
            <div className="relative h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <BaseDiv 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
                {...shimmer}
              />
            </div>
            <div className="relative h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <BaseDiv 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
                {...shimmer}
              />
            </div>
          </div>
          <div className="relative h-6 w-full bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
            <BaseDiv 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
              {...shimmer}
            />
          </div>
          <div className="space-y-2">
            <div className="relative h-4 w-full bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <BaseDiv 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
                {...shimmer}
              />
            </div>
            <div className="relative h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <BaseDiv 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
                {...shimmer}
              />
            </div>
          </div>
          <div className="flex justify-between gap-3 pt-4">
            <div className="relative h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <BaseDiv 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
                {...shimmer}
              />
            </div>
            <div className="relative h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <BaseDiv 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
                {...shimmer}
              />
            </div>
          </div>
        </div>
      </div>
    ),

    // Table row skeleton
    tableRow: (
      <tr className={className}>
        {[1, 2, 3, 4, 5].map(col => (
          <td key={col} className="px-6 py-4">
            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <BaseDiv 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
                {...shimmer}
              />
            </div>
          </td>
        ))}
      </tr>
    ),

    // Text lines skeleton
    text: (
      <div className={`space-y-2 ${className}`}>
        {[1, 2, 3].map(line => (
          <div key={line} className="space-y-2">
            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <BaseDiv 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
                {...shimmer}
              />
            </div>
          </div>
        ))}
        <div className="relative h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
          <BaseDiv 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
            {...shimmer}
          />
        </div>
      </div>
    ),

    // Simple line skeleton
    line: (
      <div className={`relative h-4 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden ${className}`}>
        <BaseDiv 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
          {...shimmer}
        />
      </div>
    ),

    // Circle skeleton (for avatars, etc.)
    circle: (
      <div className={`relative w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
        <BaseDiv 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
          {...shimmer}
        />
      </div>
    ),

    // Button skeleton
    button: (
      <div className={`relative h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden ${className}`}>
        <BaseDiv 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
          {...shimmer}
        />
      </div>
    )
  };

  // Render multiple skeletons if count > 1
  if (count > 1) {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }, (_, index) => (
          <div key={index}>
            {variants[variant]}
          </div>
        ))}
      </div>
    );
  }

  return variants[variant];
}

// Specialized skeletons for common use cases
export function ModelCardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {Array.from({ length: count }, (_, index) => (
        <LoadingSkeleton key={index} variant="card" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
        <tbody className="bg-white dark:bg-navy-800 divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }, (_, index) => (
            <LoadingSkeleton key={index} variant="tableRow" />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InsightCardSkeleton({ count = 3 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="bg-white dark:bg-navy-800 rounded-lg shadow-sm p-6">
          <div className="flex items-start space-x-4">
            <LoadingSkeleton variant="circle" className="w-16 h-16" animate />
            <div className="flex-1 space-y-4">
              <LoadingSkeleton variant="line" className="h-6 w-3/4" animate />
              <LoadingSkeleton variant="text" animate />
              <div className="flex space-x-2">
                <LoadingSkeleton variant="button" className="h-8 w-20" animate />
                <LoadingSkeleton variant="button" className="h-8 w-16" animate />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}