import React, { createRef, RefObject } from 'react';
import { createPortal, render } from 'react-dom';
import isDOMElement from '../../utils/isDOMElement';
import PopupComponent, { type PopupMethods } from './Popup';
import { uniqueId } from 'lodash-es';

export class PopupClass implements PopupMethods {
    popupRef: RefObject<PopupMethods>;
    show: PopupMethods['show'];
    hide: PopupMethods['hide'];
    hideAll: PopupMethods['hideAll'];
    setMaskStyle: PopupMethods['setMaskStyle'];
    setMaskClassName: PopupMethods['setMaskClassName'];
    setMaskClickHandler: PopupMethods['setMaskClickHandler'];
    setListStyle: PopupMethods['setListStyle'];
    setListClassName: PopupMethods['setListClassName'];
    setItemWrapperStyle: PopupMethods['setItemWrapperStyle'];
    setItemWrapperClassName: PopupMethods['setItemWrapperClassName'];

    constructor() {
        this.popupRef = createRef<PopupMethods>();
        this.show = (args) => this.judgeInit('show', args);
        this.hide = (args) => this.judgeInit('hide', args);
        this.hideAll = () => this.judgeInit('hideAll');
        this.setMaskStyle = (args) => this.judgeInit('setMaskStyle', args);
        this.setMaskClassName = (args) => this.judgeInit('setMaskClassName', args);
        this.setMaskClickHandler = (args) => this.judgeInit('setMaskClickHandler', args);
        this.setListStyle = (args) => this.judgeInit('setListStyle', args);
        this.setListClassName = (args) => this.judgeInit('setListClassName', args);
        this.setItemWrapperStyle = (args) => this.judgeInit('setItemWrapperStyle', args);
        this.setItemWrapperClassName = (args) => this.judgeInit('setItemWrapperClassName', args);
    }

    judgeInit(method: keyof PopupMethods, args?: any): any {
        if (!this.popupRef.current) {
            this.init();
        };
        return this[method](args);
    }

    resetMethod = () => {
        this.show = this.popupRef.current!.show;
        this.hide = this.popupRef.current!.hide;
        this.hideAll = this.popupRef.current!.hideAll;
        this.setMaskStyle = this.popupRef.current!.setMaskStyle;
        this.setMaskClassName = this.popupRef.current!.setMaskClassName;
        this.setMaskClickHandler = this.popupRef.current!.setMaskClickHandler;
        this.setListStyle = this.popupRef.current!.setListStyle;
        this.setListClassName = this.popupRef.current!.setListClassName;
        this.setItemWrapperStyle = this.popupRef.current!.setItemWrapperStyle;
        this.setItemWrapperClassName = this.popupRef.current!.setItemWrapperClassName;
    }

    init = (container?: HTMLElement) => {
        if (!container || !isDOMElement(container)) {
            container = document.createElement('div');
            container.setAttribute('id', 'popup-container-' + uniqueId());
            container.style.position = 'absolute';
            document.body.appendChild(container);
        }
        render(<PopupComponent ref={this.popupRef}/>, container);
        this.resetMethod();
    }


    Provider = ({ container }: { container?: HTMLElement; [otherProps: string]: any; }) => {
        if (!container || !isDOMElement(container)) {
            container = document.createElement('div');
            container.setAttribute('id', 'popup-container-' + uniqueId());
            container.style.position = 'absolute';
            document.body.appendChild(container);
        }
        const component = createPortal(React.createElement(PopupComponent, { ref: this.popupRef }), container);
        const resetMethod = () => {
            if (!this.popupRef.current) {
                setTimeout(resetMethod, 16);
                return;
            }
            this.resetMethod();
        }
        resetMethod();
        return component;
    }
}

export default new PopupClass();