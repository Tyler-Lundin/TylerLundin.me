import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="group">
      <div className="flex items-center">
        <div className="relative">
          <span className="text-xl lg:text-3xl font-light tracking-tight text-gray-900 group-hover:text-indigo-600 transition-all duration-300">
            Tyler
          </span>
          <span className="absolute -bottom-1 right-0 w-full h-0.5 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
        </div>
        <div className="relative ml-1">
          <span className="text-xl lg:text-3xl font-bold tracking-tight text-indigo-600 group-hover:text-gray-900 transition-all duration-300">
            Lundin
          </span>
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gray-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
        <span className="text-sm lg:text-xl font-mono text-gray-400 group-hover:text-indigo-400 transition-all duration-300 ml-1">
          .me
        </span>
      </div>
    </Link>
  );
} 