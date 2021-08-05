
import * as THREE from "../../js/three.module.js";
import { OrbitControls } from "../../js/OrbitControls.js";
import { GUI } from '../../js/dat.gui.module.js';


// https://threejsfundamentals.org/threejs/lessons/kr/threejs-fundamentals.html
const render_w = window.innerWidth;                                                
const render_h = window.innerHeight;

console.log(render_w, render_h);
console.log("aspectRatio: " + render_w/render_h);                                  
console.log("devicePixelRatio: " + window.devicePixelRatio);                       

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, render_w/render_h, 0.1, 100);       // fov, aspect, near, far 
const renderer = new THREE.WebGLRenderer();
//const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(render_w, render_h);

//const controls = new OrbitControls(camera, renderer.domElement);                  
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
        camera.updateProjectionMatrix(); 

        renderer.setSize( render_w, render_h );
    } // 사이즈 조절이라 크게는 신경 안써도 될듯?
}

function scene_init() {
    scene.add(cube);
    scene.add(new THREE.AxesHelper(2));
    //scene.add(camera);
    // camera는 굳이 scene에 포함하지 않아도 된다 

    light.position.set(-2, 2, 2);
    light.target = cube;
    scene.add(light);
    scene.add( new THREE.AmbientLight( 0x222222 ) );

    light_helper = new THREE.DirectionalLightHelper(light, 0.3);                    // light(the light to be visualized), size(dimensions of the plan)
    scene.add( light_helper );

    camera.matrixAutoUpdate = false;
    //camera.position.set(0, 0, 3);
    //camera.lookAt(0, 0, 0);
    //camera.up.set(0, 1, 0);
    //console.log(camera.matrix);
    
    let a = new THREE.Matrix4().makeTranslation(0, 0, 5);
    // let b = new THREE.Matrix4().lookAt(
    //     new THREE.Vector3(5, 5, 5), 
    //     new THREE.Vector3(0, 0, 0),
    //     new THREE.Vector3(0, 1, 0)
    // );
    
    // viewing matrix (or viewing transform)
    camera.matrixWorldNeedsUpdate = true;
    camera.matrix.copy(a);
    console.log(camera.matrix);
    
    //controls.target.set( 0, 0, 0 ); 
}


renderer.setAnimationLoop( ()=>{ // every available frame
    //controls.update();
    //cube.matrixAutoUpdate = true;
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
        rightButtonClick = true;
    }
}

function mouseUpHandler(e) {
    rightButtonClick = false;
    leftButtonClick = false;
}

function mouseMoveHandler(e) {
    camera.matrixAutoUpdate = false;
    camera.matrixWorldNeedsUpdate = true;
    if(rightButtonClick){
        let tran = new THREE.Matrix4().makeTranslation((e.offsetX-rightButtonMousePosX)*-0.01,(e.offsetY-rightButtonMousePosY)*0.01,0); 
        camera.matrix.multiply(tran);
        }
    if(leftButtonClick){
      //rotation 후 translation 후 곱해주기
      var x = e.offsetX-rightButtonMousePosX; 
      var y = e.offsetY-rightButtonMousePosY; 

      let aa = new THREE.Matrix4();
      let R1 = new THREE.Matrix4().makeRotationY(-0.002*x);
      let R2 = new THREE.Matrix4().makeRotationX(-0.002*y);
      
      aa.multiply(R1).multiply(R2);
    
      camera.applyMatrix4(aa);

      //let T1 = new THREE.Matrix4().makeTranslation();
      //let RT11 = new THREE.Matrix4().multiplyMatrices(R1,T1);
    }  
    rightButtonMousePosX = e.offsetX;
    rightButtonMousePosY = e.offsetY;

}


function mouseWheel(e) {
    camera.matrixAutoUpdate = false;
    camera.matrixWorldNeedsUpdate = true;

    let cam_view = new THREE.Vector3(0, 0, -1); // in the camera space, -z is the viewing direction
    
    cam_view.transformDirection(camera.matrix); // vector3의 메소드 로컬공간을 월드공간으로
    console.log(cam_view);

    let view_move = cam_view.clone();

    let mat_viewingTrans = new THREE.Matrix4();
    if(e.deltaY > 0) {
        view_move.multiplyScalar(-0.1);
    }
    else {
        view_move.multiplyScalar(0.1);
    }
    console.log(view_move);
    mat_viewingTrans.makeTranslation(view_move.x, view_move.y, view_move.z);
    console.log(mat_viewingTrans);

    let cam_mat_prev = camera.matrix.clone();
    // cam_mat_prev = mat_viewingTrans * cam_mat_prev 으로 하면 사라져서 copy써준다
    cam_mat_prev.premultiply(mat_viewingTrans);

    camera.matrix.copy(cam_mat_prev);
    console.log(camera.matrix);
}   