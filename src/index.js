import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import gql from "graphql-tag";
import { BrowserRouter } from 'react-router-dom'
import { setContext } from 'apollo-link-context'

import './styles/index.css'
import { AUTH_TOKEN } from './constants'
import App from './components/App'
import * as serviceWorker from './serviceWorker';

const httpLink = createHttpLink({
  uri: 'https://morning-sands-20248.herokuapp.com/',
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
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
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
