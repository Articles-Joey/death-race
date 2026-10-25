export const FIELD_HEIGHT = 5.6;

export function bankHeight(x, t) {
    const endRise = -0.2 + (FIELD_HEIGHT + 0.2) * Math.sin((t * Math.PI) / 2);
    const sideRise = Math.min(
        FIELD_HEIGHT,
        2.5 + (Math.abs(x) - 62) * Math.tan(Math.PI / 15),
    );
    return Math.max(endRise, sideRise);
}

export function groundHeight(x, z) {
    if (Math.abs(x) >= 76.5 || Math.abs(z) >= 128) return FIELD_HEIGHT;
    if (Math.abs(z) > 100) return bankHeight(x, (Math.abs(z) - 100) / 28);
    return Math.max(-0.2, 2.5 + (Math.abs(x) - 62) * Math.tan(Math.PI / 15));
}
