function Search(props) {
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
        d="M13.3013 25L14.8064 23.3706M14.8064 23.3706L13.0002 21.4783L14.8064 19.6386L16.6125 21.5309M14.8064 23.3706L16.6125 21.5309M19.087 18.9385C18.7761 18.6172 18.529 18.2346 18.3598 17.8128C18.1907 17.391 18.1029 16.9383 18.1014 16.4807C18.0999 16.0232 18.1849 15.5699 18.3513 15.1469C18.5178 14.7239 18.7624 14.3396 19.0712 14.0161C19.38 13.6926 19.7469 13.4362 20.1506 13.2618C20.5544 13.0875 20.987 12.9985 21.4237 13C21.8604 13.0016 22.2926 13.0936 22.6952 13.2708C23.0978 13.448 23.463 13.7069 23.7697 14.0326C24.3729 14.6868 24.7066 15.5632 24.6991 16.4727C24.6915 17.3823 24.3433 18.2524 23.7294 18.8956C23.1154 19.5388 22.2849 19.9037 21.4167 19.9116C20.5485 19.9195 19.7115 19.5704 19.087 18.9385ZM19.087 18.9385L16.6125 21.5309"
        stroke="#FEC574"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="13.6992" y="21" width="2" height="2" fill="#FEC574" />
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
          <ellipse
            cx="18"
            cy="26.9998"
            rx="10"
            ry="2.5"
            fill="#EB997D"
            fillOpacity="0.8"
          />
        </g>
        <path
          d="M4 10C4 8.89543 4.89543 8 6 8H27C28.1046 8 29 8.89543 29 10V13.9375V23C29 25.2091 27.2091 27 25 27H8C5.79086 27 4 25.2091 4 23V13.9375V10Z"
          fill="url(#paint0_linear)"
        />
        <rect x="7" width="25" height="27" rx="4" fill="url(#paint1_linear)" />
        <path
          opacity="0.8"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.4001 11.2501C17.4001 9.88319 18.5082 8.7751 19.8751 8.7751C21.242 8.7751 22.3501 9.88319 22.3501 11.2501C22.3501 12.617 21.242 13.7251 19.8751 13.7251C18.5082 13.7251 17.4001 12.617 17.4001 11.2501ZM19.8751 6.9751C17.5141 6.9751 15.6001 8.88908 15.6001 11.2501C15.6001 13.2218 16.9349 14.8817 18.7501 15.3755V18.0001C18.7501 18.6214 19.2538 19.1251 19.8751 19.1251C20.4964 19.1251 21.0001 18.6214 21.0001 18.0001V15.3755C22.8153 14.8817 24.1501 13.2218 24.1501 11.2501C24.1501 8.88908 22.2361 6.9751 19.8751 6.9751Z"
          fill="url(#paint2_linear)"
        />
      </g>
      <defs>
        <filter
          id="filter0_f"
          x="0"
          y="16.4998"
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
          x1="11.0312"
          y1="26.6346"
          x2="2.8931"
          y2="-1.75601"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F8CFBF" />
          <stop offset="1" stopColor="#FFFDFD" />
        </linearGradient>
        <linearGradient
          id="paint1_linear"
          x1="22.625"
          y1="24.3751"
          x2="11.1176"
          y2="-0.740219"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EB987C" />
          <stop offset="1" stopColor="#FFC9B5" />
        </linearGradient>
        <linearGradient
          id="paint2_linear"
          x1="19.8751"
          y1="6.9751"
          x2="23.0001"
          y2="26.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FBEBE5" />
          <stop offset="1" stopColor="#FBEBE5" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default Search
