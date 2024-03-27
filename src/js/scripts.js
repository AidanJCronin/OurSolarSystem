import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import { planetDistances } from './constants.js';
import { sizeRelativeToSun } from './constants.js';
import { orbitSpeed } from './constants.js';
import { rotationalSpeed } from './constants.js';
import { saturnRingSize } from './constants.js';
import { uranusRingSize } from './constants.js';

import starsTexture from '../img/stars.jpg';
import sunTexture from '../img/sun.jpg';
import mercuryTexture from '../img/mercury.jpg';
import venusTexture from '../img/venus.jpg';
import earthTexture from '../img/earth.jpg';
import marsTexture from '../img/mars.jpg';
import jupiterTexture from '../img/jupiter.jpg';
import saturnTexture from '../img/saturn.jpg';
import saturnRingTexture from '../img/saturn ring.png';
import uranusTexture from '../img/uranus.jpg';
import uranusRingTexture from '../img/uranus ring.png';
import neptuneTexture from '../img/neptune.jpg';
import plutoTexture from '../img/pluto.jpg';

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
);

const orbit = new OrbitControls(camera, renderer.domElement);
//orbit.enablePan = false;

camera.position.set(-200, 140, 140);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture
]);

const textureLoader = new THREE.TextureLoader();

// Accurate sizeProp: 0.696, distanceProp: 149.6
const sizeProportion = 0.696;
const distanceProportion = 149.6;
const orbitSpeedVal = 0.00000001;
const rotationalSpeedVal = 0.0000001;

//const sunGeo = new THREE.SphereGeometry(sizeRelativeToSun.Sun * sizeProportion, 30, 30);
const sunGeo = new THREE.SphereGeometry(5, 40, 40);
const sunMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load(sunTexture)
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

function createPlanete(size, texture, position, ring) {
    const geo = new THREE.SphereGeometry(size, 40, 40);
    const mat = new THREE.MeshStandardMaterial({
        map: textureLoader.load(texture)
    });
    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.add(mesh);
    let ringMesh; // Declare ringMesh variable
    if(ring) {
        const ringGeo = new THREE.RingGeometry(
            ring.innerRadius,
            ring.outerRadius,
            32);
        const ringMat = new THREE.MeshBasicMaterial({
            map: textureLoader.load(ring.texture),
            side: THREE.DoubleSide
        });
        ringMesh = new THREE.Mesh(ringGeo, ringMat); // Assign ringMesh
        obj.add(ringMesh);
        ringMesh.position.x = position;
        ringMesh.rotation.x = -0.5 * Math.PI;
    }
    scene.add(obj);
    mesh.position.x = position;
    return { mesh, obj, ringMesh }; // Include ringMesh in the returned object
}

const mercury = createPlanete(sizeRelativeToSun.Mercury * sizeProportion, mercuryTexture, planetDistances.Mercury * distanceProportion);
const venus = createPlanete(sizeRelativeToSun.Venus * sizeProportion, venusTexture, planetDistances.Venus * distanceProportion);
const earth = createPlanete(sizeRelativeToSun.Earth * sizeProportion, earthTexture, planetDistances.Earth * distanceProportion);
const mars = createPlanete(sizeRelativeToSun.Mars * sizeProportion, marsTexture, planetDistances.Mars * distanceProportion);
const jupiter = createPlanete(sizeRelativeToSun.Jupiter * sizeProportion, jupiterTexture, planetDistances.Jupiter * distanceProportion);
const saturn = createPlanete(sizeRelativeToSun.Saturn * sizeProportion, saturnTexture, planetDistances.Saturn * distanceProportion, {
    innerRadius: (saturnRingSize.innerRadius * sizeProportion),
    outerRadius: (saturnRingSize.outerRadius * sizeProportion),
    texture: saturnRingTexture
});

const saturnRing = saturn.ringMesh;

const uranus = createPlanete(sizeRelativeToSun.Uranus * sizeProportion, uranusTexture, planetDistances.Uranus * distanceProportion, {
    innerRadius: (uranusRingSize.innerRadius * sizeProportion),
    outerRadius: (uranusRingSize.outerRadius * sizeProportion),
    texture: uranusRingTexture
});

const uranusRing = uranus.ringMesh;

const neptune = createPlanete(sizeRelativeToSun.Neptune * sizeProportion, neptuneTexture, planetDistances.Neptune * distanceProportion);
const pluto = createPlanete(sizeRelativeToSun.Pluto * sizeProportion, plutoTexture, planetDistances.Pluto * distanceProportion);

