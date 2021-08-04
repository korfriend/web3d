import * as THREE from "./js/three.module.js";
import { OrbitControls } from "./js/OrbitControls.js";
import { GUI } from './js/dat.gui.module.js';

// https://threejsfundamentals.org/threejs/lessons/kr/threejs-fundamentals.html
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

//const controls = new OrbitControls(camera, renderer.domElement);

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
//SetOrbitControls(true);
//SetOrbitControls(false);
//camera.matrixAutoUpdate = false;

function dom_init() {
    const container = document.getElementById('render_div');
    container.appendChild(renderer.domElement);
    container.addEventListener("mousedown", mouseDownHandler, false);
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
    scene.add(cube);
    scene.add(new THREE.AxesHelper(2));
    //scene.add(camera);

    light.position.set(-2, 2, 2);
    light.target = cube;
    scene.add(light);
    scene.add( new THREE.AmbientLight( 0x222222 ) );

    light_helper = new THREE.DirectionalLightHelper(light, 0.3);
    scene.add( light_helper );

    camera.matrixAutoUpdate = false;
    //camera.position.set(0, 0, 3);
    //camera.lookAt(0, 0, 0);
    //camera.up.set(0, 1, 0);

    let a = new THREE.Matrix4().makeTranslation(0, 0, 3);
    let b = new THREE.Matrix4().lookAt(
        new THREE.Vector3(5, 5, 5),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0)
    );

    // viewing matrix (or viewing transform)
    camera.matrix.copy(a);// = new THREE.Matrix4().multiplyMatrices(a, b);
    console.log(camera.matrix);

    //controls.target.set( 0, 0, 0 );
}

function SetOrbitControls(enable_orbitctr){
    controls.enabled = enable_orbitctr;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.update();
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
renderer.setAnimationLoop( ()=>{
    //controls.update();
    renderer.render( scene, camera );
} );
/**/
function mouseDownHandler(e) {
}

function mouseMoveHandler(e) {
}

function mouseWheel(e) {
    camera.matrixAutoUpdate = false;
    let cam_view = new THREE.Vector3(0, 0, -1); // in the camera space, -z is the viewing direction
    cam_view.transformDirection(camera.matrix); // refer to THREE.js doc
    console.log(cam_view);

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
    console.log(view_move);
    mat_viewingTrans.makeTranslation(view_move.x, view_move.y, view_move.z);
    console.log(mat_viewingTrans);

    let cam_mat_prev = camera.matrix.clone();
    // cam_mat_prev = mat_viewingTrans * cam_mat_prev
    cam_mat_prev.premultiply(mat_viewingTrans);
    // camera.matrix = cam_mat_prev
    camera.matrix.copy(cam_mat_prev);
}