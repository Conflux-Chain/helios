import React, { createContext, useState, useEffect, useContext } from "react";
import { autorun } from '@formily/reactive';
import ConfluxManage from './ConfluxManage';

const ConfluxContext = createContext<typeof ConfluxManage.conflux.value>(null!);

const ConfluxProvider: React.FC = ({ children }) => {
    const [conflux, setConflux] = useState(() => ConfluxManage.conflux.value);
    useEffect(() => {
        return autorun(() => {
            setConflux(ConfluxManage.conflux.value);
        });
    }, []);

    return (
        <ConfluxContext.Provider value={conflux}>
            {children}
        </ConfluxContext.Provider>
    );
}

const useConflux = () => useContext(ConfluxContext);

export { useConflux, ConfluxProvider };