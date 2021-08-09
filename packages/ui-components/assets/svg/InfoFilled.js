function SvgInfoFilled(props) {
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
        id="info-filled_svg__a"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={24}
        height={24}
      >
        <path fill="#C4C4C4" d="M0 0h24v24H0z" />
      </mask>
      <g mask="url(#info-filled_svg__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
          fill="#7084ED"
        />
        <path
          d="M12 17.833a.834.834 0 01-.828-.736L11.167 17v-6.667a.833.833 0 011.66-.097l.007.097V17c0 .46-.374.833-.834.833z"
          fill="#fff"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 7a.833.833 0 100 1.666A.833.833 0 0012 7z"
          fill="#fff"
        />
      </g>
    </svg>
  )
}

export default SvgInfoFilled
