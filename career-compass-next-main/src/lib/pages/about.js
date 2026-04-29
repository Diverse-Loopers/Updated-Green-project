import { supabase } from '../supabase';
import * as THREE from 'three';

// Three.js Animation Setup
export function initThreeJsAnimation() {
    if (typeof window === 'undefined') return null;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.002);

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
    });

    const container = document.getElementById("canvas-container");
    if (!container) return null;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create Particles (Nodes)
    const geometry = new THREE.BufferGeometry();
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    const color1 = new THREE.Color(0x6366f1); // Indigo
    const color2 = new THREE.Color(0x2dd4bf); // Teal

    for (let i = 0; i < particlesCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 25;
        posArray[i + 1] = (Math.random() - 0.5) * 25;
        posArray[i + 2] = (Math.random() - 0.5) * 25;

        const mixedColor = Math.random() > 0.5 ? color1 : color2;
        colorsArray[i] = mixedColor.r;
        colorsArray[i + 1] = mixedColor.g;
        colorsArray[i + 2] = mixedColor.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colorsArray, 3));

    const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);

    // Add geometric shapes
    const loopGeometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const loopMaterial = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.05,
    });
    const loopMesh = new THREE.Mesh(loopGeometry, loopMaterial);
    scene.add(loopMesh);

    camera.position.z = 5;

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const handleMouseMove = (event) => {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    };

    document.addEventListener("mousemove", handleMouseMove);

    // Scroll Interaction
    let scrollY = 0;
    const handleScroll = () => {
        scrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        const elapsedTime = clock.getElapsedTime();

        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        particlesMesh.rotation.y = 0.1 * elapsedTime;
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);

        loopMesh.rotation.z = -0.1 * elapsedTime;
        loopMesh.rotation.x = scrollY * 0.0005;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();

    // Handle Resize
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleResize);
        if (container && renderer.domElement) {
            container.removeChild(renderer.domElement);
        }
    };
}

// Scroll Reveal Logic
export function initScrollReveal() {
    if (typeof window === 'undefined') return;

    const observerOptions = {
        threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, observerOptions);

    document.querySelectorAll(".reveal").forEach((el) => {
        observer.observe(el);
    });

    return () => {
        observer.disconnect();
    };
}

// Hybrid Hustler Registration
export async function registerHybridHustler(formData) {
    const data = {
        full_name: formData.get("name"),
        college_name: formData.get("college"),
        email_id: formData.get("email"),
        contact_number: formData.get("contact"),
        core_technology: formData.get("tech"),
        course_year: formData.get("year"),
        semester: parseInt(formData.get("semester"), 10),
        roll_no: formData.get("roll"),
    };

    // Safe Auth Check
    let userId = null;
    try {
        const authResponse = await supabase.auth.getUser();
        if (authResponse && authResponse.data && authResponse.data.user) {
            userId = authResponse.data.user.id;
        }
    } catch (authError) {
        console.warn("Auth check failed (proceeding as guest):", authError);
    }

    if (userId) {
        data.user_id = userId;
    }

    try {
        const { error } = await supabase
            .from("hybrid_hustler_registrations")
            .insert([data]);

        if (error) {
            console.error("Supabase Insert Error:", error);

            if (error.code === "23505" && error.details && error.details.includes("email_id")) {
                return {
                    success: false,
                    message: "Registration failed: This email address is already registered."
                };
            } else if (error.code === "42P01") {
                return {
                    success: false,
                    message: 'System Error: The table "hybrid_hustler_registrations" does not exist.'
                };
            } else if (error.code === "42501") {
                return {
                    success: false,
                    message: "Permission Error: RLS policy is blocking the insert. Check Supabase settings."
                };
            } else {
                return {
                    success: false,
                    message: `Registration failed: ${error.message}`
                };
            }
        }

        const firstName = data.full_name.split(" ")[0];
        return {
            success: true,
            message: `Success! Thank you, ${firstName}! Your registration has been saved.`
        };

    } catch (e) {
        console.error("Unexpected Registration Error:", e);
        return {
            success: false,
            message: "An unexpected network error occurred. Try with a different Email ID."
        };
    }
}
