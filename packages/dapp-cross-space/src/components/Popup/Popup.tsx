import React, { CSSProperties, forwardRef, isValidElement, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { uniqueId } from 'lodash-es';
import classNames from 'clsx';
import runAsync from '../../utils/runAsync';
import List, { type ItemProps } from '../List';
import Mask from '../Mask';

type PartialOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface PopupProps extends ItemProps {
    Content: React.ReactNode;
    duration?: number;
    preventDuplicate?: boolean,
    maximum?: number;
    unique?: boolean;
    queue?: boolean;
    showMask?: boolean;
    onClose?: Function;
}

export interface PopupMethods {
    show(props: PartialOptional<PopupProps, 'key'>): string | number;
    hide(key: string | number): void;
    hideAll(): void;
    setMaskStyle(style?: CSSProperties): void;
    setMaskClassName(className?: string): void;
    setListStyle(style?: CSSProperties): void;
    setListClassName(className?: string): void;
    setItemWrapperStyle(style?: CSSProperties): void;
    setItemWrapperClassName(className?: string): void;
    setMaskClickHandler(handler?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void): void;
}

const PopupItem = forwardRef<HTMLDivElement, PopupProps & { handleClose: Function }>(({ handleClose, Content, duration }, ref) => {
    useEffect(() => {
        let timer: number;
        if (duration !== 0) timer = setTimeout(handleClose, duration);
        return () => clearTimeout(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (isValidElement(Content) || typeof Content === 'function')
        return (
            <div
                className="flex flex-col w-fit bg-transparent backface-visible overflow-hidden contain-content"
                ref={ref}
            >
                {typeof Content === 'function' ? <Content /> : Content}
            </div>
        );
        return (
            <div ref={ref} className="w-fit px-[5px] py-[8px] bg-black bg-opacity-70 text-white rounded backface-visible">
                {Content}
            </div>
        );
});

const PopupContainer = forwardRef<PopupMethods>((_, ref) => {
    const [popupList, setPopupList] = useState<PopupProps[]>([]);
    const listQueue = useRef<PopupProps[]>([]);
    const [openMask, setOpenMask] = useState<boolean>(false);
    const [maskStyle, setMaskStyle] = useState<CSSProperties | undefined>(undefined);
    const [maskClassName, setMaskClassName] = useState<string | undefined>(undefined);
    const [maskClickHandler, setMaskClickHandler] = useState<((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined>(undefined);
    const [listStyle, setListStyle] = useState<CSSProperties | undefined>(undefined);
    const [listClassName, setListClassName] = useState<string | undefined>(undefined);
    const [itemWrapperStyle, setItemWrapperStyle] = useState<CSSProperties | undefined>(undefined);
    const [itemWrapperClassName, setItemWrapperClassName] = useState<string | undefined>(undefined);

    const pushPopup = useCallback(({ Content, duration = 3000, showMask = false, key, preventDuplicate, maximum, unique, queue, ...props }: PartialOptional<PopupProps, 'key'>) => {
        const usedKey = key ?? uniqueId('popup');
        setPopupList(curList => {
            if (key && curList.find((item: PopupProps) => item.key === key)) return curList;
            if (queue && curList.length) {
                listQueue.current.push({ Content, duration, showMask, key: usedKey, preventDuplicate, maximum, unique, ...props });
                return curList;
            }
            if (preventDuplicate && curList.find((item: PopupProps) => item.Content === Content)) return curList;
            if (maximum && curList.length > 0 && curList.length >= maximum) curList = curList.slice(0, maximum - 1);
            return ([
                    { key: usedKey, Content, duration, showMask, ...props }, 
                    ...(unique && curList.length >= 1 ? [] : curList)
            ]);
        });
        runAsync(() => { if (showMask) setOpenMask(true); });
        return usedKey;
    }, []);

    const popPopup = useCallback((key: PopupProps['key']) => {
        let isListEmpty = false;
        setPopupList(curList => {
            const newList = curList.filter((item: PopupProps) => item.key !== key);
            if (!newList.find(item => item.showMask)) setOpenMask(false);
            if (!newList.length && listQueue.current.length) isListEmpty = true;
            return newList;
        });
        runAsync(() => { if (isListEmpty) pushPopup(listQueue.current.shift() as PopupProps); });
    }, []);

    const popAllPopup = useCallback(() => {
        listQueue.current = [];
        setPopupList([]);
        setOpenMask(false);
    }, []);

    const setMaskClick = useCallback((func: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void): void => {
        setMaskClickHandler(() => func);
    }, []);

    useImperativeHandle(ref, () => ({ show: pushPopup, hide: popPopup, hideAll: popAllPopup, setMaskStyle, setMaskClassName, setListStyle, setListClassName, setItemWrapperStyle, setItemWrapperClassName, setMaskClickHandler: setMaskClick }));

    return (
        <div>
            <Mask open={openMask} className={maskClassName} style={maskStyle} onClick={maskClickHandler}/>
            <List
                className={classNames('fixed flex flex-col items-center w-fit left-[50%] top-[30%] translate-x-[-50%] z-[201] contain-content', listClassName)}
                list={popupList}
                animatedHeight
                style={listStyle}
                ItemWrapperClassName={itemWrapperClassName}
                ItemWrapperStyle={{ marginBottom: 12, ...itemWrapperStyle }}
            >
                {popup => <PopupItem handleClose={() => { popPopup(popup.key); popup?.onClose?.(); }} {...popup} />}
            </List>
        </div>
    );
});

export default PopupContainer;