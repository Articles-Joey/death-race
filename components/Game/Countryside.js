import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Tree from "@/components/Models/Tree";
import { GrassSurface } from "./Grass";
import { bankHeight, FIELD_HEIGHT } from "./terrain";
import { useStore } from "@/hooks/useStore";

const GROUND_HEIGHT = FIELD_HEIGHT;
const FIELD_COLORS = ["#efad24", "#e6bd37", "#f3bc38", "#d3b63d", "#c4b846"];
const CLOUD_PUFFS = [
    [-12, 0, 0, 10, 3, 5],
    [-5, 2, 0, 10, 5, 6],
    [3, 5, 0, 12, 8, 7],
    [13, 2, 1, 10, 5, 6],
    [21, 0, 0, 9, 2.5, 4],
];

// Fixed layout keeps the landscape stable when the game state changes.
const FIELDS = [];
for (const side of [-1, 1]) {
    for (let row = 0; row < 3; row++) {
        for (let column = -4; column <= 4; column++) {
            FIELDS.push({
                x: column * 74,
                z: side * (174 + row * 84),
                width: 70,
                depth: 78,
            });
        }
    }
    for (let row = 0; row < 4; row++) {
        for (let column = -1; column <= 1; column++) {
            FIELDS.push({
                x: side * (117 + row * 74),
                z: column * 84,
                width: 70,
                depth: 78,
            });
        }
    }
}

const BALES = FIELDS.filter((_, index) => index % 4 === 0).map(
    (field, index) => ({
        position: [
            field.x + Math.sin(index * 3.7) * 18,
            GROUND_HEIGHT,
            field.z + Math.cos(index * 2.3) * 22,
        ],
        rotation: index * 1.7,
        scale: 0.85 + (index % 3) * 0.2,
    }),
);

function FieldGround() {
    const ground = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-1400, -1400);
        shape.lineTo(1400, -1400);
        shape.lineTo(1400, 1400);
        shape.lineTo(-1400, 1400);
        shape.closePath();

        // Leave the arena and its banks completely open below the farmland.
        const arena = new THREE.Path();
        arena.moveTo(-76.5, -128);
        arena.lineTo(-76.5, 128);
        arena.lineTo(76.5, 128);
        arena.lineTo(76.5, -128);
        arena.closePath();
        shape.holes.push(arena);
        return shape;
    }, []);

    const { positions, colors } = useMemo(() => {
        const positions = [];
        const colors = [];
        FIELDS.forEach((field, index) => {
            const base = new THREE.Color(
                FIELD_COLORS[index % FIELD_COLORS.length],
            );
            for (let row = 0; row < 12; row++) {
                const x0 = field.x - field.width / 2;
                const x1 = field.x + field.width / 2;
                const z0 = field.z - field.depth / 2 + (row * field.depth) / 12;
                const z1 = z0 + field.depth / 12;
                const color = base.clone().multiplyScalar(row % 2 ? 0.88 : 1);
                const y = GROUND_HEIGHT + 0.05;
                // Alternating strips follow the patchwork of harvested fields.
                const vertices =
                    index % 2
                        ? [
                              [x0, z0],
                              [x0, z1],
                              [x1, z0],
                              [x1, z0],
                              [x0, z1],
                              [x1, z1],
                          ]
                        : [
                              [
                                  field.x -
                                      field.width / 2 +
                                      (row * field.width) / 12,
                                  field.z - field.depth / 2,
                              ],
                              [
                                  field.x -
                                      field.width / 2 +
                                      (row * field.width) / 12,
                                  field.z + field.depth / 2,
                              ],
                              [
                                  field.x -
                                      field.width / 2 +
                                      ((row + 1) * field.width) / 12,
                                  field.z - field.depth / 2,
                              ],
                              [
                                  field.x -
                                      field.width / 2 +
                                      ((row + 1) * field.width) / 12,
                                  field.z - field.depth / 2,
                              ],
                              [
                                  field.x -
                                      field.width / 2 +
                                      (row * field.width) / 12,
                                  field.z + field.depth / 2,
                              ],
                              [
                                  field.x -
                                      field.width / 2 +
                                      ((row + 1) * field.width) / 12,
                                  field.z + field.depth / 2,
                              ],
                          ];
                vertices.forEach(([x, z]) => {
                    positions.push(x, y, z);
                    colors.push(color.r, color.g, color.b);
                });
            }
        });
        return {
            positions: new Float32Array(positions),
            colors: new Float32Array(colors),
        };
    }, []);

    return (
        <group>
            <mesh
                renderOrder={0}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, GROUND_HEIGHT, 0]}
            >
                <shapeGeometry args={[ground]} />
                <meshStandardMaterial
                    color="#c99435"
                    roughness={1}
                />
            </mesh>
            {/* All field strips share one draw call. */}
            <mesh renderOrder={1}>
                <bufferGeometry
                    onUpdate={(geometry) => geometry.computeVertexNormals()}
                >
                    <bufferAttribute
                        attach="attributes-position"
                        args={[positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        args={[colors, 3]}
                    />
                </bufferGeometry>
                <meshStandardMaterial
                    vertexColors
                    roughness={1}
                    polygonOffset
                    polygonOffsetFactor={-2}
                    polygonOffsetUnits={-2}
                />
            </mesh>
        </group>
    );
}

