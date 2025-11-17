"use client"

import styles from "./page.module.css";
import { Canvas } from "@react-three/fiber";
import Wave from "@/component/Wave";
import { OrbitControls } from "@react-three/drei";
import FPSStats from "react-fps-stats";
import { Environment } from '@react-three/drei';
import { Stats } from "@react-three/drei";

export default function Scene({readFile, saveData, getDataFile}:{readFile:Function, saveData:Function, getDataFile:Function}) {

  return (
        <div className={styles.scene}>

          {/* <FPSStats /> */}
          <Stats showPanel={0} className="stats" />
          <Canvas
              shadows
              className={styles.canvas}
              camera={{
                position: [-6, 10, 20],
              }}
            >

              <OrbitControls/>   
              <Environment files={"/env1K.hdr"} background/>
              {/* <ambientLight intensity={1} /> */}



              <Wave readFile={readFile} saveData={saveData} getDataFile={getDataFile} />

              {/* <mesh position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]} castShadow receiveShadow>
                <planeGeometry args={[100, 100, 100, 100]}/>
                <shaderMaterial 
                wireframe/>
              </mesh> */}
              
            </Canvas>

        </div>
    )
}