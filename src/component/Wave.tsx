import {useFrame } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from 'react';
import { CustomMaterial, CustomShaderMaterial, CustomMaterialType } from '../shaders/shaderMaterial'
import { Mesh, Vector2 } from "three";
import GUI from "lil-gui";

export default function Wave() {
    const size = 64;
    const MAX_WAVES = 32; // Make sure that there is the same constant in the shaders

    const mesh = useRef<Mesh>(null!)
    const material = useRef<CustomMaterialType>(null!)

    // Clock to animate the shader
    useFrame(({clock}) => {
        if (material.current) {
            material.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    })

    interface Wave {
    	vecteurDirection : Vector2 ,
        waveNumber? : number,
        amplitude : number,
        phase : number,
        angularFrequency : number
    };

    // Use to fill the array so that it has the right length (MAX_WAVES)
    const emptyWave:Wave = {
        vecteurDirection :  new Vector2(0.0, 0.0),
        waveNumber : 0.0,
        amplitude : 0.0,
        phase : 0.0,
        angularFrequency : 0.0
    }

    // Main array, put all your waves in there
    const waves:Wave[] = [
        {
            vecteurDirection :  new Vector2(-0.25, 0.25),
            amplitude : 0.5,
            phase : 1.0,
            angularFrequency : 1.5
        },
        {
            vecteurDirection :  new Vector2(1.0, 0.0),
            amplitude : 0.25,
            phase : 2.0,
            angularFrequency : 1.5
        },
        {
            vecteurDirection :  new Vector2(-1.0, -0.5),
            amplitude : 0.05,
            phase : 2.0,
            angularFrequency : 0.5
        }
    ]

    // For each waves it calculate the wavenumber
    waves.forEach((wave) => {
        wave.waveNumber = Math.sqrt(Math.pow(wave.vecteurDirection.x,2) + Math.pow(wave.vecteurDirection.y,2));
    });

    // Keeping the length of the array before filling it with the empty waves
    const wavesLength = waves.length;

    // Filling the array with empty waves so the lenght is equal to MAX_WAVES
    while (waves.length < MAX_WAVES) {
        waves.push(emptyWave)
    }

    // Uniforms to send to the shader
    const uniforms = {
        uWavesListSize : {
            value : wavesLength
        },
        uWaves : {
            value : waves
        },
        uTime : {
            value : 1
        }
    }



    // GUI
    useEffect(() => {
        const gui = new GUI()

        if (material.current) {
            const wavesFolder = gui.addFolder("Waves");
            const waves:Wave[] = material.current.uniforms.uWaves.value;

            for (let index = 0; index < wavesLength; index++) {
                const wave = waves[index];

                const itemFolder = wavesFolder.addFolder(`Wave ${index + 1}`);
                const VecteurDirection = itemFolder.addFolder(`VecteurDirection`);
                VecteurDirection.add(wave.vecteurDirection,"x", -1, 1);
                VecteurDirection.add(wave.vecteurDirection,"y", -1, 1);
                itemFolder.add(wave, "amplitude", 0, 10);
                itemFolder.add(wave, "angularFrequency", 0, 10);
                itemFolder.add(wave, "phase", 0, 10);

                
            }

        }
        return () => {
            gui.destroy()
        }
    }, [])

    return(
        <>
            <mesh ref={mesh} position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]} castShadow>
                <planeGeometry args={[size, size, size*3, size*3]}/>
                <CustomMaterial 
                    key={CustomShaderMaterial.key} 
                    ref={material}
                    wireframe={true} 
                    uniforms={uniforms}
                    
                    />
            </mesh>
        </>
    )
}