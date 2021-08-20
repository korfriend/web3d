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
const far = 100;
const near = 0.1 ;
const camera = new THREE.PerspectiveCamera( 75, render_w/render_h, near, far);
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
//SetOrbitControls(true);

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

    camera.matrixAutoUpdate = false;

    
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

//function SetOrbitControls(enable_orbitctr){
    // controls.enabled = enable_orbitctr;
    // controls.enablePan = true;
    // controls.enableZoom = true;
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.05;
    // controls.update();
//}
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

let mouse3D = new THREE.Vector3();
let prevMouse3D = new THREE.Vector3();
let worldMouse3D = new THREE.Vector3();

let angleX = 0;
let angleY = 0;

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

    camera.matrixAutoUpdate = false;
    camera.matrixWorldNeedsUpdate = true;
    cameraSpace.matrixWorldNeedsUpdate = true;
    cameraSpace.matrixAutoUpdate = false;

    let cameraLookAt = cameraSpace.localToWorld(new THREE.Vector3(0,0,0));

    let cameraPos = new THREE.Vector3(camera.matrixWorld.elements[12],camera.matrixWorld.elements[13],camera.matrixWorld.elements[14]);
    let d = cameraPos.distanceTo(cameraLookAt);
    let scale = d /(2*near); 

    mouse3D = new THREE.Vector3( ( e.clientX /render_w ) * 2 - 1,
        -( e.clientY / render_h ) * 2 + 1,
        0);

    let tempMouse3D = mouse3D.clone();

    let unMouse3D = mouse3D.unproject(camera).clone();
    let unPrevMouse3D = prevMouse3D.unproject(camera).clone();   

    
    if(rightButtonClick){

        camera.worldToLocal(unMouse3D);
        camera.worldToLocal(unPrevMouse3D);
        worldMouse3D = unMouse3D.sub(unPrevMouse3D);
        worldMouse3D.multiplyScalar(scale);
        cameraLookAt.add(worldMouse3D);
        
        let m = new THREE.Matrix4();

        // m.set( 1, 0, 0, - (worldMouse3D.x),
        //        0, 1, 0,  -(worldMouse3D.y),
        //        0, 0, 1, -(worldMouse3D.z),
        //        0, 0, 0, 1 );

        m.makeTranslation(- (worldMouse3D.x),-(worldMouse3D.y),-(worldMouse3D.z),);

        let cam_mat_prev = cameraSpace.matrix.clone();
        cam_mat_prev.multiply(m); // 얘는 왜 또 그냥 multiply인거지?
        cameraSpace.matrix.copy(cam_mat_prev); 
        console.log(camera.position , camera.matrix);
    }
    else if(leftButtonClick){
        
        unMouse3D.sub(cameraLookAt);
        unPrevMouse3D.sub(cameraLookAt);

        let forAngleA = unPrevMouse3D.clone();
        let forAngleB = unMouse3D.clone();

        let d1 = forAngleA.length();
        let d2 = forAngleB.length();
        
        let dotProduct = forAngleA.dot(forAngleB);

        let theta = (180/Math.PI) * Math.acos(dotProduct/(d1*d2));
        
        // camera.worldToLocal(unMouse3D);
        // camera.worldToLocal(unPrevMouse3D);
        unPrevMouse3D.cross(unMouse3D);
        cameraSpace.worldToLocal(unPrevMouse3D);
        
        let a = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(unPrevMouse3D,-10*theta));
        let cam_mat_prev = cameraSpace.matrix.clone();
        cam_mat_prev.multiply(a);
        cameraSpace.matrix.copy(cam_mat_prev); /// 이렇게 하면 왜 해결되는거지? 그냥 multiply랑 뭐가 다른데?   camera.matrix.premultiply(a); 그냥 이렇게 해도됨
        ///premultiply multiply 차이와, 굳이 직접 변환하지 않고, copy해주는 이유는??



    }
    rightButtonMousePosX = e.clientX;
    rightButtonMousePosY = e.clientY;
    prevMouse3D = tempMouse3D.clone();
}


function mouseWheel(e) {
    
    camera.matrixAutoUpdate = false;
    camera.matrixWorldNeedsUpdate = true;
    let cam_view = new THREE.Vector3(0, 0, -1); // in the camera space, -z is the viewing direction
    cam_view.transformDirection(camera.matrix); // refer to THREE.js doc   cma_view는 원점을 바라보는 방향. 카메라 메트릭스의 위치 많큼 변환 시킴. 
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

    // camera.matrix.premultiply(mat_viewingTrans); 이렇게 하지 않을 이유가 있는가? 
    // 또한 해당에서는 multiply와 차이가 없는데 물리적으로 어떤 현상이 벌어지고 있는지 잘 모르겠다.
}

