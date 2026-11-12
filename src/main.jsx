import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Github, Linkedin, Mail, Download, MoveUpRight } from 'lucide-react';
import './style.css';

function FluidField() {
  const host = useRef(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(el.clientWidth, el.clientHeight) }
    };

    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uPointer;
        uniform vec2 uVelocity;
        uniform vec2 uResolution;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          f = f*f*(3.0-2.0*f);
          return mix(mix(hash(i), hash(i+vec2(1.,0.)), f.x),
                     mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), f.x), f.y);
        }
        void main() {
          vec2 uv = vUv;
          vec2 p = uv - 0.5;
          p.x *= uResolution.x / uResolution.y;
          vec2 mouse = uv - uPointer;
          mouse.x *= uResolution.x / uResolution.y;
          float d = length(mouse);
          float influence = exp(-d * 5.0);
          float flow = noise(uv * 3.2 + vec2(uTime * 0.045, -uTime * 0.035));
          float warp = sin((uv.x * 4.0 + uv.y * 2.2) + uTime * 0.18 + flow * 2.0);
          warp += cos((uv.y * 5.0 - uv.x * 1.8) - uTime * 0.13);
          float ripple = sin(d * 27.0 - uTime * 1.8) * influence;
          vec2 drift = uVelocity * influence * 0.10;
          float lines = sin((uv.y + warp * 0.025 + ripple * 0.012 + drift.y) * 90.0);
          float glow = exp(-length(p + vec2(0.18, 0.05)) * 2.2);
          float intensity = smoothstep(0.25, 0.95, abs(lines)) * 0.14;
          intensity += influence * 0.18 + glow * 0.10;
          vec3 ink = vec3(0.24, 0.76, 0.68);
          vec3 violet = vec3(0.43, 0.36, 0.88);
          vec3 color = mix(ink, violet, smoothstep(-0.8, 0.9, warp + ripple));
          float alpha = clamp(intensity, 0.0, 0.30);
          gl_FragColor = vec4(color, alpha);
        }
      `
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    let target = new THREE.Vector2(0.5, 0.5);
    let last = new THREE.Vector2(0.5, 0.5);
    let velocity = new THREE.Vector2();
    let raf;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      target.set((e.clientX - rect.left) / rect.width, 1 - (e.clientY - rect.top) / rect.height);
    };
    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      uniforms.uResolution.value.set(el.clientWidth, el.clientHeight);
    };
    el.addEventListener('pointermove', onMove);
    window.addEventListener('resize', resize);
    const clock = new THREE.Clock();
    const render = () => {
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;
      uniforms.uPointer.value.lerp(target, 0.075);
      velocity.copy(target).sub(last).multiplyScalar(0.8);
      last.copy(target);
      uniforms.uVelocity.value.lerp(velocity, 0.12);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="fluid-field" ref={host} aria-hidden="true" />;
}

const projects = [
  {
    number: '01',
    type: 'SOFTWARE · MARKETING',
    title: 'Telling business customer stories for Ford Pro',
    description: 'An enterprise publishing platform built to streamline content creation, management, and distribution, supporting customer engagement across Ford Pro’s digital ecosystem.'
    tags: ['TypeScript', 'React', 'NodeJS', "Google Cloud Platform", "Tekton", "Terraform"]
  },
  {
    number: '02',
    type: 'HARDWARE · NETWORKING · PRIVACY',
    title: 'A better way to communicate in the here and now',
    description: 'A solution for realtime local network communication with associated US patent US11102021B2.',
    tags: ['PYTHON', 'C++', 'UDP']
  },
  {
    number: '01',
    type: 'SOFTWARE · MARKETING · RETAIL',
    title: 'Intuitive retail inventory and cashflow solution',
    description: 'A cashflow and inventory solution that eliminates headaches and pain points, and increases productivity by orders of magnitude. My custom solution replaces a hacky antiquated Microsoft Excel based CMS with a modern interface and database.',
    tags: ['TypeScript', 'React', 'NodeJS', "Supabase"]
  },
  {
    number: '03',
    type: 'VR · AR · XR',
    title: 'Expanding human-computer interaction',
    description: 'Multiple innovations in ways that humans can interact with computers, specifically in the field of manufacturing',
    tags: ['UNITY', 'UNREAL', 'OPENVR', 'OPENXR', 'ARKIT', 'ARCORE']
  }
];

function App() {
  return (
    <>
      <FluidField />
      <div className="site-shell">
        <header className="topbar">
          <a className="wordmark" href="#top"><span className="mark">☼</span> CG<span className="wordmark-dot">.</span></a>
          <nav>
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#resume">Resume</a>
          </nav>
          <a className="availability" href="mailto:cagokcek@gmail.com"><span /> Open to interesting work</a>
        </header>

        <main id="top">
          <section className="hero">
            <motion.div className="hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: [.2,.7,.2,1] }}>
              <p className="eyebrow"><span className="eyebrow-line" /> SOFTWARE ENGINEERING · SYSTEMS · LEADERSHIP</p>
              <h1>Can Gokcek<br /><span className="muted">~hack the planet~</span></h1>
              <div className="hero-actions">
                <a className="button button-primary" href="#work">Explore selected work <ArrowDownRight size={17} /></a>
                <a className="text-link" href="#about">A little about me <MoveUpRight size={15} /></a>
              </div>
            </motion.div>
            <motion.div className="hero-side" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .25, duration: .8 }}>
              <div className="orb-wrap"><div className="orb"><div className="orb-core" /></div><span className="orb-label">Weird Shape / 001</span></div>
              <div className="side-note"><span className="mono">CURRENTLY</span><p>Cleaning a carburetor<br />and loving the mechanical feeling.</p></div>
            </motion.div>
            <div className="hero-index mono">PHILADELPHIA, PA <span>—</span> 2026</div>
          </section>

          <section className="ticker" aria-label="Areas of interest">
            <div className="ticker-track"><span>REACT</span><i>✳</i><span>NODEJS</span><i>✳</i><span>TYPESCRIPT</span><i>✳</i><span>JAVASCRIPT</span><i>✳</i><span>AWS</span><i>✳</i><span>GCP</span><i>✳</i><span>REDIS</span><i>✳</i><span>TEKTON</span><i>✳</i><span>TERRAFORM</span><i>✳</i><span>NEXTJS</span><i>✳</i><span>UNITY</span><i>✳</i><span>UNREAL</span><i>✳</i><span>PYTHON</span><i>✳</i><span>JAVA</span><i>✳</i><span>C#</span><i>✳</i><span>C++</span><i>✳</i><span>MYSQL</span><i>✳</i><span>MOTORCYCLES</span><i>✳</i><span>CIRCUITS</span><i>✳</i><span>SEMICONDUCTORS</span><i>✳</i></div>
          </section>

          <section className="section work-section" id="work">
            <div className="section-heading">
              <div><p className="eyebrow">01 / SELECTED WORK</p><h2>Things I’ve been<br /><span className="muted">working on.</span></h2></div>
              <p className="section-aside">Some problems I've helped to solve.<br /></p>
            </div>
            <div className="project-list">
              {projects.map((project) => (
                <motion.article className="project" key={project.number} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .55 }}>
                  <span className="project-number mono">{project.number}</span>
                  <div className="project-main">
                    <p className="project-type mono">{project.type}</p>
                    <h3>{project.title}</h3>
                    <p className="project-description">{project.description}</p>
                    <div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
                  </div>
                  <span className="project-arrow"><ArrowUpRight size={20} /></span>
                </motion.article>
              ))}
            </div>
          </section>

          <section className="about-section section" id="about">
            <div className="about-kicker"><p className="eyebrow">02 / A LITTLE ABOUT ME</p><span className="mono">THE SHORT VERSION</span></div>
            <div className="about-content">
              <h2>Constantly Innovating<br /><span className="muted"></span></h2>
              <div className="about-columns">
                <p>I have a decade of experience in enterprise software engineering, from PLCs to Augmented Reality; from Manufacturing to full-stack web development.</p>
                <p>I have been a team leader for several years in large enterprise settings. I am well-versed in pair programming, onboarding, project management, and roadmapping.</p>
                <p>WebAssembly is a dream come true.</p>
                <p>I've been wrangling computers since I was about 6 years old, starting with QBasic.</p>
                <p>I sometimes miss the turbo button on a 486.</p>
                <p>I love solving problems, whether it is software, hardware, or mechanical.</p>
                <p>I've got a soft spot for 90s Sierra games.</p>
              </div>
              <div className="interest-grid">
                <span>01 <b>Building software that feels natural</b></span><span>02 <b>Failing fast and recovering swiftly</b></span><span>03 <b>Motorcycles & machines</b></span><span>04 <b>Adventure Games, Intuitive UIs, UKG</b></span>
              </div>
            </div>
          </section>

          <section className="resume-section section" id="resume">
            <div className="resume-card">
              <div><p className="eyebrow">03 / WHAT IVE DONE</p><h2>Curriculum Vitae</h2><p className="resume-copy">From there to here and onward.</p></div>
              <a className="button button-primary" href="/resume.pdf" target="_blank" rel="noreferrer"><Download size={17} /> Download resume <ArrowUpRight size={16} /></a>
              <span className="resume-stamp mono">PDF / 2026</span>
            </div>
          </section>

          <section className="contact-section section">
            <p className="eyebrow">04 / SAY HELLO</p>
            <h2>Let's<br /><span className="muted">collaborate</span></h2>
            <a className="contact-link" href="mailto:cagokcek@gmail.com">cagokcek@gmail.com <ArrowUpRight size={22} /></a>
          </section>
        </main>

        <footer className="footer">
          <a className="wordmark" href="#top"><span className="mark">✳</span> CG<span className="wordmark-dot">.</span></a>
          <span className="mono">MADE WITH ❤️ IN PHILADELPHIA · (ɔ) 0x7EA</span>
          <div className="socials">
            <a href="https://github.com/cagokcek" aria-label="GitHub"><Github size={17} /></a>
            <a href="https://www.linkedin.com/in/gokcekca" aria-label="LinkedIn"><Linkedin size={17} /></a>
            <a href="mailto:cagokcek@gmail.com" aria-label="Email"><Mail size={17} /></a>
          </div>
        </footer>
      </div>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
