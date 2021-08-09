function SvgBgChange(props) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path opacity={0.01} fill="#000" d="M1.5 22.5v-21h21v21z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.286 16.278v-7.84a.72.72 0 00-.715-.724.718.718 0 00-.715.723v6.098L8.22 12.879a.708.708 0 00-1.01 0 .726.726 0 000 1.021l2.858 2.89c.204.206.51.267.778.155a.722.722 0 00.44-.667zm1.869-8.508a.705.705 0 01.778.156l2.858 2.89a.724.724 0 010 1.019.707.707 0 01-1.01 0l-1.637-1.656v6.098c0 .4-.32.723-.715.723a.719.719 0 01-.715-.723v-7.84a.72.72 0 01.44-.667z"
        fill="currentColor"
      />
    </svg>
  )
}

export default SvgBgChange
