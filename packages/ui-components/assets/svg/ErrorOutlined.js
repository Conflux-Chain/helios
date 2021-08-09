function SvgErrorOutlined(props) {
  return (
    <svg
      width={52}
      height={52}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx={24} cy={24} r={22.5} stroke="#E15C56" strokeWidth={3} />
      <path
        d="M32 16L16 32M16 16l16 16"
        stroke="#E15C56"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default SvgErrorOutlined
