// @ts-nocheck

import {
    Vector3,
    Mesh,
    Scene
} from "babylonjs"

export class RemoteCharacterController {
    private _moveVector: Vector3;
    public _avatar: Mesh;
    private _scene: Scene;
    private _renderer: () => void;
    private _started: boolean = false;
    private moving: boolean = false;
    private _avStartPos: Vector3 = Vector3.Zero();
    private _vMovStartPos: Vector3 = Vector3.Zero();
    private _stepOffset: number = 0.25;
    private _vMoveTot: number = 0;
    private _minSlopeLimit: number = 30;
    private _maxSlopeLimit: number = 45;
    private _sl: number = Math.PI * this._minSlopeLimit / 180;
    private _sl2: number = Math.PI * this._maxSlopeLimit / 180;
    private _id=null;

    constructor(avatar: Mesh, scene: Scene, id, roomid) {
        this._avatar = avatar;
        this._avatar.getChildMeshes()[4].material = scene.getMaterialByName('front').clone(`${id}_mat0`)
        this._avatar.getChildMeshes()[4].material.albedoTexture =  new BABYLON.Texture("/head.jpeg", scene);
        this._avatar.getChildMeshes()[5].material =  scene.getMaterialByName('red').clone(`${id}_mat1`)
        this._id = id
        this._roomid = roomid
        this._scene = scene;
        this._renderer = () => { this._moveAVandCamera() };
      //  this.drawEllipsoid(this._avatar)
    }

    drawEllipsoid(mesh) {
        mesh.computeWorldMatrix(true);
        var ellipsoidMat = mesh.getScene().getMaterialByName("__ellipsoidMat__h");
        if (! ellipsoidMat) { 
            ellipsoidMat = new BABYLON.StandardMaterial("__ellipsoidMat__h", mesh.getScene());
            ellipsoidMat.alpha = 0;
        }
        var ellipsoid = BABYLON.Mesh.CreateSphere("__ellipsoid__r", 9, 1, mesh.getScene());
        ellipsoid.scaling = mesh.ellipsoid.clone();
        ellipsoid.scaling.y *= 1;
        ellipsoid.scaling.x *= 8;
        ellipsoid.scaling.z *= 8;
        ellipsoid.material = ellipsoidMat;
        ellipsoid.parent = mesh;
        ellipsoid.computeWorldMatrix(true);
        ellipsoid.actionManager = new BABYLON.ActionManager(this._scene);
        ellipsoid.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                    parameter:  this._scene.getMeshByName("__ellipsoid__"),
                },
                () => {
                    console.log("Collison found...")
                },
            ),
   
        );
        ellipsoid.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnIntersectionExitTrigger,
                    parameter: this._scene.getMeshByName("__ellipsoid__"),
                },
                () => {
                    console.log("Collison Exited...")
                },
            ),
   
        );

    }

    setColor(rgb){
        let color = new BABYLON.Color3(rgb[0], rgb[1], rgb[2])
        
       let a : BABYLON.PBRMaterial = this._avatar.getChildMeshes()[0].material.clone(`body_${this._id}`)
       a.albedoColor = color
       this._avatar.getChildMeshes()[0].material =a
    }

    private _moveAVandCamera() {
        this._avStartPos.copyFrom(this._avatar.position);
        if (this.moving) {
            this.moving=false;
            if (this._moveVector.length() > 0.001) {
                this._avatar.moveWithCollisions(this._moveVector);
                //walking up a slope
                if (this._avatar.position.y > this._avStartPos.y) {
                    const actDisp: Vector3 = this._avatar.position.subtract(this._avStartPos);
                    const _sl: number = this._verticalSlope(actDisp);
                    if (_sl >= this._sl2) {
                        //this._climbingSteps=true;
                        //is av trying to go up steps
                        if (this._stepOffset > 0) {
                            if (this._vMoveTot == 0) {
                                //if just started climbing note down the position
                                this._vMovStartPos.copyFrom(this._avStartPos);
                            }
                            this._vMoveTot = this._vMoveTot + (this._avatar.position.y - this._avStartPos.y);
                            if (this._vMoveTot > this._stepOffset) {
                                //move av back to its position at begining of steps
                                this._vMoveTot = 0;
                                this._avatar.position.copyFrom(this._vMovStartPos);
                                this._endFreeFall();
                            }
                        } else {
                            //move av back to old position
                            this._avatar.position.copyFrom(this._avStartPos);
                            this._endFreeFall();
                        }
                    } else {
                        this._vMoveTot = 0;
                        if (_sl > this._sl) {
                            //av is on a steep slope , continue increasing the moveFallTIme to deaccelerate it
                            this._fallFrameCount = 0;
                            this._inFreeFall = false;
                        } else {
                            //continue walking
                            this._endFreeFall();
                        }
                    }
                } else if ((this._avatar.position.y) < this._avStartPos.y) {
                    const actDisp: Vector3 = this._avatar.position.subtract(this._avStartPos);
                    if (!(this._areVectorsEqual(actDisp, this._moveVector, 0.001))) {
                        //AV is on slope
                        //Should AV continue to slide or walk?
                        //if slope is less steeper than acceptable then walk else slide
                        if (this._verticalSlope(actDisp) <= this._sl) {
                            this._endFreeFall();
                        } else {
                            //av is on a steep slope , continue increasing the moveFallTIme to deaccelerate it
                            this._fallFrameCount = 0;
                            this._inFreeFall = false;
                        }
                    } else {
                        this._inFreeFall = true;
                        this._fallFrameCount++;
                    }
                } else {
                    this._endFreeFall();
                }
            }
        }
    }

    public start() {
        if (this._started) return;
        this._started = true;
        this._scene.registerBeforeRender(this._renderer);
    }

    public setMoveData(moveVector){
        this._moveVector=moveVector;
        this.moving=true;
    }

    private _areVectorsEqual(v1: Vector3, v2: Vector3, p: number) {
        return ((Math.abs(v1.x - v2.x) < p) && (Math.abs(v1.y - v2.y) < p) && (Math.abs(v1.z - v2.z) < p));
    }

    private _verticalSlope(v: Vector3): number {
        return Math.atan(Math.abs(v.y / Math.sqrt(v.x * v.x + v.z * v.z)));
    }

    private _endFreeFall(): void {
        this._fallFrameCount = 0;
        this._inFreeFall = false;
    }

}