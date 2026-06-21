"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
}

export function CursorTrail() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let mouseX = 0;
        let mouseY = 0;
        let animationId: number;
        const particles: Particle[] = [];

        function resize() {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function onMouseMove(e: MouseEvent) {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Spawn particles on movement
            for (let i = 0; i < 2; i++) {
                particles.push({
                    x: mouseX,
                    y: mouseY,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() - 0.5) * 1.5,
                    life: 0,
                    maxLife: 30 + Math.random() * 20,
                    size: 1.5 + Math.random() * 2,
                });
            }

            // Limit particle count
            while (particles.length > 60) {
                particles.shift();
            }
        }

        function animate() {
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life++;

                const progress = p.life / p.maxLife;
                const alpha = 1 - progress;

                if (progress >= 1) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(109, 92, 255, ${alpha * 0.4})`;
                ctx.fill();
            }

            animationId = requestAnimationFrame(animate);
        }

        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", onMouseMove);
        animate();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return <canvas ref={canvasRef} id="cursor-trail" />;
}