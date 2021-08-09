function SvgArrowUp(props) {
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
        opacity={0.1}
        d="M12 1.5c-6.627 0-12 5.373-12 12h24c0-6.627-5.373-12-12-12z"
        fill="#44D7B6"
      />
      <path
        d="M8.554 10.554L12 7.11l3.446 3.445"
        stroke="#44D7B6"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default SvgArrowUp
