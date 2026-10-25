import { Text } from "@react-three/drei";
import { FrontSide } from "three";

function isOdd(num) {
    return num % 2;
}

export default function FinishLine() {
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
                                <planeGeometry
                                    attach="geometry"
                                    args={[1, 1]}
                                />
                                <meshStandardMaterial
                                    color={isOdd(i) ? "#fff" : "#000"}
                                />
                            </mesh>

                            <mesh position={[0 + i, 2, 0]}>
                                <planeGeometry
                                    attach="geometry"
                                    args={[1, 1]}
                                />
                                <meshStandardMaterial
                                    color={isOdd(i) ? "#000" : "#fff"}
                                />
                            </mesh>
                        </group>
                    );
                })}

                {/* Finish Line Poles and Bar */}
                <group>
                    <mesh
                        position={[40, 2, 58]}
                        rotation={[0, 0, 0]}
                    >
                        <cylinderGeometry
                            attach="geometry"
                            args={[0.5, 0.5, 8, 5]}
                        />
                        <meshStandardMaterial
                            color={"black"}
                            side={2}
                        />
                    </mesh>

                    <mesh
                        position={[-40, 2, 58]}
                        rotation={[0, 0, 0]}
                    >
                        <cylinderGeometry
                            attach="geometry"
                            args={[0.5, 0.5, 8, 5]}
                        />
                        <meshStandardMaterial
                            color={"black"}
                            side={2}
                        />
                    </mesh>

                    <group position={[0, 5, 58]}>
                        {[-1, 1].map((side) => (
                            <group
                                key={side}
                                position={[0, 0, side * 0.04]}
                                rotation={[0, side === 1 ? 0 : Math.PI, 0]}
                            >
                                {Array.from({ length: 10 }, (_, i) => (
                                    <Text
                                        key={i}
                                        position={[35.1 - i * 7.8, 0, 0]}
                                        fontSize={1.8}
                                        color="white"
                                        anchorX="center"
                                        anchorY="middle"
                                        material-side={FrontSide}
                                    >
                                        FINISH
                                    </Text>
                                ))}
                            </group>
                        ))}
                    </group>

                    <mesh
                        position={[0, 5, 58]}
                        rotation={[0, 0, 0]}
                    >
                        <planeGeometry
                            attach="geometry"
                            args={[80, 2]}
                        />
                        <meshStandardMaterial
                            color={"red"}
                            side={2}
                        />
                    </mesh>
                </group>
            </group>
        </group>
    );
}
