"use client";

import DevBoxButton from "@articles-media/articles-dev-box/Button";

// Keep Death Race's button styling on dev-box's MUI button.
export default function ArticlesButton({ variant, active, sx, ...props }) {
    return (
        <DevBoxButton
            {...props}
            variant={variant}
            active={active}
            sx={[
                (theme) => {
                    const dark = theme.palette.mode === "dark";
                    const articles = !variant || variant === "articles";
                    const variantStyles = {
                        success: { bgcolor: "#00a74b", color: "#fff", borderBottom: "3px solid #007434" },
                        primary: { bgcolor: "#0d6efd", color: "#fff", borderBottom: "3px solid #0b0fff" },
                        secondary: { bgcolor: "#6c757d", color: "#fff", borderBottom: "3px solid #4c545b" },
                        "outline-dark": { color: dark ? "#fff" : "#212529", borderColor: dark ? "#fff" : "#212529" },
                    };
                    return {
                        borderRadius: 0,
                        fontStyle: "normal",
                        fontWeight: 900,
                        fontSize: "0.7rem",
                        whiteSpace: "pre",
                        ...variantStyles[variant],
                        ...(articles && {
                            bgcolor: dark ? "#464646" : "#fff",
                            color: dark ? "#fff" : "#212529",
                            border: `1px solid ${dark ? "#1d1d1d" : "#ced4da"}`,
                            borderBottom: `3px solid ${theme.palette.primary.main}`,
                            "&:hover": {
                                textDecoration: "none",
                                bgcolor: dark ? "#000" : "#e2e6ea",
                                color: dark ? "#fff" : "#212529",
                                ...(!dark && { borderColor: "#dae0e5", borderBottom: "3px solid #f5f5dc" }),
                            },
                            "&:active": { bgcolor: theme.palette.primary.main, color: "#000", borderBottom: "3px solid #000" },
                            ...(active && { bgcolor: theme.palette.primary.main, color: "#000", borderBottom: "3px solid #000" }),
                            "&.Mui-disabled": { filter: "grayscale(1)", color: "darkgray", opacity: 1 },
                        }),
                    };
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        />
    );
}
