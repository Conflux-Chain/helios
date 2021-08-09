function SvgNotConnected(props) {
  return (
    <svg
      width={8}
      height={8}
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle opacity={0.2} cx={4} cy={4} r={4} fill="#B1B8D1" />
      <circle cx={4} cy={4} r={2} fill="#A9ABB2" />
    </svg>
  )
}

export default SvgNotConnected
