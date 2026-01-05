
import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import React from 'react'
import { OrbitControls } from '@react-three/drei'
import VRMModel from './components/vrm'
import { say } from './components/vrm'

export default function App() {
  const [userText, setUserText] = useState('')
  
  const onChangeText = (e) => {
    setUserText(e.target.value)
  }
  const onSubmitText = () => {
    console.log("submetted text")
    say(userText)
  }
  return (
    <div style={{ width: '100vw', height: '70vh' }}>
      <div className='bg-black h-full'>
        <Canvas camera={{ position: [0, 1.4, 3.8], fov: 30 }}>
        
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        
        <gridHelper args={[10, 10]} />
        
        <React.Suspense fallback={null}>
            <VRMModel />
         
        </React.Suspense>
        
        <OrbitControls target={[0, 1, 0]} />
        
      </Canvas>
      </div>
      <div className="inputContainer bg-black h-full">
        <div className="input  px-6 py-2 w-[20vw] rounded-2xl flex gap-4 items-center">
          <input type="text" placeholder='enter some text' className='outline-none border-none h-full w-full text-center text-white ' onChange={onChangeText} />
          <button className='bg-cyan-700 text-white border-none outline-none px-8 py-2 rounded-lg cursor-pointer' onClick={onSubmitText}>submit</button>
        </div>
      </div>
    </div>
  )
}