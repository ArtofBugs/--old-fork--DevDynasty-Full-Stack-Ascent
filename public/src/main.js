import * as THREE from 'three'
import { LoadGLTFByPath } from './Helpers/ModelHelper.js'

//Renderer does the job of rendering the graphics
let renderer = new THREE.WebGLRenderer({

	//Defines the canvas component in the DOM that will be used
	canvas: document.querySelector('#background'),
  antialias: true,
});

// refer to: https://youtu.be/r4bepZ2PEUw?si=Xo4HgSrk7DkqZpu_
window.addEventListener('resize', function(){
	var width = window.innerWidth;
	var height = window.innerHeight;
	renderer.setSize(width, height);
	camera.aspect = width/height;
	camera.updateProjectionMatrix();
})

renderer.setSize(window.innerWidth, window.innerHeight);

//set up the renderer with the default settings for threejs.org/editor - revision r153
renderer.shadows = true;
renderer.shadowType = 1;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio( window.devicePixelRatio );
renderer.toneMapping = 0;
renderer.toneMappingExposure = 1
renderer.useLegacyLights  = false;
renderer.toneMapping = THREE.NoToneMapping;
renderer.setClearColor(0xffffff, 0);
//make sure three/build/three.module.js is over r152 or this feature is not available. 
renderer.outputColorSpace = THREE.SRGBColorSpace 

const scene = new THREE.Scene();

let cameraList = [];

let camera;

let mixer;

let clickedIsTrue;

// camera movement - https://youtu.be/bfqlPHI3TzE?si=3ufLoN5lCDsp5KVn
let mouseX = 0;
let mouseY = 0;

const minX = -1.25;
const maxX = 1;

const minY = 0.8;
const maxY = 1.3;

const originalLookAt = new THREE.Vector3(0, 0, -1);
const targetLookAt = new THREE.Vector3(0, 0, 0);

document.addEventListener('mousemove', function(e){
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;
  mouseX = (e.clientX - windowHalfX) / 100;
  mouseY = (e.clientY - windowHalfY) / 100; 

  // Update the target lookAt position based on mouse movement
  targetLookAt.x = mouseX;
  targetLookAt.y = -mouseY;
})

document.addEventListener('click', function(){
  clickedIsTrue = true;
})

// Load the GLTF model
LoadGLTFByPath(scene)
  .then((loadedMixer) => {
    mixer = loadedMixer;
    retrieveListOfCameras(scene);
  })
  .catch((error) => {
    console.error('Error loading JSON scene:', error);
  });

//retrieve list of all cameras
function retrieveListOfCameras(scene){
  // Get a list of all cameras in the scene
  scene.traverse(function (object) {
    if (object.isCamera) {
      cameraList.push(object);
    }
  });

  //Set the camera to the first value in the list of cameras
  camera = cameraList[0];

  updateCameraAspect(camera);

  // Start the animation loop after the model and cameras are loaded
  animate();
}

// Set the camera aspect ratio to match the browser window dimensions
function updateCameraAspect(camera) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

const clock = new THREE.Clock();

//A method to be run each time a frame is generated
function animate() {
  requestAnimationFrame(animate);

  if(mixer){
    mixer.update(clock.getDelta());
  }
  
  if(clock.elapsedTime >= 3.5){
    // Update the camera position based on mouse movement
    camera.position.x += (mouseX - camera.position.x) * 0.001;
    camera.position.y += (-mouseY - camera.position.y) * 0.001;

    // Clamp the camera position
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, minX, maxX);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, minY, maxY);

    // Update the target position based on the camera's new position
    targetLookAt.x = camera.position.x;
    targetLookAt.y = camera.position.y;

    const blendedLookAt = originalLookAt.clone().lerp(targetLookAt.clone().normalize(), 0.1);
    camera.lookAt(blendedLookAt);
    
  }

  renderer.render(scene, camera);
};