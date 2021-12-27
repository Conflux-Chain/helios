// import {useState, useEffect} from 'react'

// This component is used for the transition before mounting router.
// It has the same effect as 'page' type in useLoading.
const PageLoading = () => {
  // const [inDelay, setInDelay] = useState(true)
  // useEffect(() => {
  //   const timer = setTimeout(() => setInDelay(false), 0)
  //   return () => clearTimeout(timer)
  // }, [])

  // if (inDelay) return null
  return (
    <div className="h-150 w-93 m-auto light flex items-center justify-center">
      <div
        className="loading-page-wrapper"
        style={{opacity: 1, transform: 'scale3d(1, 1, 1)'}}
      >
        <div className="loading-page-inner">
          <svg
            width="48"
            height="48"
            viewBox="0 0 480 480"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M480 77.287V0H227.797C101.988 0 0 101.987 0 227.794V479.997h50.75l50.263.003a.918.918 0 0 0 .02-.003h2.004C180.666 467.651 240 400.411 240 319.315v-79.307h-2.034v-.015l79.322.004 2.691-.022C408.601 238.538 480 166.251 480 77.287z"
              fill="#fff"
              fillOpacity=".8"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M376.928 0h103.038v77.28c0 91.531-72.605 162.695-162.05 162.695l-2.691.022-75.259-.008v-79.307C239.966 79.586 299.3 12.346 376.928 0z"
              fill="#242265"
              fillOpacity=".8"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M480 77.287V0H227.797C101.988 0 0 101.987 0 227.794V479.997h50.75l50.263.003a.918.918 0 0 0 .02-.003h2.004C180.666 467.651 240 400.411 240 319.315v-79.307h-2.034v-.015l79.322.004 2.691-.022C408.601 238.538 480 166.251 480 77.287z"
              fill="#616EE1"
              fillOpacity=".8"
            />
          </svg>
          <div className="loading-page-line"></div>
        </div>
      </div>
    </div>
  )
}

export default PageLoading
