import { NearestFilter, RepeatWrapping, TextureLoader } from "three";

const texture = new TextureLoader().load(`${process.env.NEXT_PUBLIC_CDN}games/Race Game/grass.jpg`)

function GrassPlane(props) {

    const width = props.width; // Set the width of the plane
    const height = props.height; // Set the height of the plane

    texture.magFilter = NearestFilter;
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
	texture.repeat.set(2, 20)

    return (
        <group {...props}>
            <mesh position={[0, 0, 0]}>
                <planeGeometry attach="geometry" args={props.args} />
                <meshStandardMaterial attach="material" map={texture} />
            </mesh>
        </group>
    );
};

export default GrassPlane