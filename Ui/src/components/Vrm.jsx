import { useLoader, useFrame } from "@react-three/fiber"
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm"
import { GLTFLoader } from "three/examples/jsm/Addons.js"
import { useRef, useEffect, useState } from "react"
import { useAnimations } from "@react-three/drei"
import { setExprression } from "../../utils/setExpression"
import { parseAnimationFbx } from "../../utils/parseFBXAnimations"
import { playStream } from "../../utils/textToSpeech"
import { unlockAudio } from "../../utils/audioManager"


export const say = async ( text ) => {
    await unlockAudio();
    await playStream(text);
}


function VRMModel() {
    const vrmRef = useRef()
    const [Animation, setAnimation] = useState("HipHopDancing");
    const gltf = useLoader(GLTFLoader, '/waifu-2.vrm', (loader) => {
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
    if (Animation) {
        const clip = parseAnimationFbx(vrm, Animation);
        actions = useAnimations([clip], vrm.scene)
    }
    useEffect(() => {
        if (Animation) {
            actions.actions[Animation]?.play()
        }
        return () => {
            actions.actions[Animation]?.stop(); // clean up function 
        }
    }, [actions, Animation])



    useEffect(() => {
        const vrm = gltf?.userData.vrm;
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.combineSkeletons(gltf.scene);
        VRMUtils.combineMorphs(vrm);

        vrm.scene.traverse((obj) => {
            obj.fructumCulled = false;
        })
    }, [gltf.scene])

    // Update VRM every frame
    useFrame((state, delta) => {
        if (vrmRef.current) {
            
            vrmRef.current.update(delta)
        }
    })

    if (!gltf?.userData?.vrm) {
        console.log('No VRM found')
        return null
    }



    return <primitive object={vrm.scene} />
}

export default VRMModel