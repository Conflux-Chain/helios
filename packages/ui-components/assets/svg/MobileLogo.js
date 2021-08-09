function SvgMobileLogo(props) {
  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fillRule="evenodd" clipRule="evenodd">
        <path
          d="M27.112 15.99L20.08 8.922a2.42 2.42 0 00-3.43-.003L6.002 19.585l27.58-.72-19.196-1.142 2.4-2.61a2.421 2.421 0 013.358-.2l1.256 1.077h5.713z"
          fill="#44D7B6"
        />
        <path
          opacity={0.2}
          d="M12.469 24.631l7.03 7.068a2.42 2.42 0 003.43.003l10.65-10.666L6 21.756l19.196 1.142-2.401 2.61a2.42 2.42 0 01-3.357.2L18.18 24.63H12.47z"
          fill="#333"
        />
      </g>
    </svg>
  )
}

export default SvgMobileLogo
