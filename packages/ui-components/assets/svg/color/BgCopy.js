function SvgBgCopy(props) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13 10H8.5a1 1 0 00-1 1v4.5a1 1 0 001 1H13a1 1 0 001-1V11a1 1 0 00-1-1z"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 8.5a1 1 0 011-1h4.5a1 1 0 011 1V13a1 1 0 01-1 1"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default SvgBgCopy
