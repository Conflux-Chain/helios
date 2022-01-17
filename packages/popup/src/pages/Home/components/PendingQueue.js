import PropTypes from 'prop-types'

function PendingQueue({count = ''}) {
  return (
    <div
      id="queueContainer"
      className="absolute bg-error text-white text-2xs w-[18px] h-[18px] leading-[18px] text-center rounded-full right-0 -top-1.5 translate-x-2/4"
    >
      {count}
      <svg
        className="pending-queue-spin absolute top-[-1px] left-[-1px]"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M4.88 4.116c.108-.074.21-.147.308-.208.097-.065.192-.12.278-.172.043-.027.085-.05.125-.072l.115-.064.051-.027.048-.024.085-.043.038-.02.044-.021.076-.038.14-.069a1.176 1.176 0 1 0-1.206-2.01l-.127.092-.069.05-.04.03-.051.038-.114.084-.062.047-.065.05-.131.106c-.046.037-.094.075-.143.118-.097.084-.203.174-.311.276-.11.099-.222.21-.34.327-.115.12-.236.244-.355.38a9.838 9.838 0 0 0-1.382 2.02 9.597 9.597 0 0 0-.534 1.252c-.02.054-.036.11-.054.165l-.053.165c-.033.112-.063.224-.094.335l-.042.17c-.013.056-.029.112-.04.17l-.036.17-.018.085-.015.086A9.36 9.36 0 0 0 .758 8.93c-.006.113-.005.225-.006.336v.084l.002.083.005.165.002.082.005.082.01.162.006.087.008.077.015.153.008.076.01.08.021.159.011.078.013.076.025.152a9.212 9.212 0 0 0 .441 1.613l.044.115.022.056.023.056.09.214c.064.138.121.268.183.388a8.846 8.846 0 0 0 .57.98l.088.13-.065-.142a8.547 8.547 0 0 1-.392-1.048c-.04-.125-.074-.26-.112-.401l-.05-.219-.014-.056-.011-.057-.023-.117a8.588 8.588 0 0 1-.156-1.572V10.588c0-.024.002-.047.003-.071l.005-.142.003-.071.005-.075.015-.23v-.006c.001.012.001.001.001.002l.001-.009.002-.018.004-.037.016-.148.008-.075.01-.074.02-.149c.005-.024.007-.05.012-.074l.013-.075c.018-.099.033-.198.056-.297.082-.399.193-.79.333-1.173l.026-.071.028-.071.055-.141c.018-.048.04-.093.06-.14l.06-.138c.043-.09.085-.182.13-.27l.068-.133c.023-.044.045-.088.07-.131A8.097 8.097 0 0 1 3.85 4.998c.22-.224.454-.434.7-.63.112-.092.224-.173.33-.252zM20 9.97l-.018-.155-.02-.187-.014-.12-.022-.159c-.016-.112-.034-.236-.055-.369l-.083-.408c-.014-.073-.034-.147-.054-.223l-.06-.235c-.011-.04-.02-.08-.033-.121l-.038-.124-.08-.254-.02-.065-.024-.065-.048-.131c-.033-.089-.065-.179-.1-.27l-.116-.273-.06-.139c-.02-.046-.043-.092-.065-.139l-.137-.28a1.176 1.176 0 0 0-.037-.07l-.038-.07-.077-.142-.078-.142c-.027-.047-.056-.093-.085-.14l-.173-.281a10.488 10.488 0 0 0-.82-1.087 10.424 10.424 0 0 0-.988-.978 10.31 10.31 0 0 0-1.108-.812 10.185 10.185 0 0 0-1.162-.618l-.292-.121c-.048-.02-.095-.04-.143-.058l-.145-.052-.143-.051-.07-.025a1.038 1.038 0 0 0-.07-.024l-.282-.085c-.046-.013-.091-.028-.137-.04l-.137-.034-.267-.067-.26-.052-.127-.025-.062-.012-.062-.009-.242-.035-.117-.017c-.038-.006-.076-.008-.114-.012l-.22-.02c-.07-.007-.139-.015-.206-.016l-.375-.016-.317.002-.136.001-.12.007-.187.01-.156.01.155.017.187.02.117.014.133.021.308.05.36.078c.064.012.129.031.196.05l.207.054c.035.01.07.018.106.03l.109.035.223.073.057.018.057.022.115.043.236.09.24.105.121.054c.041.018.08.04.122.06l.245.122c.021.01.042.021.062.033l.061.034.123.07.124.069c.042.023.082.05.123.076l.246.154c.323.22.643.463.947.732.301.273.585.565.848.876.255.31.489.637.7.979.206.338.38.683.53 1.022l.102.255.05.126.043.127.043.125.02.062c.008.02.015.04.02.062l.072.245c.011.04.024.08.034.12l.028.12.055.233.042.228.02.11.01.054.008.054.027.21.014.102c.005.033.006.067.009.1l.015.19c.005.063.012.122.012.18l.01.327-.007.257-.002.109-.006.117-.011.188-.01.155A1.176 1.176 0 1 0 20 9.97v.001zm-2.711 4.921l-.096.116c-.033.04-.067.082-.105.125-.075.085-.155.178-.246.272-.088.097-.188.194-.292.297-.106.1-.217.206-.339.31a8.657 8.657 0 0 1-1.79 1.198 8.43 8.43 0 0 1-1.105.457c-.048.017-.097.031-.145.046l-.146.045c-.097.028-.196.053-.294.08l-.149.034c-.05.011-.099.025-.149.034l-.15.03-.074.015-.075.012a8.19 8.19 0 0 1-1.198.116c-.098.004-.197.002-.294.001h-.073c-.024 0-.046-.002-.07-.003l-.138-.006-.068-.003-.078-.005-.156-.01-.039-.003-.019-.002h-.01H10l-.005-.001-.07-.008-.139-.015a7.936 7.936 0 0 1-1.94-.485l-.1-.039-.048-.02-.048-.02-.186-.08c-.118-.058-.231-.109-.334-.164a7.757 7.757 0 0 1-.524-.295l-.026-.016a10.88 10.88 0 0 0-.068-.044l-.08-.053-.036-.023-.04-.026-.07-.048-.13-.087a1.176 1.176 0 1 0-1.141 2.047l.142.064.078.035.046.021.059.025.13.057.072.03.037.017.037.014c.2.078.443.171.727.259.14.046.294.086.453.131l.248.06.064.016.065.014.131.027a9.754 9.754 0 0 0 2.44.185l.167-.01.084-.006h.023l.01-.002.019-.002.038-.003.155-.016.078-.008.088-.011.176-.022c.03-.004.06-.007.088-.012l.085-.014c.113-.018.227-.035.34-.06.455-.088.904-.21 1.341-.365l.082-.028.082-.031.162-.063c.054-.02.106-.043.16-.065l.158-.067c.105-.048.21-.095.312-.145l.152-.076c.05-.026.102-.05.15-.078a9.264 9.264 0 0 0 2.048-1.483c.26-.25.504-.514.732-.792.107-.128.202-.256.293-.376.088-.123.172-.239.245-.352.075-.11.14-.218.2-.316.032-.049.058-.098.085-.143l.075-.131c.092-.168.162-.3.206-.393l.068-.14-.091.126a8.85 8.85 0 0 1-.266.35z"
            fill="#fff"
          />
        </g>
        <defs>
          <clipPath id="clip0_10816_12706">
            <path fill="#fff" d="M0 0h20v20H0z" />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}

PendingQueue.propTypes = {
  count: PropTypes.string,
}

export default PendingQueue
