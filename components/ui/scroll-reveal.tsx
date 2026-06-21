"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    delay?: number;
    direction?: "up" | "left" | "right";
    className?: string;
}

export function ScrollReveal({
    children,
    delay = 0,
    direction = "up",
    className = "",
}: ScrollRevealProps) {
    const directionMap = {
        up: { y: 20, x: 0 },
        left: { y: 0, x: -20 },
        right: { y: 0, x: 20 },
    };

    const offset = directionMap[direction];

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: offset.y, x: offset.x }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            {children}
        </motion.div>
    );
}