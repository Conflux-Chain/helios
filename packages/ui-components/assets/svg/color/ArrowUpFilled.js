function SvgArrowUpFilled(props) {
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
        id="arrow-top-filled_svg__a"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={24}
        height={24}
      >
        <path fill="#C4C4C4" d="M0 0h24v24H0z" />
      </mask>
      <g mask="url(#arrow-top-filled_svg__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.861 8.107a1.09 1.09 0 00-1.722 0l-4.77 6.132A1.09 1.09 0 007.231 16h9.539a1.09 1.09 0 00.86-1.76l-4.769-6.133z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}

export default SvgArrowUpFilled
