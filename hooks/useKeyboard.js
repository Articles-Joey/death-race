import { useCallback, useEffect, useState } from "react"

// Key Guide
// https://www.toptal.com/developers/keycode

function actionByKey(key) {
	const keyActionMap = {
		KeyW: 'moveUp',
		KeyS: 'moveDown',
		KeyA: 'moveLeft',
		KeyD: 'moveRight',
		Space: 'drop',
        // ShiftLeft: 'shift',
        // KeyC: 'crouch',
        // KeyV: 'cameraView',
		// Digit1: 'dirt',
		// Digit2: 'grass',
		// Digit3: 'glass',
		// Digit4: 'wood',
		// Digit5: 'log',
	}
	return keyActionMap[key]
}

export const useKeyboard = () => {
	const [actions, setActions] = useState({
		moveUp: false,
		moveDown: false,
		moveLeft: false,
		moveRight: false,
		drop: false,
        // shift: false,
        // crouch: false,
        // cameraView: false,
		// dirt: false,
		// grass: false,
		// glass: false,
		// wood: false,
		// log: false,
	})

	const handleKeyDown = useCallback((e) => {
		const action = actionByKey(e.code)
		if (action) {
			setActions((prev) => {
				return ({
					...prev,
					[action]: true
				})
			})
		}
	}, [])

	const handleKeyUp = useCallback((e) => {
		const action = actionByKey(e.code)
		if (action) {
			setActions((prev) => {
				return ({
					...prev,
					[action]: false
				})
			})
		}
	}, [])

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown)
		document.addEventListener('keyup', handleKeyUp)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('keyup', handleKeyUp)
		}
	}, [handleKeyDown, handleKeyUp])

	return actions
}