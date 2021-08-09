function SvgPendingFilled(props) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx={12} cy={12} r={10} fill="#FFCA4F" />
      <circle cx={7.5} cy={12} r={1.5} fill="#fff" />
      <circle cx={12} cy={12} r={1.5} fill="#fff" fillOpacity={0.8} />
      <circle cx={16.5} cy={12} r={1.5} fill="#fff" fillOpacity={0.4} />
    </svg>
  )
}

export default SvgPendingFilled
