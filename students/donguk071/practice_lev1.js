import * as THREE from "../../js/three.module.js";
import { OrbitControls } from "../../js/OrbitControls.js";
import { GUI } from '../../js/dat.gui.module.js';

const render_w = window.innerWidth;
const render_h = window.innerHeight;

console.log(render_w, render_h);
console.log("aspectRatio: " + render_w/render_h);
console.log("devicePixelRatio: " + window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, render_w/render_h, 0.1, 100);
const renderer = new THREE.WebGLRenderer();
//const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(render_w, render_h);

const controls = new OrbitControls(camera, renderer.domElement);//카메라가 움직이기 가능해짐
//큐브생성
const geomery = new THREE.BoxGeometry(1, 1, 1);
const texture = new THREE.TextureLoader().load( './teximg.jpg' );
const material = new THREE.MeshPhongMaterial( {color:0xFFFFFF, map:texture} );
const cube = new THREE.Mesh(geomery, material);
cube.matrixAutoUpdate = false;

const light = new THREE.DirectionalLight(0xFFFFFF, 1);
let light_helper;
let mode_movement = "none";

dom_init();
scene_init();
SetOrbitControls(true);

function dom_init() {
    const container = document.getElementById('render_div');
    container.appendChild(renderer.domElement);
    container.addEventListener("mousedown", mouseDownHandler, false);
    container.addEventListener("mousemove", mouseMoveHandler, false);
    container.addEventListener("wheel", mouseWheel, false);
    container.addEventListener('contextmenu', function (e) { 
        e.preventDefault(); 
    }, false); //여기 분석 여러 리스너 추가하는 파트인듯

    window.addEventListener( 'resize', onWindowResize );

    function onWindowResize() {
        var render_w = window.innerWidth; // 내가 변수 선언해준거임
        var render_h = window.innerHeight;
        camera.aspect = render_w/render_h;
        camera.updateProjectionMatrix(); //여기도 분석

        renderer.setSize( render_w, render_h );
    } // 사이즈 조절이라 크게는 신경 안써도 될듯?
}

function scene_init() {
    scene.add(cube);
    scene.add(new THREE.AxesHelper(2));

    light.position.set(-2, 2, 2);
    light.target = cube;
    scene.add(light);
    scene.add( new THREE.AmbientLight( 0x222222 ) );

    light_helper = new THREE.DirectionalLightHelper(light, 0.3);
    scene.add( light_helper );

    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 1, 0); //기본 카메라 세팅같은데 건드릴 필요있을까

    controls.target.set( 0, 0, 0 );
}//삽입해주는 부분

function SetOrbitControls(enable_orbitctr){
    controls.enabled = enable_orbitctr;//사용자가 입력 받을지 말지
    controls.enablePan = true; //카매라 패닝의 활성화 또는 비활성화를 설정합니다. 기본값은 true 입니다.
    controls.enableZoom = true; //카메라 확대 / 축소 (dollying)를 활성화 또는 비활성화를 설정합니다.
    controls.enableDamping = true; //부드럽게 관성
    controls.dampingFactor = 0.05; //위가 true일 경우 애니메이션루프에서 .update호출 필요
    controls.update();
} //카메라가 대상 주변 회전가능
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
    controls.update();
    renderer.render( scene, camera );
} );
/**/
function mouseDownHandler(e) {
}

function mouseMoveHandler(e) {
}

function mouseWheel(e) {
}