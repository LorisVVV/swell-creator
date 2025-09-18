"use client"

import styles from "./page.module.css";
import { Canvas, useThree } from "@react-three/fiber";
import Wave from "@/component/Wave";
import { OrbitControls } from "@react-three/drei";
import FPSStats from "react-fps-stats";

export default function Scene({readFile}:{readFile:Function}) {
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
              <Wave debug readFile={readFile}/>
              <ambientLight intensity={2} />
              <OrbitControls/>   

            </Canvas>
        </div>
    )
}