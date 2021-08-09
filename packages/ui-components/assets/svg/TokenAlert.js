function SvgTokenAlert(props) {
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path opacity={0.01} fill="#000" d="M0 0h16v16H0z" />
      <path
        d="M8 1C3.333 1 1 3.333 1 8s2.333 7 7 7 7-2.333 7-7-2.333-7-7-7z"
        fill="#FFCA4F"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.045 9.319a.842.842 0 00.842-.842l.324-3.852c0-.464-.7-1.044-1.166-1.044-.464 0-1.204.58-1.204 1.044l.362 3.852c0 .465.377.842.842.842zm0 2.648a.842.842 0 00.842-.842v-.24a.842.842 0 10-1.684 0v.24c0 .466.376.842.842.842z"
        fill="#fff"
      />
    </svg>
  )
}

export default SvgTokenAlert
