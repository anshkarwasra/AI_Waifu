import Home from './components/Home/Home'
import Settings from './components/settings/Settings'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'

export default function App() {

  const router = createBrowserRouter(
    [
      {
        path:'/',
        element:<Home />
      },
      {
        path:'/settings',
        element: <Settings />
      }
    ]
  )
  



  return (
    <RouterProvider router={router}>
      
    </RouterProvider>
  )
}