"use client";

import { useStore } from "@/hooks/useStore";
import DarkModeHandler from "@articles-media/articles-dev-box/DarkModeHandler";
import GlobalBody from '@articles-media/articles-dev-box/GlobalBody';
// import { useEffect } from "react";

export default function LayoutClient({

}) {

    // const theme = useStore(state => state.theme);

    // useEffect(() => {
    //     // document.body.className = theme === 'Dark' ? 'dark-theme' : 'light-theme';
    //     document.body.setAttribute('data-bs-theme', theme === 'Dark' ? 'dark' : 'light');
    // }, [theme]);

    return (
        <>
            <GlobalBody />
            <DarkModeHandler
                useStore={useStore}
            />
        </>
    );
}
