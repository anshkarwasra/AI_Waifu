// import Home from './components/Home/Home'
// import Settings from './components/settings/Settings'
// import { createBrowserRouter,RouterProvider } from 'react-router-dom'

// export default function App() {

//   const router = createBrowserRouter(
//     [
//       {
//         path:'/',
//         element:<Home />
//       },
//       {
//         path:'/settings',
//         element: <Settings />
//       }
//     ]
//   )
  



//   return (
//     <RouterProvider router={router}>
      
//     </RouterProvider>
//   )
// }

import { Canvas } from '@react-three/fiber';
import { ChangeEvent, useState, useRef, useEffect } from 'react';
import { useWaifuSocket } from '../utils/hooks/useWaifu';
import React from 'react';
import { OrbitControls } from '@react-three/drei';
import VRMModel from './components/Vrm';

export default function App() {
  const [inp, setInp] = useState<string>('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { getSocket, getTargetLip } = useWaifuSocket();
  const waifuSocket = getSocket();

  const onInpFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInp(e.target.value);
  };

  const onSubmitBtn = () => {
    waifuSocket?.emit("speak", { text: inp });
    setInp('');
  };

  // Make waifu draggable
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startX = 0;
    let startY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      // Only drag from top area
      const rect = container.getBoundingClientRect();
      if (e.clientY - rect.top > 100) return; // Only top 100px is draggable
      
      setIsDragging(true);
      startX = e.screenX;
      startY = e.screenY;
      
      // @ts-ignore - Electron IPC
      window.electronAPI?.setClickable(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.screenX - startX;
      const deltaY = e.screenY - startY;
      
      // @ts-ignore
      window.electronAPI?.moveWindow(deltaX, deltaY);
      
      startX = e.screenX;
      startY = e.screenY;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // @ts-ignore
      window.electronAPI?.setClickable(true);
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        // Transparent background for desktop mate mode
        backgroundColor: 'transparent',
      }}
      onMouseEnter={() => {
        // Make window interactive when hovering over waifu
        // @ts-ignore
        window.electronAPI?.setClickable(true);
      }}
      onMouseLeave={() => {
        // Make background click-through when not hovering
        if (!isMinimized) {
          // @ts-ignore
          window.electronAPI?.setClickable(false);
        }
      }}
    >
      {/* Canvas - The Waifu */}
      <div style={{ flex: 1, position: 'relative',background:'black' }}>
        <Canvas
          camera={{ position: [0, 1.4, 3.8], fov: 30 }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={2} />

          <React.Suspense fallback={null}>
            <VRMModel animation={"HappyIdle"} getTargetLip={getTargetLip} />
          </React.Suspense>

          <OrbitControls
            target={[0, 1, 0]}
            enablePan={false}
            enableZoom={false}
            enableRotate={true}
          />
        </Canvas>

        {/* Drag handle indicator */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '4px 12px',
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '12px',
            cursor: 'move',
            userSelect: 'none',
            opacity: isDragging ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}
        >
          ⋮⋮ Drag to move
        </div>
      </div>

      {/* Collapsible Chat Input */}
      {!isMinimized && (
        <div
          style={{
            background: 'rgba(31, 41, 55, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '12px',
            display: 'flex',
            gap: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px 12px 0 0',
          }}
        >
          <input
            type="text"
            value={inp}
            onChange={onInpFieldChange}
            onKeyPress={(e) => e.key === 'Enter' && onSubmitBtn()}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: 'rgba(55, 65, 81, 0.8)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              outline: 'none',
            }}
            placeholder="Talk to your waifu..."
          />
          <button
            onClick={onSubmitBtn}
            style={{
              padding: '8px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          >
            Send
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(55, 65, 81, 0.8)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
            title="Minimize chat"
          >
            ▼
          </button>
        </div>
      )}

      {/* Minimized state - small button to expand */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          style={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            background: 'rgba(37, 99, 235, 0.9)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            borderRadius: '20px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          💬 Chat
        </button>
      )}

      {/* Context menu (right-click options) */}
      {/* TODO: Add settings, quit, toggle mode, etc. */}
    </div>
  );
}