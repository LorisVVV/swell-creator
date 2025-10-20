import {useFrame, useLoader } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CustomMaterial, CustomShaderMaterial, CustomMaterialType } from '../shaders/shaderMaterial'
import { Mesh, TextureLoader, Vector2, Vector3 } from "three";
import GUI from "lil-gui";
import { HDRLoader } from "three/examples/jsm/Addons.js";
// import { GLTFLoader } from '@three/examples/jsm/loaders/GLTFLoader';

interface Wave {
    vecteurDirection : Vector2 ,
    waveNumber? : number,
    amplitude : number,
    phase : number,
    angularFrequency : number,
    waveLength: number
};

// Function to calculate the wave number
function calculWavenumber(x:number, y:number) {
    return Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
}

function generateGernsterWave(nbBands:number, firstWave:Wave) {
    const GRAVITY = 9.81/2;

    let waves:Wave[] = [firstWave]
    let nbWavesByBands = 3;


    for (let i = 0; i < nbBands; i++) {

        const angle = Math.PI * 2 / nbWavesByBands;

        for (let j = 0; j < nbWavesByBands; j++) {
            const lastWave = waves[waves.length - 1];

            const vecteurDirection = new Vector2(Math.cos(angle * (j + 1)), Math.sin(angle * (j + 1)));
            const waveNumber = calculWavenumber(vecteurDirection.x, vecteurDirection.y);
            const amplitude = lastWave.amplitude / 1.3;
            const phase = 1;
            const angularFrequency = Math.sqrt(GRAVITY * waveNumber)
            const waveLength = lastWave.waveLength / 1.3;

            waves.push(
                {
                    vecteurDirection: vecteurDirection,
                    waveNumber: waveNumber,
                    amplitude: amplitude,
                    phase: phase,
                    angularFrequency: angularFrequency,
                    waveLength: waveLength

                }
            )
        }


        nbWavesByBands += 2;
    }

    return waves;
}

