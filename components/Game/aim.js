export const CROSSHAIR_RADIUS = 1.25;
export const CROSSHAIR_HEIGHT = 10;
export const PLAYER_ORIGIN = [-37, 0, -50];

export function isValidCrosshair(crosshair) {
    return (
        Array.isArray(crosshair) &&
        Number.isFinite(crosshair[0]) &&
        Number.isFinite(crosshair[2])
    );
}

function distanceSquared(player, crosshair) {
    return (
        (player.y + PLAYER_ORIGIN[0] - crosshair[0]) ** 2 +
        (player.x + PLAYER_ORIGIN[2] - crosshair[2]) ** 2
    );
}

export function isPlayerInCrosshair(player, crosshair) {
    return (
        !player.dead &&
        Number.isFinite(player.x) &&
        Number.isFinite(player.y) &&
        isValidCrosshair(crosshair) &&
        distanceSquared(player, crosshair) <= CROSSHAIR_RADIUS ** 2
    );
}

export function findAimedPlayer(positions, crosshair) {
    let nearest = null;
    let nearestDistance = Infinity;
    for (const player of positions) {
        if (!isPlayerInCrosshair(player, crosshair)) continue;
        const distance = distanceSquared(player, crosshair);
        if (distance < nearestDistance) {
            nearest = player;
            nearestDistance = distance;
        }
    }
    return nearest;
}
