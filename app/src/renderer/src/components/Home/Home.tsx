import VRMModel from "../Vrm"
import Icon from "../settings/Icon"
import { Canvas } from "@react-three/fiber"
import React from "react"
import { OrbitControls } from "@react-three/drei"
import { useWaifuSocket } from "../../../utils/hooks/useWaifu"

const Home = () => {
    const { getTargetLip } = useWaifuSocket();
  return (
    <div className="flex  h-screen w-screen">
      <div className="left bg-black relative w-2/3">
        <Canvas
          camera={{ position: [0, 1.4, 3.8], fov: 30 }}
          className=" w-full h-full"
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={2} />

          <React.Suspense fallback={null}>
            <VRMModel animation={"HappyIdle"} getTargetLip={getTargetLip} />
          </React.Suspense>

          <OrbitControls target={[0, 1, 0]} />
        </Canvas>
      </div>
      <div className="right w-1/3 bg-red-200 h-full">
      <div className="icon bg-white  py-2 rounded-full w-16 text-center px-4 cursor-pointer">
            <Icon />
        </div>
      </div>




    </div>
  )
}

export default Home