import React, {MutableRefObject, useEffect, useRef, useState} from 'react';
import {Observable, Subscription} from 'rxjs';
import {ButtonEventData, Controller} from './controller/controller';
import {tap} from 'rxjs/operators';
import {isEqual} from 'lodash-es';
import {Stick} from './controller/buttons.model';
import {imageData, recogniseText} from './video-stream/ocr-pipeline';
import {ColourMatcher} from './video-stream/colour-matcher';

interface SwitchProps {
    children?: React.ReactChild;
    buttonEvents$?: Observable<ButtonEventData>;
}

const black = '#000';
const green = '#0F0';

export function Switch({children, buttonEvents$}: SwitchProps = {}) {

    const [subscription, setter] = useState<Subscription | null>(null);
    // const [buttonState.current?, setEventData] = useState<ButtonEventData | null>(null);
    const buttonState = useRef<Partial<ButtonEventData>>({});
    const previousButtonState = useRef<Partial<ButtonEventData>>({});
    const animationId = useRef<number>();

    const dpadUp = useRef<SVGPathElement>(null);
    const dpadDown = useRef<SVGPathElement>(null);
    const dpadLeft = useRef<SVGPathElement>(null);
    const dpadRight = useRef<SVGPathElement>(null);
    const minusButton = useRef<SVGPathElement>(null);
    const lClickButton = useRef<SVGPathElement>(null);
    const lBumper = useRef<SVGPathElement>(null);
    const captureButton = useRef<SVGPathElement>(null);
    const plusButton = useRef<SVGPathElement>(null);
    const xButton = useRef<SVGPathElement>(null);
    const bButton = useRef<SVGPathElement>(null);
    const yButton = useRef<SVGPathElement>(null);
    const aButton = useRef<SVGPathElement>(null);
    const homeButton = useRef<SVGPathElement>(null);
    const rClickButton = useRef<SVGPathElement>(null);
    const rBumper = useRef<SVGPathElement>(null);
    const vidCoord = useRef<[number, number] | null>(null);

    useEffect(() => {
        function updateStroke(el: MutableRefObject<SVGPathElement | null>, current: boolean | undefined, previous: boolean | undefined): void {
            if (current !== previous)
                el.current?.setAttribute('stroke', current ? green : black);
        }

        function coord(n: number) {
            return (n - Stick.MID) / (Stick.MAX / 25)
        }

        const update = () => {
            const current: Partial<ButtonEventData> = buttonState.current;
            const previous: Partial<ButtonEventData> = previousButtonState.current;

            updateStroke(dpadRight, current.dpad?.right, previous.dpad?.right);
            updateStroke(dpadLeft, current.dpad?.left, previous.dpad?.left);
            updateStroke(dpadUp, current.dpad?.up, previous.dpad?.up);
            updateStroke(dpadDown, current.dpad?.down, previous.dpad?.down);
            updateStroke(minusButton, current.minus, previous.minus);
            updateStroke(lClickButton, current.lClick, previous.lClick);
            updateStroke(captureButton, current.capture, previous.capture);
            updateStroke(plusButton, current.plus, previous.plus);
            updateStroke(xButton, current.x, previous.x);
            updateStroke(bButton, current.b, previous.b);
            updateStroke(yButton, current.y, previous.y);
            updateStroke(aButton, current.a, previous.a);
            updateStroke(homeButton, current.home, previous.home);
            updateStroke(rClickButton, current.rClick, previous.rClick);
            updateStroke(rClickButton, current.rClick, previous.rClick);
            updateStroke(rClickButton, current.rClick, previous.rClick);
            updateStroke(lBumper, (current.l || current.zl), (previous.l || previous.zl));
            updateStroke(rBumper, (current.r || current.zr), (previous.r || previous.zr));

            if (current.leftStick && isEqual(current.leftStick, previous.leftStick))
                lClickButton.current?.parentElement?.setAttribute('transform', `translate(${coord(current.leftStick[0])}, ${coord(current.leftStick[1])})`);
            if (current.rightStick && isEqual(current.rightStick, previous.rightStick))
                rClickButton.current?.parentElement?.setAttribute('transform', `translate(${coord(current.rightStick[0])}, ${coord(current.rightStick[1])})`);

            previousButtonState.current = current;
            animationId.current = requestAnimationFrame(update)
        };

        animationId.current = requestAnimationFrame(update);

        return () => {
            if (animationId.current)
                cancelAnimationFrame(animationId.current)
        }
    }, []);
    useEffect(() => {
            if (subscription) {
                subscription.unsubscribe();
            }
            if (buttonEvents$) {
                const newSubscription = buttonEvents$.subscribe((next) => {
                    buttonState.current = next;
                });
                setter(newSubscription)
            }
        }, [buttonEvents$]
    );

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='100%'
            viewBox='0 0 994 425'
        >
            <g fill='none' fillRule='evenodd' stroke='none' strokeWidth='1'>
                <g transform='translate(1 1)'>
                    <g fillRule='nonzero' stroke='#000'>
                        <path
                            fill='#44484C'
                            ref={lBumper}
                            stroke={(buttonState.current?.l || buttonState.current?.zl) ? green : black}
                            d='M113.47 6.844V2.656C113.47 1.4 112.186 0 110.814 0h-26.25C44.07 0 7.824 32.662 1.612 55.844c-.283 1.058-.385 3.182 1.459 3.182h4.662L113.47 6.844z'
                        />
                        <path
                            fill='#00BBDB'
                            d='M136.512 8.383V421.07c0 1.024-.506 1.797-1.797 1.797h-49.64C33.395 422.867 0 377.169 0 337.792V89.852c0-57.886 56.764-84.72 84.719-84.72h48.79c2.487 0 3.003 1.368 3.003 3.25z'
                        />
                        <path
                            fill='#44484C'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            ref={dpadUp}
                            onClick={() => Controller.up()}
                            stroke={buttonState.current?.dpad?.up ? green : black}
                            strokeWidth='1'
                            d='M87.355 200.042c0 8.367-6.783 15.15-15.15 15.15-8.368 0-15.15-6.783-15.15-15.15 0-8.368 6.782-15.15 15.15-15.15 8.367 0 15.15 6.782 15.15 15.15h0z'
                        />
                        <path
                            fill='#44484C'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            ref={dpadDown}
                            onClick={() => Controller.down()}
                            stroke={buttonState.current?.dpad?.down ? green : black}
                            strokeWidth='1'
                            d='M87.355 262.671c0 8.367-6.783 15.15-15.15 15.15-8.368 0-15.15-6.783-15.15-15.15s6.782-15.15 15.15-15.15c8.367 0 15.15 6.783 15.15 15.15h0z'
                        />
                        <path
                            fill='#44484C'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            ref={dpadLeft}
                            onClick={() => Controller.left()}
                            stroke={buttonState.current?.dpad?.left ? green : black}
                            strokeWidth='1'
                            d='M40.89 246.507c-8.367 0-15.15-6.783-15.15-15.15 0-8.368 6.783-15.151 15.15-15.151s15.15 6.783 15.15 15.15c0 8.368-6.783 15.15-15.15 15.15h0z'
                        />
                        <path
                            fill='#44484C'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            ref={dpadRight}
                            onClick={() => Controller.right()}
                            stroke={buttonState.current?.dpad?.right ? green : black}
                            strokeWidth='1'
                            d='M103.52 246.507c-8.368 0-15.151-6.783-15.151-15.15 0-8.368 6.783-15.151 15.15-15.151 8.368 0 15.15 6.783 15.15 15.15 0 8.368-6.782 15.15-15.15 15.15h0z'
                        />
                        <path
                            fill='#44484C'
                            ref={minusButton}
                            onClick={() => Controller.minus()}
                            stroke={buttonState.current?.minus ? green : black}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M103.264 43.469H125.452V49.844H103.264z'
                        />
                        <g>
                            <path
                                fill='#44484C'
                                ref={lClickButton}
                                stroke={buttonState.current?.lClick ? green : black}
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                d='M104.389 113.469c0 17.707-14.355 32.062-32.063 32.062-17.707 0-32.062-14.355-32.062-32.062 0-17.708 14.355-32.063 32.062-32.063 17.708 0 32.063 14.355 32.063 32.063z'
                            />
                            <path
                                fill='#44484C'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='1'
                                d='M94.81 113.691c0 12.418-10.066 22.484-22.484 22.484-12.417 0-22.484-10.066-22.484-22.484 0-12.418 10.067-22.484 22.484-22.484 12.418 0 22.484 10.066 22.484 22.484z'
                            />
                            <path
                                fill='#000'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='0.031'
                                d='M71.165 87.355c0-2.145.006-3.412.015-3.48.03-.207.132-.405.29-.562a.982.982 0 011.576.275c.11.228.102-.049.102 3.717v3.402h-.7c-.387 0-.833.004-.993.01l-.29.011v-3.373h0z'
                            />
                            <path
                                fill='#000'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='0.031'
                                d='M72.045 143.776c-.39-.044-.725-.333-.847-.732-.025-.08-.027-.33-.031-3.24l-.005-3.153.23.013c.127.007.574.013.993.013h.762l-.004 3.156-.004 3.156-.035.102a1.037 1.037 0 01-.651.647c-.1.034-.29.051-.408.038h0z'
                            />
                            <path
                                fill='#000'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='0.031'
                                d='M95.311 113.76c0-.356-.006-.802-.013-.994l-.012-.348 3.231.004 3.231.004.115.042c.431.158.7.555.67.994a.974.974 0 01-.28.631c-.134.136-.259.208-.489.282-.05.016-.711.02-3.258.024l-3.195.005v-.645h0z'
                            />
                            <path
                                fill='#000'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='0.031'
                                d='M42.64 114.387a.988.988 0 01-.579-.299.985.985 0 01.492-1.647c.07-.017.69-.021 3.45-.022h3.364l-.012.332c-.007.183-.013.629-.013.992v.66l-3.304-.002a253.448 253.448 0 01-3.399-.014h0z'
                            />
                        </g>
                        <path
                            fill='#44484C'
                            ref={captureButton}
                            stroke={buttonState.current?.capture ? green : black}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M82.389 298.344H108.139V323.469H82.389z'
                        />
                        <path
                            fill='#000'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M104.014 311.125a8.844 8.844 0 11-17.688 0 8.844 8.844 0 0117.688 0h0z'
                        />
                        <path
                            fill='#000'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='1'
                            d='M99.482768 237.725128L99.482768 225.049091 110.460541 231.38711z'
                        />
                        <path
                            fill='#000'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='1'
                            d='M34.107767 237.725128L34.107767 225.049091 45.08554 231.38711z'
                            transform='matrix(-1 0 0 1 79.193 0)'
                        />
                        <path
                            fill='#000'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='1'
                            d='M66.6965414 205.210364L66.6965414 192.534327 77.6743144 198.872346z'
                            transform='rotate(-90 72.185 198.872)'
                        />
                        <path
                            fill='#000'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='1'
                            d='M66.6965414 270.585363L66.6965414 257.909326 77.6743144 264.247344z'
                            transform='scale(-1 1) rotate(90 0 192.062)'
                        />
                    </g>
                    <g fillRule='nonzero' transform='translate(855.604)'>
                        <path
                            fill='#44484C'
                            ref={rBumper}
                            stroke={(buttonState.current?.r || buttonState.current?.zr) ? green : black}
                            d='M23 6.84V2.656C23 1.4 24.284 0 25.656 0h26.246c40.488 0 76.729 32.647 82.94 55.82.283 1.057.384 3.18-1.459 3.18h-4.662L23 6.84z'
                        />
                        <path
                            fill='#FF5F53'
                            stroke='#000'
                            d='M0 9.244v411.962C0 422.228.508 423 1.803 423h49.818C103.485 423 137 377.383 137 338.075V90.57C137 32.787 80.033 6 51.978 6H3.014C.519 6 0 7.366 0 9.244h0z'
                        />
                        <path
                            fill='#44484C'
                            ref={plusButton}
                            onClick={() => Controller.plus()}
                            stroke={buttonState.current?.plus ? green : black}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M11 43.6326553L18.4645931 43.6326553 18.4645931 36 24.659233 36 24.659233 43.6647179 32 43.6647179 32 50.0787203 24.6902386 50.0787203 24.6902386 58 18.40268 58 18.40268 50.0787203 11.0309075 50.0787203z'
                        />
                        {/*X Button*/}
                        <path
                            fill='#44484C'
                            ref={xButton}
                            onClick={() => Controller.x()}
                            stroke={buttonState.current?.x ? green : black}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='1'
                            d='M79 79c0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15 0-8.284 6.716-15 15-15 8.284 0 15 6.716 15 15h0z'
                        />
                        {/*B Button*/}
                        <path
                            fill='#44484C'
                            ref={bButton}
                            onClick={() => Controller.b()}
                            stroke={buttonState.current?.b ? green : black}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='1'
                            d='M79 142c0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15 0-8.284 6.716-15 15-15 8.284 0 15 6.716 15 15h0z'
                        />
                        {/*Y Button*/}
                        <path
                            fill='#44484C'
                            ref={yButton}
                            onClick={() => Controller.y()}
                            stroke={buttonState.current?.y ? green : black}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='1'
                            d='M32 126c-8.284 0-15-6.716-15-15 0-8.284 6.716-15 15-15 8.284 0 15 6.716 15 15 0 8.284-6.716 15-15 15h0z'
                        />
                        {/*A Button*/}
                        <path
                            fill='#44484C'
                            ref={aButton}
                            onClick={() => Controller.a()}
                            stroke={buttonState.current?.a ? green : black}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='1'
                            d='M95 126c-8.284 0-15-6.716-15-15 0-8.284 6.716-15 15-15 8.284 0 15 6.716 15 15 0 8.284-6.716 15-15 15h0z'
                        />
                        {/*HOME*/}
                        <path
                            fill='#999595'
                            ref={homeButton}
                            onClick={() => Controller.home()}
                            stroke={buttonState.current?.home ? green : black}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='1'
                            d='M58 305c0 9.389-7.611 17-17 17s-17-7.611-17-17 7.611-17 17-17 17 7.611 17 17h0z'
                        />
                        <path
                            fill='#3A3D40'
                            stroke='#000'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='1'
                            d='M53 304.5c0 6.904-5.596 12.5-12.5 12.5S28 311.404 28 304.5 33.596 292 40.5 292 53 297.596 53 304.5h0z'
                        />
                        <path
                            fill='#000'
                            stroke='#000'
                            d='M32 304.183h2.545V312h12.91v-7.817H50c-2.804-2.545-6.577-6.02-9-8.183-2.933 2.632-6.024 5.471-9 8.183h0zm6 .13h6v4.994h-6v-4.993z'
                        />
                        {/*Right stick*/}
                        <g>
                            <path
                                fill='#44484C'
                                ref={rClickButton}
                                stroke={buttonState.current?.rClick ? green : black}
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                d='M96 227c0 17.673-14.327 32-32 32-17.673 0-32-14.327-32-32 0-17.673 14.327-32 32-32 17.673 0 32 14.327 32 32z'
                            />
                            <path
                                fill='#44484C'
                                stroke='#000'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='1'
                                d='M86 226.5c0 12.426-10.074 22.5-22.5 22.5S41 238.926 41 226.5 51.074 204 63.5 204 86 214.074 86 226.5z'
                            />
                            <path
                                fill='#000'
                                stroke='#000'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='0.031'
                                d='M63 200.495c0-2.229.01-3.545.016-3.616.03-.215.133-.42.292-.584a.975.975 0 011.588.286c.111.237.103-.05.104 3.863v3.534h-.707c-.389-.001-.839.004-1 .01L63 204v-3.505h0z'
                            />
                            <path
                                fill='#000'
                                stroke='#000'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='0.031'
                                d='M63.895 256.996a1.026 1.026 0 01-.854-.72c-.024-.077-.027-.323-.03-3.18L63 250l.232.012c.128.007.578.013 1 .013H65v6.198l-.035.1c-.105.3-.348.535-.656.636-.101.032-.292.05-.411.037h0-.003z'
                            />
                            <path
                                fill='#000'
                                stroke='#000'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='0.031'
                                d='M87.025 227.35c0-.357-.01-.807-.012-1L87 226l3.12.004 3.12.004.111.042a.997.997 0 01.647 1.001 1 1 0 01-.271.636c-.129.136-.25.209-.472.283-.048.016-.687.021-3.145.025l-3.085.005v-.65h0z'
                            />
                            <path
                                fill='#000'
                                stroke='#000'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='0.031'
                                d='M33.904 227.983a1.059 1.059 0 01-.61-.3c-.562-.568-.279-1.475.519-1.66.075-.018.727-.022 3.639-.022L41 226l-.013.335c-.01.184-.012.634-.012 1V228l-3.486-.002a279.78 279.78 0 01-3.585-.015h0z'
                            />
                        </g>
                        <path
                            fill='#FFF'
                            d='M56 86.98c0-.01 1.244-1.888 2.765-4.174l2.764-4.159-2.45-3.727c-1.347-2.05-2.48-3.772-2.519-3.824L56.492 71h3.791l1.626 2.568c.894 1.412 1.641 2.562 1.66 2.556.02-.011.747-1.158 1.617-2.559l1.582-2.548 1.868-.01c1.027-.011 1.868 0 1.868.01 0 .011-1.127 1.75-2.503 3.867-1.432 2.203-2.496 3.873-2.487 3.905.01.03 1.246 1.881 2.75 4.112A539.281 539.281 0 0171 86.978c0 .011-.874.02-1.941.02h-1.942l-1.805-2.779c-1.457-2.244-1.813-2.77-1.848-2.732-.024.025-.845 1.276-1.825 2.78L59.858 87h-1.93c-1.06 0-1.928-.011-1.928-.017v-.002z'
                        />
                        <path
                            fill='#FFF'
                            d='M87.003 117.938c.06-.159 6.055-15.529 6.132-15.72l.086-.218H96.6l3.191 7.956 3.21 8c.014.035-.335.042-1.725.034l-1.742-.01-.702-1.825-.702-1.825-3.218.01-3.218.01-.664 1.825-.663 1.825h-1.693c-1.599 0-1.692-.01-1.67-.06v-.002zm10.085-6.305c-.01-.024-.509-1.369-1.111-2.988-.602-1.62-1.105-2.932-1.118-2.917-.017.02-1.304 3.537-2.161 5.905-.013.034.441.043 2.196.043 1.754 0 2.208-.01 2.194-.043z'
                        />
                        <path
                            fill='#FFF'
                            d='M58 142v-8l3.85.017c3.839.017 4.253.03 5.023.15 1.168.182 2.126.795 2.76 1.764a3.824 3.824 0 01-.38 4.687c-.276.301-.54.512-.91.724l-.285.165.231.08a4.56 4.56 0 011.565.92c.472.443.877 1.146 1.054 1.825.08.309.09.408.092.99 0 .503-.01.709-.06.934-.196.918-.629 1.771-1.203 2.373-.736.77-1.638 1.16-2.926 1.267-.642.053-3.768.103-6.49.104H58v-8zm7.763 5.277c.719-.061 1.102-.211 1.482-.58.393-.38.556-.82.555-1.498 0-1.044-.553-1.776-1.51-2.005-.554-.134-.879-.151-3.046-.168l-2.116-.016v4.302h2.116c1.164 0 2.297-.016 2.519-.035zm-1.253-6.913c1.135-.033 1.362-.067 1.771-.266a1.65 1.65 0 00.872-1.001c.098-.306.098-.93 0-1.24-.184-.582-.605-.957-1.252-1.115-.202-.049-.555-.059-2.504-.072l-2.27-.014v3.742h1.182c.65 0 1.64-.015 2.201-.03v-.004z'
                        />
                        <path
                            fill='#FFF'
                            d='M30.877 115.625v-3.373l-2.938-4.612A976.572 976.572 0 0125 103.014c0-.01.843-.014 1.874-.014h1.874l1.9 3.177c1.414 2.361 1.91 3.165 1.94 3.134.02-.022.866-1.451 1.877-3.176L36.303 103H40l-.05.08c-.029.042-1.36 2.13-2.96 4.64l-2.91 4.562V119H30.877v-3.374z'
                        />
                    </g>
                    <g
                        stroke='#373435'
                        strokeWidth='0.5'
                        transform='translate(137.204 5.8)'
                    >
                        <path
                            fill='#30363A'
                            d='M16.439 0h687.485c0 8.093 5.97 14.909 13.764 16.186V417.4H0V16.38c9.034 0 16.439-7.357 16.439-16.38z'
                        />
                        <path
                            fill='#373435'
                            d='M30.744 13.012h661.204c4.808 0 8.723 3.913 8.723 8.717v367.937c0 4.803-3.915 8.716-8.723 8.716H650.97v-3.72a4.11 4.11 0 00-4.11-4.105h-25.122a4.11 4.11 0 00-4.11 4.106v3.719H249.944v-9.414c0-3.099-3.257-5.655-7.328-5.655-4.032 0-7.288 2.556-7.288 5.655v9.414H105.064v-3.72a4.11 4.11 0 00-4.11-4.105H75.833a4.085 4.085 0 00-4.11 4.106v3.719H30.745c-4.807 0-8.723-3.913-8.723-8.716V21.729c0-4.804 3.916-8.717 8.723-8.717z'
                        />
                        {
                            React.Children.count(children)
                                ? (
                                    <foreignObject key={1} x={73.07} y={44.042} width={643.617 - 73.07}
                                                   height={365.35 - 44.042}>
                                        {children}
                                        <canvas key={0}
                                                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}

                                                onClick={((event) => {
                                                    const rect = event.currentTarget.getBoundingClientRect();
                                                    const [right, bottom] = [Math.floor(event.clientX - rect.left), Math.floor(event.clientY - rect.top)];
                                                    if (!vidCoord.current) {
                                                        vidCoord.current = [right, bottom];
                                                        console.log('First position:', vidCoord.current.join(','))
                                                    } else {
                                                        const [left, top] = vidCoord.current;
                                                        const [width, height] = [
                                                            Math.floor(rect.width),
                                                            Math.floor(rect.height)
                                                        ];
                                                        const rectangle: [number, number, number, number] = [
                                                            left / width,
                                                            (top) / height,
                                                            (right - left) / width,
                                                            (bottom - top) / height
                                                        ];
                                                        console.log(`[${left}/${width}, ${top}/${height}, ${right - left}/${width}, ${bottom - top}/${height}]`, rectangle);
                                                        if (rectangle[2] && rectangle[3])
                                                            recogniseText(rectangle).then(d => console.log(d, ColourMatcher.closestMatch(imageData([left / width, top / height, 1, 1])?.data.slice(0, 3))))
                                                        vidCoord.current = null
                                                    }

                                                })}/>
                                    </foreignObject>
                                )
                                : (
                                    <rect fill='#606062' x={73.07} y={44.042} width={643.617 - 73.07}
                                          height={365.35 - 44.042}/>
                                )
                        }
                    </g>
                </g>
            </g>
        </svg>
    );
}
