import Box from "@mui/material/Box";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
// import FinishLine from "../Models/FinishLine";
import { Farm } from "../Models/Farm";

export default function RotatingMascot() {
    return (
        <Box sx={{ width: "100%", height: "100%" }}>
            <Suspense>
                <Canvas>
    
                    <OrbitControls
                        autoRotate
                        enableZoom={false}
                        enablePan={false}
                        enableRotate={false}
                        autoRotateSpeed={10}
                    />
    
                    <ambientLight intensity={2} />
    
                    <Suspense fallback={null}>
                        <group
                            position={[0, -1, 0]}
                            scale={0.025}
                        >
                            <Farm />
                        </group>
                    </Suspense>
    
                </Canvas>
            </Suspense>
        </Box>
    );
}
