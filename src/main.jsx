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
    type: 'DATA · COMMERCE',
    title: 'Sales intelligence, without the noise.',
    description: 'A focused reporting layer connecting Shopify data to a lightweight dashboard, with daily sales breakdowns and custom business logic.',
    tags: ['TypeScript', 'Supabase', 'Shopify API']
  },
  {
    number: '02',
    type: 'LOCAL CONTROL · HARDWARE',
    title: 'A better interface for the things around us.',
    description: 'A local-first browser interface for controlling Sengled devices through a Python command-line tool—fast controls, no cloud dependency in the UI.',
    tags: ['React', 'Python', 'UDP']
  },
  {
    number: '03',
    type: 'TOOLS · AUTOMATION',
    title: 'Small tools that remove friction.',
    description: 'A barcode and label workflow built around generated SVGs, keyboard-wedge scanners, QR codes, and reliable thermal printing.',
    tags: ['React', 'SVG', 'Printing']
  },
  {
    number: '04',
    type: 'REALTIME · GAME DEVELOPMENT',
    title: 'Turning runtime worlds into authored worlds.',
    description: 'Exploring ways to capture dynamically generated Unity scenes and turn runtime state into editable, persistent scene assets.',
    tags: ['Unity', 'C#', 'Editor tooling']
  }
];

function App() {
  return (
    <>
      <FluidField />
      <div className="site-shell">
        <header className="topbar">
          <a className="wordmark" href="#top"><span className="mark">✳</span> CG<span className="wordmark-dot">.</span></a>
          <nav>
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#resume">Resume</a>
          </nav>
          <a className="availability" href="mailto:hello@example.com"><span /> Open to interesting work</a>
        </header>

        <main id="top">
          <section className="hero">
            <motion.div className="hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: [.2,.7,.2,1] }}>
              <p className="eyebrow"><span className="eyebrow-line" /> SOFTWARE ENGINEERING · SYSTEMS · EXPERIMENTS</p>
              <h1>Making useful things<br /><span className="muted">work beautifully.</span></h1>
              <p className="hero-description">I like building software that connects the dots between people, systems, and the physical world. I’m drawn to practical problems, thoughtful interfaces, and figuring out how things actually work.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#work">Explore selected work <ArrowDownRight size={17} /></a>
                <a className="text-link" href="#about">A little about me <MoveUpRight size={15} /></a>
              </div>
            </motion.div>
            <motion.div className="hero-side" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .25, duration: .8 }}>
              <div className="orb-wrap"><div className="orb"><div className="orb-core" /></div><span className="orb-label">INTERACTIVE FIELD / 001</span></div>
              <div className="side-note"><span className="mono">CURRENTLY</span><p>Building, breaking,<br />and learning by doing.</p></div>
            </motion.div>
            <div className="hero-index mono">PHILADELPHIA, PA <span>—</span> 2026</div>
          </section>

          <section className="ticker" aria-label="Areas of interest">
            <div className="ticker-track"><span>SOFTWARE</span><i>✳</i><span>SYSTEMS THINKING</span><i>✳</i><span>INTERFACES</span><i>✳</i><span>HARDWARE</span><i>✳</i><span>SOFTWARE</span><i>✳</i><span>SYSTEMS THINKING</span><i>✳</i><span>INTERFACES</span><i>✳</i><span>HARDWARE</span><i>✳</i></div>
          </section>

          <section className="section work-section" id="work">
            <div className="section-heading">
              <div><p className="eyebrow">01 / SELECTED WORK</p><h2>Things I’ve been<br /><span className="muted">working on.</span></h2></div>
              <p className="section-aside">A few directions I’ve explored.<br />Some shipped, some still evolving.</p>
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
              <h2>Curious by default.<br /><span className="muted">Practical by design.</span></h2>
              <div className="about-columns">
                <p>I’m interested in the space where software meets the real world: business systems, hardware, automation, creative tools, and the messy details that make products useful.</p>
                <p>I learn by building. I enjoy taking something opaque, understanding the moving parts, and making it simpler to use. Outside the editor, I’m usually curious about machines, music, games, and how things are put together.</p>
              </div>
              <div className="interest-grid">
                <span>01 <b>Building useful software</b></span><span>02 <b>Reverse-engineering systems</b></span><span>03 <b>Motorcycles & machines</b></span><span>04 <b>Games, music & design</b></span>
              </div>
            </div>
          </section>

          <section className="resume-section section" id="resume">
            <div className="resume-card">
              <div><p className="eyebrow">03 / THE PROFESSIONAL VERSION</p><h2>Want the details?</h2><p className="resume-copy">Experience, skills, and the full story—neatly packaged.</p></div>
              <a className="button button-primary" href="/resume.pdf" target="_blank" rel="noreferrer"><Download size={17} /> Download resume <ArrowUpRight size={16} /></a>
              <span className="resume-stamp mono">PDF / 2026</span>
            </div>
            <p className="resume-hint">Add your PDF as <code>public/resume.pdf</code> to activate the download link.</p>
          </section>

          <section className="contact-section section">
            <p className="eyebrow">04 / SAY HELLO</p>
            <h2>Have something<br /><span className="muted">interesting in mind?</span></h2>
            <a className="contact-link" href="mailto:hello@example.com">hello@example.com <ArrowUpRight size={22} /></a>
          </section>
        </main>

        <footer className="footer">
          <a className="wordmark" href="#top"><span className="mark">✳</span> CG<span className="wordmark-dot">.</span></a>
          <span className="mono">BUILT WITH CURIOSITY · © 2026</span>
          <div className="socials">
            <a href="https://github.com/" aria-label="GitHub"><Github size={17} /></a>
            <a href="https://www.linkedin.com/" aria-label="LinkedIn"><Linkedin size={17} /></a>
            <a href="mailto:hello@example.com" aria-label="Email"><Mail size={17} /></a>
          </div>
        </footer>
      </div>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