function EndBank({ side }) {
    const positions = useMemo(() => {
        const vertices = [];
        // A rounded rise from the sand at z=100 to the fields at z=128.
        for (let step = 0; step < 16; step++) {
            const t0 = step / 16;
            const t1 = (step + 1) / 16;
            for (let column = 0; column < 32; column++) {
                const x0 = -77 + (column * 154) / 32;
                const x1 = -77 + ((column + 1) * 154) / 32;
                // Match the existing side slopes at both corners.
                vertices.push(
                    x0,
                    bankHeight(x0, t0),
                    100 + t0 * 28,
                    x0,
                    bankHeight(x0, t1),
                    100 + t1 * 28,
                    x1,
                    bankHeight(x1, t0),
                    100 + t0 * 28,
                    x1,
                    bankHeight(x1, t0),
                    100 + t0 * 28,
                    x0,
                    bankHeight(x0, t1),
                    100 + t1 * 28,
                    x1,
                    bankHeight(x1, t1),
                    100 + t1 * 28,
                );
            }
        }
        return new Float32Array(vertices);
    }, []);

    return (
        <group rotation={[0, side === 1 ? 0 : Math.PI, 0]}>
            <GrassSurface
                positions={positions}
                seed={side === 1 ? 3 : 4}
            />
            {[108, 120].map((z, row) => (
                <group key={z}>
                    {Array.from({ length: 15 }, (_, index) => {
                        const x = -69 + index * 9.8 + (row ? -2 : 0);
                        const bankY = bankHeight(x, (z - 100) / 28);
                        return (
                            <Tree
                                key={index}
                                position={[x, bankY - 0.15, z]}
                            />
                        );
                    })}
                </group>
            ))}
        </group>
    );
}

