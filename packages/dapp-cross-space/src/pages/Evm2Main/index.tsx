import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { a } from '@react-spring/web';
import useClipboard from 'react-use-clipboard';
import {
    useFluent,
    sendTransaction,
    useCrossSpaceContract,
    useEvmMappedAddressBalance,
    CrossSpaceContractAdress,
    trackEvmMappedAddressBalanceChangeOnce,
} from '../../manage';
import { showWaitFluent, showTransactionSubmitted, hideWaitFluent, hideTransactionSubmitted } from '../../components/tools/Modal';
import showToast from '../../components/tools/Toast';
import { convertCFX2Drip } from '../../utils';

const Evm2Main: React.FC<{ style: any }> = ({ style }) => {
    const { account, evmMappedAddress } = useFluent();
    const [isCopied, setCopied] = useClipboard(evmMappedAddress ?? '', { successDuration: 1500 });

    const crossSpaceContract = useCrossSpaceContract();
    const [inWithdraw, setInWithdraw] = useState(false);

    const handleWithdraw = useCallback(
        async (withdrawBalance: string) => {
            if (!crossSpaceContract || !evmMappedAddress) return;
            let waitFluentKey: string | number = null!;
            let transactionSubmittedKey: string | number = null!;

            try {
                waitFluentKey = showWaitFluent();
                const TxnHash = await sendTransaction({
                    to: CrossSpaceContractAdress,
                    data: crossSpaceContract.withdrawFromMapped(convertCFX2Drip(+withdrawBalance - 0.001)).data,
                });
                setInWithdraw(true);
                transactionSubmittedKey = showTransactionSubmitted(TxnHash);

                trackEvmMappedAddressBalanceChangeOnce(() => {
                    setInWithdraw(false)
                    hideTransactionSubmitted(transactionSubmittedKey);
                    showToast('Withdraw Success!');
                });
            } catch (err) {
                console.error('Withdraw from EVM Space Mapped address error: ', err);
                hideWaitFluent(waitFluentKey);
                if ((err as { code: number })?.code === 4001)
                    showToast('You canceled withdraw.');
            }
        },
        [crossSpaceContract, evmMappedAddress],
    );

    return (
        <a.div className="main-content backface-visible contain-content" style={style}>
            <p>
                From: <span className="ml-1 text-green-500">Conflux EVM-Chain</span>
            </p>

            <p className="mt-8">
                To: <span className="ml-1 text-blue-700">Conflux Core-Chain</span>
            </p>
            <p className="text-ellipsis overflow-hidden">{account}</p>

            <p className="mt-8">
                <b>Step 1: Transfer Token</b>
            </p>
            <p className="mt-4">{`Transfer {CFX} to the following address.`}</p>
            <p className="mt-6 font-semibold">Cautious:</p>
            <ul className="list-disc pl-6">
                <li>
                    Use <span className="ml-1 text-green-500">Conflux EVM-Chain</span>.
                </li>
                <li>
                    {`Send your {CFX} to the`} <span className="ml-1 text-red-500">following address</span>.
                </li>
                <li>
                    This address can <span className="ml-1 text-red-500">{`only receive {CFX}.`}</span>
                </li>
            </ul>

            <p className="mt-6 font-semibold">Transfer Address</p>
            <p
                className="mt-2 text-green-600 inline-flex items-center cursor-pointer hover:ring ring-green-600 transition-shadow"
                onClick={setCopied}
            >
                {isCopied &&
                    <>
                        Copy success!
                        <svg className="ml-1" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                            <path
                                d="M666.272 472.288l-175.616 192a31.904 31.904 0 0 1-23.616 10.4h-0.192a32 32 0 0 1-23.68-10.688l-85.728-96a32 32 0 1 1 47.744-42.624l62.144 69.6 151.712-165.888a32 32 0 1 1 47.232 43.2m-154.24-344.32C300.224 128 128 300.32 128 512c0 211.776 172.224 384 384 384 211.68 0 384-172.224 384-384 0-211.68-172.32-384-384-384"
                                fill="#22c55e"
                            ></path>
                        </svg>
                    </>
                }
                {!isCopied &&
                    <>
                        Click to copy Mirror Address
                        <svg className="ml-2" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                            <path
                                d="M829.568 53.12H960V1024H194.432v-121.344H64V284.48L361.92 0h467.648v53.12z m0 80.896v768.64H279.488v40.448h595.456V134.016h-45.44zM149.056 317.952v503.808h595.456V80.896H397.248L149.12 317.952z"
                                fill="#262626"
                            ></path>
                        </svg>
                    </>
                }
            </p>

            <div className="w-full h-0.5 bg-gray-500 my-10"></div>
            <Withdraw account={account} handleWithdraw={handleWithdraw} inWithdraw={inWithdraw} />
        </a.div>
    );
};

const Withdraw: React.FC<{
    account?: string;
    inWithdraw: boolean;
    handleWithdraw: (amount: string) => void;
}> = memo(({ account, inWithdraw, handleWithdraw }) => {
    const withdrawableBalance = useEvmMappedAddressBalance();
    const preBalance = useRef(withdrawableBalance);

    useEffect(() => {
        if (
            typeof preBalance.current !== 'undefined' && (
                (Number(preBalance.current) <= 0.01 && Number(withdrawableBalance ?? 0) > 0.01)
                || ((Number(withdrawableBalance) - Number(preBalance.current)) > 0.1)
            )
        )
            showToast('It seems that you have sent some CFX to the mirror address');

        return () => {
            preBalance.current = withdrawableBalance;
        };
    }, [withdrawableBalance]);

    return (
        <>
            <p className="mt-8">
                <b>Step 2: Withdraw</b>
            </p>
            <p className="mt-4 mb-2 text-ellipsis overflow-hidden">Current address: {account}</p>
            <p className="">
                Withdrawable:
                {inWithdraw ? ' in withdraw...'
                    : (typeof withdrawableBalance !== 'undefined' ? ` ${+withdrawableBalance > 0.01 ? withdrawableBalance : 0} CFX` : '')
                }
            </p>
            <button
                className="mt-6 px-40 py-4 border border-black rounded text-12 ring-black ring-opacity-60 hover:ring transition-shadow whitespace-nowrap"
                disabled={inWithdraw || !withdrawableBalance || +withdrawableBalance <= 0.01}
                onClick={() => handleWithdraw(withdrawableBalance!)}
            >
                Withdraw
            </button>
        </>
    );
});

export default memo(Evm2Main);
