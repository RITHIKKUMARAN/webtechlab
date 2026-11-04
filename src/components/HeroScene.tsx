import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const HeroScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    group.rotation.x = 0.2;

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.05, 0.28, 180, 32, 2, 3),
      new THREE.MeshPhysicalMaterial({
        color: 0xc7d2fe,
        metalness: 0.78,
        roughness: 0.17,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        emissive: 0x312e81,
        emissiveIntensity: 0.42,
      }),
    );
    group.add(knot);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.72, 0.012, 12, 160),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.7 }),
    );
    ring.rotation.x = Math.PI / 2.4;
    group.add(ring);

    const particles = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ color: 0xa5b4fc, size: 0.018, transparent: true, opacity: 0.7 }),
    );
    const particlePositions = new Float32Array(360 * 3);
    for (let i = 0; i < particlePositions.length; i += 3) {
      const radius = 2.05 + Math.random() * 1.1;
      const angle = Math.random() * Math.PI * 2;
      particlePositions[i] = Math.cos(angle) * radius;
      particlePositions[i + 1] = (Math.random() - 0.5) * 2.8;
      particlePositions[i + 2] = Math.sin(angle) * radius;
    }
    particles.geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    scene.add(particles);

    scene.add(new THREE.AmbientLight(0x818cf8, 1.6));
    const keyLight = new THREE.PointLight(0x67e8f9, 18, 12);
    keyLight.position.set(3, 2, 4);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0x8b5cf6, 12, 10);
    fillLight.position.set(-3, -1, 2);
    scene.add(fillLight);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!reducedMotion) {
        group.rotation.y += 0.003;
        group.rotation.z = Math.sin(Date.now() * 0.00035) * 0.08;
        particles.rotation.y -= 0.0007;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      knot.geometry.dispose();
      (knot.material as THREE.Material).dispose();
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} aria-hidden="true" className="hero-scene" />;
};
