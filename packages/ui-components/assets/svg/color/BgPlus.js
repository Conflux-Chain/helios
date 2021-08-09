function SvgBgPlus(props) {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 7.3a.7.7 0 01.7.7v8a.7.7 0 11-1.4 0V8a.7.7 0 01.7-.7z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.3 12a.7.7 0 01.7-.7h8a.7.7 0 110 1.4H8a.7.7 0 01-.7-.7z"
        fill="currentColor"
      />
    </svg>
  )
}

export default SvgBgPlus
