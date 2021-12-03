
// @ts-nocheck

export class CSS3DObject extends BABYLON.Mesh {
    constructor(element, scene) {
        super()
        this.element = element
		this.element.style.position = 'absolute'
		this.element.style.pointerEvents = 'auto'
    }
}