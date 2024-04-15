import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { planetDistances } from './constants.js';
import { celestialSize } from './constants.js';
import { orbitSpeed } from './constants.js';
import { rotationalSpeed } from './constants.js';
import { saturnRingSize } from './constants.js';
import { uranusRingSize } from './constants.js';
import { celestialDescriptions } from './constants.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js"; 
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"; 
import { RenderPixelatedPass } from "three/examples/jsm/postprocessing/RenderPixelatedPass.js"; 

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
import spaceTexture from '../img/space.jpg';

/*document.getElementById('splash-screen').style.display = 'block';

// Hide the splash screen after 3 seconds
setTimeout(function() {
    // Apply fade-out animation
    document.getElementById('splash-screen').classList.add('fade-out');
    
    // Hide the splash screen after the animation ends
    setTimeout(function() {
        document.getElementById('splash-screen').style.display = 'none';
    }, 500); // Adjust this timeout to match the duration of your CSS animation
}, 1500);*/

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
orbit.minDistance = 50;
orbit.maxDistance = 500;

camera.position.set(-70, 100, 100);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    spaceTexture,
    spaceTexture,
    spaceTexture,
    spaceTexture,
    spaceTexture,
    spaceTexture
]);
scene.backgroundBlurriness = 0.2;
scene.backgroundIntensity = 0.05;

const textureLoader = new THREE.TextureLoader();

const orbitSpeedVal = 0.00000001;
let rotationalSpeedVal = 0.000001;
let planetSelected = false;


//FLOATING PARTICLES

const particleCount = 3000;
const boxSize = 1000;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * boxSize - boxSize / 2;
    const y = Math.random() * boxSize - boxSize / 2;
    const z = Math.random() * boxSize - boxSize / 2;

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMaterial = new THREE.PointsMaterial({
    size: 1,
    color: 0xffffff,
});
const particles = new THREE.Points(particleGeometry, particleMaterial);

scene.add(particles);

function animateParticles() {
    const particlePositions = particleGeometry.attributes.position.array;
    const speed = 0.05;
    for (let i = 0; i < particlePositions.length; i += 3) {
        const offsetX = (Math.random() - 0.5) * speed;
        const offsetY = (Math.random() - 0.5) * speed;
        const offsetZ = (Math.random() - 0.5) * speed;
        particlePositions[i] += offsetX;
        particlePositions[i + 1] += offsetY;
        particlePositions[i + 2] += offsetZ;
    }
    particleGeometry.attributes.position.needsUpdate = true;
}


//PLANET CREATION

const sunGeo = new THREE.SphereGeometry(10, 40, 40);
const sunMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load(sunTexture)
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

function createPlanet(size, texture, position, ring) {
    const planetTexture = textureLoader.load(texture);
    const mat = new THREE.MeshStandardMaterial({
        map: planetTexture,
        
    });
    const geo = new THREE.SphereGeometry(size, 100, 100);
    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.add(mesh);
    let ringMesh;
    if(ring) {
        const ringGeo = new THREE.RingGeometry(
            ring.innerRadius,
            ring.outerRadius,
            32);
        const ringMat = new THREE.MeshBasicMaterial({
            map: textureLoader.load(ring.texture),
            side: THREE.DoubleSide
        });
        ringMesh = new THREE.Mesh(ringGeo, ringMat);
        obj.add(ringMesh);
        ringMesh.position.x = position;
        ringMesh.rotation.x = -0.5 * Math.PI;
    }
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.01);
    mesh.add(ambientLight);

    
    scene.add(obj);
    mesh.position.x = position;
    return { mesh, obj, ringMesh, };
}

const mercury = createPlanet(celestialSize.Mercury, mercuryTexture, planetDistances.Mercury);
const venus = createPlanet(celestialSize.Venus, venusTexture, planetDistances.Venus);
const earth = createPlanet(celestialSize.Earth, earthTexture, planetDistances.Earth);
const mars = createPlanet(celestialSize.Mars, marsTexture, planetDistances.Mars);
const jupiter = createPlanet(celestialSize.Jupiter, jupiterTexture, planetDistances.Jupiter);
const saturn = createPlanet(celestialSize.Saturn, saturnTexture, planetDistances.Saturn, {
    innerRadius: (saturnRingSize.innerRadius),
    outerRadius: (saturnRingSize.outerRadius),
    texture: saturnRingTexture
});

const saturnRing = saturn.ringMesh;

const uranus = createPlanet(celestialSize.Uranus, uranusTexture, planetDistances.Uranus, {
    innerRadius: (uranusRingSize.innerRadius),
    outerRadius: (uranusRingSize.outerRadius),
    texture: uranusRingTexture
});

const uranusRing = uranus.ringMesh;

const neptune = createPlanet(celestialSize.Neptune, neptuneTexture, planetDistances.Neptune);
const pluto = createPlanet(celestialSize.Pluto, plutoTexture, planetDistances.Pluto);

