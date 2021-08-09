function SvgNoChecked(props) {
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
        x={2.5}
        y={2.5}
        width={19}
        height={19}
        rx={1.5}
        stroke="currentColor"
      />
    </svg>
  )
}

export default SvgNoChecked
