// "use client"

import Scene from "@/component/Scene";
import { readdirSync, writeFile } from "fs";
import { readFile } from "fs/promises";
import path from "path";

export default function Home() {

  async function readFileFunc(filename:string) : Promise<string> {
    "use server"
    const pathName =  path.join(process.cwd(), "src", "data", filename);
    // console.log(pathName)

    try {
      return await readFile(pathName, 'utf8');
    } catch (e) {
      return "nodata"
    }

  }

  async function saveData(data:string) {
    "use server"

    const pathDataDir =  path.join(process.cwd(), "src", "data");
    const nbFile = readdirSync(pathDataDir).length;
    const pathname = path.join(pathDataDir, "data-"+nbFile+".json")

    await writeFile(pathname, data, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      }
    )
  }

  async function getDataFile() {
    "use server"
    const pathDataDir =  path.join(process.cwd(), "src", "data");
    return readdirSync(pathDataDir);
  }

  return (
        <div>
          <Scene readFile={readFileFunc} saveData={saveData} getDataFile={getDataFile}/>
        </div>
  );
}
