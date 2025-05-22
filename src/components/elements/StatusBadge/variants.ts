export const baseClasses = 'inline-flex items-center justify-center rounded-lg px-4 py-1 text-sm font-medium transition-colors';

export const statusClasses = {
  outline: {
    canceled: 'border bg-red-50 border-red-300 text-red-500',
    confirmed: 'border bg-blue-50 border-blue-300 text-blue-500',
    inactive: 'border bg-zinc-50 border-zinc-300 text-zinc-500',
    completed: 'border bg-green-50 border-green-300 text-green-500',
    warning: 'border bg-yellow-50 border-yellow-300 text-yellow-500',
    pending: 'border bg-zinc-50 border-zinc-300 text-zinc-500',
    failed: 'border bg-red-50 border-red-300 text-red-500',
  },
  solid: {
    canceled: 'bg-red-500 text-white',
    confirmed: 'bg-blue-500 text-white',
    inactive: 'bg-zinc-500 text-white',
    completed: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    pending: 'bg-zinc-500 text-white',
    failed: 'bg-red-500 text-white',
  },
  outline_dark: {
    canceled: 'border bg-red-900 border-red-300 text-red-50',
    confirmed: 'border bg-blue-900 border-blue-300 text-blue-50',
    inactive: 'border bg-zinc-900 border-zinc-300 text-zinc-50',
    completed: 'border bg-green-900 border-green-300 text-green-50',
    warning: 'border bg-yellow-900 border-yellow-300 text-yellow-50',
    pending: 'border bg-zinc-900 border-zinc-300 text-zinc-50',
    failed: 'border bg-red-900 border-red-300 text-red-50',
  },
  solid_dark: {
    canceled: 'bg-red-800 text-red-50',
    confirmed: 'bg-blue-800 text-blue-50',
    inactive: 'bg-zinc-800 text-zinc-50',
    completed: 'bg-green-800 text-green-50',
    warning: 'bg-yellow-800 text-yellow-50',
    pending: 'bg-zinc-800 text-zinc-50',
    failed: 'bg-red-800 text-red-50',
  },
};