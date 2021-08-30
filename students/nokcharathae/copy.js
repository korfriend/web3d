import * as THREE from "/js/three.module.js";
import {OrbitControls} from "/js/OrbitControls.js";
import {GUI} from '/js/dat.gui.module.js';


// https://threejsfundamentals.org/threejs/lessons/kr/threejs-fundamentals.html
const render_w = window.innerWidth;
const render_h = window.innerHeight;

console.log(render_w, render_h);
console.log("aspectRatio: " + render_w / render_h);
console.log("devicePixelRatio: " + window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, render_w / render_h, 0.1, 100);
const renderer = new THREE.WebGLRenderer();
//const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(render_w, render_h);

//const controls = new OrbitControls(camera, renderer.domElement);

const geomery = new THREE.BoxGeometry(1, 1, 1);
const texture = new THREE.TextureLoader().load('./teximg.jpg');
const material = new THREE.MeshPhongMaterial({
    color: 0xFFFFFF,
    map: texture
});
const cube = new THREE.Mesh(geomery, material);
cube.matrixAutoUpdate = false;

const light = new THREE.DirectionalLight(0xFFFFFF, 1);
let light_helper;
let mode_movement = "none"; //what?

let leftdown = false;
let rightdown = false;

let previousMousePosition = {
    x: 0,
    y: 0
};



dom_init();
scene_init();
//SetOrbitControls(true);

function dom_init() {
    const container = document.getElementById('render_div');
    container.appendChild(renderer.domElement);
    container.addEventListener("mousedown", mouseDownHandler, false);
    container.addEventListener("mousemove", mouseMoveHandler, false);
    document.addEventListener('mouseup', mouseUpHandler, false);
    container.addEventListener("wheel", mouseWheel, false);
    container.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, false);

    window.addEventListener('resize', onWindowResize);

    function onWindowResize() {
        render_w = window.innerWidth;
        render_h = window.innerHeight;
        camera.aspect = render_w / render_h;
        camera.updateProjectionMatrix();

        renderer.setSize(render_w, render_h);
    }
}

function scene_init() {

    scene.add(cube);
    scene.add(new THREE.AxesHelper(2));
    

    light.position.set(-2, 2, 2);
    light.target = cube;
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x222222));

    light_helper = new THREE.DirectionalLightHelper(light, 0.3);
    scene.add(light_helper);

    camera.matrixAutoUpdate = false;
    // camera.position.set(0, 0, 5);
    // camera.lookAt(0, 0, 0);
    // camera.up.set(0, 1, 0);

    let a = new THREE.Matrix4().makeTranslation(0, 0, 5);
    let b = new THREE.Matrix4().lookAt(
        new THREE.Vector3(0, 0, 5),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0)
    );

    let mat_cam = new THREE.Matrix4().multiplyMatrices(a, b);
    camera.matrixWorldNeedsUpdate = true;
    camera.matrix.copy(mat_cam);
    // viewing matrix (or viewing transform)
    // camera.matrix.copy(a);// = new THREE.Matrix4().multiplyMatrices(a, b);
    //console.log(camera.matrix);

    //controls.target.set( 0, 0, 0 );
}

// function SetOrbitControls(enable_orbitctr){
//     controls.enabled = enable_orbitctr;
//     controls.enablePan = true;
//     controls.enableZoom = true;
//     controls.enableDamping = true;
//     controls.dampingFactor = 0.05;
//     controls.update();
// }
/*
render_animation();
function render_animation(){
    window.requestAnimationFrame(render_animation);
    controls.update();
    renderer.render(scene, camera);
}
/**/
// I strongly recommend you guys to read "Lambda function/code" articles

renderer.setAnimationLoop(() => {
    //controls.update();
    renderer.render(scene, camera);
});
/**/

function mouseDownHandler(e) {
    if (e.which == 3) {
        rightdown = true;
    } else if (e.which == 1) {
        leftdown = true;
    }
}
let prevPS = new THREE.Vector3(); // We need this reference even the mouseMoveHandler() is finished.

function mouseMoveHandler(e) {
    camera.matrixAutoUpdate = false;
    camera.matrixWorldNeedsUpdate = true;
    let mat_viewingTrans = new THREE.Matrix4();

   //console.log(camera.localToWorld(new THREE.Vector3(0,0,0)));
  
   let PS = new THREE.Vector3( ( e.offsetX /render_w ) * 2 - 1,
        -( e.offsetY / render_h ) * 2 + 1, -1);

    let tempPS = PS.clone();

    let WS = PS.unproject(camera).clone();
    let prevWS = prevPS.unproject(camera).clone();   

    let V1 = WS.sub(camera.getWorldPosition(new THREE.Vector3(0,0,0)));
    let V2 = prevWS.sub(camera.getWorldPosition(new THREE.Vector3(0,0,0)));

    if (leftdown == true) {
 
        let myAxis = new THREE.Vector3().crossVectors(WS,prevWS)
        let theta = -Math.acos(WS.dot(prevWS)/(V1.length()*V2.length()));
        mat_viewingTrans.makeRotationAxis(myAxis.normalize(),  theta);
    }

    else if (rightdown == true) {
        let D_PS=camera.localToWorld(new THREE.Vector3(0,0,0)).distanceTo(PS);
        let D_WS=camera.localToWorld(new THREE.Vector3(0,0,0)).distanceTo(V1);
        let scale=D_WS/D_PS;
        let cameraMoveInWorld = WS.sub(prevWS);
        mat_viewingTrans.makeTranslation(-cameraMoveInWorld.x*scale, 
        -cameraMoveInWorld.y*scale,-cameraMoveInWorld.z*scale);
    }

    camera.matrix.premultiply(mat_viewingTrans);
    prevPS = tempPS.clone();
}

function mouseUpHandler(e) {
    leftdown = false;
    rightdown = false;
}

function mouseWheel(e) {
    camera.matrixAutoUpdate = false;
    camera.matrixWorldNeedsUpdate = true;
    let cam_view = new THREE.Vector3(0, 0, -1); // in the camera space, -z is the viewing direction
    cam_view.transformDirection(camera.matrix); // refer to THREE.js doc
    //console.log(cam_view);

    let view_move = cam_view.clone();

    let mat_viewingTrans = new THREE.Matrix4();
    if (e.deltaY > 0) {
        // wheel down
        view_move.multiplyScalar(-0.1);
    } else {
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