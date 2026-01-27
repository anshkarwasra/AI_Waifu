import { useLoader, useFrame } from "@react-three/fiber"
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm"
import { GLTFLoader } from "three/examples/jsm/Addons.js"
import { useRef, useEffect, useState, RefObject } from "react"
import { useAnimations } from "@react-three/drei"
import { parseAnimationFbx } from "../../utils/parseFBXAnimation"
import { VRMProps } from "src/renderer/utils/types/types"




function VRMModel({ animation,getTargetLip }:VRMProps) {
    const vrmRef: RefObject<VRM | null> = useRef<VRM | null>(null);
    const [ isLoading,setIsLoading ] = useState<boolean>(true);
    const [Animation, setAnimation] = useState<string | null>(animation);
    const gltf = useLoader(GLTFLoader, '/waifu.vrm', (loader) => {
        loader.register((parser) => new VRMLoaderPlugin(parser))
    })
    const vrm = gltf.userData.vrm

    // Store reference
    if (!vrmRef.current) {
        console.log('VRM loaded:', vrm)
        VRMUtils.rotateVRM0(vrm)
        vrmRef.current = vrm
    }


    let actions;
    if (Animation != null) {
        const clip = parseAnimationFbx(vrm, Animation);
        if (clip != undefined) {
            actions = useAnimations([clip], vrm.scene)
        }
    }
    useEffect(() => {
        if (vrm) setIsLoading(true);
        if (Animation) {
            actions.actions[Animation]?.play()
        }
        return () => {
            if (Animation) {
                actions.actions[Animation]?.stop(); // clean up function 
            }
        }
    }, [actions, Animation])



    useEffect(() => {
        const vrm = gltf?.userData.vrm;
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.combineSkeletons(gltf.scene);
        // VRMUtils.combineMorphs(vrm);

        vrm.scene.traverse((obj) => {
            obj.fructumCulled = false;
        })
    }, [gltf.scene])

    
   
    // Update VRM every frame
    useFrame((_, delta) => {
        if (vrmRef.current) {
           const v = getTargetLip();

            vrmRef.current.expressionManager?.setValue("aa", v);
            vrmRef.current.expressionManager?.setValue("oh", v * 0.6);  
            // console.log('the value of v is:- ',v)
            vrmRef.current.update(delta)
        }
    })

    if (!gltf?.userData?.vrm) {
        console.log('No VRM found')
        return null
    }



    return isLoading? <primitive object={vrm.scene} /> : <div className="text-white">Loading VRM Please wait</div>
}

export default VRMModel