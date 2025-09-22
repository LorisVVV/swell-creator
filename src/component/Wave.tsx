import {useFrame } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from 'react';
import { CustomMaterial, CustomShaderMaterial, CustomMaterialType } from '../shaders/shaderMaterial'
import { Mesh, Vector2 } from "three";
import GUI from "lil-gui";


interface Wave {
    vecteurDirection : Vector2 ,
    waveNumber? : number,
    amplitude : number,
    phase : number,
    angularFrequency : number,
    waveLength?: number
};

// Function to calculate the wave number
function calculWavenumber(x:number, y:number) {
    return Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
}

function setWaveLength(wave:Wave, value:number) {
    wave.vecteurDirection.x = wave.vecteurDirection.x * value;
    wave.vecteurDirection.y = wave.vecteurDirection.y * value;
    wave.waveNumber = calculWavenumber(wave.vecteurDirection.x, wave.vecteurDirection.y)
}

function tanh(x:number) {
    return 1 - (2/(Math.exp(2 * x)+1))
}

export default function Wave({debug = false, readFile}:{debug?:boolean, readFile:Function}) {
    const size = 64;
    const MAX_WAVES = 32; // Make sure that there is the same constant in the shaders
    const GRAVITY = 9.81;

    const mesh = useRef<Mesh>(null!)
    const material = useRef<CustomMaterialType>(null!)

    // Clock to animate the shader
    useFrame(({clock}) => {
        if (material.current) {
            material.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    })


    // Use to fill the array so that it has the right length (MAX_WAVES)
    const emptyWave:Wave = {
        vecteurDirection :  new Vector2(0.0, 0.0),
        waveNumber : 0.0,
        amplitude : 0.0,
        phase : 0.0,
        angularFrequency : 0.0,
        waveLength : 0.0,
    }

    // Main array, put all your waves in there
    const waves:Wave[] = [
        {
            vecteurDirection: new Vector2(
                1.0,
                0.0
            ),
            waveNumber: 1,
            amplitude: 1.244,
            phase: 2.17,
            angularFrequency: 0.73,
            waveLength: 0.17
        },
        {
            vecteurDirection: new Vector2(
                1.0,
                0.0
            ),
            waveNumber: 1,
            amplitude: 0.226,
            phase: 0,
            angularFrequency: 5.69,
            waveLength: 0.76
        },
        {
            vecteurDirection: new Vector2(
                1.0,
                -0.558
            ),
            waveNumber: 1.1451480253661535,
            amplitude: 0.33,
            phase: 0,
            angularFrequency: 0.73,
            waveLength: 0.5
        },
        {
            vecteurDirection: new Vector2(
                0.582,
                -0.474
            ),
            waveNumber: 0.7505997601918082,
            amplitude: 0.146,
            phase: 5.95,
            angularFrequency: 0.6,
            waveLength: 1.87
        },
        {
            vecteurDirection: new Vector2(
                0.11,
                -0.502
            ),
            waveNumber: 0.5139104980441633,
            amplitude: 0.2,
            phase: 4.91,
            angularFrequency: 1,
            waveLength: 1.085
        },
        {
            vecteurDirection: new Vector2(
                -0.224,
                -0.502
            ),
            waveNumber: 0.5497090139337357,
            amplitude: 0.564,
            phase: 0.86,
            angularFrequency: 0.34,
            waveLength: 0.825
        }
    ]

    // For each waves it calculate the wavenumber
    waves.forEach((wave) => {
        wave.waveNumber = calculWavenumber(wave.vecteurDirection.x,wave.vecteurDirection.y,);
        wave.angularFrequency = Math.sqrt(GRAVITY * wave.waveNumber)
    });

    // Keeping the length of the array before filling it with the empty waves
    let wavesLength = waves.length;

    // Filling the array with empty waves so the lenght is equal to MAX_WAVES
    while (waves.length < MAX_WAVES) {
        waves.push({...emptyWave,
            vecteurDirection : new Vector2(0.0,0.0)
        })
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

    console.dir(uniforms)

    // GUI
    useEffect(() => {
        const gui = new GUI()

        if (material.current) {

            let waves:Wave[] = material.current.uniforms.uWaves.value;
            let size:number = material.current.uniforms.uWavesListSize.value;


            const controlFunction = {
                addWave() {
                    if (size <= MAX_WAVES) {
                        let newSize = size + 1;
                        material.current.uniforms.uWavesListSize.value = newSize;
                        wavesLength = newSize;
                        size = newSize;
                    }

                },
                removeWave() {
                    if (size > 0 ) {
                        let newSize = size - 1;
                        material.current.uniforms.uWavesListSize.value = newSize;
                        wavesLength = newSize;
                        size = newSize;
                    }

                },
                async loadData() {
                    const data = await readFile('../data/data.json');
                    console.log(data)
                    // material.current.uniforms.uWaves.value = data.toJSON()
                }
            }

            function loadWaveFolder() {
                for (let index = 0; index < wavesLength; index++) {
                    const wave = material.current.uniforms.uWaves.value[index];


                    const itemFolder = wavesFolder.addFolder(`Wave ${index + 1}`);
                    const VecteurDirection = itemFolder.addFolder(`VecteurDirection`);
                    VecteurDirection.add(wave.vecteurDirection,"x", -1, 1)
                                    .onChange( (value:number) => {
                                        wave.waveNumber= calculWavenumber(value, wave.vecteurDirection.y)
                                        
                                    } );
                    VecteurDirection.add(wave.vecteurDirection,"y", -1, 1)
                                    .onChange( (value:number) => {
                                        wave.waveNumber= calculWavenumber(wave.vecteurDirection.x, value)
                                    } );
                    itemFolder.add(wave, "amplitude",0,2)
                            //   .name("Amplitude")
                            //   .onChange((value:number) => {
                            //     console.dir(index)
                            //     wave.amplitude = value;
                            //     material.current.uniforms.uWaves.value[0].amplitude = value;
                            //   });
                    itemFolder.add(wave, "angularFrequency", 0, 10);
                    itemFolder.add(wave, "phase", 0, 10);
                    itemFolder.add(wave, "waveLength", 0, 5);
                            //   .onChange((value:number) => {
                            //     setWaveLength(wave, value)
                            //   })
                    itemFolder.onChange(() => {
                        console.log("Uniforms : ")
                        console.dir(material.current.uniforms)
                    });

                    itemFolder.close()
                }
            }

            gui.add(controlFunction, "addWave").onChange(() => {
                wavesFolder.destroy();
                wavesFolder = gui.addFolder("Waves");
                loadWaveFolder()
                console.dir(material.current.uniforms)
            });

            gui.add(controlFunction, "removeWave").onChange(() => {
                wavesFolder.destroy();
                wavesFolder = gui.addFolder("Waves");
                loadWaveFolder()
                console.dir(material.current.uniforms)
            });

            const dataFolder = gui.addFolder("dataFolder");

            dataFolder.add(controlFunction, "loadData")

            let wavesFolder = gui.addFolder("Waves");
            loadWaveFolder();



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
                    wireframe={debug} 
                    uniforms={uniforms}
                    />
            </mesh>
        </>
    )
}