export default function Wave({readFile, saveData, getDataFile}:{readFile:Function, saveData:Function, getDataFile:Function}) {
    const size = 1024;
    const MAX_WAVES = 32; // Make sure that there is the same constant in the shaders
    const GRAVITY = 9.81;

    // Refs
    const mesh = useRef<Mesh>(null!)
    const material = useRef<CustomMaterialType>(null!)
    const dataFiles = useRef<string[]>([]);
    const animate = useRef(true);


    // Example of a waves data
    const wavesData1:Wave[] = [
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

    // Use to fill the array so that it has the right length (MAX_WAVES)
    const emptyWave:Wave = {
        vecteurDirection :  new Vector2(0.0, 0.0),
        waveNumber : 0.0,
        amplitude : 0.0,
        phase : 0.0,
        angularFrequency : 0.0,
        waveLength : 0.0,
    }

    const vecteurDirection = new Vector2(1.0, 0.0);
    const waveNumber = calculWavenumber(vecteurDirection.x, vecteurDirection.y);
    const amplitude = 12.0;
    const phase = 1;
    const angularFrequency = Math.sqrt(GRAVITY * waveNumber)
    const waveLength = 80.0;

    const firstWave = {
                    vecteurDirection: vecteurDirection,
                    waveNumber: waveNumber,
                    amplitude: amplitude,
                    phase: phase,
                    angularFrequency: angularFrequency,
                    waveLength: waveLength
                }


    const generateWaves = generateGernsterWave(3, firstWave);
    
    
    // console.dir(
    //     generateWaves
    // )

    // Main array, put all your waves in there
    const waves:Wave[] = [...generateWaves]

    // Keeping the length of the array before filling it with the empty waves
    let wavesListSize = waves.length;

    // Filling the array with empty waves so the lenght is equal to MAX_WAVES
    while (waves.length < MAX_WAVES) {
        waves.push({...emptyWave})
    }

    // Texture and hdr
    const foamTexture = useLoader(TextureLoader, "/foamTexture.jpg");
    const envTexture = useLoader(HDRLoader, "/env1K.hdr")
    // Uniforms to send to the shader
    const uniforms = {
        uWavesListSize : {
            value : wavesListSize
        },
        uWaves : {
            value : waves
        },
        uTime : {
            value : 1
        },
        uColor : {
            value : new Vector3(0.0, 0.0, 1.0)
        },
        uNbBand : {
            value : 3.0
        },
        uFoamTexture : {
            value : foamTexture
        },
        uEnvironment : {
            value : envTexture
        },
        uLightCoord : {
            value : new Vector3(0.0, 0.0, 1.0)
        },
        uColorShallow : {
            value : new Vector3(72.0/255.0, 202.0/255.0, 228.0/255.0)
        }
    }

    // console.dir(uniforms)

    // GUI
    useEffect(() => {
        // Gui creation
        const gui = new GUI()

        if (material.current) {

            // let waves:Wave[] = material.current.uniforms.uWaves.value;
            let size:number = material.current.uniforms.uWavesListSize.value;
            let color:Vector3 = material.current.uniforms.uColor.value;
            let colorShallow:Vector3 = material.current.uniforms.uColorShallow.value;

            const colorFormats = {
                colorWave: { r: color.x, g: color.y, b: color.z },
                colorWaveShallow : { r: colorShallow.x, g: colorShallow.y, b: colorShallow.z }
            };

            // Object for control 
            // const controlFunction = {
            //     addWave() {
            //         if (size <= MAX_WAVES) {
            //             let newSize = size + 1;
            //             material.current.uniforms.uWavesListSize.value = newSize;
            //             wavesListSize = newSize;
            //             size = newSize;
            //         }
            //     },
            //     removeWave() {
            //         if (size > 0 ) {
            //             let newSize = size - 1;
            //             material.current.uniforms.uWavesListSize.value = newSize;
            //             wavesListSize = newSize;
            //             size = newSize;
            //         }

            //     },
            //     async loadData() {
            //         const data = await readFile(this.filename);

            //         if (data != "nodata") {
            //             const jsonData = JSON.parse(data);

            //             material.current.uniforms.uWaves.value = jsonData.uWaves.value;
            //             material.current.uniforms.uWavesListSize.value = jsonData.uWavesListSize.value;
            //         }

            //         wavesFolder.destroy();
            //         wavesFolder = gui.addFolder("Waves");
            //         loadWaveFolder()
            //     },
            //     async saveData() {
            //         const data = material.current.uniforms;
            //         saveData(JSON.stringify(data))
            //         loadDataFiles()
            //     },
            //     filename : "none"
            // }


            // Load functions
            // function loadWaveFolder() {
            //     for (let index = 0; index < wavesListSize; index++) {
            //         const wave = material.current.uniforms.uWaves.value[index];


            //         const itemFolder = wavesFolder.addFolder(`Wave ${index + 1}`);
            //         const VecteurDirection = itemFolder.addFolder(`VecteurDirection`);
            //         VecteurDirection.add(wave.vecteurDirection,"x", -1, 1)
            //                         .onChange( (value:number) => {
            //                             wave.waveNumber= calculWavenumber(value, wave.vecteurDirection.y)
                                        
            //                         } );
            //         VecteurDirection.add(wave.vecteurDirection,"y", -1, 1)
            //                         .onChange( (value:number) => {
            //                             wave.waveNumber= calculWavenumber(wave.vecteurDirection.x, value)
            //                         } );
            //         itemFolder.add(wave, "amplitude",0,10)
            //         itemFolder.add(wave, "angularFrequency", 0, 10);
            //         itemFolder.add(wave, "phase", 0, 10);
            //         itemFolder.add(wave, "waveLength", 0.01, 120);
            //         // itemFolder.onChange(() => {
            //         //     console.log("Uniforms : ")
            //         //     console.dir(material.current.uniforms)
            //         // });

            //         itemFolder.close()
            //     }
            // }

            // async function loadDataFiles() {
            //     dataFiles.current = await getDataFile();
                
            //     dataFolderController.options(dataFiles.current)
            //     dataFolderController.updateDisplay()
            // }

            // Add/Remove wave controls
            // gui.add(controlFunction, "addWave").onChange(() => {
            //     wavesFolder.destroy();
            //     wavesFolder = gui.addFolder("Waves");
            //     loadWaveFolder()
            // });

            // gui.add(controlFunction, "removeWave").onChange(() => {
            //     wavesFolder.destroy();
            //     wavesFolder = gui.addFolder("Waves");
            //     loadWaveFolder()
            // });


            // Colors
            gui.addColor(colorFormats, "colorWave").onChange(() => {
                material.current.uniforms.uColor.value = new Vector3(colorFormats.colorWave.r, colorFormats.colorWave.g, colorFormats.colorWave.b)
            });

            gui.addColor(colorFormats, "colorWaveShallow").onChange(() => {
                material.current.uniforms.uColorShallow.value = new Vector3(colorFormats.colorWaveShallow.r, colorFormats.colorWaveShallow.g, colorFormats.colorWaveShallow.b)
            });

            gui.add(material.current.uniforms.uLightCoord.value, "x", 0.0, 1.0)
            gui.add(material.current.uniforms.uLightCoord.value, "y", 0.0, 1.0)
            gui.add(material.current.uniforms.uLightCoord.value, "z", 0.0, 1.0)

            // Data folder
            // const dataFolder = gui.addFolder("dataFolder");

            // let dataFolderController = dataFolder.add(controlFunction, 'filename', dataFiles.current)

            // loadDataFiles()

            // dataFolder.add(controlFunction, "loadData")
            // dataFolder.add(controlFunction, "saveData")


            // Wave folder
            // let wavesFolder = gui.addFolder("Waves");
            // loadWaveFolder();

        }

        return () => {
            gui.destroy()
        }

    }, [])



    useEffect(() => {
        const handleKeyDown = (e:KeyboardEvent) => {
            if (e.key == " ") {
            animate.current = !animate.current
            console.log(animate.current?"The animation is playing":"The animation is paused")
            } else if (e.key == "d") {
                material.current.wireframe = !material.current.wireframe;
            }
        }

        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };

    }, [])

    // Clock to animate the shader
    useFrame(({clock}) => {
        if (material.current && animate.current) {
            material.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    })


    return(
        <>
            <mesh ref={mesh} position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]} castShadow receiveShadow>
                <planeGeometry args={[size, size, size/1.5, size/1.5]}/>
                <CustomMaterial 
                    key={CustomShaderMaterial.key} 
                    ref={material}
                    uniforms={uniforms}
                    transparent={true}
                    
                    />
            </mesh>
        </>
    )
}