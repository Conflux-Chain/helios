function SvgErrorFilled(props) {
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
        id="error-filled_svg__a"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={24}
        height={24}
      >
        <path fill="#C4C4C4" d="M0 0h24v24H0z" />
      </mask>
      <g mask="url(#error-filled_svg__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
          fill="#E15C56"
        />
        <path
          d="M15 9l-6 6M9 9l6 6"
          stroke="#fff"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

export default SvgErrorFilled
