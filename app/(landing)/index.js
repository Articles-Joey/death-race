"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import PageTemplateLandingPage from "@articles-media/articles-dev-box/PageTemplateLandingPage";
import ArticlesButton from "@/components/UI/Button";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";
import ConnectedControllersPreview from "@/components/UI/ConnectedControllersPreview";
import RotatingMascot from "@/components/UI/RotatingMascot";
import logo from "@/app/icon.png";

const backgroundImage = `${process.env.NEXT_PUBLIC_CDN}games/Death Race/death-race-background.jpg`;
const LandingBackgroundAnimation = dynamic(
    () => import("@/components/Game/LandingBackgroundAnimation"),
    {
        ssr: false,
        loading: () => <Image src={backgroundImage} alt="" fill style={{ objectFit: "cover", objectPosition: "center", filter: "blur(10px)" }} />,
    },
);

export default function DeathRaceLobbyPage() {
    const darkMode = useStore((state) => state.darkMode);

    return (
        <Box
            sx={{
                position: "relative",
                isolation: "isolate",
                "& .landing-page": {
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                },
                "& .servers": { display: "grid", gap: "5px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
                "& .server": { p: "0.5rem", border: "1px solid rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", alignItems: "center" },
                "& .scoreboard": {
                    mt: "1rem",
                    "@media (min-width: 992px)": { mt: 0, display: "block", position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" },
                },
                "& .ad-wrap": {
                    mt: "1rem",
                    "@media (min-width: 992px)": { mt: 0, display: "block", position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)" },
                },
                "& .background-wrap": {
                    position: "fixed",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: -1,
                    "& img": { filter: "blur(2px)", opacity: darkMode === false ? 1 : "0.25 !important" },
                },
            }}
        >
            <PageTemplateLandingPage
                useSocketStore={useSocketStore}
                useStore={useStore}
                RotatingMascot={RotatingMascot}
                Link={Link}
                useRouter={useRouter}
                LandingBackgroundAnimation={<LandingBackgroundAnimation />}
                heroOverride={
                    <Box sx={{ position: "relative", mb: "1rem", textAlign: "center" }}>
                        <Box component="img" src={logo.src} alt="Game Logo" width={150} sx={{ display: "flex", mx: "auto", objectFit: "cover" }} />
                        <Box component="h1" sx={{ fontSize: "2rem", bgcolor: "#5e5f62", color: "#fff", borderRadius: "0.5rem", fontWeight: 900, WebkitTextStroke: "1px #000", width: "fit-content", p: "0.25rem 0.5rem", m: "auto", mt: "-16px" }}>
                            {process.env.NEXT_PUBLIC_GAME_NAME}
                        </Box>
                    </Box>
                }
                backgroundImage={backgroundImage}
                CardBodyPrependContent={
                    <Box sx={{ mb: "0.5rem", borderBottom: 1, borderColor: "divider", pb: "0.5rem" }}>
                        <ArticlesButton component={Link} href="/play?local_play=true" sx={{ width: "100%" }}>
                            <SportsEsportsIcon fontSize="small" sx={{ mr: "0.5rem" }} />
                            Local Play
                            <Box component="span" sx={{ ml: "0.5rem", px: "0.65em", py: "0.35em", fontSize: "0.75em", fontWeight: 700, lineHeight: 1, borderRadius: "0.375rem", bgcolor: "#212529", color: "#fff", scale: "1.1" }}>
                                Works offline!
                            </Box>
                        </ArticlesButton>
                        <Box sx={{ fontSize: "0.875em", textAlign: "center" }}>Play with 2 to 4 gamepads locally.</Box>
                        <ConnectedControllersPreview />
                    </Box>
                }
                multiplayerConfig={{ type: "WebSocket", defaultServers: 2, onlinePlayersTemplate: "2.0" }}
                gameScoreboardConfig={{
                    append_score_text: "m",
                    metrics: [
                        { label: "Players Killed", key: "score", format: (value) => `${value} m` },
                        { label: "Games Won", key: "games_won", format: (value) => `${value} m` },
                    ],
                }}
                disableGameScoreboard={process.env.NEXT_PUBLIC_ENABLE_ARTICLES !== "true"}
                disableAd={process.env.NEXT_PUBLIC_ENABLE_ARTICLES !== "true"}
            />
        </Box>
    );
}
