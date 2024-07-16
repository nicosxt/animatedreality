// components/ThreeScene.tsx
"use client"

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Object3D } from 'three';
import { OrbitControls, Preload } from '@react-three/drei';
import { useGLTF } from '@react-three/drei'

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const loadedModels: { [key: string]: THREE.Object3D } = {}; // Declare an object to store models

  useEffect(() => {
    const currentRef = mountRef.current;
    if (!currentRef) return;

    // Scene, camera, renderer setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xeeeeee, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    currentRef.appendChild(renderer.domElement);



    // Function to load a model and store it in the loadedModels object
    const loadModel = (path: string, name: string) => {
        const loader = new GLTFLoader();
        loader.load(path, (gltf) => {
          const model = gltf.scene;
          model.position.set(0, 0, 0);
  
          // Change material properties
          const textureLoader = new THREE.TextureLoader();
          const texture = textureLoader.load('/imgs/gradient.jpg'); // Replace with the path to your texture
  
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.material = new THREE.MeshStandardMaterial({
                map: texture,  // Apply the texture
                metalness: 0.5,  // Adjust metalness
                roughness: 0.3,  // Adjust roughness
                emissive: new THREE.Color('#ff80aa'),
                emissiveMap: texture,  // Use texture for emission
                emissiveIntensity: 0.4,  // Set emissive strength
              });
            }
          });
          scene.add(model);
          loadedModels[name] = model; // Store the model in the object
        });
      };
  
      loadModel('/models/make-magic-with-us.glb', 'mainText');

    // Lighting
    const ambientLight = new THREE.AmbientLight('#ffb3d9', 2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight('#ffcc99', 1);
    directionalLight.position.set(0, 0.5, 3).normalize();
    scene.add(directionalLight);

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.066;
    controls.enableZoom = true;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE,
    };

    const originalPosition = new THREE.Vector3(0, 0, 0); // Assuming the original position is (0, 0, 0)
    const maxPanDistance = 5;

    controls.addEventListener('change', () => {
      const offset = controls.target.clone().sub(originalPosition);

      if (offset.length() > maxPanDistance) {
        offset.clampLength(0, maxPanDistance);
        controls.target.copy(originalPosition).add(offset);
      }
    });

    // Camera initial position
    camera.position.set(0,0,4);
    controls.update();

    // Handle window resize
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Contact function
    const handleContactClick = () => {
        alert('Contact me at: example@example.com');
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    document.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();


    // Smooth camera movement
    const targetPosition = new THREE.Vector3();
    const smoothMoveCamera = (x: number, y: number, z: number) => {
      targetPosition.set(x, y, z);
      gsap.to(camera.position, {
        duration: 10,
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        ease: 'power1.inOut',
        onUpdate: () => {
          camera.lookAt(scene.position);
        },
      });
    };



    // Clean up on component unmount
    return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('mousemove', onMouseMove);
        // document.removeEventListener('click', onMouseClick);
      //   document.removeEventListener('keydown', handleKeyDown);
        if (mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };
    }, []);
  
    return (
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100vh',
          background: 'linear-gradient(to bottom, #fad0c4, #ff9a9e)',
        }}
      />
    );
  };

export default ThreeScene;
