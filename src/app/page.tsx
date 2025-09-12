"use client"

import styles from "./page.module.css";
import { Canvas, useThree } from "@react-three/fiber";
import Wave from "@/component/Wave";
import { OrbitControls } from "@react-three/drei";

export default function Home() {
  return (
        <div className={styles.scene}>
          <Canvas
              shadows
              className={styles.canvas}
              camera={{
                position: [-6, 7, 7],
              }}
                   
            >      
              <OrbitControls/>   
              <Wave/>
              <ambientLight intensity={2} />

            </Canvas>
        </div>
  );
}
