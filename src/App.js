import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import {
  ContactShadows,
  Environment,
  useGLTF,
  OrbitControls,
  Html,
} from 'drei';
import { proxy, useProxy } from 'valtio';
import { HexColorPicker } from 'react-colorful';
import 'react-colorful/dist/index.css';
import GLTFExporter from 'three-gltf-exporter';
import * as THREE from 'three';
import {
  DAppProvider,
  useReady,
  useWallet,
  useConnect,
  useTezos,
  useOnBlock,
} from './dapp';

import { MichelsonMap } from '@taquito/taquito';

import { APP_NAME, NETWORK, CONTRACT_ADDRESS } from './defaults';

//TODO: Make every mesh part colorable -- dependent on how the material is named inside blender
const state = proxy({
  current: null,
  items: {
    head: '#ffffff',
    body: '#ffffff',
    hands: '#ffffff',
    legs: '#ffffff',
  },
});

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

const renderGroup = (groupObject, id = 0, color, color_name) => {
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
            child.material.name = color_name;
            return (
              <mesh
                name={child.name}
                material={child.material}
                geometry={child.geometry}
                position={child.position}
                scale={child.scale}
                material-color={color}
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
  const snap = useProxy(state);
  const [hovered, set] = useState(null);

  const wallet = useWallet();
  const ready = useReady();
  const connect = useConnect();
  const tezos = useTezos();

  const handleConnect = React.useCallback(async () => {
    try {
      await connect(NETWORK);
      //TODO: linking tezos account to email id + name
      // alert('yo');
    } catch (err) {
      alert(err.message);
    }
  }, [connect]);

  const mintNFT = React.useCallback(async (URL) => {
    if (ready) {
      console.log('yo');
      const contract = await tezos.wallet.at(CONTRACT_ADDRESS);

      const extra = MichelsonMap.fromLiteral({ id: URL });

      try {
        const op = await contract.methods
          .mint(
            'tz1iLVzBpCNTGz6tCBK2KHaQ8o44mmhLTBio',
            Number(1),
            extra,
            'CB',
            3
          )
          .send();
        console.log('op', op);
        // setOperation(op);
      } catch (err) {
        alert(err.message);
      }

      // const storage = await contract.storage();
      // console.log('storage', storage);
      // setStorage(storage.all_tokens.toString());
    }
  });

  useEffect(() => {
    const cursor = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><g filter="url(#filter0_d)"><path d="M29.5 47C39.165 47 47 39.165 47 29.5S39.165 12 29.5 12 12 19.835 12 29.5 19.835 47 29.5 47z" fill="${snap.items[hovered]}"/></g><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/><text fill="#000" style="white-space:pre" font-family="Inter var, sans-serif" font-size="10" letter-spacing="-.01em"><tspan x="35" y="63">${hovered}</tspan></text></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h64v64H0z"/></clipPath><filter id="filter0_d" x="6" y="8" width="47" height="47" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="2"/><feGaussianBlur stdDeviation="3"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter></defs></svg>`;
    const auto = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/></svg>`;
    document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(
      hovered ? cursor : auto
    )}'), auto`;
  }, [hovered]);

  const link = useRef();

  const head = useGroup(scene, 'head');
  const hand = useGroup(scene, 'hand');
  const body = useGroup(scene, 'body');
  const leg = useGroup(scene, 'leg');

  return (
    <>
      <Html>
        <button
          ref={link}
          onClick={() => {
            const gltfExporter = new GLTFExporter();

            gltfExporter.parse(
              [
                head[headCount],
                hand[bodyCount],
                body[bodyCount],
                leg[legCount],
              ],
              function (result) {
                console.log('result', result);
                const blob = new Blob([result], {
                  type: 'application/octet-stream',
                });

                // const link = document.createElement( 'a' );
                // link.style.display = 'none';
                // window.document.body.appendChild( link );
                // link.href = URL.createObjectURL( blob );
                // link.download = "bot.glb";
                // link.click();
                upload(blob);
              },
              { binary: true }
            );

            function upload(blob) {
              var fd = new FormData();
              // fd.append('bot', blob, 'bot.glb');
              fd.append('file', blob);
              fetch('http://localhost:3005/api/test', {
                method: 'post',
                body: fd,
              })
                .then((res) => {
                  // console.log(res)
                  return res.json();
                })
                .then((res) => {
                  console.log(res);
                  console.log('yo');
                  handleConnect();
                  mintNFT(res.location);
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          }}
        >
          export
        </button>
      </Html>
      <group
        onPointerOver={(e) => (
          e.stopPropagation(), set(e.object.material.name)
        )}
        onPointerOut={(e) => e.intersections.length === 0 && set(null)}
        onPointerMissed={() => (state.current = null)}
        onPointerDown={(e) => {
          e.stopPropagation();
          console.log(e.object);
          state.current = e.object.material.name;
        }}
        ref={group}
        dispose={null}
      >
        {renderGroup(head, headCount, snap.items.head, 'head')}
        {renderGroup(hand, bodyCount, snap.items.hands, 'hands')}
        {renderGroup(body, bodyCount, snap.items.body, 'body')}
        {renderGroup(leg, legCount, snap.items.legs, 'legs')}
      </group>
    </>
  );
};

function Picker() {
  const snap = useProxy(state);
  return (
    <div style={{ display: snap.current ? 'block' : 'none' }}>
      <HexColorPicker
        className="picker"
        color={snap.items[snap.current]}
        onChange={(color) => (state.items[snap.current] = color)}
      />
      <h1>{snap.current}</h1>
    </div>
  );
}

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

  const wallet = useWallet();
  const ready = useReady();
  const connect = useConnect();
  const tezos = useTezos();

  const mintNFT = React.useCallback(async (URL) => {
    if (ready) {
      console.log('yo');
      const contract = await tezos.wallet.at(CONTRACT_ADDRESS);

      const extra = MichelsonMap.fromLiteral({ id: URL });

      try {
        const op = await contract.methods
          .mint(
            'tz1iLVzBpCNTGz6tCBK2KHaQ8o44mmhLTBio',
            Number(1),
            extra,
            'CB',
            1
          )
          .send();
        console.log('op', op);
        // setOperation(op);
      } catch (err) {
        alert(err.message);
      }

      // const storage = await contract.storage();
      // console.log('storage', storage);
      // setStorage(storage.all_tokens.toString());
    }
  });

  const handleConnect = React.useCallback(async () => {
    try {
      await connect(NETWORK);
      //TODO: linking tezos account to email id + name
      // alert('yo');
    } catch (err) {
      alert(err.message);
    }
  }, [connect]);

  return (
    <>
      <Picker />
      <Canvas
        concurrent
        pixelRatio={[1, 1.5]}
        camera={{ position: [0, 0, 5.75], fov: 80 }}
      >
        <ambientLight intensity={0.5} />
        <spotLight
          intensity={0.3}
          angle={0.1}
          penumbra={1}
          position={[5, 25, 20]}
        />
        <Suspense fallback={null}>
          <DAppProvider appName={'BOTS'}>
            <Bot
              headCount={headCount}
              bodyCount={bodyCount}
              legCount={legCount}
            />
          </DAppProvider>
          <Environment files="royal_esplanade_1k.hdr" />
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
      <button
        onClick={() => {
          handleConnect();
          mintNFT();
        }}
        className="leg_right"
      >
        connect
      </button>
    </>
  );
}

export default App;
