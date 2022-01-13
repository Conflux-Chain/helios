import { forwardRef, type HTMLAttributes } from 'react';
import classNames from 'clsx';
import {shortenAddress} from '@fluent-wallet/shorten-address';
import './index.css';

export type Props = OverWrite<
  HTMLAttributes<HTMLDivElement>,
  {
    text: string;
  }
>;

const ShortenAddress = forwardRef<HTMLDivElement, Props>(({ text, className, ...props }, _ref) => {
    return (
        <div {...props} ref={_ref} className={classNames('flex justify-start items-center dfn', className)} data-info={text}>
            {text ? shortenAddress(text) : ''}
        </div>
    );
});

export default ShortenAddress;