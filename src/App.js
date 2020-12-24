import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import {
  ContactShadows,
  Environment,
  useGLTF,
  OrbitControls,
  Html,
} from 'drei';

function useGroup(scene, type) {
  const result = [];

  const filterType = [type];
  const regexType = new RegExp(filterType.join('|'), 'i');

  scene.children.forEach((group) => {
    if (regexType.test(group.name)) {
      result.push(group);
    }
  });

  // console.log('result', result);
  return result;
}

const renderGroup = (groupObject, id = 0) => {
  return (
    <>
      <group
        name="bot_head"
        position={groupObject.length > 0 && groupObject[id].position}
        rotation={groupObject.length > 0 && groupObject[id].rotation}
        scale={groupObject.length > 0 && groupObject[id].scale}
      >
        {groupObject.length > 0 &&
          groupObject[id].children.map((child) => {
            return (
              <mesh
                name={child.name}
                material={child.material}
                geometry={child.geometry}
                position={child.position}
                scale={child.scale}
              />
            );
          })}
      </group>
    </>
  );
};

const Bot = ({ headCount, legCount, bodyCount }) => {
  const group = useRef();
  const { scene } = useGLTF('bot.glb');

  const head = useGroup(scene, 'head');
  const hand = useGroup(scene, 'hand');
  const body = useGroup(scene, 'body');
  const leg = useGroup(scene, 'leg');

  return (
    <group ref={group} dispose={null}>
      {renderGroup(head, headCount)}
      {renderGroup(hand, bodyCount)}
      {renderGroup(body, bodyCount)}
      {renderGroup(leg, legCount)}
    </group>
  );
};

const updateCountFunc = (prevCount) => {
  if (prevCount === 1) {
    return 0;
  } else {
    return 1;
  }
};

function App() {
  const [headCount, updateHeadCount] = useState(0);
  const [bodyCount, updateBodyCount] = useState(0);
  const [legCount, updateLegCount] = useState(0);
  return (
    <>
      <Canvas
        concurrent
        pixelRatio={[1, 1.5]}
        camera={{ position: [0, 0, 5.75], fov: 80 }}
      >
        <ambientLight intensity={0.3} />
        <spotLight
          intensity={0.3}
          angle={0.1}
          penumbra={1}
          position={[5, 25, 20]}
        />
        <Suspense fallback={null}>
          <Bot
            headCount={headCount}
            bodyCount={bodyCount}
            legCount={legCount}
          />
          <ContactShadows
            rotation-x={Math.PI / 2}
            position={[0, -0.8, 0]}
            opacity={0.25}
            width={10}
            height={10}
            blur={2}
            far={1}
          />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>
      <button
        onClick={() => updateHeadCount(updateCountFunc)}
        className="head_left"
      >
        {' head <  '}
      </button>
      <button
        onClick={() => updateHeadCount(updateCountFunc)}
        className="head_right"
      >
        {' head > '}
      </button>
      <button
        onClick={() => updateBodyCount(updateCountFunc)}
        className="body_left"
      >
        {' body < '}
      </button>
      <button
        onClick={() => updateBodyCount(updateCountFunc)}
        className="body_right"
      >
        {' body > '}
      </button>
      <button
        onClick={() => updateLegCount(updateCountFunc)}
        className="leg_left"
      >
        {' leg < '}
      </button>
      <button
        onClick={() => updateLegCount(updateCountFunc)}
        className="leg_right"
      >
        {' leg > '}
      </button>
    </>
  );
}

export default App;
