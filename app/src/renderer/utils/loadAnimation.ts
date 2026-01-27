import * as THREE from 'three';
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm';
import { mixamoVRMRigMap } from './mixamoVRMRigMap';


export function remapMixamoAnimationToVrm(vrm: VRM, asset: THREE.Object3D | THREE.Group): THREE.AnimationClip | null {
  // Extract the AnimationClip
  const rawClip = THREE.AnimationClip.findByName(asset.animations, 'mixamo.com');
  if (!rawClip) {
    console.error('Mixamo animation not found in asset');
    return null;
  }

  const clip = rawClip.clone();
  const tracks: THREE.KeyframeTrack[] = [];

  const restRotationInverse = new THREE.Quaternion();
  const parentRestWorldRotation = new THREE.Quaternion();
  const _quatA = new THREE.Quaternion();

  // 1. Calculate Hips Scaling
  const mixamoHips = asset.getObjectByName('mixamorigHips');
  const vrmHipsNode = vrm.humanoid?.getNormalizedBoneNode('hips');

  if (!mixamoHips || !vrmHipsNode) {
    console.warn('Hips node missing for scale calculation');
    return null;
  }

  const motionHipsHeight = mixamoHips.position.y;
  // Normalized rest pose access for v0.x and v1.x
  const vrmHipsHeight = vrm.humanoid.normalizedRestPose?.hips?.position?.[1] ?? 1.0;
  const hipsPositionScale = vrmHipsHeight / motionHipsHeight;

  // 2. Process Tracks
  clip.tracks.forEach((track: THREE.KeyframeTrack) => {
    const trackSplitted = track.name.split('.');
    const mixamoRigName = trackSplitted[0];
    const propertyName = trackSplitted[1];

    // Map Mixamo name to VRM Human Bone Name
    const vrmBoneName = mixamoVRMRigMap[mixamoRigName] as VRMHumanBoneName;
    const vrmNode = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName);
    const mixamoRigNode = asset.getObjectByName(mixamoRigName);

    if (vrmNode && mixamoRigNode) {
      const vrmNodeName = vrmNode.name;

      // Store rotations of rest-pose
      mixamoRigNode.getWorldQuaternion(restRotationInverse).invert();
      mixamoRigNode.parent?.getWorldQuaternion(parentRestWorldRotation);

      if (track instanceof THREE.QuaternionKeyframeTrack) {
        // Retarget rotation
        for (let i = 0; i < track.values.length; i += 4) {
          _quatA.fromArray(track.values, i);

          _quatA
            .premultiply(parentRestWorldRotation)
            .multiply(restRotationInverse);

          _quatA.toArray(track.values, i);
        }

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            `${vrmNodeName}.${propertyName}`,
            track.times,
            track.values.map((v, i) => 
              vrm.meta?.metaVersion === '0' && i % 2 === 0 ? -v : v
            )
          )
        );
      } else if (track instanceof THREE.VectorKeyframeTrack) {
        // Retarget position (usually only for Hips)
        const value = track.values.map((v, i) => 
          (vrm.meta?.metaVersion === '0' && i % 3 !== 1 ? -v : v) * hipsPositionScale
        );
        
        tracks.push(
          new THREE.VectorKeyframeTrack(
            `${vrmNodeName}.${propertyName}`, 
            track.times, 
            value
          )
        );
      }
    }
  });

  return new THREE.AnimationClip('vrmAnimation', clip.duration, tracks);
}