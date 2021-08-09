function SvgLoading(props) {
  return (
    <svg
      width={52}
      height={52}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx={26} cy={26} r={24} stroke="currentColor" strokeWidth={3} />
      <path
        d="M26 50c13.255 0 24-10.745 24-24S39.255 2 26 2"
        stroke="#44D7B6"
        strokeWidth={3}
      />
    </svg>
  )
}

export default SvgLoading
