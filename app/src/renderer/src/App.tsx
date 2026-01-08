
import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import React from 'react'
import { OrbitControls } from '@react-three/drei'
import VRMModel from './components/Vrm'

export default function App() {
  
  return (
    <div style={{ width: '100vw', height: '70vh' }}>
      <div className='bg-black h-full'>
        <Canvas camera={{ position: [0, 1.4, 3.8], fov: 30 }}>
        
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        
        {/* <gridHelper args={[10, 10]} /> */}
        
        <React.Suspense fallback={null}>
            <VRMModel animation={null} />
         
        </React.Suspense>
        
        <OrbitControls target={[0, 1, 0]} />
        
      </Canvas>
      </div>
      
    </div>
  )
}