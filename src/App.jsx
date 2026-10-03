import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import ZustandBackground from "./components/ZustandBackground";

function App() {
  return (
    <>
      <UI />
      <Loader />

      {/* Background Canvas — DepthOfField + Vignette dari zustand */}
      <Canvas
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
        orthographic
        camera={{ zoom: 5, position: [0, 0, 200], far: 300, near: 50 }}
      >
        <Suspense fallback={null}>
          <ZustandBackground />
        </Suspense>
      </Canvas>

      {/* Main Canvas — book, no blur */}
      <Canvas
        shadows
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
        camera={{
          position: [0, 0, window.innerWidth > 800 ? 4 : 8],
          fov: 45,
        }}
        gl={{ alpha: true }}
      >
        <group position-y={0}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </group>
      </Canvas>
    </>
  );
}

export default App;
