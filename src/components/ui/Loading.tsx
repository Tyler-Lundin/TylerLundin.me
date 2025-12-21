import React from 'react';

type LoadingVariant = 'spinner' | 'dots' | 'bar';
type LoadingSize = 'sm' | 'md' | 'lg';

export type LoadingProps = {
  message?: string;
  variant?: LoadingVariant;
  size?: LoadingSize;
  fullScreen?: boolean;
  className?: string;
};

function sizeClasses(size: LoadingSize) {
  switch (size) {
    case 'sm':
      return { box: 'w-6 h-6', dot: 'w-1.5 h-1.5', barH: 'h-1.5' };
    case 'lg':
      return { box: 'w-16 h-16', dot: 'w-3.5 h-3.5', barH: 'h-3' };
    case 'md':
    default:
      return { box: 'w-10 h-10', dot: 'w-2.5 h-2.5', barH: 'h-2' };
  }
}

function Spinner({ size }: { size: LoadingSize }) {
  const { box } = sizeClasses(size);
  return (
    <div
      className={`inline-block ${box} animate-spin rounded-full border-4 border-neutral-200 dark:border-neutral-800 border-t-neutral-900 dark:border-t-white`}
      aria-hidden
    />
  );
}

function Dots({ size }: { size: LoadingSize }) {
  const { dot } = sizeClasses(size);
  const delays = ['0ms', '150ms', '300ms'];
  return (
    <div className="flex items-end gap-1" aria-hidden>
      {delays.map((delay, i) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={`${dot} rounded-full bg-neutral-900 dark:bg-white animate-bounce`}
          style={{ animationDelay: delay }}
        />
      ))}
    </div>
  );
}

function Bar({ size }: { size: LoadingSize }) {
  const { barH } = sizeClasses(size);
  return (
    <div className={`w-52 max-w-[80vw] ${barH} rounded-full bg-neutral-200/70 dark:bg-neutral-800/70 overflow-hidden`} aria-hidden>
      <div className={`h-full w-1/2 rounded-full bg-gradient-to-r from-neutral-400 via-neutral-900 to-neutral-400 dark:from-neutral-500 dark:via-white dark:to-neutral-500 animate-pulse`} />
    </div>
  );
}

export function Loading({
  message,
  variant = 'spinner',
  size = 'md',
  fullScreen = false,
  className = '',
}: LoadingProps) {
  const Wrapper = fullScreen ? 'div' : 'div';

  return (
    <Wrapper
      className={[
        fullScreen ? 'min-h-[60vh] md:min-h-[70vh] flex items-center justify-center' : 'py-8',
        'text-black dark:text-white',
        className,
      ].join(' ')}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3">
        {variant === 'spinner' && <Spinner size={size} />}
        {variant === 'dots' && <Dots size={size} />}
        {variant === 'bar' && <Bar size={size} />}
        <span className="sr-only">Loading</span>
        {message && (
          <p className="text-sm md:text-base opacity-80 tracking-wide">
            {message}
          </p>
        )}
      </div>
    </Wrapper>
  );
}

export default Loading;

