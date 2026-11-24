import React, { useRef } from 'react'

export default function ColorPicker({ value, onChange, label }) {
  const colorInputRef = useRef(null)

  const handleHexChange = (e) => {
    const val = e.target.value
    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
      onChange(val)
    }
  }

  const handleColorChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
      <div className="flex items-center gap-2">
        <div
          className="relative w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer overflow-hidden flex-shrink-0 shadow-sm hover:border-indigo-400 transition-colors"
          onClick={() => colorInputRef.current?.click()}
          title="Click to open color picker"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: value || '#000000' }}
          />
          <input
            ref={colorInputRef}
            type="color"
            value={value || '#000000'}
            onChange={handleColorChange}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={value || ''}
          onChange={handleHexChange}
          placeholder="#000000"
          maxLength={7}
          className="border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm font-mono"
        />
      </div>
    </div>
  )
}
