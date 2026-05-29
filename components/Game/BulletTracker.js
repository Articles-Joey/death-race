'use client';
import { useEffect } from 'react';
import { usePlayersStore } from '@/hooks/usePlayersStore';

// Place your image URLs here
const cursorImgUrls = [
    '/img/bullet-sharp.svg',
    '/img/bullet-sharp.svg',
    '/img/bullet-sharp.svg',
];

export default function BulletTracker() {
    const fakeBulletTracker = usePlayersStore(state => state.fakeBulletTracker);

    useEffect(() => {
        const canvasWrap = document.querySelector('.canvas-wrap');
        if (!canvasWrap) return;

        // Remove any previously added images (cleanup in case of rerender)
        const prevImgs = document.querySelectorAll('.dynamic-cursor-img');
        prevImgs.forEach(img => img.remove());

        // Create image elements dynamically based on fakeBulletTracker
        const imgs = Array.from({ length: fakeBulletTracker }, (_, i) => {
            const img = document.createElement('img');
            img.src = cursorImgUrls[i % cursorImgUrls.length];
            img.alt = `cursor-img-${i + 1}`;
            img.className = 'dynamic-cursor-img';
            img.style.position = 'fixed';
            img.style.pointerEvents = 'none';
            img.style.zIndex = 9999;
            img.style.width = '32px';
            img.style.height = '32px';
            img.style.display = 'none';
            document.body.appendChild(img);
            return img;
        });

        function handleMove(e) {
            // Space bullets horizontally with 10px gap
            imgs.forEach((img, i) => {
                img.style.left = (e.clientX + i * 10) + 'px';
                img.style.top = (e.clientY + 30) + 'px';
            });
        }
        function handleEnter() {
            imgs.forEach(img => img.style.display = 'block');
        }
        function handleLeave() {
            imgs.forEach(img => img.style.display = 'none');
        }

        canvasWrap.addEventListener('mousemove', handleMove);
        canvasWrap.addEventListener('mouseenter', handleEnter);
        canvasWrap.addEventListener('mouseleave', handleLeave);

        // If the mouse is already inside the element, trigger handleEnter immediately
        if (canvasWrap.matches(':hover')) {
            handleEnter();
        }

        return () => {
            canvasWrap.removeEventListener('mousemove', handleMove);
            canvasWrap.removeEventListener('mouseenter', handleEnter);
            canvasWrap.removeEventListener('mouseleave', handleLeave);
            imgs.forEach(img => img.remove());
        };
    }, [fakeBulletTracker]);

    return null;
}
