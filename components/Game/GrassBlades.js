import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, DoubleSide, Object3D, Vector3 } from "three";

function variation(seed) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
}

// Adapted from eager-eagle: tapered blades with bent tips and darker roots.
const BLADE_POSITIONS = new Float32Array([
    -0.045, 0, 0, 0.045, 0, 0, -0.026, 0.55, 0.055, 0.026, 0.55, 0.055, 0.03, 1,
    0.2,
]);
const BLADE_COLORS = new Float32Array([
    0.28, 0.4, 0.16, 0.28, 0.4, 0.16, 0.65, 0.8, 0.4, 0.65, 0.8, 0.4, 0.86,
    0.94, 0.6,
]);

export default function GrassBlades({ positions, count, seed }) {
    const mesh = useRef();
    const indices = useMemo(
        () => new Uint16Array([0, 1, 2, 2, 1, 3, 2, 3, 4]),
        [],
    );

    useLayoutEffect(() => {
        // No instances means setColorAt never creates the instanceColor buffer.
        if (!mesh.current || count <= 0) return;

        const object = new Object3D();
        const color = new Color();
        const a = new Vector3();
        const b = new Vector3();
        const c = new Vector3();
        const normal = new Vector3();
        const edge = new Vector3();
        const up = new Vector3(0, 1, 0);
        const triangleCount = positions.length / 9;

        for (let blade = 0; blade < count; blade++) {
            const bladeSeed = seed * 7919 + blade * 17;
            const triangle =
                Math.floor(variation(bladeSeed + 1) * triangleCount) * 9;
            a.fromArray(positions, triangle);
            b.fromArray(positions, triangle + 3);
            c.fromArray(positions, triangle + 6);
            // Barycentric sampling plants every root on the actual bank mesh.
            const u = Math.sqrt(variation(bladeSeed + 2));
            const v = variation(bladeSeed + 3);
            object.position
                .copy(a)
                .multiplyScalar(1 - u)
                .addScaledVector(b, u * (1 - v))
                .addScaledVector(c, u * v);
            normal.subVectors(b, a).cross(edge.subVectors(c, a)).normalize();
            object.position.addScaledVector(normal, 0.003);
            object.quaternion.setFromUnitVectors(up, normal);
            object.rotateY(variation(bladeSeed + 4) * Math.PI * 2);
            object.rotateZ((variation(bladeSeed + 5) - 0.5) * 0.2);
            const width = 0.9 + variation(bladeSeed + 6) * 1.1;
            object.scale.set(
                width,
                0.3 + variation(bladeSeed + 7) * 0.65,
                width,
            );
            object.updateMatrix();
            mesh.current.setMatrixAt(blade, object.matrix);
            color.setHSL(
                0.24 + variation(bladeSeed + 8) * 0.07,
                0.46,
                0.23 + variation(bladeSeed + 9) * 0.12,
            );
            mesh.current.setColorAt(blade, color);
        }
        mesh.current.instanceMatrix.needsUpdate = true;
        mesh.current.instanceColor.needsUpdate = true;
        mesh.current.computeBoundingSphere();
    }, [positions, count, seed]);

    return (
        <instancedMesh
            ref={mesh}
            args={[null, null, count]}
            receiveShadow
        >
            <bufferGeometry
                onUpdate={(geometry) => geometry.computeVertexNormals()}
            >
                <bufferAttribute
                    attach="attributes-position"
                    args={[BLADE_POSITIONS, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[BLADE_COLORS, 3]}
                />
                <bufferAttribute
                    attach="index"
                    args={[indices, 1]}
                />
            </bufferGeometry>
            <meshStandardMaterial
                vertexColors
                side={DoubleSide}
                roughness={1}
            />
        </instancedMesh>
    );
}
