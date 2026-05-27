import { memo, useEffect, useState } from "react";

import ArticlesButton from "@/components/UI/Button"
// import { useControlsStore, useGameStore } from "@/hooks/useGameStore"
import useTouchControlsStore from "@/hooks/useTouchControlsStore";
import { useStore } from "@/hooks/useStore";
import { useGameStore } from "@/hooks/useGameStore";
import { useSocketStore } from "@/hooks/useSocketStore";

const arePropsEqual = (prevProps, nextProps) => {
    // Compare all props for equality
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};

function ActionButtons() {

    const {
        socket
    } = useSocketStore(state => ({
        socket: state.socket
    }));

    const setTouchControls = useTouchControlsStore(state => state.setTouchControls);

    return (
        <div className="action-buttons g-3">

            <ArticlesButton
                className="action-button run-button"
                onClick={() => {

                    socket.emit('game:death-race:toggle-run');

                    // const touchControls = useTouchControlsStore.getState().touchControls;
                    // console.log("Jump!")
                    // setTouchControls({
                    //     ...touchControls,
                    //     jump: true
                    // })
                }}
            >
                Run
            </ArticlesButton>

            <ArticlesButton
                className="action-button walk-button"
                onClick={() => {

                    socket.emit('game:death-race:toggle-walking');

                    // const touchControls = useTouchControlsStore.getState().touchControls;
                    // setTouchControls({
                    //     ...touchControls,
                    //     roll: true
                    // })
                }}
            >
                Walk
            </ArticlesButton>

            <ArticlesButton
                className="action-button shoot-button"
                onClick={() => {
                    const touchControls = useTouchControlsStore.getState().touchControls;
                    setTouchControls({
                        ...touchControls,
                        shoot: true
                    })
                }}
            >
                Shoot
            </ArticlesButton>

        </div>
    )
}

export default function TouchControls(props) {

    // const {
    //     touchControlsEnabled,
    // } = props;

    const sceneKey = useStore(state => state.sceneKey)
    // const cameraMode = useGameStore(state => state.cameraMode)

    const touchControls = useTouchControlsStore(state => state.touchControls);
    const setTouchControls = useTouchControlsStore(state => state.setTouchControls);
    const touchControlsEnabled = useTouchControlsStore(state => state.enabled);

    const [nippleCreated, setNippleCreated] = useState(false)

    const [nStart, setnStart] = useState(false)
    const [nDirection, setnDirection] = useState(false)

    // const {
    //     touchControls, setTouchControls
    // } = useTouchControlsStore()

    function startNipple() {

        // console.log("n", nipplejs)

        // return

        var options = {
            zone: document.getElementById('zone_joystick'),
            // threshold: 0.5
            // lockX: true,
        };

        // var manager = nipplejs.create(options);
        var manager = require('nipplejs').create(options);

        setNippleCreated(true)

        let dragDistance
        let dragDirection

        manager.on('start end', function (evt, data) {
            // dump(evt.type);
            // debug(data);
            console.log("1", evt.type)

            if (evt.type == 'start') {
                setnStart(true)
            } else if (evt.type == 'end') {
                setnStart(false)
                setnDirection(false)
                dragDistance = 0
                dragDirection = false
                setTouchControls({
                    ...touchControls,
                    left: false,
                    right: false
                })
            }

        })
            .on('move', function (evt, data) {

                // debug(data);
                dragDistance = data.distance
                console.log("2", dragDistance)

                if (dragDistance > 15 && dragDirection) {

                    if (dragDirection == 'left') setTouchControls({
                        ...touchControls,
                        left: true,
                        right: false
                    })

                    if (dragDirection == 'right') setTouchControls({
                        ...touchControls,
                        left: false,
                        right: true
                    })

                } else {
                    setTouchControls({
                        ...touchControls,
                        left: false,
                        right: false
                    })
                }

            })
            .on(' ' +
                'dir:up plain:up dir:left plain:left dir:down ' +
                'plain:down dir:right plain:right',
                function (evt, data) {

                    if (evt.type == 'move') {
                        dragDistance = data.distance
                    }

                    // dump(evt.type);
                    console.log("3", evt.type, dragDistance)



                    if (evt.type == 'dir:left') {
                        dragDirection = 'left'
                        // setnDirection('left')
                        // setTouchControls({
                        //     ...touchControls,
                        //     left: true,
                        //     right: false
                        // })
                    }

                    if (evt.type == 'dir:right') {
                        dragDirection = 'right'
                        // setnDirection('right')
                        // setTouchControls({
                        //     ...touchControls,
                        //     left: false,
                        //     right: true
                        // })
                    }

                }
            )
            .on('pressure', function (evt, data) {
                // debug({
                //   pressure: data
                // });
            });

        return manager;
    }

    useEffect(() => {

        console.log("Load nipple")
        const manager = startNipple()

        return () => {
            if (manager) {
                console.log("Destroy nipple")
                manager.destroy()
            }
        }

    }, [sceneKey]);

    // if (cameraMode == "Free") return null

    return (
        <div
            className={`touch-controls-area ${!touchControlsEnabled && 'd-none'}`}
        >

            <div className="w-100 h-100">
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    // backgroundColor: 'black',
                    zIndex: 1,
                }} id="zone_joystick"></div>
            </div>

            <div className='d-flex d-none'>

                <div>
                    {/* <ArticlesButton
                    onClick={() => {
                        setTouchControls({
                            left: true
                        })
                    }}
                >
                    Left
                </ArticlesButton>
                <ArticlesButton
                    onClick={() => {
                        setTouchControls({
                            right: true
                        })
                    }}
                >
                    Right
                </ArticlesButton> */}

                </div>

                <div className='ms-2 d-none d-lg-block'>
                    <div>Active: {nStart ? 'True' : 'False'}</div>
                    <div>Direction: {nDirection ? nDirection : 'None'}</div>
                    <div>Touch: {JSON.stringify(touchControls)}</div>
                </div>

            </div>

            <ActionButtons />

        </div>
    )
}