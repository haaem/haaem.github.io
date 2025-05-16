import * as THREE from 'three';  
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();

// Camera를 perspective와 orthographic 두 가지로 switching 해야 해서 const가 아닌 let으로 선언
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 0;
camera.position.y = 30;
camera.position.z = 120;
camera.lookAt(scene.position);
scene.add(camera);

const textureLoader = new THREE.TextureLoader();

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(new THREE.Color(0x000000));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const stats = new Stats();
document.body.appendChild(stats.dom);

// Camera가 바뀔 때 orbitControls도 바뀌어야 해서 let으로 선언
let orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

// sun
const sunGeometry = new THREE.SphereGeometry(10);
const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.x = 0;
sun.position.y = 0;
sun.position.z = 0;
scene.add(sun);

// mercury
const mercuryPivot = new THREE.Object3D();
scene.add(mercuryPivot);

const mercuryGeometry = new THREE.SphereGeometry(1.5);
const mercuryTexture = textureLoader.load('Mercury.jpg');
const mercuryMaterial = new THREE.MeshStandardMaterial({
    color: 0xa6a6a6,
    map: mercuryTexture,
    roughness: 0.8,
    metalness: 0.2
});
const mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
mercury.position.set(20, 0, 0);
mercury.rotationSpeed = 0.02;
mercury.orbitSpeed = 0.02;
mercuryPivot.add(mercury);

// venus
const venusPivot = new THREE.Object3D();
scene.add(venusPivot);

const venusGeometry = new THREE.SphereGeometry(3);
const venusTexture = textureLoader.load('Venus.jpg');
const venusMaterial = new THREE.MeshStandardMaterial({
    color: 0xe39e1c,
    map: venusTexture,
    roughness: 0.8,
    metalness: 0.2
});
const venus = new THREE.Mesh(venusGeometry, venusMaterial);
venus.position.set(35, 0, 0);
venus.rotationSpeed = 0.015;
venus.orbitSpeed = 0.015;
venusPivot.add(venus);

// earth
const earthPivot = new THREE.Object3D();
scene.add(earthPivot);

const earthGeometry = new THREE.SphereGeometry(3.5);
const earthTexture = textureLoader.load('Earth.jpg');
const earthMaterial = new THREE.MeshStandardMaterial({
    color: 0x3498db,
    map: earthTexture,
    roughness: 0.8,
    metalness: 0.2
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.position.set(50, 0, 0);
earth.rotationSpeed = 0.01;
earth.orbitSpeed = 0.01;
earthPivot.add(earth);

// mars
const marsPivot = new THREE.Object3D();
scene.add(marsPivot);

const marsGeometry = new THREE.SphereGeometry(2.5);
const marsTexture = textureLoader.load('Mars.jpg');
const marsMaterial = new THREE.MeshStandardMaterial({
    color: 0xc0392b,
    map: marsTexture,
    roughness: 0.8,
    metalness: 0.2
});
const mars = new THREE.Mesh(marsGeometry, marsMaterial);
mars.position.set(65, 0, 0);
mars.rotationSpeed = 0.008
mars.orbitSpeed = 0.008
marsPivot.add(mars);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(10, 10, 50);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

let step = 0;

// GUI
const gui = new GUI();
const controls = new function () {
    this.perspective = "Perspective";
    this.switchCamera = function () {
        if (camera instanceof THREE.PerspectiveCamera) {
            scene.remove(camera);
            camera = null; // 기존의 camera 제거    
            // OrthographicCamera(left, right, top, bottom, near, far)
            camera = new THREE.OrthographicCamera(window.innerWidth / -16, 
                window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -200, 500);
            camera.position.x = 120;
            camera.position.y = 60;
            camera.position.z = 180;
            camera.lookAt(scene.position);
            orbitControls.dispose(); // 기존의 orbitControls 제거
            orbitControls = null;
            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.enableDamping = true;
            this.perspective = "Orthographic";
        } else {
            scene.remove(camera);
            camera = null; 
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.x = 120;
            camera.position.y = 60;
            camera.position.z = 180;
            camera.lookAt(scene.position);
            orbitControls.dispose(); // 기존의 orbitControls 제거
            orbitControls = null;
            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.enableDamping = true;
            this.perspective = "Perspective";
        }
    };
    this.mercuryRotationSpeed = 0.02;
    this.mercuryOrbitSpeed = 0.02;
    this.venusRotationSpeed = 0.015;
    this.venusOrbitSpeed = 0.015;
    this.earthRotationSpeed = 0.01;
    this.earthOrbitSpeed = 0.01;
    this.marsRotationSpeed = 0.008;
    this.marsOrbitSpeed = 0.008;
};

const guiCamera = gui.addFolder('Camera');
guiCamera.add(controls, 'switchCamera').name('Switch Camera Type');
guiCamera.add(controls, 'perspective').name('Current Camera').listen();

const guiMercury = gui.addFolder('Mercury');
guiMercury.add(controls, 'mercuryRotationSpeed', 0, 0.1, 0.001)
  .name('Rotation Speed')
  .onChange(value => mercury.rotationSpeed = value);
guiMercury.add(controls, 'mercuryOrbitSpeed', 0, 0.1, 0.001)
  .name('Orbit Speed')
  .onChange(value => mercury.orbitSpeed = value);

const guiVenus = gui.addFolder('Venus');
guiVenus.add(controls, 'venusRotationSpeed', 0, 0.1, 0.001)
  .name('Rotation Speed')
  .onChange(value => venus.rotationSpeed = value);
guiVenus.add(controls, 'venusOrbitSpeed', 0, 0.1, 0.001)
  .name('Orbit Speed')
  .onChange(value => venus.orbitSpeed = value);

const guiEarth = gui.addFolder('Earth');
guiEarth.add(controls, 'earthRotationSpeed', 0, 0.1, 0.001)
  .name('Rotation Speed')
  .onChange(value => earth.rotationSpeed = value);
guiEarth.add(controls, 'earthOrbitSpeed', 0, 0.1, 0.001)
  .name('Orbit Speed')
  .onChange(value => earth.orbitSpeed = value);

const guiMars = gui.addFolder('Mars');
guiMars.add(controls, 'marsRotationSpeed', 0, 0.1, 0.001)
  .name('Rotation Speed')
  .onChange(value => mars.rotationSpeed = value);
guiMars.add(controls, 'marsOrbitSpeed', 0, 0.1, 0.001)
  .name('Orbit Speed')
  .onChange(value => mars.orbitSpeed = value);

const clock = new THREE.Clock();

render();

function render() {
    orbitControls.update();
    stats.update();

    mercury.rotation.y += mercury.rotationSpeed;
    mercuryPivot.rotation.y += mercury.orbitSpeed;

    venus.rotation.y += venus.rotationSpeed;
    venusPivot.rotation.y += venus.orbitSpeed;

    earth.rotation.y += earth.rotationSpeed;
    earthPivot.rotation.y += earth.orbitSpeed;

    mars.rotation.y += mars.rotationSpeed;
    marsPivot.rotation.y += mars.orbitSpeed;

    // render using requestAnimationFrame
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

// listen to the resize events
window.addEventListener('resize', onResize, false);
function onResize() {  // resize handler
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
