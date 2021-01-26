import React, { useState } from 'react';
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
export default function Marketplace() {
  const [bidAmount, updateBid] = useState();
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
  const buy_bot = async (token_id, sale_price) => {
    console.log(ready);
    if (ready) {
      const contract = await tezos.wallet.at(CONTRACT_ADDRESS);
      console.log(contract);
      console.log('sale price', sale_price);
      const sendArgs = { amount: sale_price, mutez: true };

      try {
        const op = await contract.methods
          .purchase_bot_at_sale_price(Number(token_id))
          .send(sendArgs);
        console.log('op', op);
        // setOperation(op);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const enter_bid = async (token_id, sale_price) => {
    console.log(ready);
    if (ready) {
      const contract = await tezos.wallet.at(CONTRACT_ADDRESS);
      console.log(contract);
      console.log('sale price', sale_price);
      const sendArgs = { amount: sale_price, mutez: true };

      try {
        const op = await contract.methods
          .enter_bid_for_bot(Number(token_id))
          .send(sendArgs);
        console.log('op', op);
        // setOperation(op);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  //   const bidList = useAsync(async (current_token_id = 5) => {
  //     const response = await fetch(
  //       `https://api.better-call.dev/v1/contract/${NETWORK}/${CONTRACT_ADDRESS}/storage`
  //     );
  //     const result = await response.json();
  //     const tokens = result.children.find((elm) => elm.name === 'bid');
  //     const tk = await fetch(
  //       `https://api.better-call.dev/v1/bigmap/${NETWORK}/${tokens.value}/keys`
  //     );
  //     const all_tokens = await tk.json();
  //     const token_bid_list = all_tokens.filter(
  //       (el) => el.data.key.value === current_token_id.toString()
  //     );

  //     const all = token_bid_list[0].data.value.children.map((elm) => {
  //       return {
  //         token_id: current_token_id,
  //         bid_value: elm.children[0].value,
  //         bidder: elm.children[1].value,
  //         has_bid: elm.children[2].value,
  //       };
  //     });

  //     const max = all.reduce(function (prev, current) {
  //       return prev.bid_value > current.bid_value ? prev : current;
  //     }); //returns object
  //     console.log('ok', all);
  //     console.log('ok', max);
  //     return {
  //       all_bids: all,
  //       highest_bid: max,
  //     };
  //   }, []);

  //   const bidList = useAsync(async (token_id = 5) => {
  //     const response = await fetch(
  //       `https://api.better-call.dev/v1/contract/${NETWORK}/${CONTRACT_ADDRESS}/storage`
  //     );
  //     const result = await response.json();
  //     const tokens = result.children.find((elm) => elm.name === 'bid');
  //     const tk = await fetch(
  //       `https://api.better-call.dev/v1/bigmap/${NETWORK}/${tokens.value}/keys`
  //     );
  //     const all_tokens = await tk.json();
  //     const token_bid_list = all_tokens.filter(
  //       (el) => el.data.key.value === token_id.toString()
  //     );
  //     const mapped = token_bid_list[0].data.value.children.map((elm) => {
  //       // {
  //       //     token_id: "",
  //       //     bid_value: "",
  //       //     bidder_address: "",
  //       //     has_bid: ""
  //       // }
  //       return {
  //         token_id: token_id,
  //         bid_value: elm.children[0].value,
  //         address: elm.children[1].value,
  //         has_bid: elm.children[3].value,
  //       };
  //     });

  //     console.log('bid', all_tokens);
  //     return all_tokens;
  //   }, []);

  const offer = useAsync(async () => {
    const response = await fetch(
      `https://api.better-call.dev/v1/contract/${NETWORK}/${CONTRACT_ADDRESS}/storage`
    );
    const result = await response.json();
    const offerToken = result.children.find((elm) => elm.name === 'offer');
    const nftToken = result.children.find((elm) => elm.name === 'tokens');
    const offertk = await fetch(
      `https://api.better-call.dev/v1/bigmap/${NETWORK}/${offerToken.value}/keys`
    );
    const nfttk = await fetch(
      `https://api.better-call.dev/v1/bigmap/${NETWORK}/${nftToken.value}/keys`
    );

    const on_sale_tokens = await offertk.json();
    const filtered_on_sale_tokens = on_sale_tokens.filter(
      (elm) => elm.data.value !== null
    );
    const all_nft_tokens = await nfttk.json();

    // {
    //     token_id: "",
    //     is_for_sale: "true/false",
    //     sale_value: "mutez value",
    //     seller_address: "xtz",
    //     nft_url: "id/direct_url",
    //     token_symbol: "",
    //     name: "",
    //     decimals: "",
    // }
    const combined = filtered_on_sale_tokens.map((el, i) => {
      const token = all_nft_tokens.find(
        (element) => element.data.key.value == el.data.key.value
      );
      return {
        token_id: el.data.key.value,
        is_for_sale: el.data.value.children[0].value,
        sale_value: el.data.value.children[1].value,
        seller_address: el.data.value.children[2].value,
        nft_url: token.data.value.children[4].children[0].value,
        token_symbol: token.data.value.children[1].value,
        name: token.data.value.children[2].value,
        decimals: token.data.value.children[3].value,
      };
    });

    console.log('offer', combined);
    return combined;
  }, []);
  return (
    <div style={{ overflow: 'auto' }}>
      Marketplace
      <h4>List of all the 3D Cryptobots on sale</h4>
      {offer.loading ? (
        <div>Loading...</div>
      ) : offer.error ? (
        <div>Error: {offer.error.message}</div>
      ) : (
        <div>
          {offer.value.map((elm) => {
            return (
              <div>
                <p>token ID: {elm.token_id}</p>
                <p>is_for_sale: {elm.is_for_sale.toString()}</p>
                <p>sale_value: {elm.sale_value} mutez</p>
                <p>seller_address: {elm.seller_address}</p>
                <model-viewer
                  camera-controls
                  alt={`Bot id ${elm.token_id}on sale`}
                  src={`${elm.nft_url}`}
                ></model-viewer>
                <div>
                  <button
                    onClick={() => {
                      handleConnect();
                      buy_bot(elm.token_id, elm.sale_value);
                    }}
                  >
                    Buy now
                  </button>
                  bid value(mutez):{' '}
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => updateBid(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      handleConnect();
                      enter_bid(elm.token_id, bidAmount);
                    }}
                  >
                    Bid
                  </button>
                  {/* {bidList.loading ? (
                    <div>Loading...</div>
                  ) : bidList.error ? (
                    <div>Error: {bidList.error.message}</div>
                  ) : (
                    <div>
                      <p>Highest bidder: </p>
                      bid_value: {bidList.value.highest_bid.bid_value}
                      bidder: {bidList.value.highest_bid.bidder}
                      has_bid: {bidList.value.highest_bid.has_bid}
                      token_id: {bidList.value.highest_bid.token_id}
                    </div>
                  )}
                  <div>
                    <p>list of all bidders</p>
                    {bidList.value.all_bids.map((elm) => {
                      return (
                        <div>
                          bid_value: {elm.bid_value}
                          bidder: {elm.bidder}
                          has_bid: {elm.has_bid}
                          token_id: {elm.token_id}
                        </div>
                      );
                    })}
                  </div> */}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
