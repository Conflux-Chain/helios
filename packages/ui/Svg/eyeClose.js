function EyeClose(props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <mask
        id="mask0"
        mask-type="alpha"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="16"
        height="16"
      >
        <rect
          x="0.7"
          y="0.7"
          width="14.6"
          height="14.6"
          fill="#C4C4C4"
          stroke="#A9ABB2"
          strokeWidth="1.4"
        />
      </mask>
      <g mask="url(#mask0)">
        <path
          d="M2.03711 6C3.50196 7.63667 5.63073 8.66667 8.00006 8.66667C10.3134 8.66667 12.3974 7.68477 13.858 6.11502"
          stroke="#898D9A"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M12.6667 7.33325L14.0001 8.99992"
          stroke="#898D9A"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M9.5 8.66675L9.82137 10.7768"
          stroke="#898D9A"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M6.11011 8.66675L5.3334 10.6548"
          stroke="#898D9A"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M3.63647 7.33325L2.25287 8.95842"
          stroke="#898D9A"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

export default EyeClose
