import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

import vertexShader from './shader.vs'
import fragmentShader from './shader.fs'


// interface Wave {
//   vecteurDirection : Vector2 ,
//   waveNumber? : Number,
//   amplitude : Number,
//   phase : Number,
//   angularFrequency : Number

// };

// const wave1:Wave = {
//   vecteurDirection : new Vector2(-0.5, 0.5),
//   amplitude : 0.5,
//   phase : 1.0,
//   angularFrequency : 1.5
// }

// const waves:Wave[] = [
//   wave1
// ]

// waves.forEach((wave) => {
//   wave.waveNumber = Math.sqrt(Math.pow(wave.vecteurDirection.x,2) + Math.pow(wave.vecteurDirection.y,2));
// });

// const uniforms = {
//   uWavesListSize : waves.length,
//   uWaves : waves,
//   uTime : 0
// }

// console.dir(uniforms)


export const CustomShaderMaterial = shaderMaterial(
  {},
  vertexShader,
  fragmentShader
)

export const CustomMaterial = extend(CustomShaderMaterial)
export type CustomMaterialType = InstanceType<typeof CustomShaderMaterial>;