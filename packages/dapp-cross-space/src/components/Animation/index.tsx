export const clipRect = {
    from: { clipPath: 'inset(50% round 50% 50%)' },
    enter: { clipPath: 'inset(0% round 0% 0%)', config: { mass: 1, tension: 180, friction: 24 } },
    leave: { clipPath: 'inset(50% round 50% 50%)', config: { mass: 1, tension: 180, friction: 24, clamp: true } },
}

export const clipRectSp = {
    from: { clipPath: 'polygon(50% 20%, 50% 50%, 20% 50%, 50% 50%, 50% 80%, 50% 50%, 80% 50%, 50% 50%)' },
    enter: { clipPath: 'polygon(50% 0%, 0% 0%, 0% 50%, 0% 100%, 50% 100%, 100% 100%, 100% 50%, 100% 0%)', config: { mass: 1, tension: 180, friction: 24 } },
    leave: { clipPath: 'polygon(50% 20%, 50% 50%, 20% 50%, 50% 50%, 50% 80%, 50% 50%, 80% 50%, 50% 50%)', config: { mass: 1, tension: 240, friction: 22, clamp: true } }
}

export const clipCircle = {
    from: { clipPath: 'circle(0% at 50% 50%)' },
    enter: { clipPath: 'circle(100% at 50% 50%)', config: { mass: 1, tension: 170, friction: 26 } },
    leave: { clipPath: 'circle(0% at 50% 50%)', config: { mass: 1, tension: 170, friction: 26, clamp: true } },
}

export const blur = {
    from: { filter: 'blur(8px)', opacity: 0 },
    enter: { filter: 'blur(0px)', opacity: 1, config: { mass: 1, tension: 200, friction: 26 } },
    leave: { filter: 'blur(8px)', config: { mass: 1, tension: 240, friction: 24, clamp: true } },
}

export const fade = {
    from: { opacity: 0  },
    enter: { opacity: 1, config: { mass: 1, tension: 170, friction: 26 } },
    leave: { opacity: 0, config: { mass: 1, tension: 170, friction: 26, clamp: true } },
}

export const slideUp = {
    from: { opacity: 0, transform: 'translate3d(0, 200%, 0)' },
    enter: { opacity: 1, transform: 'translate3d(0, 0%, 0)', config: { mass: 1, tension: 260, friction: 19 } },
    leave: { opacity: 0, transform: 'translate3d(0, 200%, 0)', config: { mass: 1, tension: 170, friction: 26, clamp: true } },
}

export const slideDown = {
    from: { opacity: 0, transform: 'translate3d(0, -200%, 0)' },
    enter: { opacity: 1, transform: 'translate3d(0, 0%, 0)', config: { mass: 1, tension: 260, friction: 19 } },
    leave: { opacity: 0, transform: 'translate3d(0, -200%, 0)', config: { mass: 1, tension: 170, friction: 26, clamp: true } },
}

export const slideLeft = {
    from: { opacity: 0, transform: 'translate3d(-175%, 0, 0)' },
    enter: { opacity: 1, transform: 'translate3d(0%, 0, 0)', config: { mass: 1, tension: 260, friction: 19 } },
    leave: { opacity: 0, transform: 'translate3d(-175%, 0, 0)', config: { mass: 1, tension: 170, friction: 26, clamp: true } },
}

export const slideRight = {
    from: { opacity: 0, transform: 'translate3d(175%, 0, 0)' },
    enter: { opacity: 1, transform: 'translate3d(0%, 0, 0)', config: { mass: 1, tension: 260, friction: 19 } },
    leave: { opacity: 0, transform: 'translate3d(175%, 0, 0)', config: { mass: 1, tension: 170, friction: 26, clamp: true } },
}

export const flip = {
    from: { transform: 'perspective(400px) rotate3d(1, 0, 0, 90deg)' },
    enter: { transform: 'perspective(400px) rotate3d(1, 0, 0, 0deg)', opacity: 1, config: { mass: 1, tension: 180, friction: 26 } },
    leave: { transform: 'perspective(400px) rotate3d(1, 0, 0, 90deg)', opacity: 0, config: { mass: 1, tension: 240, friction: 26, clamp: true } },
}

export const rotate = {
    from: { transform: 'rotate3d(0, 0, 1, 200deg)', opacity: 0 },
    enter: { transform: 'rotate3d(0, 0, 1, 0deg)', opacity: 1, config: { mass: 1, tension: 210, friction: 26 } },
    leave: { transform: 'rotate3d(0, 0, 1, 200deg)', opacity: 0, config: { mass: 1, tension: 240, friction: 26, clamp: true } },
}

export const zoom = {
    from: { transform: 'scale3d(0.3, 0.3, 0.3)' },
    enter: { transform: 'scale3d(1, 1, 1)', config: { mass: 1, tension: 210, friction: 26 } },
    leave: { transform: 'scale3d(0, 0, 0)', config: { mass: 1, tension: 240, friction: 26, clamp: true } },
}

export const door = {
    from: { transform: 'scale3d(0, 1, 1)' },
    enter: { transform: 'scale3d(1, 1, 1)', config: { mass: 1, tension: 210, friction: 26 } },
    leave: { transform: 'scale3d(0, 1, 0.1)', config: { mass: 1, tension: 240, friction: 26, clamp: true } },
}


const transitions = {
    blur,
    clipRectSp,
    clipRect,
    clipCircle,
    fade,
    flip,
    door,
    zoom,
    slideUp,
    slideDown,
    slideRight,
    slideLeft,
    rotate,
};

export type TransitionAnimationType = keyof typeof transitions;

type AnimationProps = Record<TransitionAnimationType, {
    from?: any,
    enter?: any,
    leave?: any,
    to?: any,
    config?: any
}>;

export const transitionAnimation = transitions as AnimationProps;