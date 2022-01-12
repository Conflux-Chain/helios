import { forwardRef, type HTMLAttributes } from 'react';
import classNames from 'clsx';
import './index.css';

export type Props = OverWrite<
  HTMLAttributes<HTMLDivElement>,
  {
    text: string;
  }
>;

const EllipsisCenter = forwardRef<HTMLDivElement, Props>(({ text, className, ...props }, _ref) => {
    return (
        <div {...props} ref={_ref} className={classNames('flex justify-start items-center dfn', className)} data-info={text}>
            <span className='inline-block w-[50%] overflow-hidden overflow-ellipsis'>{text}</span>
            <span className='inline-block w-[50%] overflow-clip' dir="rtl">{text}</span>
        </div>
    );
});

export default EllipsisCenter;