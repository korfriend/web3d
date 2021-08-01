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

//const controls = new OrbitControls(camera, renderer.domElement);//카메라가 움직이기 가능해짐
//큐브생성
const geomery = new THREE.BoxGeometry(1, 1, 1);
const texture = new THREE.TextureLoader().load( './teximg.jpg' );
const material = new THREE.MeshPhongMaterial( {color:0xFFFFFF, map:texture} );
const cube = new THREE.Mesh(geomery, material);
cube.matrixAutoUpdate = false; //큐브 조작 방지

const light = new THREE.DirectionalLight(0xFFFFFF, 1);
let light_helper;
let mode_movement = "none";

///추가부분
const NewObj = new THREE.Object3D();
///

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
    }, false); //여기 분석 여러 리스너 추가하는 파트

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

    NewObj.add(scene); //신그래프에 개념이용 새로운 좌표계에 담아주기

    scene.add(cube);
    scene.add(new THREE.AxesHelper(2));

    light.position.set(-2, 2, 2);
    light.target = cube;
    scene.add(light);
    scene.add( new THREE.AmbientLight( 0x222222 ) ); //광원이 이상하길래 큰거에 설정해줬다
    light_helper = new THREE.DirectionalLightHelper(light, 0.3);
    scene.add( light_helper );

    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 1, 0); //기본 카메라 세팅같은데 건드릴 필요있을까

    //controls.target.set( 0, 0, 0 );
}//삽입해주는 부분

renderer.setAnimationLoop( ()=>{
    //controls.update();
    renderer.render( scene, camera );
} );


let rightButtonClick = false;
let leftButtonClick = false;
let rightButtonMousePosX = 0;
let rightButtonMousePosY = 0;


function mouseDownHandler(e) {

    if(e.button === 0) { 
        leftButtonClick = true; 
    }
    else if (e.button === 2) { 
        console.log("r");
        rightButtonClick = true;
    }
}

function mouseUpHandler(e) {
    rightButtonClick = false;
    leftButtonClick = false;
}

function mouseMoveHandler(e) {
    if(rightButtonClick){
        //camera.position.x -= 5*(e.offsetX - rightButtonMousePosX)/ render_w ; // 화면 크기에 따른 이동량 변화
        //camera.position.y += 5*(e.offsetY - rightButtonMousePosY)/ render_w ;
        //camera.updateProjectionMatrix();
        scene.translateX(5*(e.offsetX - rightButtonMousePosX)/ render_w);
        scene.translateY(-5*(e.offsetY - rightButtonMousePosY)/ render_w);
        //scene과 NewObj의 상하관계가 이상해서 이런거같음
    }
    if(leftButtonClick){
        var x = 3*2*2*(e.offsetX - rightButtonMousePosX)/render_w;
        var y = 3*2*2*(e.offsetY - rightButtonMousePosY)/render_h;
        //2*(e.offsetX - rightButtonMousePosX)/render_w 이게 1px씩 움직인다
        //const transform  = new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, 'YXZ'));
        scene.quaternion.multiplyQuaternions(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),x),scene.quaternion);
        scene.quaternion.multiplyQuaternions(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),y),scene.quaternion);
    }  
    rightButtonMousePosX = e.offsetX;
    rightButtonMousePosY = e.offsetY;

}

function mouseWheel(e) {

    if(e.wheelDelta > 0){
        console.log(camera.zoom);
        camera.zoom =camera.zoom + 0.1;
        camera.updateProjectionMatrix();
    }
    if(e.wheelDelta < 0){
        camera.zoom =camera.zoom - 0.1;
        console.log(camera.zoom);
        camera.updateProjectionMatrix();
    } 
}




// function mouseDownHandler(e) {
    
// //     var div = document.getElementById('render_div');
// //     div.addEventListener('mousedown', function(e) {
// // 		var isRightButton;
// //         e = e || window.event;
// //         if ("which" in e){
// //             isRightButton = e.which == 3; 
// //             console.log("Right mouse button clicked!");   
// //         }  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
// //         else{
// //             console.log("Left mouse button clicked!");       
// //         }
// // });

// // div.addEventListener('contextmenu', function(e) {
// // 	var x = e.clientX;
// //     var y = e.clientY;
// //     console.log(x+" "+y);
// //     mouseMoveHandler();
// // });
// }