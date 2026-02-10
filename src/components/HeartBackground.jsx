import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const HeartBackground = ({ svgPath }) => {
    const [init, setInit] = useState(false);

    // Inizializzazione globale dell'engine (si fa una volta sola)
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const options = {
        background: { color: "#0f172a" },
        fullScreen: { enable: true, zIndex: -10 },
        particles: {
            number: { value: 30 },
            shape: {
                type: "image",
                options: {
                    image: { src: svgPath, width: 100, height: 100 }
                }
            },
            size: { value: { min: 10, max: 20 } },
            move: { enable: true, speed: 2, direction: "top" },
            opacity: { value: 0.5 },
            wobble: {
                enable: true,
                distance: 10,
                speed: 10
            },
            rotate: {
                value: { min: 0, max: 360 },
                animation: { enable: true, speed: 5 }
            },
            
        }
    };

    if (!init) return <div className="fixed inset-0 bg-slate-900" />;

    return (
        <Particles
            id="tsparticles"
            options={options}
            className="block fixed inset-0"
        />
    );
};

export default HeartBackground;