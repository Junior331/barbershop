// Base classes que todos os botões terão
export const baseClasses =
  'inter inline-flex items-center justify-center whitespace-nowrap rounded-md text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full cursor-pointer';

// Classes específicas para cada variante
export const variantClasses = {
  default: 'bg-[#6C8762] text-white hover:bg-[#6C8762]/80 focus:bg-[#6C8762]/80 active:bg-[#6C8762]/80',
  destructive: 'bg-red-500 text-white hover:bg-red-600 focus:bg-red-600 active:bg-red-600',
  positive: 'bg-green-500 text-white hover:bg-green-600 focus:bg-green-600 active:bg-green-600',
  cancel: 'bg-zinc-800 text-white hover:bg-zinc-900 focus:bg-zinc-900 active:bg-zinc-900',
  subtle: 'bg-zinc-700 text-white hover:bg-zinc-800 focus:bg-zinc-800 active:bg-zinc-800',
  ghost: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 focus:bg-zinc-200 active:bg-zinc-300',
  link: 'text-blue-500 underline-offset-4 hover:underline',
  outline: 'border border-zinc-300 bg-transparent text-zinc-900 hover:bg-zinc-100 focus:bg-zinc-100',
};

// Classes específicas para cada tamanho
export const sizeClasses = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-14 px-6',
  icon: 'h-10 w-10',
};
