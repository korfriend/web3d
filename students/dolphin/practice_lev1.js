// https://webdoli.tistory.com/53
// https://jsfiddle.net/MadLittleMods/n6u6asza/

/*
다른 폴더에 있는 모듈을 import 하는 방법 
import sys 
sys.path.insert(0, 'D:\바탕 화면\SW\web3d\js')
*/

import * as THREE from "./js/three.module.js";
import { OrbitControls } from "./js/OrbitControls.js";
import { GUI } from './js/dat.gui.module.js';


// https://threejsfundamentals.org/threejs/lessons/kr/threejs-fundamentals.html
const render_w = window.innerWidth;                                                 // window.innerWidth : browser window 창의 넓이
const render_h = window.innerHeight;

console.log(render_w, render_h);
console.log("aspectRatio: " + render_w/render_h);                                   // 화면비, 가로/세로 
console.log("devicePixelRatio: " + window.devicePixelRatio);                        // devicePixelRatio : 장치의 물리적 px과 CSS px의 비율값 반환 

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, render_w/render_h, 0.1, 100);       // fov, aspect, near, far 
const renderer = new THREE.WebGLRenderer();
//const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(render_w, render_h);

const controls = new OrbitControls(camera, renderer.domElement);                    // camera가 target 주위를 공전, 제어할 카메라 객체, domElement 이벤트 리스터에 사용되는 HTML element

const geometry = new THREE.BoxGeometry(1, 1, 1);                                    // width, height, depth
const texture = new THREE.TextureLoader().load( './teximg.jpg' );
const material = new THREE.MeshPhongMaterial( {color:0xFFFFFF, map:texture} );
const cube = new THREE.Mesh(geometry, material);
cube.matrixAutoUpdate = false;                                                      // 위치의 matrix를 계산하고 매 프레임마다 확대/축소하고 matrixWorld property를 자동 재계산한다 
                                                                                    // object가 정적이거나, 매뉴얼 업데이트를 원한다면 false로 설정하여 더 나은 퍼포먼스를 얻을 수 있다고 함 
const light = new THREE.DirectionalLight(0xFFFFFF, 1);                              // 직사광, 주로 태양을 표현할 때 사용 
let light_helper;
let mode_movement = "none";


dom_init();
scene_init();
SetOrbitControls(true);


function dom_init() {
    const container = document.getElementById('render_div');
    container.appendChild(renderer.domElement);
    container.addEventListener("mousedown", mouseDownHandler, false);               // 마우스 클릭, 떼기 전까지 
    container.addEventListener("mousemove", mouseMoveHandler, false);               // 마우스가 움직였을 때 
    container.addEventListener("mouseup", mouseUpHandler, false);
    container.addEventListener("wheel", mouseWheel, false);                         // false >> bubbling 방식, 자식노드부터 이벤트가 발생하여 부모로 이벤트 전파
    container.addEventListener('contextmenu', function (e) { 
        e.preventDefault();                                                         // preventDefault : 현재 이벤트의 기본 동작을 중단한다
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
    scene.add(cube);
    scene.add(new THREE.AxesHelper(2));

    light.position.set(-2, 2, 2);
    light.target = cube;
    scene.add(light);
    scene.add( new THREE.AmbientLight( 0x222222 ) );

    light_helper = new THREE.DirectionalLightHelper(light, 0.3);                    // light(the light to be visualized), size(dimensions of the plan)
    scene.add( light_helper );

    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 1, 0);

    //controls.target.set( 0, 0, 0 ); 
}

function SetOrbitControls(enable_orbitctr){
    controls.enabled = false //enable_orbitctr;     // rotating
    controls.enablePan = false;             // panning
    controls.enableZoom = true;             // zooming
    controls.enableDamping = false;
    controls.dampingFactor = 0.05;

    controls.update(); // camera 변환설정을 수동으로 변경한 후에 호출 
}

/*
render_animation();
function render_animation(){
    window.requestAnimationFrame(render_animation);
    controls.update();
    renderer.render(scene, camera);
}
*/

// I strongly recommend you guys to read "Lambda function/code" articles
renderer.setAnimationLoop( ()=>{ // every available frame
    //controls.update();
    cube.matrixAutoUpdate = true;
    renderer.render( scene, camera );
} );


var isRotating, isPanning;
var previousMousePosition = {
    x: 0,
    y: 0
}
var deltaMove = {
    x: 0,
    y: 0
}

function mouseDownHandler(e) {
    // Gecko (Firefox), WebKit (Safari/Chrome) & Opera -> which, IE, Opera -> button
    if (e.which==1 || e.button ==0)  
        isRotating = true;
    if (e.which==3 || e.button ==2)
        isPanning = true;
    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
}

// 마우스 클릭 지점  offset -> 옮긴 지점까지의 거리만큼 rotation
// 마우스 처음 클릭 지점 -> 마우스 뗄때까지 옮긴 지점까지의 거리만큼 camera 이동,panning 
// rotation시 한계지점을 정해줘야 하나?봄
function mouseMoveHandler(e) {
    deltaMove = {
        x: e.offsetX-previousMousePosition.x,
        y: e.offsetY-previousMousePosition.y
    };

    if(isRotating) {
        var deltaRotaionQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(
            deltaMove.y * 0.01 * (Math.PI/180),
            deltaMove.x * 0.01 * (Math.PI/180),
            0,
            'XYZ'
        ));
        cube.quaternion.multiplyQuaternions(deltaRotaionQuaternion, cube.quaternion);}

    else if(isPanning) {
        camera.position.x -= 0.01 * (deltaMove/render_w);
        camera.position.y += 0.01 * (deltaMove/render_w);
        camera.updateProjectionMatrix();
    }
}

function mouseUpHandler(e) {
    isRotating = false;
    isPanning = false;
}

function mouseWheel(e) {
    const d = camera.position.distanceTo( new THREE.Vector3());
    if(e.wheelDelta>0) {
        const newD = d - 0.15;  
        camera.position.x *= ( newD / d);
        camera.position.y *= ( newD / d);
        camera.position.z *= ( newD / d);}
    else if (e.wheelDelta<0) {
        const newD = d + 0.15;
        camera.position.x *= ( newD / d);
        camera.position.y *= ( newD / d);
        camera.position.z *= ( newD / d);}
    //camera.position.z += event.deltaY / 1000;
    // prevent scrolling beyond a min/max value
    //camera.position.clampScalar(0, 10);
}   
