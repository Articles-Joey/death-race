// import { Geist, Geist_Mono } from "next/font/google";

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';

import "bootstrap/dist/css/bootstrap.min.css";

// import "./globals.css";
import "@/styles/index.scss";
import SocketLogicHandler from "@/components/SocketLogicHandler";
import PeerLogicHandler from '@/components/PeerLogicHandler';
import LayoutClient from './layoutClient';

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata = {
  title: "Death Race",
  description: "Make it to the finish line while avoiding detection. If you see any suspicious NPCs that you might think are players then use your bullet to take them out.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <head>

        <link
          rel="stylesheet"
          href={`${process.env.NEXT_PUBLIC_CDN}fonts/fontawsome/css/all.min.css`}
        />

      </head>

      <body
      // className={`${geistSans.variable} ${geistMono.variable}`}
      >

        <SocketLogicHandler />

        <PeerLogicHandler />

        <LayoutClient />

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
