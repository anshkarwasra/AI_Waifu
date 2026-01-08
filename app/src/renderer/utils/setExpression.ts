import { VRM } from "@pixiv/three-vrm";

export const setExprression = (vrm:VRM, expression:string, value:number) => {
    vrm.expressionManager?.setValue(expression, value);
}