function HayBale({ position, rotation, scale }) {
    const spiral = useMemo(() => {
        const points = [];
        for (let i = 0; i <= 96; i++) {
            const angle = (i / 96) * Math.PI * 5;
            const radius = 0.12 + (i / 96) * 1.92;
            points.push(0, Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        return new Float32Array(points);
    }, []);

    return (
        <group
            position={position}
            rotation={[0, rotation, 0]}
            scale={scale}
        >
            <group position={[0, 2.4, 0]}>
                <mesh
                    rotation={[0, 0, Math.PI / 2]}
                    castShadow
                >
                    <cylinderGeometry args={[2.4, 2.4, 5.2, 18]} />
                    <meshStandardMaterial
                        color="#efb32a"
                        roughness={1}
                        flatShading
                    />
                </mesh>
                {[-1, 1].map((side) => (
                    <group
                        key={side}
                        position={[side * 2.61, 0, 0]}
                    >
                        <mesh rotation={[0, (side * Math.PI) / 2, 0]}>
                            <circleGeometry args={[2.22, 24]} />
                            <meshStandardMaterial
                                color="#d58c1b"
                                roughness={1}
                            />
                        </mesh>
                        <line position={[side * 0.02, 0, 0]}>
                            <bufferGeometry>
                                <bufferAttribute
                                    attach="attributes-position"
                                    args={[spiral, 3]}
                                />
                            </bufferGeometry>
                            <lineBasicMaterial color="#ab6615" />
                        </line>
                    </group>
                ))}
                {[-1.65, 1.65].map((x) => (
                    <mesh
                        key={x}
                        position={[x, 0, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                    >
                        <torusGeometry args={[2.42, 0.07, 4, 24]} />
                        <meshStandardMaterial
                            color="#ffe097"
                            roughness={1}
                        />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

function DistantHills({ darkMode }) {
    return (
        <group>
            {[0, 1].map((layer) => (
                <group key={layer}>
                    {Array.from({ length: 18 }, (_, index) => {
                        const angle = (index / 18) * Math.PI * 2 + layer * 0.18;
                        const radius = layer ? 860 : 590;
                        return (
                            <mesh
                                key={index}
                                position={[
                                    Math.sin(angle) * radius,
                                    -12,
                                    Math.cos(angle) * radius,
                                ]}
                                scale={[
                                    110 + (index % 3) * 35,
                                    (layer ? 72 : 44) + (index % 4) * 12,
                                    100 + (index % 4) * 24,
                                ]}
                                rotation={[0, -angle, 0]}
                            >
                                <sphereGeometry args={[1, 24, 12]} />
                                <meshStandardMaterial
                                    color={
                                        darkMode
                                            ? layer
                                                ? "#354f60"
                                                : "#365a49"
                                            : layer
                                              ? "#a1dccc"
                                              : "#6ec799"
                                    }
                                    roughness={1}
                                />
                            </mesh>
                        );
                    })}
                </group>
            ))}
        </group>
    );
}

function DriftingCloud({ index, darkMode }) {
    const cloud = useRef();
    const angle = (index / 16) * Math.PI * 2;
    const radius = 340 + (index % 3) * 115;
    const startX = Math.sin(angle) * radius;
    const startZ = Math.cos(angle) * radius;
    const height = 90 + (index % 4) * 22;

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        cloud.current.position.x = startX + Math.sin(time * 0.018 + index) * 45;
        cloud.current.position.z = startZ + Math.cos(time * 0.012 + index) * 22;
        cloud.current.position.y = height + Math.sin(time * 0.09 + index) * 1.5;
    });

    return (
        <group
            ref={cloud}
            position={[startX, height, startZ]}
            rotation={[0, -angle, 0]}
            scale={1.4 + (index % 3) * 0.5}
        >
            {CLOUD_PUFFS.map(([x, y, z, sx, sy, sz], puff) => (
                <mesh
                    key={puff}
                    position={[x, y, z]}
                    scale={[sx, sy, sz]}
                >
                    <sphereGeometry args={[1, 16, 10]} />
                    <meshStandardMaterial
                        color={darkMode ? "#67788e" : "#ffffff"}
                        roughness={1}
                    />
                </mesh>
            ))}
        </group>
    );
}

function Countryside({ darkMode }) {
    const graphicsQuality = useStore((state) => state.graphicsQuality);

    return (
        <>
            <fog
                attach="fog"
                args={[darkMode ? "#182c40" : "#b7e7e9", 300, 1100]}
            />
            <group>
                <EndBank side={-1} />
                <EndBank side={1} />
                <FieldGround />
                {BALES.map((bale, index) => (
                    <HayBale
                        key={index}
                        {...bale}
                    />
                ))}
                {graphicsQuality == "High" && (
                    <DistantHills darkMode={darkMode} />
                )}
                {Array.from({ length: 16 }, (_, index) => (
                    <DriftingCloud
                        key={index}
                        index={index}
                        darkMode={darkMode}
                    />
                ))}
            </group>
        </>
    );
}

export default memo(Countryside);
