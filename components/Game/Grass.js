import { useMemo } from "react";
import * as THREE from "three";
import GrassBlades from "./GrassBlades";

function variation(seed) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
}

function GrassMaterial() {
    const pixels = useMemo(() => {
        const size = 128;
        const data = new Uint8Array(size * size * 4);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // Seamless broad patches underneath fine, grass-like grain.
                const patch =
                    Math.sin((x / size) * Math.PI * 8) *
                    Math.cos((y / size) * Math.PI * 6);
                const noise = variation(x + y * size) * 0.6 + (patch + 1) * 0.2;
                const offset = (x + y * size) * 4;
                data[offset] = 42 + noise * 26;
                data[offset + 1] = 72 + noise * 42;
                data[offset + 2] = 24 + noise * 22;
                data[offset + 3] = 255;
            }
        }
        return data;
    }, []);

    return (
        <meshStandardMaterial roughness={1}>
            <dataTexture
                attach="map"
                args={[pixels, 128, 128, THREE.RGBAFormat]}
                colorSpace={THREE.SRGBColorSpace}
                wrapS={THREE.RepeatWrapping}
                wrapT={THREE.RepeatWrapping}
                magFilter={THREE.LinearFilter}
                minFilter={THREE.LinearMipmapLinearFilter}
                generateMipmaps
                anisotropy={8}
                needsUpdate
            />
        </meshStandardMaterial>
    );
}

export function GrassSurface({ positions, bladeCount = 14000, seed = 0 }) {
    const uv = useMemo(() => {
        const coordinates = new Float32Array((positions.length / 3) * 2);
        for (let i = 0; i < positions.length / 3; i++) {
            coordinates[i * 2] = positions[i * 3] * 0.16;
            coordinates[i * 2 + 1] = positions[i * 3 + 2] * 0.16;
        }
        return coordinates;
    }, [positions]);

    return (
        <group>
            <mesh receiveShadow>
                <bufferGeometry
                    onUpdate={(geometry) => geometry.computeVertexNormals()}
                >
                    <bufferAttribute
                        attach="attributes-position"
                        args={[positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-uv"
                        args={[uv, 2]}
                    />
                </bufferGeometry>
                <GrassMaterial />
            </mesh>
            {bladeCount > 0 && (
                <GrassBlades
                    positions={positions}
                    count={bladeCount}
                    seed={seed}
                />
            )}
        </group>
    );
}

export default function GrassPlane({
    args,
    position,
    rotation,
    showGrassBlades = false,
}) {
    const [width, depth] = args;
    const [x, y, z] = position;
    const [rx, ry, rz] = rotation;
    const positions = useMemo(() => {
        const transform = new THREE.Matrix4().compose(
            new THREE.Vector3(x, y, z),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
            new THREE.Vector3(1, 1, 1),
        );
        const point = new THREE.Vector3();
        const vertices = [];
        for (let row = 0; row < 100; row++) {
            for (let column = 0; column < 16; column++) {
                const x0 = -width / 2 + (column / 16) * width;
                const x1 = -width / 2 + ((column + 1) / 16) * width;
                const y0 = -depth / 2 + (row / 100) * depth;
                const y1 = -depth / 2 + ((row + 1) / 100) * depth;
                for (const [px, py] of [
                    [x0, y0],
                    [x1, y0],
                    [x0, y1],
                    [x1, y0],
                    [x1, y1],
                    [x0, y1],
                ]) {
                    point.set(px, py, 0).applyMatrix4(transform);
                    vertices.push(point.x, point.y, point.z);
                }
            }
        }
        return new Float32Array(vertices);
    }, [width, depth, x, y, z, rx, ry, rz]);

    return (
        <GrassSurface
            positions={positions}
            bladeCount={showGrassBlades ? 20000 : 0}
            seed={x < 0 ? 1 : 2}
        />
    );
}
