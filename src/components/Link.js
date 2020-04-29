import React, { Component } from 'react'
import { AUTH_TOKEN } from '../constants'
import { timeDifferenceForDate } from '../utils'

class Link extends Component {
  render() {

    const authToken = localStorage.getItem(AUTH_TOKEN)

    return (
      <div className="flex mt2 items-start">
        <div className="flex items-center">

          { /* Index */}
          <span className="gray">{this.props.index + 1}.</span>

          { /* Vote button */}
          <div className="ml1 gray f11" onClick={() => this._voteForLink()}>
            ▲
          </div>

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
            {timeDifferenceForDate(this.props.link.createdAt)}
          </div>
        </div>
      </div>
    )
  }

}


export default Link;
