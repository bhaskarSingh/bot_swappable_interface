import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { DAppProvider, useReady, useWallet, useConnect } from './dapp';
import Profile from './Profile';
import Marketplace from './Marketplace';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
ReactDOM.render(
  <DAppProvider appName={'BOTS'}>
    <React.StrictMode>
      <Router>
        <Switch>
          <Route path="/marketplace">
            <DAppProvider appName={'BOTS'}>
              <Marketplace />
            </DAppProvider>
          </Route>
          <Route path="/profile">
            <Profile />
          </Route>
          <Route path="/">
            <App />
          </Route>
        </Switch>
      </Router>
    </React.StrictMode>
  </DAppProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
