import React, {useEffect} from 'react';
import { APP_NAME, NETWORK, CONTRACT_ADDRESS } from './defaults';
import {useAsync} from 'react-use';

export default function Profile() {
    
    const state = useAsync(async () => {
        const response = await fetch(`https://api.better-call.dev/v1/contract/${NETWORK}/${CONTRACT_ADDRESS}/storage`);
        const result = await response.json();
        const tokens = result.children.find((elm) => elm.name === "tokens");
        const tk = await fetch(`https://api.better-call.dev/v1/bigmap/${NETWORK}/${tokens.value}/keys`);
        const all_tokens = await tk.json();
        console.log(all_tokens);
        return all_tokens
    }, []);

    console.log(state)

  return <div><p>All Cryptobots</p>
{state.loading
        ? <div>Loading...</div>
        : state.error
          ? <div>Error: {state.error.message}</div>
          : <div>{state.value.map(elm => {
              return elm.data.value.children[4].children ? <model-viewer camera-controls alt="BOT" src={`${elm.data.value.children[4].children[0].value}`}>
                    </model-viewer> : null;
          })}</div>
      }
  {/* <model-viewer camera-controls alt="A 3D model of an astronaut" src="https://3dcryptobots.s3.ap-south-1.amazonaws.com/bd6e98cf1a49d488cb72cb5e196ef31dfc801e1d.glb">
</model-viewer> */}
  </div>;
}
