
import * as THREE from "../../js/three.module.js";
import { OrbitControls } from "../../js/OrbitControls.js";
import { GUI } from '../../js/dat.gui.module.js';
import { VertexColors } from "../taemin-steve/js/three.module.js";


const render_w = window.innerWidth;                                                
const render_h = window.innerHeight;

console.log(render_w, render_h);
console.log("aspectRatio: " + render_w/render_h);                                  
console.log("devicePixelRatio: " + window.devicePixelRatio);                       

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, render_w/render_h, 0.1, 100);       // fov, aspect, near, far 
const renderer = new THREE.WebGLRenderer();
//const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(render_w, render_h);
                
//큐브생성
const geomery = new THREE.BoxGeometry(1, 1, 1);
const texture = new THREE.TextureLoader().load( './teximg.jpg' );
const material = new THREE.MeshPhongMaterial( {color:0xFFFFFF, map:texture} );
const cube = new THREE.Mesh(geomery, material);
cube.matrixAutoUpdate = false; 

const light = new THREE.DirectionalLight(0xFFFFFF, 1);
let light_helper;
let mode_movement = "none";

////추가좌표////
const forcamera = new THREE.Object3D();
forcamera.add(camera);

dom_init();
scene_init();

function dom_init() {
    const container = document.getElementById('render_div');
    container.appendChild(renderer.domElement);
    container.addEventListener("mousedown", mouseDownHandler, false);
    container.addEventListener("mouseup", mouseUpHandler, false);

    container.addEventListener("mousemove", mouseMoveHandler, false);
    container.addEventListener("wheel", mouseWheel, false);
    container.addEventListener('contextmenu', function (e) { 
        e.preventDefault(); 
    }, false); 

    window.addEventListener( 'resize', onWindowResize );

    function onWindowResize() {
        var render_w = window.innerWidth; // 내가 변수 선언해준거임
        var render_h = window.innerHeight;
        camera.aspect = render_w/render_h;
        camera.updateProjectionMatrix(); 

        renderer.setSize( render_w, render_h );
    } 
}

function scene_init() {
    scene.add(forcamera);
    scene.add(cube);
    //좌표계하나에 두개의 좌표계를 추가하여 상대적인 움직임을 보여줘보자
    scene.add(cube);
    scene.add(new THREE.AxesHelper(2));// 축 생성
    scene.add(light);

    light.position.set(-2, 2, 2);
    light.target = cube;
    scene.add(light);
    scene.add( new THREE.AmbientLight( 0x222222 ) );

    light_helper = new THREE.DirectionalLightHelper(light, 0.3);          
    scene.add( light_helper );

    camera.matrixAutoUpdate = false;
    
    let a = new THREE.Matrix4().makeTranslation(0, 0, 5);

    camera.matrixWorldNeedsUpdate = true;
    camera.matrix.copy(a);    
}


renderer.setAnimationLoop( ()=>{ // every available frame
    //controls.update();
    //cube.matrixAutoUpdate = true;
    renderer.render( scene, camera );
} );


let rightButtonClick = false;
let leftButtonClick = false;


function mouseDownHandler(e) {

    if(e.button === 0) { 
        leftButtonClick = true; 
    }
    else if (e.button === 2) { 
        rightButtonClick = true;
    }

}

function mouseUpHandler(e) {
    rightButtonClick = false;
    leftButtonClick = false;
}

let prePS = new THREE.Vector3();

function mouseMoveHandler(e) {
    camera.matrixAutoUpdate = false;
    camera.matrixWorldNeedsUpdate = true;   
    forcamera.matrixAutoUpdate = false;
    forcamera.matrixWorldNeedsUpdate = true;   

    let SS = new THREE.Vector3();
    let PS = SS.set((e.clientX/window.innerWidth)*2-1,-(e.clientY/window.innerHeight)*2+1,-1);//SS to PS
    let temPS = PS.clone();  //???????????????
    let temWS = PS.unproject(camera).clone();
    let preWS = prePS.unproject(camera).clone();
    //1. ss에서 바뀌기 전후 위치를 받아와  ws 로 변환한다 이후 전 ss에 후 ws를 넣어준다

    if(rightButtonClick){
/////////////////////////

        //let SSpoint = temPS.distanceTo(camera.getWorldPosition(new THREE.Vector3(0,0,0)));
        //console.log(SSpoint);
        console.log(temWS);
        let WSpoint = temWS.distanceTo(camera.getWorldPosition(new THREE.Vector3(0,0,0)));
        console.log(WSpoint);
//////////////////////////
        let cameraMove = temWS.sub(preWS);
        let tran = new THREE.Matrix4().makeTranslation(cameraMove.x*-30,cameraMove.y*-30,cameraMove.z*-30); 
        //camera.matrix.multiply(tran);

        let updateCM = forcamera.matrix.clone();
        updateCM.premultiply(tran); 
        forcamera.matrix.copy(updateCM); 
    }
    if(leftButtonClick){
        let V1 = temWS.sub(camera.getWorldPosition(new THREE.Vector3(0,0,0)));
        let V2 = preWS.sub(camera.getWorldPosition(new THREE.Vector3(0,0,0)));
        //console.log(camera.getWorldPosition(new THREE.Vector3(0,0,0)));
        
        let d1 = V1.length();
        let d2 = V2.length();
        
        let V = V1.cross(V2);
        let VV = V.normalize();

        let dotV = V1.dot(V2);
        let theta = (Math.PI/180)*Math.acos(dotV/(d1*d2)); //이래야지 도가되나?

        // let R = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().
        // setFromAxisAngle(VV, -Math.abs(theta)));
        let R = new THREE.Matrix4().makeRotationAxis(VV,-theta);
        //console.log(theta);
        //두가지 방법으로 로테이션을 돌려봄 아래가 더 잘되는듯함
        let CM = camera.matrix.clone();
        CM.premultiply(R);
        camera.matrix.copy(CM);
    }  
    prePS = temPS.clone();
} 

function mouseWheel(e) {
    camera.matrixAutoUpdate = false;
    camera.matrixWorldNeedsUpdate = true;

    let cam_view = new THREE.Vector3(0, 0, -1); // in the camera space, -z is the viewing direction
    
    cam_view.transformDirection(camera.matrix); // vector3의 메소드 로컬공간을 월드공간으로

    let view_move = cam_view.clone();

    let mat_viewingTrans = new THREE.Matrix4();
    if(e.deltaY > 0) {
        view_move.multiplyScalar(-0.1);
    }
    else {
        view_move.multiplyScalar(0.1);
    }
    console.log(view_move);
    mat_viewingTrans.makeTranslation(view_move.x, view_move.y, view_move.z);
    console.log(mat_viewingTrans);
    let cam_mat_prev = camera.matrix.clone();
    // cam_mat_prev = mat_viewingTrans * cam_mat_prev 으로 하면 사라져서 copy써준다
    cam_mat_prev.premultiply(mat_viewingTrans);
    camera.matrix.copy(cam_mat_prev);
}   