import { memo, useMemo } from "react";
import Rock from "./Rock";

export default memo(function RocksArea({
    center = [0, 0], // World X/Z coordinates shared by both circles.
    innerRadius = 150,
    outerRadius = 380,
    count = 120,
    seed = 23,
    groundHeight,
    heightOffset = 0,
}) {
    const [centerX, centerZ] = center;
    const positions = useMemo(() => {
        const inner = Math.max(0, innerRadius);
        const outer = Math.max(inner, outerRadius);
        let state = seed >>> 0;
        const random = () => {
            state = (state + 0x6d2b79f5) >>> 0;
            let value = Math.imul(state ^ (state >>> 15), 1 | state);
            value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
            return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
        };

        return Array.from({ length: Math.max(0, Math.floor(count)) }, () => {
            const angle = random() * Math.PI * 2;
            // Sampling squared radii distributes rocks evenly across the area.
            const radius = Math.sqrt(
                inner * inner + random() * (outer * outer - inner * inner),
            );
            return [
                centerX + Math.cos(angle) * radius,
                centerZ + Math.sin(angle) * radius,
            ];
        });
    }, [centerX, centerZ, innerRadius, outerRadius, count, seed]);

    return (
        <group name="rocks-area">
            {positions.map(([x, z], index) => (
                <Rock
                    key={`${seed}-${index}`}
                    position={[x, heightOffset, z]}
                    groundHeight={groundHeight}
                />
            ))}
        </group>
    );
});
