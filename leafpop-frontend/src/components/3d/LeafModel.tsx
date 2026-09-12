'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LeafModelProps {
  scale?: number;
  interactive?: boolean;
  popping?: boolean;
  onClick?: (event: any) => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

export const LeafModel: React.FC<LeafModelProps> = ({
  scale = 1.0,
  interactive = true,
  popping = false,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const leafMeshRef = useRef<THREE.Mesh>(null);
  const stemMeshRef = useRef<THREE.Mesh>(null);
  const hoveredRef = useRef(false);

  // Generate an organic 3D leaf shape using Shape and ExtrudeGeometry
  const { leafGeometry, stemGeometry } = useMemo(() => {
    // 1. Leaf blade 2D profile
    const shape = new THREE.Shape();
    // Start at bottom stem connection
    shape.moveTo(0, -1.8);
    // Right side curve towards tip
    shape.bezierCurveTo(1.4, -1.2, 1.8, 0.4, 0, 2.2);
    // Left side curve back to stem
    shape.bezierCurveTo(-1.8, 0.4, -1.4, -1.2, 0, -1.8);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.05,
      bevelThickness: 0.04,
    };

    const lGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    lGeo.center();

    // Bend the leaf slightly along Y and Z axis for realistic curvature
    const pos = lGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Dish curvature: center dip, tip bend forward
      const zCurv = -Math.pow(x, 2) * 0.15 + (y > 0 ? Math.sin((y / 2) * Math.PI) * 0.2 : 0);
      pos.setZ(i, pos.getZ(i) + zCurv);
    }
    lGeo.computeVertexNormals();

    // 2. Leaf stem curve
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -1.3, -0.05),
      new THREE.Vector3(0.08, -1.8, -0.1),
      new THREE.Vector3(0.12, -2.4, -0.2),
    ]);
    const sGeo = new THREE.TubeGeometry(stemCurve, 16, 0.06, 8, false);

    return { leafGeometry: lGeo, stemGeometry: sGeo };
  }, []);

  // Frame animation for natural gentle floating & sway
  useFrame(({ clock, mouse }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    if (popping) {
      // Impact compression & pop vibration
      meshRef.current.scale.set(scale * 0.85, scale * 1.15, scale * 0.85);
      meshRef.current.rotation.z = Math.sin(t * 30) * 0.08;
    } else {
      // Natural gentle float & sway
      const floatY = Math.sin(t * 1.5) * 0.12;
      const swayZ = Math.cos(t * 1.2) * 0.05;
      const swayX = Math.sin(t * 0.9) * 0.06;

      meshRef.current.position.y = floatY;
      meshRef.current.rotation.z = swayZ;
      meshRef.current.rotation.x = swayX;

      // Mouse response if interactive
      if (interactive) {
        const targetRotY = mouse.x * 0.35;
        const targetRotX = -mouse.y * 0.25;
        meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.08;
        meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.08;
      }

      // Smooth hover scale
      const targetScale = hoveredRef.current ? scale * 1.06 : scale;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group
      ref={meshRef}
      scale={scale}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        hoveredRef.current = true;
        onPointerOver?.();
      }}
      onPointerOut={() => {
        hoveredRef.current = false;
        onPointerOut?.();
      }}
    >
      {/* Leaf Blade */}
      <mesh ref={leafMeshRef} geometry={leafGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#22c55e"
          roughness={0.35}
          metalness={0.08}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
          emissive="#14532d"
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* Main Spine / Vein highlight */}
      <mesh position={[0, 0.2, 0.04]}>
        <cylinderGeometry args={[0.03, 0.06, 3.2, 8]} />
        <meshStandardMaterial color="#86efac" roughness={0.4} />
      </mesh>

      {/* Secondary Veins Left/Right */}
      {[-0.6, -0.1, 0.4, 0.9, 1.4].map((y, i) => (
        <group key={i} position={[0, y, 0.03]}>
          <mesh rotation={[0, 0, Math.PI / 4]} position={[0.4, 0.2, 0]}>
            <cylinderGeometry args={[0.015, 0.025, 0.9 - Math.abs(y) * 0.2, 6]} />
            <meshStandardMaterial color="#a7f3d0" roughness={0.5} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]} position={[-0.4, 0.2, 0]}>
            <cylinderGeometry args={[0.015, 0.025, 0.9 - Math.abs(y) * 0.2, 6]} />
            <meshStandardMaterial color="#a7f3d0" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Stem */}
      <mesh ref={stemMeshRef} geometry={stemGeometry} castShadow>
        <meshStandardMaterial color="#15803d" roughness={0.6} />
      </mesh>
    </group>
  );
};