const celestialMesh = [sun, mercury.mesh, venus.mesh, earth.mesh, mars.mesh, jupiter.mesh, saturn.mesh, uranus.mesh, neptune.mesh, pluto.mesh];
const planetMesh = [mercury.mesh, venus.mesh, earth.mesh, mars.mesh, jupiter.mesh, saturn.mesh, uranus.mesh, neptune.mesh, pluto.mesh];
const planets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto];

console.log(saturn.ringMesh);
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

const pointLight = new THREE.PointLight(0xFFFFFF, 7000, 4000, );
pointLight.castShadow = true;
scene.add(pointLight);


//ORBIT CREATION

function createOrbit(size, color) {
    const obj = new THREE.Object3D();
    scene.add(obj);
  
    const ringGeo = new THREE.RingGeometry(size - 0.1, size + 0.1, 500);  // Increase outer radius for thickness
  
    const ringMat = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide
    });
  
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    obj.add(ringMesh);
  
    ringMesh.rotation.x = -0.5 * Math.PI;
    return { ringMesh, obj };
  }

const mercruyOrbit = createOrbit(planetDistances.Mercury, 0xffffff);
const venusOrbit = createOrbit(planetDistances.Venus, 0xffffff);
const earthOrbit = createOrbit(planetDistances.Earth, 0xffffff);
const marsOrbit = createOrbit(planetDistances.Mars, 0xffffff);
const jupiterOrbit = createOrbit(planetDistances.Jupiter, 0xffffff);
const saturnOrbit = createOrbit(planetDistances.Saturn, 0xffffff);
const uranusOrbit = createOrbit(planetDistances.Uranus, 0xffffff);
const neptuneOrbit = createOrbit(planetDistances.Neptune, 0xffffff);
const plutoOrbit = createOrbit(planetDistances.Pluto, 0xffffff);

const orbits = [mercruyOrbit.ringMesh, venusOrbit.ringMesh, earthOrbit.ringMesh, marsOrbit.ringMesh, jupiterOrbit.ringMesh, saturnOrbit.ringMesh, uranusOrbit.ringMesh, neptuneOrbit.ringMesh, plutoOrbit.ringMesh];


//SCENE HELPERS

const mousePosition = new THREE.Vector2();

window.addEventListener('mousemove', function(e){
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1;
});

const rayCaster = new THREE.Raycaster();

function bounce(object){
    object.scale.x += 0.01;
    object.scale.y += 0.01;
    object.scale.z += 0.01;
    object.position.y += 0.2;
}

function debounce(object){
    object.scale.x -= 0.01;
    object.scale.y -= 0.01;
    object.scale.z -= 0.01;
    object.position.y -= 0.2;
}

function resetHighlight(object) {
    if (object.scale.x < 1.01 || object.scale.y < 1.01 || object.scale.z < 1.01 || object.position.y < 0) {
        return;
    }
    debounce(object);
}

function highLight(object) {
    if (planetSelected){
        return;
    }
    if (orbits.includes(object) || object == particles){
        return;
    }
    if (object.scale.x > 1.15 || object.scale.y > 1.15 || object.scale.z > 1.15 || object.position.y > 3) {
        return;
    }
    document.body.style.cursor = "pointer";
    bounce(object)
}

let selectedCelestial;

document.addEventListener('click', onClick, false);

function onClick(event) {
    if (selectedCelestial) {
        rayCaster.setFromCamera(mousePosition, camera);
        const intersects = rayCaster.intersectObject(selectedCelestial);
        if (intersects.length > 0 && !targetPlanet) {
            handleCelestialClick(selectedCelestial);
        }
        selectedCelestial = null;
    }
}

let targetPlanet;
let tempCamera;
let tempOrbit;
let tempScene;
let composerTemp;
let tempCameraRenderPass;

function handleCelestialClick(celestial) {
    planetSelected = true;
    if (targetPlanet) {
        targetPlanet.remove(camera);
    }
    targetPlanet = celestial;
    
    tempScene = new THREE.Scene();
    const clonedCelestial = celestial.clone();
    tempScene.add(clonedCelestial);
    clonedCelestial.position.set(0, 0, 0);
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    tempScene.add(ambientLight);
    tempScene.background = cubeTextureLoader.load([
        spaceTexture,
        spaceTexture,
        spaceTexture,
        spaceTexture,
        spaceTexture,
        spaceTexture
    ]);
    tempScene.backgroundBlurriness = 0.2;
    tempScene.backgroundIntensity = 0.05;
    tempScene.add(particles);

    tempCamera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    tempOrbit = new OrbitControls(tempCamera, renderer.domElement);
    tempCamera.position.set(0, 0, 0)
    tempCamera.position.x += -celestialSize[celestial.name] - 30;
    tempCamera.lookAt(celestial.position);
    tempOrbit.update();
    
    
    composerTemp = new EffectComposer(renderer);
    tempCameraRenderPass = new RenderPass(tempScene, tempCamera);
    composerTemp.addPass(tempCameraRenderPass);
    const pixelPassTemp = new RenderPixelatedPass(3, tempScene, tempCamera);
    composerTemp.addPass(pixelPassTemp);
    const bloomPassTemp = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight),0.15, 5, 0.1);
    composerTemp.addPass(bloomPassTemp);

    const infoBox = document.createElement('div');
    infoBox.id = 'info-box';
    infoBox.innerHTML = `<p>${celestialDescriptions[celestial.name]}</p>`;
    
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-view';
    resetButton.textContent = 'Back';
    resetButton.addEventListener('click', resetView);

    document.body.appendChild(infoBox);
    document.body.appendChild(resetButton);
}

