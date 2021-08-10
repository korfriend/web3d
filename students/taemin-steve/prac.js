import * as THREE from "./js/three.module.js";
import { OrbitControls } from "./js/OrbitControls.js";
import { GUI } from './js/dat.gui.module.js';

// https://threejsfundamentals.org/threejs/lessons/kr/threejs-fundamentals.html
const render_w = window.innerWidth;
const render_h = window.innerHeight;
/// 랜더러의 화면 크기 설정

console.log(render_w, render_h);
console.log("aspectRatio: " + render_w/render_h);
console.log("devicePixelRatio: " + window.devicePixelRatio);


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, render_w/render_h, 0.1, 100);
const renderer = new THREE.WebGLRenderer();
const cameraSpace = new THREE.Object3D();
cameraSpace.add(camera);
//const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(render_w, render_h);
/// 기본적인 화면 설정

//const controls = new OrbitControls(camera, renderer.domElement);


const geomery = new THREE.BoxGeometry(1, 1, 1);
const texture = new THREE.TextureLoader().load( './teximg.PNG' );
const material = new THREE.MeshPhongMaterial( {color:0xFFFFFF, map:texture} );
/// add object3D 
const overallObject3D = new THREE.Object3D();
const forObject3D = new THREE.Object3D();
const cube = new THREE.Mesh(geomery, material);
cube.matrixAutoUpdate = false;
/// 박스 만들기


const light = new THREE.DirectionalLight(0xFFFFFF, 1);
let light_helper;
let mode_movement = "none";
///광원

dom_init();
scene_init();
SetOrbitControls(true);

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

        render_w = window.innerWidth;
        render_h = window.innerHeight;
        camera.aspect = render_w/render_h;
        camera.updateProjectionMatrix();

        renderer.setSize( render_w, render_h );
    }
}

function scene_init() {
    ///add object3D ,
    scene.add(cameraSpace);
    scene.add(overallObject3D);
    overallObject3D.add(forObject3D)
    forObject3D.add(cube);
    forObject3D.add(new THREE.AxesHelper(2));
    forObject3D.add(light);
    //scene.add(cube);
    //scene.add(new THREE.AxesHelper(2));// 축 생성

    light.position.set(-2, 2, 2);
    light.target = cube;
    //scene.add(light);
    scene.add( new THREE.AmbientLight( 0x222222 ) );// 광원 설정, 장면에 추가 

    light_helper = new THREE.DirectionalLightHelper(light, 0.3);
    scene.add( light_helper );

    // camera.position.set(0, 0, 5);
    // camera.lookAt(0, 0, 0);
    // camera.up.set(0, 1, 0);

    camera.matrixAutoUpdate = false;

    // camera.position.set(0, 0, 5);
    // camera.lookAt(0, 0, 0);
    // camera.up.set(0, 1, 0);
    
    let a = new THREE.Matrix4().makeTranslation(0, 0, 5);
    let b = new THREE.Matrix4().lookAt(
        new THREE.Vector3(5, 5, 5),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0)
    );
    
    camera.matrixWorldNeedsUpdate = true;
    camera.matrix.copy(a);
    console.log(camera.matrix);
    console.log(camera.position);
    
    // let a = new THREE.Matrix4().makeTranslation(0, 0, 5);
    // let b = new THREE.Matrix4().lookAt(
    //     new THREE.Vector3(5, 5, 5),
    //     new THREE.Vector3(0, 0, 0),
    //     new THREE.Vector3(0, 1, 0)
    // );
    
    // camera.matrixWorldNeedsUpdate= true;
    // camera.matrix.multiplyMatrices(a);
    // console.log(camera.position);

    //controls.target.set( 0, 0, 0 );
}/// 전체적인 장면의 세부 설정 함수

function SetOrbitControls(enable_orbitctr){
    // controls.enabled = enable_orbitctr;
    // controls.enablePan = true;
    // controls.enableZoom = true;
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.05;
    // controls.update();
}
/*
render_animation();
function render_animation(){
    window.requestAnimationFrame(render_animation);
    controls.update();
    renderer.render(scene, camera);
}
/**/
// I strongly recommend you guys to read "Lambda function/code" articles
let rightButtonClick = false;
let leftButtonClick = false;
let rightButtonMousePosX = 0;
let rightButtonMousePosY = 0;

