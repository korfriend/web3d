/*
Replace the camera controls provided by the OrbitControl module with your own control codes
- OrbitControl module을 대신하는 자신만의 control code를 작성하라 
Use the mouse event via JavaScript event callbacks (refer to the skeleton code)
- (skeleton code를 참고하여) JacaScript event callback 함수를 통해서 mouse event를 사용하라 -> 함수 내용을 채우면 되는건가? 
Camera translating along the viewing direction (zooming effect in the perspective mode), panning, rotating
- viewing direction, panning, rotating을 따라서 Camera를 변경하라 -> ???
*/

// https://webdoli.tistory.com/53


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

const controls = new OrbitControls(camera, renderer.domElement);                   // camera가 target 주위를 공전, 제어할 카메라 객체, domElement 이벤트 리스터에 사용되는 HTML element

const geometry = new THREE.BoxGeometry(1, 1, 1);                                     // width, height, depth
const texture = new THREE.TextureLoader().load( './sleepka01.jpg' );
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
    controls.enabled = false;                // rotating
    controls.enablePan = false;             // panning
    controls.enableZoom = true;             // zooming
    controls.enableDamping = false;
    controls.dampingFactor = 0.05;

    controls.update(); // camera 변환설정을 수동으로 변경한 후에 호출 
}


render_animation();
function render_animation(){
    window.requestAnimationFrame(render_animation);
    controls.update();
    renderer.render(scene, camera);
}


// I strongly recommend you guys to read "Lambda function/code" articles
renderer.setAnimationLoop( ()=>{ // every available frame
    //controls.update();
    renderer.render( scene, camera );
} );


/**/
function mouseDownHandler(e) {
    var isRotating, isPanning; //undefined
    var previousMousePosition = {
        x: 0,
        y: 0
    }
    // Gecko (Firefox), WebKit (Safari/Chrome) & Opera -> which, IE, Opera -> button
    if (e.which==1 || e.button ==0) 
        isRotating = true;
        //alert("Left mouse button was clicked!"+isRotating);             

    if (e.which==3 || e.button ==2)
        isPanning = true;
        //alert("Right mouse button was clicked!"+isPanning);          
       
    
}

function mouseMoveHandler(e) {
    var deltaMove = {
        x: e.offsetX-previousMousePosition.x,
        y: e.offsetY-previousMousePosition.y
    };
}

function mouseWheel(e) {
    //camera.position.z += event.deltaY / 1000;

    // prevent scrolling beyond a min/max value
    //camera.position.clampScalar(0, 10);
}