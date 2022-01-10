import React, {useState, useCallback} from 'react'
import {useSpring} from '@react-spring/web'
import classNames from 'clsx'
import {useFluent} from '../manage/useFluent'
import {useIsSupportEvmSpace} from '../manage/useEvm'
import Connect from './Connect'
import Main2Evm from './Main2Evm'
import Evm2Main from './Evm2Main'
import './index.css'

const App: React.FC = () => {
  const {isConnected} = useFluent()
  const isSupportEvmSpace = useIsSupportEvmSpace()

  const [flipped, setFlipped] = useState(
    () => localStorage.getItem('filpped') === 'true',
  )
  const {transform, opacity} = useSpring({
    opacity: flipped ? 1 : 0,
    transform: `perspective(600px) rotateY(${flipped ? 180 : 0}deg)`,
    config: {mass: 5, tension: 500, friction: 80, clamp: true},
  })

  const handleClickFlipped = useCallback(
    () =>
      setFlipped(pre => {
        localStorage.setItem('filpped', !pre ? 'true' : 'false')
        return !pre
      }),
    [],
  )

  return (
    <div className="w-fit m-auto pt-14">
      <p>
        <b>Transfer Assets</b>
      </p>
      <p className="relative mb-10">
        Between Conflux Core-Chain and Conflux EVM-Chain
        <button
          className={classNames(
            'absolute -right-28 -top-6 p-2 border rounded-full hover:ring transition-shadow',
            {hidden: !isConnected},
          )}
          onClick={handleClickFlipped}
        >
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
          >
            <path
              d="M259.84 810.666667h512l-55.466667 55.04a42.666667 42.666667 0 0 0 60.586667 60.586666l128-128a42.666667 42.666667 0 0 0 0-60.586666l-128-128a42.666667 42.666667 0 0 0-60.586667 0 42.666667 42.666667 0 0 0 0 60.586666l55.466667 55.04h-512a66.56 66.56 0 0 1-67.84-65.28V554.666667a42.666667 42.666667 0 0 0-85.333333 0v105.386666A151.893333 151.893333 0 0 0 259.84 810.666667zM247.04 414.293333a42.666667 42.666667 0 1 0 60.586667-60.586666L252.16 298.666667h512a66.56 66.56 0 0 1 67.84 65.28V469.333333a42.666667 42.666667 0 0 0 85.333333 0V363.946667A151.893333 151.893333 0 0 0 764.16 213.333333h-512l55.466667-55.04a42.666667 42.666667 0 0 0 0-60.586666 42.666667 42.666667 0 0 0-60.586667 0l-128 128a42.666667 42.666667 0 0 0 0 60.586666z"
              fill="#231F20"
              p-id="3773"
            ></path>
          </svg>
        </button>
      </p>

      {!isConnected && <Connect />}
      {isConnected && (
        <>
          <Main2Evm
            style={{
              zIndex: flipped ? 0 : 1,
              opacity: opacity.to(o => 1 - o),
              transform,
            }}
          />
          <Evm2Main
            style={{
              zIndex: flipped ? 1 : 0,
              opacity,
              transform,
              rotateY: '180deg',
            }}
          />
          {!isSupportEvmSpace && (
            <div className="fixed bottom-[24px] left-[50%] translate-x-[-46%] flex justify-center items-center px-[32px] py-[12px] bg-[#445159] text-white rounded overflow-hidden">
              It seems that current network doesn't support EVM Space, please
              check your network.
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App
