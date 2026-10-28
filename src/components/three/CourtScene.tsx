'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/* ─────────── Textures procédurales ─────────── */

function makeBallTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const x = c.getContext('2d')!;
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#f07b2a'); g.addColorStop(0.5, '#e8671c'); g.addColorStop(1, '#c9531a');
  x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
  x.fillStyle = 'rgba(0,0,0,0.06)';
  for (let i = 0; i < 5200; i++) {
    const px = Math.random() * 1024, py = Math.random() * 512;
    x.beginPath(); x.arc(px, py, 1.1 + Math.random() * 1.4, 0, 7); x.fill();
  }
  x.strokeStyle = '#1c1210'; x.lineWidth = 9; x.lineCap = 'round';
  x.beginPath(); x.moveTo(0, 256); x.lineTo(1024, 256); x.stroke();
  x.beginPath(); x.moveTo(256, 0); x.lineTo(256, 512); x.stroke();
  x.beginPath(); x.moveTo(768, 0); x.lineTo(768, 512); x.stroke();
  x.lineWidth = 8;
  x.beginPath(); x.moveTo(512, 0); x.bezierCurveTo(384, 170, 384, 342, 512, 512); x.stroke();
  x.beginPath(); x.moveTo(0, 256); x.bezierCurveTo(170, 190, 340, 190, 512, 256); x.stroke();
  x.beginPath(); x.moveTo(512, 256); x.bezierCurveTo(684, 322, 854, 322, 1024, 256); x.stroke();
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeBackboardTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 768; c.height = 480;
  const x = c.getContext('2d')!;
  x.fillStyle = 'rgba(235,240,245,0.14)';
  roundRect(x, 6, 6, 756, 468, 26); x.fill();
  x.strokeStyle = 'rgba(255,122,51,0.95)'; x.lineWidth = 10;
  roundRect(x, 14, 14, 740, 452, 22); x.stroke();
  x.strokeStyle = 'rgba(255,122,51,0.9)'; x.lineWidth = 8;
  x.strokeRect(292, 200, 184, 158);
  x.fillStyle = 'rgba(255,255,255,0.85)';
  x.font = '900 52px Arial, sans-serif'; x.textAlign = 'center';
  x.fillText('COURTLINK', 384, 108);
  x.fillStyle = 'rgba(255,122,51,0.9)';
  x.font = '700 22px Arial, sans-serif';
  x.fillText('ARENA · COTONOU', 384, 150);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeCourtTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 1024;
  const x = c.getContext('2d')!;
  const grd = x.createRadialGradient(512, 380, 60, 512, 512, 760);
  grd.addColorStop(0, '#23232b'); grd.addColorStop(1, '#121216');
  x.fillStyle = grd; x.fillRect(0, 0, 1024, 1024);
  x.globalAlpha = 0.05;
  for (let i = 0; i < 40; i++) {
    x.fillStyle = i % 2 ? '#ffffff' : '#000000';
    x.fillRect(0, i * 26, 1024, 12);
  }
  x.globalAlpha = 1;
  x.strokeStyle = 'rgba(255,122,51,0.5)'; x.lineWidth = 5;
  x.beginPath(); x.arc(512, 700, 150, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.arc(512, 700, 22, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.moveTo(40, 700); x.lineTo(984, 700); x.stroke();
  x.beginPath(); x.arc(512, 190, 330, Math.PI * 0.06, Math.PI * 0.94, false); x.stroke();
  x.beginPath(); x.moveTo(382, 330); x.lineTo(642, 330); x.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function roundRect(x: CanvasRenderingContext2D, px: number, py: number, w: number, h: number, r: number) {
  x.beginPath();
  x.moveTo(px + r, py);
  x.arcTo(px + w, py, px + w, py + h, r);
  x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r);
  x.arcTo(px, py, px + w, py, r);
  x.closePath();
}

/* ─────────── Filet ─────────── */

let netSwayFn: ((v: number) => void) | null = null;

function Net() {
  const ref = useRef<THREE.Group>(null!);
  const sway = useRef(0);
  useEffect(() => {
    netSwayFn = (v: number) => { sway.current = v; };
    return () => { netSwayFn = null; };
  }, []);
  const geometry = useMemo(() => {
    const pts: number[] = [];
    const N = 12, R = 0.5, r2 = 0.26, depth = 0.58;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const a2 = ((i + 0.5) / N) * Math.PI * 2;
      pts.push(Math.cos(a) * R, 0, Math.sin(a) * R);
      pts.push(Math.cos(a2) * r2, -depth, Math.sin(a2) * r2);
      pts.push(Math.cos(a2) * r2, -depth, Math.sin(a2) * r2);
      pts.push(Math.cos(((i + 1) / N) * Math.PI * 2) * R, 0, Math.sin(((i + 1) / N) * Math.PI * 2) * R);
    }
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const a2 = ((i + 1) / N) * Math.PI * 2;
      pts.push(Math.cos(a) * r2, -depth, Math.sin(a) * r2);
      pts.push(Math.cos(a2) * r2, -depth, Math.sin(a2) * r2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  useFrame((_, dt) => {
    if (sway.current > 0 && ref.current) {
      sway.current = Math.max(0, sway.current - dt);
      ref.current.rotation.x = Math.sin(sway.current * 22) * 0.16 * sway.current;
      ref.current.rotation.z = Math.cos(sway.current * 18) * 0.12 * sway.current;
      const sc = 1 + Math.sin(sway.current * 20) * 0.05 * sway.current;
      ref.current.scale.set(sc, 1, sc);
    }
  });
  return (
    <group ref={ref} position={[0, 2.6, -0.85]}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="#f5f2ec" transparent opacity={0.72} />
      </lineSegments>
    </group>
  );
}

/* ─────────── Confettis ─────────── */

const CONFETTI_COUNT = 46;
function Confetti({ triggerRef }: { triggerRef: React.MutableRefObject<(() => void) | null> }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const parts = useMemo(() => Array.from({ length: CONFETTI_COUNT }, () => ({
    p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0, rot: Math.random() * Math.PI,
  })), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    triggerRef.current = () => {
      for (const c of parts) {
        c.p.set((Math.random() - 0.5) * 0.7, 2.65, -0.85 + (Math.random() - 0.5) * 0.4);
        const a = Math.random() * Math.PI * 2;
        c.v.set(Math.cos(a) * (0.7 + Math.random() * 1.6), 2.2 + Math.random() * 2.4, Math.sin(a) * (0.7 + Math.random() * 1.4));
        c.life = 1 + Math.random() * 0.5;
      }
    };
    return () => { triggerRef.current = null; };
  }, [parts, triggerRef]);
  useFrame(() => {
    const m = mesh.current; if (!m) return;
    const dt = 1 / 60;
    parts.forEach((c, i) => {
      if (c.life > 0) {
        c.life -= dt;
        c.v.y -= 7.5 * dt;
        c.p.addScaledVector(c.v, dt);
        if (c.p.y < 0.02) { c.p.y = 0.02; c.v.y *= -0.3; c.v.multiplyScalar(0.7); }
        dummy.position.copy(c.p);
        dummy.rotation.set(c.rot + c.life * 5, c.rot, c.life * 3);
        dummy.scale.setScalar(Math.min(1, c.life * 2.2));
      } else {
        dummy.position.set(0, -10, 0); dummy.scale.setScalar(0.0001);
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, CONFETTI_COUNT]}>
      <boxGeometry args={[0.05, 0.05, 0.012]} />
      <meshBasicMaterial color="#ff8a3c" />
    </instancedMesh>
  );
}

/* ─────────── Ballon + logique de tir ─────────── */

type Phase = 'idle' | 'shoot' | 'fall' | 'brick' | 'fade';

const START = new THREE.Vector3(-2.7, 1.35, 1.9);
const CTRL = new THREE.Vector3(-1.15, 4.9, 0.35);
const RIM = new THREE.Vector3(0, 2.64, -0.85);
const MISS_END = new THREE.Vector3(0.42, 2.62, -0.72);

export interface SceneProps {
  auto: boolean;
  shotSignal: number;
  onScore: () => void;
  onMiss: () => void;
  shootRef: React.MutableRefObject<(() => void) | null>;
  confettiRef: React.MutableRefObject<(() => void) | null>;
}

function SceneContent({ auto, shotSignal, onScore, onMiss, shootRef, confettiRef }: SceneProps) {
  const ball = useRef<THREE.Mesh>(null!);
  const shadow = useRef<THREE.Mesh>(null!);
  const phase = useRef<Phase>('idle');
  const t = useRef(0);
  const nextAuto = useRef(2.2);
  const vel = useRef(new THREE.Vector3());
  const makeShot = useRef(true);
  const pos = useRef(START.clone());
  const { camera, size } = useThree();

  const ballTex = useMemo(() => makeBallTexture(), []);
  const bbTex = useMemo(() => makeBackboardTexture(), []);
  const courtTex = useMemo(() => makeCourtTexture(), []);

  const startShoot = (willMake: boolean) => {
    if (phase.current !== 'idle') return;
    makeShot.current = willMake;
    phase.current = 'shoot'; t.current = 0;
    pos.current.copy(START);
  };

  useEffect(() => { shootRef.current = () => startShoot(Math.random() < 0.82); }, [shootRef]);

  useEffect(() => {
    if (shotSignal > 0) startShoot(Math.random() < 0.82);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shotSignal]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const clock = state.clock.elapsedTime;

    const wide = size.width >= 768;
    const baseX = wide ? 0.4 : 0.15;
    const target = wide ? -1.55 : -0.15;
    const px = state.pointer.x, py = state.pointer.y;
    camera.position.x += ((baseX + px * 0.55) - camera.position.x) * 0.045;
    camera.position.y += ((2.35 + py * 0.3) - camera.position.y) * 0.045;
    camera.position.z += ((wide ? 7.3 : 9.2) - camera.position.z) * 0.03;
    camera.lookAt(target, 1.85, -0.5);

    if (phase.current === 'idle') {
      const bounce = Math.abs(Math.sin(clock * 2.6));
      pos.current.set(START.x + Math.sin(clock * 0.7) * 0.12, 0.34 + bounce * 0.62, START.z + Math.cos(clock * 0.5) * 0.08);
      if (auto && clock > nextAuto.current) {
        nextAuto.current = clock + 4.4 + Math.random() * 1.4;
        startShoot(true);
      }
    }

    if (phase.current === 'shoot') {
      t.current += dt / 0.92;
      const k = Math.min(t.current, 1);
      const end = makeShot.current ? RIM : MISS_END;
      const a = new THREE.Vector3().lerpVectors(START, CTRL, k);
      const b = new THREE.Vector3().lerpVectors(CTRL, end, k);
      pos.current.copy(a.lerp(b, k));
      if (k >= 1) {
        if (makeShot.current) {
          phase.current = 'fall'; t.current = 0;
          vel.current.set(0, -0.5, -0.15);
          onScore();
          netSwayFn?.(1);
          confettiRef.current?.();
        } else {
          phase.current = 'brick'; t.current = 0;
          vel.current.set(1.4 + Math.random(), 2.6 + Math.random(), 1.1 + Math.random() * 0.6);
          onMiss();
          netSwayFn?.(0.4);
        }
      }
    }

    if (phase.current === 'fall') {
      t.current += dt;
      vel.current.y -= 11 * dt;
      vel.current.z += -0.4 * dt;
      pos.current.addScaledVector(vel.current, dt);
      if (pos.current.y > 2.1 && pos.current.y < 2.6) {
        pos.current.x = THREE.MathUtils.lerp(pos.current.x, 0, 0.4);
        pos.current.z = THREE.MathUtils.lerp(pos.current.z, -0.85, 0.4);
      }
      if (pos.current.y <= 0.34) {
        pos.current.y = 0.34;
        vel.current.y = Math.abs(vel.current.y) * 0.42;
        vel.current.x *= 0.6; vel.current.z *= 0.6;
        if (Math.abs(vel.current.y) < 0.8) { phase.current = 'fade'; t.current = 0; }
      }
    }

    if (phase.current === 'brick') {
      vel.current.y -= 11 * dt;
      pos.current.addScaledVector(vel.current, dt);
      if (pos.current.y <= 0.34) {
        pos.current.y = 0.34;
        vel.current.y = Math.abs(vel.current.y) * 0.5;
        vel.current.x *= 0.65; vel.current.z *= 0.65;
        if (Math.abs(vel.current.y) < 0.7) { phase.current = 'fade'; t.current = 0; }
      }
    }

    if (phase.current === 'fade') {
      t.current += dt;
      const mat = ball.current.material as THREE.MeshStandardMaterial;
      mat.transparent = true;
      mat.opacity = Math.max(0, 1 - t.current * 1.4);
      if (t.current > 0.8) {
        mat.opacity = 1;
        pos.current.copy(START);
        phase.current = 'idle';
        t.current = 0;
      }
    }

    const spinning = phase.current === 'shoot' || phase.current === 'fall';
    ball.current.position.copy(pos.current);
    ball.current.rotation.x -= spinning ? dt * 7 : dt * 0.8;
    ball.current.rotation.y += dt * (phase.current === 'idle' ? 0.9 : 1.6);
    if (shadow.current) {
      shadow.current.position.set(pos.current.x, 0.005, pos.current.z);
      const h = THREE.MathUtils.clamp(pos.current.y / 4, 0.05, 1);
      (shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.34 * (1 - h) + 0.05;
      shadow.current.scale.setScalar(0.55 + h * 0.9);
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4.5, 7, 3.5]} intensity={1.5} color="#fff4e8" />
      <directionalLight position={[-4, 5, -5]} intensity={0.9} color="#ff7a33" />
      <pointLight position={[0, 2.7, 0.4]} intensity={9} color="#ff9a55" distance={7} />
      <hemisphereLight args={['#3a3440', '#181418', 0.5]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[34, 34]} />
        <meshStandardMaterial map={courtTex} roughness={0.82} metalness={0.18} />
      </mesh>

      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <ContactShadows position={[0, 0.002, 0]} opacity={0.35} scale={16} blur={2.6} far={5} resolution={512} color="#0a0a0c" frames={1} />

      <mesh position={[0, 3.42, -1.42]}>
        <planeGeometry args={[3.1, 1.94]} />
        <meshBasicMaterial map={bbTex} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.75, -2.5]}>
        <cylinderGeometry args={[0.09, 0.11, 3.5, 12]} />
        <meshStandardMaterial color="#2a2a30" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, 3.42, -1.95]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.12, 0.12, 1.1]} />
        <meshStandardMaterial color="#2a2a30" roughness={0.5} metalness={0.7} />
      </mesh>

      <mesh position={[0, 2.6, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.042, 14, 40]} />
        <meshStandardMaterial color="#ff5a1f" metalness={0.75} roughness={0.28} emissive="#b23a0a" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 2.52, -1.3]}>
        <boxGeometry args={[0.09, 0.14, 0.42]} />
        <meshStandardMaterial color="#ff5a1f" metalness={0.7} roughness={0.35} />
      </mesh>

      <Net />
      <Confetti triggerRef={confettiRef} />
      <Sparkles count={70} scale={[12, 6, 7]} size={2.2} speed={0.25} color="#ff9a55" opacity={0.4} position={[0, 3, 0]} />

      <mesh
        ref={ball}
        onPointerDown={(e) => { e.stopPropagation(); shootRef.current?.(); }}
      >
        <sphereGeometry args={[0.34, 48, 48]} />
        <meshStandardMaterial map={ballTex} bumpMap={ballTex} bumpScale={0.6} roughness={0.82} metalness={0.04} />
      </mesh>
    </>
  );
}

/* ─────────── Canvas exporté ─────────── */

export default function CourtScene(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0.4, 2.35, 7.3], fov: 42, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
