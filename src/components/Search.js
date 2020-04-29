import React, { Component } from 'react'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'

import Link from './Link'

const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
      links {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`

class Search extends Component {
  state = {
    links: [],
    filter: '',
  }
  render() {
    return (
      <div>
        <div>
          Search
          {/* 検索語入力領域 */}
          <input
            type='text'
            onChange={e => this.setState({ filter: e.target.value })}
          />
          {/* 検索ボタン */}
          <button onClick={() => this._executeSearch()}>OK</button>
        </div>

        {/* 検索結果表示 */}
        {this.state.links.map((link, index) => (
          <Link
            key={link.id}
            link={link}
            index={index} />
        ))}
      </div>
    )
  }

  _executeSearch = async () => {
    const { filter } = this.state
    const result = await this.props.client.query({
      query: FEED_SEARCH_QUERY,
      variables: { filter },
    })
    const links = result.data.feed.links
    this.setState({ links })
  }
}

export default withApollo(Search)
