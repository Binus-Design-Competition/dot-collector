import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Globe(props) {
    const ref = useRef();

    // Generate points on a sphere
    const sphere = useMemo(() => {
        const count = 4000;
        const radius = 2.0;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;

            positions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
            positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
            positions[i * 3 + 2] = radius * Math.cos(phi);
        }

        return positions;
    }, []);

    useFrame((state, delta) => {
        // Continuous slow rotation on Y axis
        ref.current.rotation.y += delta * 0.05;

        // Interactive tilting based on mouse
        // state.mouse.x/y are -1 to 1
        const mouseX = state.mouse.x;
        const mouseY = state.mouse.y;

        // Target rotation for tilt
        const targetRotationX = -mouseY * 0.5; // Tilt up/down
        const targetRotationZ = -mouseX * 0.2; // slight tilt sideways

        // Smoothly interpolate current tilt to target
        ref.current.rotation.x += (targetRotationX - ref.current.rotation.x) * delta * 2;
        ref.current.rotation.z += (targetRotationZ - ref.current.rotation.z) * delta * 2;
    });

    return (
        <group rotation={[0, 0, 0]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#38bdf8"
                    size={0.006}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.8}
                />
            </Points>
        </group>
    );
}

function Atmosphere() {
    return (
        <mesh scale={[2.1, 2.1, 2.1]}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshBasicMaterial
                color="#0ea5e9"
                transparent
                opacity={0.1}
                side={THREE.BackSide}
            />
        </mesh>
    );
}

function Stars(props) {
    const ref = useRef();
    const [sphere] = useState(() => {
        const count = 1500;
        const positions = new Float32Array(count * 3);
        const radius = 7; // Further out
        for (let i = 0; i < count; i++) {
            // Random spread
            const r = radius * (1 + Math.random() * 2);
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }
        return positions;
    });

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 20;
        ref.current.rotation.y -= delta / 25;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#ffffff"
                    size={0.005}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.5}
                />
            </Points>
        </group>
    );
}

export function GlobeBackground() {
    return (
        <div className="fixed inset-0 z-0 bg-black">
            <Canvas camera={{ position: [0, 0, 3] }}>
                <Globe />
                <Stars />
                <Atmosphere />
                <ambientLight intensity={0.5} />
            </Canvas>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#000000_120%)] pointer-events-none" />
        </div>
    );
}
