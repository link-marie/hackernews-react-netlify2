import React, { Component, Fragment } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import Link from './Link'
import { LINKS_PER_PAGE } from '../constants'

// GraphQL queryを gqlで GraphQL ASTへ変換
export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      links {
        id
        createdAt
        url
        description
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
      count
    }
  }
`

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
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
`

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
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
      user {
        id
      }
    }
  }
`

class LinkList extends Component {
  render() {

    // <Query />を返す
    return (
      // FEED_QUERYを propsとして指定
      <Query
        query={FEED_QUERY}
        variables={this._getQueryVariables()}
      >
        { /* 
        RenderPropFunctionの定義。 
        FEED_QUERYの結果がこの関数に渡される。
        */}
        {({ loading, error, data, subscribeToMore }) => {
          /* データ取得中? */
          if (loading) return <div>Loading..</div>
          /* データ取得できない? */
          if (error) return <div>Error</div>

          // 新しいLink投稿時のイベント
          this._subscribeToNewLinks(subscribeToMore)
          this._subscribeToNewVotes(subscribeToMore)

          /* 取得したデータ */
          const linksToRender = this._getLinksToRender(data)
          const isNewPage = this.props.location.pathname.includes('new')
          const pageIndex = this.props.match.params.page
            ? (this.props.match.params.page - 1) * LINKS_PER_PAGE
            : 0

          return (
            <Fragment>
              {/* 取得したデータの内容を 一つずつ処理 */}
              {linksToRender.map((link, index) => (
                // <Link />の戻され方を定義
                <Link
                  key={link.id}
                  link={link}
                  index={index + pageIndex}
                  updateStoreAfterVote={this._updateCacheAfterVote}
                />
              ))}
              {isNewPage && (
                <div className="flex ml4 mv3 gray">
                  <div className="pointer mr2"
                    onClick={() => this._previousPage()}
                  >
                    Previous
                  </div>
                  <div className="pointer mr2"
                    onClick={() => this._nextPage(data)}
                  >
                    Next
                  </div>
                </div>
              )}
            </Fragment>
          )
        }}
      </Query>
    )
  }

  /**
   Vote実行後の 内部Cacheの update
   */
  _updateCacheAfterVote = (store, remote, linkId) => {
    
    const isNewPage = this.props.location.pathname.includes('new')
    const page = parseInt(this.props.match.params.page, 10)

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null

    // 現在のCacheから 内部データを読み込む
    const localData = store.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy }
    })
    // 指定されたIDの linkを得る
    const localLink = localData.feed.links.find(link => link.id === linkId)
    // 内部Vote情報を更新
    localLink.votes = remote.link.votes
    // 内部Cacheを更新
    store.writeQuery({
      query: FEED_QUERY,
      data: localData
    })
  }

  /**
   * 新しい投稿が行われた時、Client上で自動更新されるようにする
   * 
   * 投稿が行われたら、
   * document:    登録した Queryを実行し、
   * updateQuery: Query結果を統合してその結果を戻す
   */
  _subscribeToNewLinks = (subscribeToMore) => {

    subscribeToMore({

      // Subscription実行時の処理
      document: NEW_LINKS_SUBSCRIPTION,

      // subscriptonイベントを受信した時の処理
      // prev:             subscription前のデータ
      // subscriptionData: イベント発生時に受け取るデータ
      updateQuery: (prev, { subscriptionData }) => {

        // データが受け取れなかったら、そのまま前のデータを戻す
        if (!subscriptionData.data) return prev

        // 'document:' で定義した処理で実行した subscription情報を得る
        const newLink = subscriptionData.data.newLink
        // すでに登録済み?
        const exists = prev.feed.links.find(({ id }) =>
          id === newLink.id
        )
        // 登録済みなら そのまま前のデータを戻す
        if (exists) return prev

        // 元と新データを 複製統合して、結果を戻す
        return Object.assign({}, prev, {
          feed: {
            // link データを統合
            links: [newLink, ...prev.feed.links],
            // count up
            count: prev.feed.links.length + 1,
            // 型を参照する
            __typename: prev.feed.__typename
          }
        })
      }
    })
  }

  /**
   新しい評価が行われた時、Client上で自動更新されるようにする
   */
  _subscribeToNewVotes = subscribeToMore => {
    subscribeToMore({
      // Subscription実行時の処理。
      // 新規評価を問い合わせる
      // Clientで評価が自動更新される
      document: NEW_VOTES_SUBSCRIPTION
    })
  }

  _getQueryVariables = () => {
    const isNewPage = this.props.location.pathname.includes('new')
    const page = parseInt(this.props.match.params.page, 10)

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    return { first, skip, orderBy }
  }

  _getLinksToRender = data => {
    const isNewPage = this.props.location.pathname.includes('new')
    if( isNewPage){
      return data.feed.links
    }
    const rankedLinks = data.feed.links.slice()
    rankedLinks.sort( (l1, l2) => l2.votes.length - l1.votes.length )
    return rankedLinks
  }

  _nextPage = data => {
    const page = parseInt(this.props.match.params.page, 10)
    if( page <= data.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1
      this.props.history.push(`/new/${nextPage}`)
    }
  }

  _previousPage = data => {
    const page = parseInt(this.props.match.params.page, 10)
    if( page > 1) {
      const previousPage = page - 1
      this.props.history.push(`/new/${previousPage}`)
    }
  }
}

export default LinkList
