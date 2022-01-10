import { HTMLAttributes, useEffect } from 'react';
import { a, useTransition } from '@react-spring/web';
import classNames from 'clsx';
import { lock, clearBodyLocks } from '../../utils/body-scroll-lock';

export type Props = OverWrite<HTMLAttributes<HTMLDivElement>, {
    open: boolean;
}>;

const Mask = ({ open, className, style, ...props }: Props) => {
    const transitions = useTransition(open, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        reverse: open
    });

    useEffect(() => {
        if (open) lock();
        else clearBodyLocks();
    }, [open]);

    return transitions(
        (styles, item) => item &&
            <a.div
                className={classNames("fixed left-0 top-0 w-full h-full bg-black bg-opacity-40 z-[200] contain-strict", className)}
                style={{ ...style, ...styles }}
                {...props}
            />
    )
}

export default Mask;