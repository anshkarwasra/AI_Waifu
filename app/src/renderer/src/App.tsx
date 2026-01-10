
import { Canvas } from '@react-three/fiber'
import { ChangeEvent, useState } from 'react'
import { useWaifuSocket } from '../utils/hooks/useWaifu'
import React from 'react'
import { OrbitControls } from '@react-three/drei'
import VRMModel from './components/Vrm'

export default function App() {

  const [inp, setInp] = useState<string>('');
  const { getSocket,getTargetLip} = useWaifuSocket();
  const waifuSocket = getSocket();
  const onInpFieldChange = (e:ChangeEvent)=>{
    setInp(e.target.value)
  }

  const onSubmitBtn = ()=>{
    waifuSocket?.emit("speak",{
      text:inp,
    })
  }

  return (
    <div style={{ width: '100vw', height: '270vh' }}>
      <div className='bg-black h-full'>
        <Canvas camera={{ position: [0, 1.4, 3.8], fov: 30 }}>
        
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        
        {/* <gridHelper args={[10, 10]} /> */}
        
        <React.Suspense fallback={null}>
            <VRMModel animation={null} getTargetLip={getTargetLip} />
         
        </React.Suspense>
        
        <OrbitControls target={[0, 1, 0]} />
        
      </Canvas>
      </div>
      {/* creating a debug section for now  */}
      <div className="testInpSection">
        <input type="text" onChange={onInpFieldChange} />
        <button onClick={onSubmitBtn}>submit</button>
      </div>
    </div>
  )
}