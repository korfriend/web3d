import * as THREE from "/js/three.module.js";
import { OrbitControls } from "/js/OrbitControls.js";
import { GUI } from '/js/dat.gui.module.js';

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
cube.matrixAutoUpdate = false; //why?

const light = new THREE.DirectionalLight(0xFFFFFF, 1);
let light_helper;
let mode_movement = "none"; //what?

let leftdown = false;
let rightdown =false;

var previousMousePosition = {
    x: 0,
    y: 0
};

var deltaMove = {
    x: 0,
    y: 0
};

const pivotPoint = new THREE.Object3D();


dom_init();
scene_init();
//SetOrbitControls(true);

function dom_init() {
    const container = document.getElementById('render_div');
    container.appendChild(renderer.domElement);
    container.addEventListener("mousedown", mouseDownHandler, false);
    container.addEventListener("mousemove", mouseMoveHandler, false);
    document.addEventListener( 'mouseup', mouseUpHandler, false );
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

    light.position.set(-2, 2, 2);
    light.target = cube;
    scene.add(light);
    scene.add( new THREE.AmbientLight( 0x222222 ) );

    light_helper = new THREE.DirectionalLightHelper(light, 0.3);
    scene.add( light_helper );

    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 1, 0);

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

renderer.setAnimationLoop( ()=>{
    //controls.update();
    cube.matrixAutoUpdate = true;
    renderer.render( scene, camera );
    
} );
/**/

function mouseDownHandler(e) {
    var isRightButton;
    e = e || window.event;

    if ("which" in e)  {
        isRightButton = e.which == 3; 
        leftdown = true;
        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };
        
    }
    
    else if ("button" in e) {
        isRightButton = e.button == 2; 
        rightdown=true;
    }
        
    //alert("Right mouse button " + (isRightButton ? "" : " was not ") + "clicked!");
}

function mouseMoveHandler(e) {
    
    if(leftdown==true) {
        console.log(leftdown);
        deltaMove = {
            x: e.offsetX-previousMousePosition.x,
            y: e.offsetY-previousMousePosition.y
        };
    var deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                deltaMove.y * 0.01* (Math.PI / 180),
                deltaMove.x * 0.01* (Math.PI / 180),
                0,
                'XYZ'
            ));
    console.log(deltaRotationQuaternion)
    cube.quaternion.multiplyQuaternions(deltaRotationQuaternion, cube.quaternion);
    
    }
    
}

function mouseUpHandler(e){
    leftdown = false;
    rightdown =false;
}


function mouseWheel(e) {
    if(e.wheelDelta>0)
        camera.position.z -=0.1;
    else if(e.wheelDelta<0)
        camera.position.z +=0.1;    
}