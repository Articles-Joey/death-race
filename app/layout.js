// import { Geist, Geist_Mono } from "next/font/google";

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';

import "bootstrap/dist/css/bootstrap.min.css";

// import "./globals.css";
import "@/styles/index.scss";

import "@articles-media/articles-dev-box/dist/style.css";

import "@articles-media/articles-gamepad-helper/dist/articles-gamepad-helper.css";

import SocketLogicHandler from "@/components/Handlers/SocketLogicHandler";
// import PeerLogicHandler from '@/components/Handlers/PeerLogicHandler';
import LayoutClient from './layoutClient';
import { Suspense } from 'react';
import LocalPlayHandler from '@/components/Handlers/LocalPlayHandler';

export const metadata = {
  title: "Death Race",
  description: "Make it to the finish line while avoiding detection. If you see any suspicious NPCs that you might think are players then use your bullet to take them out.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <head>

      </head>

      <body>

        <LayoutClient />

        <Suspense>
          <SocketLogicHandler />
          {/* <PeerLogicHandler /> */}
          <LocalPlayHandler />
        </Suspense>

        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
