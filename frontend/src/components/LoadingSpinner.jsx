import React from 'react'

export default function LoadingSpinner({ size = 'md', color = 'indigo' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  }
  const colorClasses = {
    indigo: 'border-indigo-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`rounded-full animate-spin ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.indigo}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
