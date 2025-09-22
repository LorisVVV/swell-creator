import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

import vertexShader from './shader.vs'
import fragmentShader from './shader.fs'


export const CustomShaderMaterial = shaderMaterial(
  {},
  vertexShader,
  fragmentShader
)

export const CustomMaterial = extend(CustomShaderMaterial)
export type CustomMaterialType = InstanceType<typeof CustomShaderMaterial>;