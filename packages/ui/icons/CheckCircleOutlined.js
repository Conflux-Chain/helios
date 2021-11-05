function CheckCircleOutlined(props) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx={12} cy={12} r={9.3} stroke="currentColor" strokeWidth={1.4} />
      <path
        d="M15.5 9l-4.068 5.5L9 12.625"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default CheckCircleOutlined
