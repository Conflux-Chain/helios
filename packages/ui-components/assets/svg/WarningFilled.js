function SvgWarningFilled(props) {
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
        id="warning-filled_svg__a"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={24}
        height={24}
      >
        <path fill="#C4C4C4" d="M0 0h24v24H0z" />
      </mask>
      <g mask="url(#warning-filled_svg__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
          fill="#FFC438"
        />
        <path
          d="M12 7c.427 0 .78.322.828.736l.005.097V14.5a.833.833 0 01-1.66.097l-.007-.097V7.833c0-.46.374-.833.834-.833z"
          fill="#fff"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 17.833a.833.833 0 100-1.666.833.833 0 000 1.666z"
          fill="#fff"
        />
      </g>
    </svg>
  )
}

export default SvgWarningFilled
