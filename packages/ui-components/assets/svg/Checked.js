function SvgChecked(props) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x={2} y={2} width={20} height={20} rx={2} fill="#44D7B6" />
      <path
        d="M15.5 9.5L11.432 15 9 13.125"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default SvgChecked
