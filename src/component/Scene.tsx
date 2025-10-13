"use client"

import styles from "./page.module.css";
import { Canvas, useThree } from "@react-three/fiber";
import Wave from "@/component/Wave";
import { OrbitControls } from "@react-three/drei";
import FPSStats from "react-fps-stats";
import { Environment } from '@react-three/drei';
import { useEffect, useRef } from "react";

export default function Scene({readFile, saveData, getDataFile}:{readFile:Function, saveData:Function, getDataFile:Function}) {
  
  const animate = useRef(true);

  useEffect(() => {
    const handleKeyDown = (e:KeyboardEvent) => {
        if (e.key == " ") {
          animate.current = !animate.current
        }

        console.log(animate.current?"The animation is playing":"The animation is paused")
      }


    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };

  }, [])

  return (
        <div className={styles.scene}>

          <FPSStats />
          
          <Canvas
              shadows
              className={styles.canvas}
              camera={{
                position: [-6, 7, 7],
              }}
            >

              <OrbitControls/>   
              {/* <Environment preset="dawn" background /> */}
              <ambientLight intensity={1} />

              <directionalLight
                castShadow
                receiveShadow
                position={[12, 1, 2]}
             
                intensity={4}
                shadow-mapSize={[4096, 4096]}
                shadow-bias={-0.0001}

                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
              
                />


              <Wave readFile={readFile} saveData={saveData} getDataFile={getDataFile} animate={animate} />

              {/* <mesh position={[0, 1.244, 0]} rotation={[-Math.PI/2, 0, 0]} castShadow receiveShadow>
                <planeGeometry args={[100, 100, 100, 100]}/>
                <shaderMaterial 
                wireframe/>
              </mesh> */}
              
            </Canvas>

        </div>
    )
}