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



const geomery = new THREE.BoxGeometry(1, 1, 1);
const texture = new THREE.TextureLoader().load( './teximg.PNG' );
const material = new THREE.MeshPhongMaterial( {color:0xFFFFFF, map:texture} );
/// add object3D 
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
    scene.add(cameraSpace);
    scene.add(cube);
    scene.add(new THREE.AxesHelper(2));// 축 생성
    scene.add(light);

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
}/// 전체적인 장면의 세부 설정 함수


/*
render_animation();
function render_animation(){
    window.requestAnimationFrame(render_animation);
    controls.update();
    renderer.render(scene, camera);
}
/**/
// I strongly recommend you guys to read "Lambda function/code" articles

renderer.setAnimationLoop( ()=>{
    //controls.update();
    renderer.render( scene, camera );
} );
/**/

let rightMouseButtonClick = false;
let leftMouseButtonClick = false;

function mouseDownHandler(e) {
    if (e.which == 3) {
        rightMouseButtonClick = true;
    }
    else if ( e.which == 1){
        leftMouseButtonClick = true;
    }
}

function mouseUpHandler(e) {
    rightMouseButtonClick = false;
    leftMouseButtonClick = false;
}

let prevScreenSpaceMousePoint = new THREE.Vector3(); // We need this reference even the mouseMoveHandler() is finished.

function mouseMoveHandler(e) {

    camera.matrixAutoUpdate = false;
    camera.matrixWorldNeedsUpdate = true;
    cameraSpace.matrixWorldNeedsUpdate = true;
    cameraSpace.matrixAutoUpdate = false;

    let cameraLookAt = cameraSpace.localToWorld(new THREE.Vector3(0,0,0));

    let cameraPos = camera.localToWorld(new THREE.Vector3(0,0,0));
    let d = cameraPos.distanceTo(cameraLookAt);
    let scale = d /(near); 

    let screenSpaceMousePoint = new THREE.Vector3( ( e.clientX /render_w ) * 2 - 1,
        -( e.clientY / render_h ) * 2 + 1,
        -1);

    let tempScreenSpaceMousePoint = screenSpaceMousePoint.clone();

    let worldSpaceMousePoint = screenSpaceMousePoint.unproject(camera).clone();
    let prevWorldSpaceMousePoint = prevScreenSpaceMousePoint.unproject(camera).clone();   

    
    if(rightMouseButtonClick){

        // camera.worldToLocal(worldSpaceMousePoint);
        // camera.worldToLocal(prevWorldSpaceMousePoint); cameraSpace의 좌표계는 회전하지 않기 때문에 camera 기준의 좌표계로 바꿀 필요가 없다. 

        let cameraMoveInWorld = worldSpaceMousePoint.sub(prevWorldSpaceMousePoint);
        cameraMoveInWorld.multiplyScalar(scale);

        let m = new THREE.Matrix4();

        m.makeTranslation(- (cameraMoveInWorld.x),-(cameraMoveInWorld.y),-(cameraMoveInWorld.z),);

        let cam_mat_prev = cameraSpace.matrix.clone();
        cam_mat_prev.premultiply(m); //  premultiply(), multiply() 모두 screen graph 구조상 상관 없음. 
        cameraSpace.matrix.copy(cam_mat_prev); 

    }
    else if(leftMouseButtonClick){
        
        worldSpaceMousePoint.sub(cameraLookAt);
        prevWorldSpaceMousePoint.sub(cameraLookAt);
        
        let mouseVector = prevWorldSpaceMousePoint.clone();
        let prevMouseVector = worldSpaceMousePoint.clone();
        
        let d1 = mouseVector.length();
        let d2 = prevMouseVector.length();
        
        let dotProduct = mouseVector.dot(prevMouseVector);
        
        let theta = (180/Math.PI) * Math.acos(dotProduct/(d1*d2));

        prevWorldSpaceMousePoint.cross(worldSpaceMousePoint);

        if(prevWorldSpaceMousePoint.equals(new THREE.Vector3(0,0,0))){
            theta = 0;
        }
        
        let a = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(prevWorldSpaceMousePoint.normalize(),-Math.abs(theta)));
        let cam_mat_prev = camera.matrix.clone();
        cam_mat_prev.premultiply(a); // 여기서 premultiply가 들어가는 것은, 이동한 다음에, rotation이 되어야 하기 때문.
        camera.matrix.copy(cam_mat_prev);
    }
    prevScreenSpaceMousePoint = tempScreenSpaceMousePoint.clone();
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
}