const celestialMesh = [sun, mercury.mesh, venus.mesh, earth.mesh, mars.mesh, jupiter.mesh, saturn.mesh, uranus.mesh, neptune.mesh, pluto.mesh];
const planetMesh = [mercury.mesh, venus.mesh, earth.mesh, mars.mesh, jupiter.mesh, saturn.mesh, uranus.mesh, neptune.mesh, pluto.mesh];

sun.name = 'Sun';
mercury.mesh.name = 'Mercury';
venus.mesh.name = 'Venus';
earth.mesh.name = 'Earth';
mars.mesh.name = 'Mars';
jupiter.mesh.name = 'Jupiter';
saturn.mesh.name = 'Saturn';
saturnRing.name = 'SaturnRing';
uranus.mesh.name = 'Uranus';
uranusRing.name = 'UranusRing';
neptune.mesh.name = 'Neptune';
pluto.mesh.name = 'Pluto';


function createOrbit(size, color){
    const obj = new THREE.Object3D();
    scene.add(obj);
    const ringGeo = new THREE.RingGeometry(
        size - 0.4,
        size,
        1000);
    const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat); // Assign ringMesh
    obj.add(ringMesh);
    ringMesh.rotation.x = -0.5 * Math.PI;
    return {ringMesh, obj};
}

const mercruyOrbit = createOrbit(planetDistances.Mercury  * distanceProportion, 0xffffff);
const venusOrbit = createOrbit(planetDistances.Venus  * distanceProportion, 0x0000ff);
const earthOrbit = createOrbit(planetDistances.Earth  * distanceProportion, 0xff0000);
const marsOrbit = createOrbit(planetDistances.Mars  * distanceProportion, 0x00ffff);
const jupiterOrbit = createOrbit(planetDistances.Jupiter  * distanceProportion, 0xffd700);
const saturnOrbit = createOrbit(planetDistances.Saturn  * distanceProportion, 0x4b0082);
const uranusOrbit = createOrbit(planetDistances.Uranus  * distanceProportion, 0xffffff);
const neptuneOrbit = createOrbit(planetDistances.Neptune  * distanceProportion, 0x0000ff);
const plutoOrbit = createOrbit(planetDistances.Pluto  * distanceProportion, 0xff0000);

const pointLight = new THREE.PointLight(0xFFFFFF, 1, sizeProportion * planetDistances.Pluto * distanceProportion * 10);
scene.add(pointLight);

const mousePosition = new THREE.Vector2();

window.addEventListener('mousemove', function(e){
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1;
});

const rayCaster = new THREE.Raycaster();

function scale(object){
    object.scale.x += 0.01;
    object.scale.y += 0.01;
    object.scale.z += 0.01;
}

function descale(object){
    object.scale.x -= 0.01;
    object.scale.y -= 0.01;
    object.scale.z -= 0.01;
}

function resetScale(object) {
    if (object.scale.x < 1.01 || object.scale.y < 1.01 || object.scale.z < 1.01) {
        return;
    }
    descale(object);
}

function highLight(object) {
    document.body.style.cursor = "pointer";
    if (object.scale.x > 1.15 || object.scale.y > 1.15 || object.scale.z > 1.15) {
        return;
    }
    scale(object)
}

function displayDescription(planetName) {
    // Example implementation to display description of the clicked planet
    const descriptionElement = document.getElementById('description');
    descriptionElement.innerHTML = `Description of ${planetName}`;
}

function resetCamera() {
    // Reset camera to original position
    camera.position.set(-90, 140, 140);
    camera.lookAt(scene.position);
}

function resetDescription() {
    // Clear description
    const descriptionElement = document.getElementById('description');
    descriptionElement.innerHTML = '';
}

const gui = new dat.GUI();

const options = {
    orbitSpeed: 1,
    rotationalSpeed: 1,
    sunSize: 1,
    planetSize: 1
};

gui.add(options, 'orbitSpeed', 0, 100);
gui.add(options, 'rotationalSpeed', 0, 100);
gui.add(options, 'sunSize', 0, 100);
gui.add(options, 'planetSize', 0, 10000);


document.addEventListener('click', onClick, false);

const planetCameraMap = {};
planetMesh.forEach(planet => {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(planet.x + 10, planet.y + 5, planet.z + 10); // Adjust position as needed
    camera.lookAt(planet.position); // Make camera look at the center of the planet
    planetCameraMap[planet.name] = camera;
    camera.name = planet.name + 'camera';
    //console.log(planet.name);
});