function resetView() {
    tempCamera = null;
    tempOrbit = null;
    tempScene = null;
    composerTemp = null;
    tempCameraRenderPass = null;
    scene.add(particles);

    planetSelected = false;
    const infoBox = document.getElementById('info-box');
    const resetButton = document.querySelector('button');
    if (infoBox) infoBox.remove();
    if (resetButton) resetButton.remove();

    rotationalSpeedVal = 0.000001;
    if (targetPlanet) {
        targetPlanet.remove(camera);
        targetPlanet = null;
    }
    camera.position.set(-100, 70, 40);
    camera.lookAt(scene.position);
    orbit.target = new THREE.Vector3(0, 0, 0);
}

let isCursorHeldDown = false; // Flag to track the state of the cursor

    // Add event listeners for mouse down and up
    document.addEventListener('mousedown', () => {
        isCursorHeldDown = true;
    });
    
    document.addEventListener('mouseup', () => {
        isCursorHeldDown = false;
    });


//POST PROCESSING

const composerMain = new EffectComposer(renderer);

const cameraRenderPass = new RenderPass(scene, camera);
composerMain.addPass(cameraRenderPass);



const pixelPass = new RenderPixelatedPass(3, scene, camera);
composerMain.addPass(pixelPass);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight),0.25, 5, 0.1);
composerMain.addPass(bloomPass);




//ANIMATE

function animate() {
    animateParticles();

    // Self-rotation
    sun.rotateY(rotationalSpeed.Sun * rotationalSpeedVal);
    mercury.mesh.rotateY(rotationalSpeed.Mercury * rotationalSpeedVal);
    venus.mesh.rotateY(rotationalSpeed.Venus * rotationalSpeedVal);
    earth.mesh.rotateY(rotationalSpeed.Earth * rotationalSpeedVal);
    mars.mesh.rotateY(rotationalSpeed.Mars * rotationalSpeedVal);
    jupiter.mesh.rotateY(rotationalSpeed.Jupiter * rotationalSpeedVal);
    saturn.mesh.rotateY(rotationalSpeed.Saturn * rotationalSpeedVal);
    uranus.mesh.rotateY(rotationalSpeed.Uranus * rotationalSpeedVal);
    neptune.mesh.rotateY(rotationalSpeed.Neptune * rotationalSpeedVal);
    pluto.mesh.rotateY(rotationalSpeed.Pluto * rotationalSpeedVal);

    // Around-sun-rotation
    mercury.obj.rotateY(orbitSpeed.Mercury * orbitSpeedVal);
    venus.obj.rotateY(orbitSpeed.Venus * orbitSpeedVal);
    earth.obj.rotateY(orbitSpeed.Earth * orbitSpeedVal);
    mars.obj.rotateY(orbitSpeed.Mars * orbitSpeedVal);
    jupiter.obj.rotateY(orbitSpeed.Jupiter * orbitSpeedVal);
    saturn.obj.rotateY(orbitSpeed.Saturn * orbitSpeedVal);
    uranus.obj.rotateY(orbitSpeed.Uranus * orbitSpeedVal);
    neptune.obj.rotateY(orbitSpeed.Neptune * orbitSpeedVal);
    pluto.obj.rotateY(orbitSpeed.Pluto * orbitSpeedVal);

    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (planetSelected) {
            resetHighlight(intersectedObject);
        }
        else{
            if (!isCursorHeldDown){
                highLight(intersectedObject);
            }
        }
        if (celestialMesh.includes(intersectedObject)) {
            selectedCelestial = intersectedObject;
        }
    }
    else{
        document.body.style.cursor = "default";
        scene.children.forEach(object => {
            resetHighlight(object);
            });
        celestialMesh.forEach(planet => {
            resetHighlight(planet);
        });
        resetHighlight(saturnRing);
        resetHighlight(uranusRing);
    }

    if (tempCamera){
        composerTemp.render();
    }
    else{
        //renderer.render(scene, camera);
        composerMain.render();
    }
    
}

renderer.setAnimationLoop(animate);


window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});