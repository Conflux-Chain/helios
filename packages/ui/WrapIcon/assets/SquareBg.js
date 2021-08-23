import React from 'react'

function SvgSquareBg(props) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        opacity={0.12}
        x={2}
        y={2}
        width={20}
        height={20}
        rx={4}
        fill="#B1B8D1"
      />
    </svg>
  )
}

export default SvgSquareBg
