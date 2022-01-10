import React, { createContext, useState, useEffect, useContext } from "react";
import { autorun } from '@formily/reactive';
import ConfluxManage from './ConfluxManage';

const CrossSpaceContractContext = createContext<typeof ConfluxManage.CrossSpaceContract.value>(null!);

const CrossSpaceContractProvider: React.FC = ({ children }) => {
    const [crossSpaceContract, setCrossSpaceContract] = useState(() => ConfluxManage.CrossSpaceContract.value);
    useEffect(() => {
        return autorun(() => {
            setCrossSpaceContract(ConfluxManage.CrossSpaceContract.value);
        });
    }, []);

    return (
        <CrossSpaceContractContext.Provider value={crossSpaceContract}>
            {children}
        </CrossSpaceContractContext.Provider>
    );
}

const useCrossSpaceContract = () => useContext(CrossSpaceContractContext);

export { useCrossSpaceContract, CrossSpaceContractProvider };