function CrossOutlined(props) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <mask
        id="cross-outlined_svg__a"
        style={{
          maskType: 'alpha',
        }}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={24}
        height={24}
      >
        <path fill="#C4C4C4" d="M0 0h24v24H0z" />
      </mask>
      <g mask="url(#cross-outlined_svg__a)">
        <mask id="cross-outlined_svg__b" fill="#fff">
          <rect x={2} y={3} width={7} height={7} rx={1} />
        </mask>
        <rect
          x={2}
          y={3}
          width={7}
          height={7}
          rx={1}
          stroke="currentColor"
          strokeWidth={4}
          mask="url(#cross-outlined_svg__b)"
        />
        <mask id="cross-outlined_svg__c" fill="#fff">
          <rect x={13} y={14} width={7} height={7} rx={1} />
        </mask>
        <rect
          x={13}
          y={14}
          width={7}
          height={7}
          rx={1}
          stroke="currentColor"
          strokeWidth={4}
          mask="url(#cross-outlined_svg__c)"
        />
        <path
          d="M12.074 2.003a1 1 0 00-.148 1.994l.148-1.994zM21.286 10l-.976.217a1 1 0 001.956-.017l-.98-.2zm1.694-3.3a1 1 0 00-1.96-.4l1.96.4zM11.926 3.997c1.182.088 3.065.519 4.765 1.514 1.684.986 3.124 2.483 3.619 4.706l1.952-.434c-.648-2.91-2.542-4.816-4.56-5.998-2.003-1.173-4.191-1.676-5.628-1.782l-.148 1.994zm10.34 6.203l.714-3.5-1.96-.4-.714 3.5 1.96.4zM10.926 21.997a1 1 0 00.148-1.994l-.148 1.994zM1.714 14l.976-.217a1 1 0 00-1.956.017l.98.2zM.02 17.3a1 1 0 101.96.4l-1.96-.4zm11.054 2.703c-1.182-.088-3.065-.518-4.765-1.514-1.684-.986-3.124-2.483-3.619-4.706l-1.952.434c.648 2.91 2.542 4.816 4.56 5.998 2.003 1.173 4.191 1.676 5.628 1.782l.148-1.994zM.734 13.8L.02 17.3l1.96.4.714-3.5-1.96-.4z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}

export default CrossOutlined
