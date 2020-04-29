import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import { AUTH_TOKEN } from '../constants'
import { timeDifferenceForDate } from '../utils'

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
       id
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

class Link extends Component {
  render() {

    const authToken = localStorage.getItem(AUTH_TOKEN)

    return (
      <div className="flex mt2 items-start">
        <div className="flex items-center">

          { /* Index */}
          <span className="gray">{this.props.index + 1}.</span>

          { /* Vote button */}
          {authToken && (
            <Mutation 
              mutation={VOTE_MUTATION}
              variables={{linkId: this.props.link.id}}
              update={ (store, { data: {vote}}) => 
                this.props.updateCacheAfterVote(store, vote, this.props.link.id)
              }
              >
              { /* RenderPropFunction の定義 
                clickで関数を呼び出せるようにする
              */}
              {voteMutation => (
                <div className="ml1 gray f11" onClick={voteMutation}>
                  ▲
                </div>
              )}
            </Mutation>

          )}
        </div>
        <div className="ml1">

          {/* Link情報 */}
          <div>
            {this.props.link.description} ({this.props.link.url})
          </div>

          <div className="f6 lh-copy gray">
            {/* Vote数 */}
            {this.props.link.votes.length} votes

            | by{' '}

            {/* 投稿者 */}
            {this.props.link.postedBy
              ? this.props.link.postedBy.name
              : 'Unknown'}{' '}

            {/* 投稿経過時間 */}
            {timeDifferenceForDate(this.props.link.createdAt)}
          </div>
        </div>
      </div>
    )
  }
}

export default Link;
