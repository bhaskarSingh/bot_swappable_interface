import React, { useEffect, useState } from 'react';
import { APP_NAME, NETWORK, CONTRACT_ADDRESS } from './defaults';
import { useAsync } from 'react-use';
import {
  DAppProvider,
  useReady,
  useWallet,
  useConnect,
  useTezos,
  useOnBlock,
} from './dapp';
export default function Profile() {
  const [value, setValue] = useState();
  const wallet = useWallet();
  const ready = useReady();
  const connect = useConnect();
  const tezos = useTezos();

  const offer = useAsync(async () => {
    const response = await fetch(
      `https://api.better-call.dev/v1/contract/${NETWORK}/${CONTRACT_ADDRESS}/storage`
    );
    const result = await response.json();
    const tokens = result.children.find((elm) => elm.name === 'offer');
    const tk = await fetch(
      `https://api.better-call.dev/v1/bigmap/${NETWORK}/${tokens.value}/keys`
    );
    const all_tokens = await tk.json();
    console.log('offer', all_tokens);
    return all_tokens;
  }, []);

  const bidder = useAsync(async () => {
    const response = await fetch(
      `https://api.better-call.dev/v1/contract/${NETWORK}/${CONTRACT_ADDRESS}/storage`
    );
    const result = await response.json();
    const tokens = result.children.find((elm) => elm.name === 'bid');
    const tk = await fetch(
      `https://api.better-call.dev/v1/bigmap/${NETWORK}/${tokens.value}/keys`
    );
    const all_tokens = await tk.json();
    console.log('bidder', all_tokens);
    return all_tokens;
  }, []);

  const state = useAsync(async () => {
    const response = await fetch(
      `https://api.better-call.dev/v1/contract/${NETWORK}/${CONTRACT_ADDRESS}/storage`
    );
    const result = await response.json();
    const tokens = result.children.find((elm) => elm.name === 'tokens');
    const tk = await fetch(
      `https://api.better-call.dev/v1/bigmap/${NETWORK}/${tokens.value}/keys`
    );
    const all_tokens = await tk.json();
    console.log(all_tokens);
    return all_tokens;
  }, []);

  const handleConnect = React.useCallback(async () => {
    try {
      await connect(NETWORK);
      //TODO: linking tezos account to email id + name
      // alert('yo');
    } catch (err) {
      alert(err.message);
    }
  }, [connect]);

  const offerBotForSale = React.useCallback(async (token_id, sale_price) => {
    console.log(ready);
    if (ready) {
      const contract = await tezos.wallet.at(CONTRACT_ADDRESS);
      console.log(contract);

      try {
        const op = await contract.methods
          .offer_bot_for_sale(Number(sale_price), Number(token_id))
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

  const withdrawBotFromSale = React.useCallback(async (token_id) => {
    if (ready) {
      const contract = await tezos.wallet.at(CONTRACT_ADDRESS);
      console.log(contract);

      try {
        const op = await contract.methods
          .bot_no_longer_for_sale(Number(token_id))
          .send();
        console.log('op', op);
        // setOperation(op);
      } catch (err) {
        alert(err.message);
      }
    }
  });
  const acceptBidForBot = React.useCallback(async (token_id) => {
    if (ready) {
      const contract = await tezos.wallet.at(CONTRACT_ADDRESS);
      console.log(contract);

      try {
        const op = await contract.methods
          .accept_bid_for_bot(Number(token_id))
          .send();
        console.log('op', op);
        // setOperation(op);
      } catch (err) {
        alert(err.message);
      }
    }
  });

  console.log(state);

  return (
    <div>
      <model-viewer
        camera-controls
        alt="BOT"
        src={`${'https://cloudflare-ipfs.com/ipfs/QmYmXc26Waty3iCgCdDdQZe7w7XbciZh7TNjTEcF7rX2pf'}`}
      ></model-viewer>
      <p>All Cryptobots</p>
      {state.loading ? (
        <div>Loading...</div>
      ) : state.error ? (
        <div>Error: {state.error.message}</div>
      ) : (
        <div>
          {state.value.map((elm) => {
            return elm.data.value.children[4].children ? (
              <div>
                <model-viewer
                  camera-controls
                  alt="BOT"
                  src={`${elm.data.value.children[4].children[0].value}`}
                ></model-viewer>
                <div>
                  <div>share your bot on social media</div>
                  sale price(mutez):{' '}
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                  token-id : {elm.data.value.children[0].value}
                  <button
                    onClick={() => {
                      handleConnect();
                      offerBotForSale(elm.data.value.children[0].value, value);
                      console.log('t');
                    }}
                  >
                    Offer bot for sale
                  </button>
                  <div>
                    <button
                      onClick={() => {
                        handleConnect();
                        withdrawBotFromSale(elm.data.value.children[0].value);
                        console.log('t');
                      }}
                    >
                      Withdraw bot from sale
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        handleConnect();
                        acceptBidForBot(elm.data.value.children[0].value);
                        console.log('t');
                      }}
                    >
                      Accept bid for bot(Highest bidder price will automatically
                      be selected)
                    </button>
                    <p>Highest bid price: </p>
                    <p>List of bidders: </p>
                  </div>
                </div>
              </div>
            ) : null;
          })}
        </div>
      )}
      {/* <model-viewer camera-controls alt="A 3D model of an astronaut" src="https://3dcryptobots.s3.ap-south-1.amazonaws.com/bd6e98cf1a49d488cb72cb5e196ef31dfc801e1d.glb">
</model-viewer> */}
    </div>
  );
}
