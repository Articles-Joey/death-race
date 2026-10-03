"use client";

import Box from "@mui/material/Box";
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

const actionButtonSx = {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    opacity: 0.75,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
    transitionDuration: "200ms",
    "&:hover": { opacity: 1 },
};

function ActionButtons() {

    const {
        socket
    } = useSocketStore(state => ({
        socket: state.socket
    }));

    const isWalking = useGameStore(state => state.isWalking);
    const setIsWalking = useGameStore(state => state.setIsWalking);
    const setTouchControls = useTouchControlsStore(state => state.setTouchControls);

    return (
        <Box sx={{ position: "fixed", right: "1rem", bottom: "50px", display: "flex", flexDirection: "column", gap: "1rem", zIndex: 2 }}>

            <ArticlesButton
                sx={actionButtonSx}
                onClick={() => {
                    socket.emit('game:death-race:toggle-run');
                }}
            >
                Run
            </ArticlesButton>

            <ArticlesButton
                sx={actionButtonSx}
                onClick={() => {
                    const next = !isWalking;
                    setIsWalking(next);
                    if (next) {
                        socket.emit('game:death-race:start-walking');
                    } else {
                        socket.emit('game:death-race:stop-walking');
                    }
                }}
            >
                Walk
            </ArticlesButton>

            <ArticlesButton
                sx={actionButtonSx}
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

        </Box>
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
                    right: false,
                    up: false,
                    down: false,
                    axisX: 0,
                    axisY: 0
                })
            }

        })
            .on('move', function (evt, data) {

                // debug(data);
                dragDistance = data.distance

                // Calculate normalized axis values (0 to 1)
                // Default nipplejs radius is 50px
                const force = Math.min(data.distance / 50, 1);
                const axisX = data.vector ? data.vector.x * force : 0;
                const axisY = data.vector ? data.vector.y * force : 0;

                if (dragDistance > 15) {
                    setTouchControls({
                        ...touchControls,
                        axisX: axisX,
                        axisY: axisY,
                        left: dragDirection == 'left',
                        right: dragDirection == 'right',
                        up: dragDirection == 'up',
                        down: dragDirection == 'down'
                    })
                } else {
                    setTouchControls({
                        ...touchControls,
                        axisX: 0,
                        axisY: 0,
                        left: false,
                        right: false,
                        up: false,
                        down: false
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

                    if (evt.type == 'dir:up') {
                        dragDirection = 'up'
                    }

                    if (evt.type == 'dir:down') {
                        dragDirection = 'down'
                    }

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
        <Box
            sx={{
                position: "absolute",
                left: "1rem",
                bottom: "50px",
                width: "calc(100% - 100px - 2rem - 1rem)",
                border: "3px solid #198754",
                borderRadius: "0.5rem",
                maxHeight: "300px",
                height: "calc(100% - 50px - 2rem)",
                zIndex: 1,
                bgcolor: "rgba(0,0,0,0.25)",
                display: touchControlsEnabled ? "flex" : "none",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >

            <Box sx={{ width: "100%", height: "100%" }}>
                <Box sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    // backgroundColor: 'black',
                    zIndex: 1,
                }} id="zone_joystick" />
            </Box>

            <Box sx={{ display: "none" }}>

                <Box>
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

                </Box>

                <Box sx={{ ml: "0.5rem", display: "none", "@media (min-width: 992px)": { display: "block" } }}>
                    <Box>Active: {nStart ? 'True' : 'False'}</Box>
                    <Box>Direction: {nDirection ? nDirection : 'None'}</Box>
                    <Box>Touch: {JSON.stringify(touchControls)}</Box>
                </Box>

            </Box>

            <ActionButtons />

        </Box>
    )
}