// Add controls for each camera
const controls = [];
Object.values(planetCameraMap).forEach(camera => {
    const control = new OrbitControls(camera, renderer.domElement);
    control.enableZoom = true;
    control.enablePan = true;
    controls.push(control);
    //console.log(camera.name);
});

// Function to switch between cameras
function switchCamera(planetName) {
    const camera = planetCameraMap[planetName];
    console.log(camera);
    if (camera) {
        renderer.render(scene, camera);
    }
}

switchCamera('Earth');

let selectedCelestial = null;
let selectedCelestialForCamera = jupiter;

function onClick(event) {
    if (selectedCelestial) {
        rayCaster.setFromCamera(mousePosition, camera);
        const intersects = rayCaster.intersectObject(selectedCelestial);
        if (intersects.length > 0) {
            handleCelestialClick(selectedCelestial);
        }
        selectedCelestial = null;
    }
}

function handleCelestialClick(celestial) {
    // Perform the desired action for the clicked planet
    console.log("Clicked on planet:", celestial.name);
    selectedCelestialForCamera = celestial;
    console.log("cameraplanet:", selectedCelestialForCamera.name);
    switchCamera(selectedCelestialForCamera.name);
    // Perform additional actions as needed...
}


function animate() {
    // Self-rotation
    sun.rotateY(rotationalSpeed.Sun * rotationalSpeedVal * options.rotationalSpeed);
    mercury.mesh.rotateY(rotationalSpeed.Mercury * rotationalSpeedVal * options.rotationalSpeed);
    venus.mesh.rotateY(rotationalSpeed.Venus * rotationalSpeedVal * options.rotationalSpeed);
    earth.mesh.rotateY(rotationalSpeed.Earth * rotationalSpeedVal * options.rotationalSpeed);
    mars.mesh.rotateY(rotationalSpeed.Mars * rotationalSpeedVal * options.rotationalSpeed);
    jupiter.mesh.rotateY(rotationalSpeed.Jupiter * rotationalSpeedVal * options.rotationalSpeed);
    saturn.mesh.rotateY(rotationalSpeed.Saturn * rotationalSpeedVal * options.rotationalSpeed);
    uranus.mesh.rotateY(rotationalSpeed.Uranus * rotationalSpeedVal * options.rotationalSpeed);
    neptune.mesh.rotateY(rotationalSpeed.Neptune * rotationalSpeedVal * options.rotationalSpeed);
    pluto.mesh.rotateY(rotationalSpeed.Pluto * rotationalSpeedVal * options.rotationalSpeed);

    // Around-sun-rotation
    mercury.obj.rotateY(orbitSpeed.Mercury * orbitSpeedVal * options.orbitSpeed);
    venus.obj.rotateY(orbitSpeed.Venus * orbitSpeedVal * options.orbitSpeed);
    earth.obj.rotateY(orbitSpeed.Earth * orbitSpeedVal * options.orbitSpeed);
    mars.obj.rotateY(orbitSpeed.Mars * orbitSpeedVal * options.orbitSpeed);
    jupiter.obj.rotateY(orbitSpeed.Jupiter * orbitSpeedVal * options.orbitSpeed);
    saturn.obj.rotateY(orbitSpeed.Saturn * orbitSpeedVal * options.orbitSpeed);
    uranus.obj.rotateY(orbitSpeed.Uranus * orbitSpeedVal * options.orbitSpeed);
    neptune.obj.rotateY(orbitSpeed.Neptune * orbitSpeedVal * options.orbitSpeed);
    pluto.obj.rotateY(orbitSpeed.Pluto * orbitSpeedVal * options.orbitSpeed);

    // GUI Scale Change
    sun.scale.set(options.sunSize, options.sunSize, options.sunSize);
    planetMesh.forEach(planet => {
        planet.scale.set(options.planetSize, options.planetSize, options.planetSize);
    });
    //TODO: ring scale 

    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children);

    document.body.style.cursor = "default";

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        highLight(intersectedObject);
        if (celestialMesh.includes(intersectedObject)) {
            selectedCelestial = intersectedObject;
        }
    }
    else{
        scene.children.forEach(object => {
            resetScale(object);
            });
        celestialMesh.forEach(planet => {
            resetScale(planet);
        });
        resetScale(saturnRing);
        resetScale(uranusRing);
    }


    
    renderer.render(scene, camera);
}



renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});