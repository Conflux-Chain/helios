import React, { createContext, useState, useEffect, useContext } from "react";
import { autorun } from '@formily/reactive';
import FluentManage, { type Status } from './FluentManage';

const FluentContext = createContext<Status>(null!);

const FluentProvider: React.FC = ({ children }) => {
    const [status, setStatus] = useState(() => ({ ...FluentManage.status, account: FluentManage.account.value, isConnected: FluentManage.isConnected.value, evmMappedAddress: FluentManage.evmMappedAddress.value }));
    useEffect(() => {
        return autorun(() => {
            setStatus({
                ...FluentManage.status,
                account: FluentManage.account.value,
                isConnected: FluentManage.isConnected.value,
                evmMappedAddress: FluentManage.evmMappedAddress.value,
            });
        });
    }, []);

    return (
        <FluentContext.Provider value={status}>
            {children}
        </FluentContext.Provider>
    );
}

const useFluent = () => useContext(FluentContext);

export { useFluent, FluentProvider };