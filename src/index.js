import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import gql from "graphql-tag";

import './styles/index.css'
import App from './components/App'
import * as serviceWorker from './serviceWorker';

const httpLink = createHttpLink({
  uri: 'https://morning-sands-20248.herokuapp.com/',
})

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  onError: ({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      console.log(graphQLErrors.toString())
    }
    if (networkError) {
      console.log(networkError.toString())
    }
  }
});

const query = gql`
  {
    info
  }
`

client
  .query({
    query
  })
  .then(result => console.log(result));

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
