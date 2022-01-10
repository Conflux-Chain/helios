import { useEffect, useState } from 'react';
import { format } from 'js-conflux-sdk';
import CrossSpaceContractConfig from 'js-conflux-sdk/src/contract/internal/CrossSpaceCall.json';
import { useConflux } from './useConflux';
import { convertDrip2CFX } from '../../utils';

export const CrossSpaceContractAdress = format.address(CrossSpaceContractConfig.address, 1030);

// export const useTrackCfxAdressBalance = (cfxAddress?: string) => {
//     const conflux = useConflux();
//     const [balance, setBalance] = useState<string | undefined>(undefined)

//     useEffect(() => {
//         if (!conflux || !cfxAddress) {
//             setBalance(undefined);
//             return;
//         }
//         const getBalance = async () => {
//             try {
//                 const balanceDrip = await conflux.getBalance(cfxAddress);
//                 setBalance(convertDrip2CFX(balanceDrip.toString()));
//             } catch (err) {
//                 console.error('Track address balance error: ', err);
//             }
//         }

//         getBalance();
//         const timer = setInterval(getBalance, 1500);
//         return () => clearInterval(timer);
//     }, [cfxAddress, conflux]);

//     return balance;
// }

export { useConflux } from './useConflux';
export { useCrossSpaceContract } from './useCrossSpaceContract';
export { confluxNetworkConfig } from './ConfluxManage';
