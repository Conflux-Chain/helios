import React, {useState, useCallback} from 'react'
import {useSpring} from '@react-spring/web'
import classNames from 'clsx'
import {useFluent} from '../manage/useFluent'
import {useIsSupportEvmSpace} from '../manage/useEvm'
import Connect from './Connect'
import Main2Evm from './Main2Evm'
import Evm2Main from './Evm2Main'
import {ConfluxSpace, EvmSpace} from '../main'
import './index.css'

const App: React.FC = () => {
  const {isConnected} = useFluent()
  const isSupportEvmSpace = useIsSupportEvmSpace();

  const [flipped, setFlipped] = useState(
    () => {
      if (window.location.hash.slice(1).indexOf('source=fluent-wallet') !== -1) {
        localStorage.setItem('filpped', 'false')
        history.pushState("", document.title, window.location.pathname + window.location.search);
        return false;
      }
      return localStorage.getItem('filpped') === 'true'
    }
  )
  const {transform, opacity} = useSpring({
    opacity: flipped ? 1 : 0,
    transform: `perspective(600px) rotateX(${flipped ? 180 : 0}deg)`,
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
    <div className="relative w-[480px] m-auto pt-[16px]">
      <p className="pl-[32px] font-medium	text-[28px] leading-[36px] text-[#3D3F4C]">
        Transfer Assets
      </p>
      <p className="pl-[32px] text-[16px] leading-[22px] mt-[4px] mb-24px text-[#A9ABB2]">
        {`Between ${ConfluxSpace} and ${EvmSpace}`}
      </p>

      {!isConnected && <Connect />}
      {isConnected && (
        <>
          <div className='mt-[24px] h-[726px]'>
            <Main2Evm
              style={{
                zIndex: flipped ? 0 : 1,
                opacity: opacity.to(o => 1 - o),
                transform,
              }}
              handleClickFlipped={handleClickFlipped}
            />
            <Evm2Main
              style={{
                zIndex: flipped ? 1 : 0,
                opacity,
                transform,
                rotateX: '180deg',
              }}
              handleClickFlipped={handleClickFlipped}
            />
          </div>
          
          <div
            className={classNames(
              "fixed bottom-[24px] left-[50%] translate-x-[-50%] flex justify-center items-center px-[32px] py-[12px] bg-[#445159] text-white rounded overflow-hidden opacity-0 transition-opacity z-10",
              !isSupportEvmSpace ? 'opacity-100' : 'pointer-events-none'
            )}
          >
            It seems that current network doesn't support EVM Space, please
            check your network.
          </div>
          
        </>
      )}
    </div>
  )
}

export default App
