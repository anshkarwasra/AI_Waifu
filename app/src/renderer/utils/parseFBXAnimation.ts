// import { remapMixamoAnimationToVrm } from './mixamoVRMRigMap'
import { useLoader } from '@react-three/fiber';
import { useMemo } from 'react';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import { VRM } from '@pixiv/three-vrm';
import { remapMixamoAnimationToVrm } from "./loadAnimation"

export const parseAnimationFbx = (vrm: VRM, animationName: string) => {
    const fbx = useLoader(FBXLoader, `${animationName}.fbx`)
    const animationClip = useMemo(() => {
        const clip = remapMixamoAnimationToVrm(vrm, fbx);
        if (!clip) {
            return;
        }
        clip.name = animationName;
        return clip
    }, [vrm, fbx]);

    return animationClip

}
