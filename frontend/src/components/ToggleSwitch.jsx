import React from 'react'

export default function ToggleSwitch({ checked, onChange, label, id }) {
  const toggleId = id || `toggle-${label?.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <label
      htmlFor={toggleId}
      className="flex items-center gap-3 cursor-pointer select-none group"
    >
      <div className="relative">
        <input
          id={toggleId}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          role="switch"
          aria-checked={checked}
        />
        <div
          className={`w-12 h-6 rounded-full transition-all duration-300 ${
            checked ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        />
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
          {label}
        </span>
      )}
    </label>
  )
}
