function SvgArrowDownFilled(props) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <mask
        id="arrow-down-filled_svg__a"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={24}
        height={24}
      >
        <path
          transform="rotate(-180 24 24)"
          fill="#C4C4C4"
          d="M24 24h24v24H24z"
        />
      </mask>
      <g mask="url(#arrow-down-filled_svg__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.139 15.893a1.09 1.09 0 001.722 0l4.77-6.132A1.09 1.09 0 0016.77 8H7.23a1.09 1.09 0 00-.86 1.76l4.769 6.133z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}

export default SvgArrowDownFilled
