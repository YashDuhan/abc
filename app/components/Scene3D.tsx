"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, useProgress, Html } from "@react-three/drei";
import * as THREE from "three";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}>
        <div style={{
          width: "200px",
          height: "4px",
          background: "#333",
          borderRadius: "2px",
          overflow: "hidden",
        }}>
          <div style={{
            width: `${progress}%`,
            height: "100%",
            background: "#fff",
            transition: "width 0.3s ease",
          }} />
        </div>
        <p style={{
          color: "#fff",
          fontSize: "14px",
          fontFamily: "system-ui, sans-serif",
        }}>
          Loading... {progress.toFixed(0)}%
        </p>
      </div>
    </Html>
  );
}

function Background() {
  const { scene } = useGLTF("/classroom.glb");
  return <primitive object={scene} scale={1} position={[80, -80, 58]} />;
}

function Model() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/girl_xi_compressed.glb");

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      groupRef.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={100} position={[0, 0, 0]} />
    </group>
  );
}

function CameraController() {
  const { camera, gl } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false });
  const rotation = useRef({ x: 0, y: 0 });
  const baseSpeed = 3.25;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "shift") keys.current.shift = true;
      else if (key in keys.current) keys.current[key as keyof typeof keys.current] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "shift") keys.current.shift = false;
      else if (key in keys.current) keys.current[key as keyof typeof keys.current] = false;
    };
    const handleWheel = (e: WheelEvent) => {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      camera.position.addScaledVector(direction, -e.deltaY * 0.01);
    };
    const handleMouseMove = (e: MouseEvent) => {
      rotation.current.y -= e.movementX * 0.002;
      rotation.current.x -= e.movementY * 0.002;
    };
    const handleClick = () => {
      gl.domElement.requestPointerLock();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("wheel", handleWheel);
    document.addEventListener("mousemove", handleMouseMove);
    gl.domElement.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("wheel", handleWheel);
      document.removeEventListener("mousemove", handleMouseMove);
      gl.domElement.removeEventListener("click", handleClick);
    };
  }, [camera, gl]);

  useFrame(() => {
    camera.rotation.order = "YXZ";
    camera.rotation.y = rotation.current.y;
    camera.rotation.x = rotation.current.x;

    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();
    camera.getWorldDirection(direction);
    right.crossVectors(direction, camera.up).normalize();

    const moveSpeed = keys.current.shift ? baseSpeed * 4 : baseSpeed;
    if (keys.current.w) camera.position.addScaledVector(direction, moveSpeed);
    if (keys.current.s) camera.position.addScaledVector(direction, -moveSpeed);
    if (keys.current.a) camera.position.addScaledVector(right, -moveSpeed);
    if (keys.current.d) camera.position.addScaledVector(right, moveSpeed);
  });

  return null;
}

export default function Scene3D() {
  return (
    <div style={{ width: "100vw", height: "100vh", cursor: "none", background: "#000" }}>
      <Canvas camera={{ position: [0, 0, 1.8], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={<Loader />}>
          <Background />
          <Model />
          <Environment preset="studio" />
        </Suspense>
        <CameraController />
      </Canvas>
    </div>
  );
}
