function Article(props) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M21.348 20.7361L24.228 17.8561C25.524 16.5601 25.524 14.4001 24.228 13.0321L24.156 12.9601C22.86 11.6641 20.7 11.6641 19.332 12.9601L18.036 14.2561L16.74 12.9601C15.444 11.5921 13.284 11.5921 11.916 12.9601L11.844 13.0321C10.44 14.4001 10.44 16.5601 11.844 17.8561L15.66 21.6721C15.732 21.7441 15.804 21.8161 15.948 21.8881L18.108 24.0481L21.348 20.7361Z"
        fill="#98C75D"
      />
      <mask
        id="mask0"
        mask-type="alpha"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="36"
        height="36"
      >
        <rect width="36" height="36" fill="#C4C4C4" />
      </mask>
      <g mask="url(#mask0)">
        <g filter="url(#filter0_f)">
          <ellipse cx="18" cy="23.375" rx="10" ry="2.5" fill="#7AE0BA" />
        </g>
        <rect
          x="3"
          y="0.375"
          width="30"
          height="24"
          rx="4"
          fill="url(#paint0_linear)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.3304 7.91659C10.7649 7.25462 11.7353 7.25462 12.1698 7.9166L12.4198 8.29755C12.5374 8.47684 12.6001 8.68662 12.6001 8.90107V9.97503H9.9001V8.90107C9.9001 8.68662 9.96278 8.47684 10.0804 8.29755L10.3304 7.91659ZM9.9001 11.775V13.8748C9.9001 14.3719 9.49715 14.7748 9.0001 14.7748C8.50304 14.7748 8.1001 14.3719 8.1001 13.8748V8.90107C8.1001 8.33569 8.26536 7.78265 8.57556 7.30997L8.82556 6.92901C9.97084 5.18382 12.5294 5.18382 13.6746 6.92901L13.9246 7.30997C14.2348 7.78265 14.4001 8.33569 14.4001 8.90107V13.8748C14.4001 14.3719 13.9972 14.7748 13.5001 14.7748C13.003 14.7748 12.6001 14.3719 12.6001 13.8748V11.775H9.9001Z"
          fill="#F0FAF6"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24.0001 8.47485C23.503 8.47485 23.1001 8.8778 23.1001 9.37485C23.1001 9.87191 23.503 10.2749 24.0001 10.2749L27.0001 10.2749C27.4972 10.2749 27.9001 9.87191 27.9001 9.37485C27.9001 8.8778 27.4972 8.47485 27.0001 8.47485H24.0001ZM19.5001 12.9749C19.003 12.9749 18.6001 13.3778 18.6001 13.8749C18.6001 14.3719 19.003 14.7749 19.5001 14.7749H27.0001C27.4972 14.7749 27.9001 14.3719 27.9001 13.8749C27.9001 13.3778 27.4972 12.9749 27.0001 12.9749H19.5001Z"
          fill="#F0FAF6"
        />
      </g>
      <defs>
        <filter
          id="filter0_f"
          x="0"
          y="12.875"
          width="36"
          height="21"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur stdDeviation="4" result="effect1_foregroundBlur" />
        </filter>
        <linearGradient
          id="paint0_linear"
          x1="21.375"
          y1="24.7501"
          x2="10.125"
          y2="9.05255e-05"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.0644729" stopColor="#61DCAE" />
          <stop offset="1" stopColor="#8AEFCA" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default Article