let angleX = 0;
let angleY = 0;
let angleYSum = 0;

renderer.setAnimationLoop( ()=>{
    //controls.update();
    renderer.render( scene, camera );
} );
/**/

function mouseDownHandler(e) {
    if (e.which == 3) {
        rightButtonClick = true;
    }
    else if ( e.which == 1){
        leftButtonClick = true;
    }
}

function mouseUpHandler(e) {
    rightButtonClick = false;
    leftButtonClick = false;
}

function mouseMoveHandler(e) {

    // cameraSpace.matrixAutoUpdate = false;
    // cameraSpace.matrixWorldNeedsUpdate = true;

    if(rightButtonClick){
       // cameraSpace.translateX( -10 * (e.offsetX - rightButtonMousePosX)/ render_w );
        // cameraSpace.translateY( 10 * (e.offsetY - rightButtonMousePosY)/ render_h );
        cameraSpace.matrixAutoUpdate = false;
        cameraSpace.matrixWorldNeedsUpdate = true;
        
        let a = new THREE.Matrix4().makeTranslation(-10 * (e.offsetX - rightButtonMousePosX)/ render_w, 10*(e.offsetY - rightButtonMousePosY)/ render_h, 0);

        cameraSpace.matrix.multiply(a);
        console.log(camera.matrix);
    }
    else if(leftButtonClick){
        // cameraSpace.matrixAutoUpdate = false;
        // cameraSpace.matrixWorldNeedsUpdate = true;
        angleX = -Math.PI*2*2*(e.offsetX - rightButtonMousePosX)/render_w;
        angleY = -Math.PI*2*2*(e.offsetY - rightButtonMousePosY)/render_h;

        // let a = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),angleY));
        // let b = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),angleX));
        // a.multiply(b);
        // cameraSpace.matrix.multiply(a);
        
        cameraSpace.quaternion.multiplyQuaternions(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),angleY),cameraSpace.quaternion);
        cameraSpace.quaternion.multiplyQuaternions(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),angleX),cameraSpace.quaternion);
        // cameraSpace.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),angleY));
        // cameraSpace.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),angleX));
    }
    rightButtonMousePosX = e.offsetX;
    rightButtonMousePosY = e.offsetY;
}


function mouseWheel(e) {
    
    camera.matrixAutoUpdate = false;
    camera.matrixWorldNeedsUpdate = true;
    let cam_view = new THREE.Vector3(0, 0, -1); // in the camera space, -z is the viewing direction
    cam_view.transformDirection(camera.matrix); // refer to THREE.js doc
    //console.log(cam_view);

    let view_move = cam_view.clone();

    let mat_viewingTrans = new THREE.Matrix4();
    if(e.deltaY > 0) {
        // wheel down
        view_move.multiplyScalar(-0.1);
    }
    else {
        // wheel up
        view_move.multiplyScalar(0.1);
    }
    //console.log(view_move);
    mat_viewingTrans.makeTranslation(view_move.x, view_move.y, view_move.z);
    //console.log(mat_viewingTrans);

    let cam_mat_prev = camera.matrix.clone();
    // cam_mat_prev = mat_viewingTrans * cam_mat_prev
    cam_mat_prev.premultiply(mat_viewingTrans);
    // camera.matrix = cam_mat_prev
    camera.matrix.copy(cam_mat_prev);

    // if(e.wheelDelta > 0){
    //     const m = new THREE.Matrix4();
    //     m.set( 0.95, 0, 0, 0,
    //         0, 0.95, 0, 0,
    //         0, 0, 0.95, 0,
    //         0, 0, 0, 1 );
    //     cameraSpace.applyMatrix4(m);
    // }
    // if(e.wheelDelta < 0){
    //     const m = new THREE.Matrix4();
    //     m.set( 1.05, 0, 0, 0,
    //         0, 1.05, 0, 0,
    //         0, 0, 1.05, 0,
    //         0, 0, 0, 1 );
    //     cameraSpace.applyMatrix4(m);
    // } 
}

