import { Text } from "@react-three/drei";
import { useRef, useEffect } from 'react';

function isOdd(num) { return num % 2; }

export default function FinishLine() {
    const finishTextGroupRef = useRef();

    // TODO - Make it so Finish only appears in front of plane and not other objects
    useEffect(() => {
        const group = finishTextGroupRef.current;
        if (!group) return;

        group.children.forEach((textMesh) => {
            // Drei Text creates a mesh with material on the first child
            const mesh = textMesh;
            if (mesh && mesh.material) {
                // Ensure text renders on top
                mesh.renderOrder = 999;
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => { m.depthTest = false; m.depthWrite = false; });
                } else {
                    mesh.material.depthTest = false;
                    mesh.material.depthWrite = false;
                }
            }
        });
    }, []);

    return (
        <group>
            {/* Finish Line */}
            <group>

                {[...Array(80)].map((item, i) => {
                    return (

                        <group
                            key={i}
                            position={[-40, 0, 60]}
                            rotation={[-Math.PI / 2, 0, 0]}
                        >
                            <mesh position={[0 + i, 1, 0]}>
                                <planeGeometry attach="geometry" args={[1, 1]} />
                                <meshStandardMaterial
                                    color={isOdd(i) ? "#fff" : '#000'}
                                />
                            </mesh>

                            <mesh position={[0 + i, 2, 0]}>
                                <planeGeometry attach="geometry" args={[1, 1]} />
                                <meshStandardMaterial
                                    color={isOdd(i) ? "#000" : '#fff'}
                                />
                            </mesh>
                        </group>

                    )
                })}

                {/* Finish Line Poles and Bar */}
                <group>
                    <mesh
                        position={[40, 2, 58]}
                        rotation={[0, 0, 0]}
                    >
                        <cylinderGeometry attach="geometry" args={[0.5, 0.5, 8, 5]} />
                        <meshStandardMaterial
                            color={'black'}
                            side={2}
                        />
                    </mesh>

                    <mesh
                        position={[-40, 2, 58]}
                        rotation={[0, 0, 0]}
                    >
                        <cylinderGeometry attach="geometry" args={[0.5, 0.5, 8, 5]} />
                        <meshStandardMaterial
                            color={'black'}
                            side={2}
                        />
                    </mesh>

                    <group
                        position={[35, 5.2, 58]}
                        ref={(el) => { /* placeholder ref set below */ }}
                    >
                        {/* We'll use a container ref to ensure text renders in front */}
                        <group ref={finishTextGroupRef}>
                            {[...Array(10)].map((item, i) => {
                                return (
                                    <Text
                                        key={i}
                                        position={[7.8 * -i, 0, 0]}
                                        rotation={[0, Math.PI / 1, 0]}
                                        fontSize={1.8}
                                        color="white"
                                    >
                                        FINISH
                                    </Text>
                                )
                            })}
                        </group>
                    </group>

                    <mesh
                        position={[0, 5, 58]}
                        rotation={[0, 0, 0]}
                    >
                        <planeGeometry attach="geometry" args={[80, 2]} />
                        <meshStandardMaterial
                            color={'red'}
                            side={2}
                        />
                    </mesh>

                </group>

            </group>
        </group>
    )
}