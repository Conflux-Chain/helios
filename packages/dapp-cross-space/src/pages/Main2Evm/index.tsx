import React, { useState, useCallback, memo } from 'react';
import { a } from '@react-spring/web'
import { clamp } from 'lodash-es';
import { useForm, type UseFormRegister, type UseFormSetValue, type FieldValues } from "react-hook-form";
import { useFluent, useBalance, sendTransaction, trackBalanceChangeOnce } from '../../manage/useFluent';
import { useCrossSpaceContract, CrossSpaceContractAdress } from '../../manage/useConflux';
import { useIsSupportEvmSpace } from '../../manage/useEvm';
import { convertCFX2Drip } from '../../utils';
import { showWaitFluent, showTransactionSubmitted, hideWaitFluent, hideTransactionSubmitted } from '../../components/tools/Modal';
import showToast from '../../components/tools/Toast';
import './index.css';

const Main2Evm: React.FC<{ style: any; }> = ({ style }) => {
    const { register, handleSubmit, setValue } = useForm();
    const { account } = useFluent();
    const isSupportEvmSpace = useIsSupportEvmSpace();
    const crossSpaceContract = useCrossSpaceContract();

    const [receivedAmount, setReceivedAmount] = useState(0);

    const onSubmit = useCallback(handleSubmit(async ({ evmAddress, amount }: { evmAddress: string; amount: string; }) => {
        if (!crossSpaceContract) return;
        let waitFluentKey: string | number = null!;
        let transactionSubmittedKey: string | number = null!;
        try {
            waitFluentKey = showWaitFluent();
            const TxnHash = await sendTransaction({
                to: CrossSpaceContractAdress,
                data: crossSpaceContract.transferEVM(evmAddress).data,
                value: convertCFX2Drip(amount)
            });
            transactionSubmittedKey = showTransactionSubmitted(TxnHash);
            trackBalanceChangeOnce(() => {
                hideTransactionSubmitted(transactionSubmittedKey);
                showToast('It seems you have sent CFX to EVM Space.');
            });
        } catch (err) {
            console.error('SendTransaction to EVM Space error: ', err);
            hideWaitFluent(waitFluentKey);
            if ((err as { code: number; })?.code === 4001)
                showToast('You canceled the transaction.');
        } finally {
            setValue('amount', '');
            setReceivedAmount(0);
        }
    }), [crossSpaceContract]);

    return (
        <a.div className='main-content backface-visible contain-content' style={style}>
            <p>From: <span className='ml-1 text-blue-700'>Conflux Core-Chain</span></p>
            <p className='text-ellipsis overflow-hidden'>{account}</p>

            <p className='mt-8'>To: <span className='ml-1 text-green-500'>Conflux EVM-Chain</span></p>

            <form onSubmit={onSubmit}>
                <input
                    className="input mt-4"
                    placeholder='Conflux EVM-Chain Destination Address'
                    pattern="0x[a-fA-F0-9]{40}"
                    {...register("evmAddress", { pattern: /0x[a-fA-F0-9]{40}/g, required: true })}
                />

                <AmountInput register={register} setValue={setValue} receivedAmount={receivedAmount} setReceivedAmount={setReceivedAmount} />

                <button
                    type="submit"
                    className='mt-14 px-40 py-4 border border-black rounded text-12 ring-black ring-opacity-60 hover:ring transition-shadow whitespace-nowrap'
                    disabled={!isSupportEvmSpace}
                >
                    Transfer
                </button>
            </form>
        </a.div>
    );
}

const AmountInput: React.FC<{
    register: UseFormRegister<FieldValues>;
    setValue: UseFormSetValue<FieldValues>;
    receivedAmount: number;
    setReceivedAmount:  React.Dispatch<React.SetStateAction<number>>;
}> = memo(({ register, setValue, receivedAmount, setReceivedAmount }) => {
    const balance = useBalance();

    const handleBlur = useCallback<React.FocusEventHandler<HTMLInputElement>>((evt) => {
        if (evt.target.value)
            evt.target.value = clamp(+evt.target.value, 0, Math.floor(+balance!)) + '';
        setReceivedAmount(+evt.target.value);
    }, [balance]);

    const handleClickMax = useCallback(() => {
        setValue('amount', typeof balance !== undefined ? Math.floor(+balance!) : '0');
    }, [balance]);
    
    return (
        <>
            <div className='relative flex items-center mt-4 mb-3'>
                <input
                    id="input-amount"
                    className="input"
                    placeholder='Amount you want to transfer'
                    type="number"
                    min={1}
                    max={balance}
                    {...register("amount", { min: 0.1, max: balance ?? 0, required: true, onBlur: handleBlur })}
                />
                <label
                    className='opacity-0 absolute right-6 text-blue-400 cursor-pointer hover:underline'
                    onClick={handleClickMax}
                    htmlFor="input-amount"
                >
                    MAX
                </label>
            </div>
            <p><span className='text-blue-700'>Core-Chain</span> Balance: {typeof balance !== 'undefined' ? Math.floor(+balance) + 'CFX' : ''}</p>
            <p className='mt-4'>Will receive on <span className='ml-1 text-green-500'>EVM-Chain</span>: {Math.max(0, receivedAmount)} CFX</p>
        </>
    );
});

export default memo(Main2Evm);