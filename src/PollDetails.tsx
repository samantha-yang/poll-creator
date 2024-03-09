import React, { Component, MouseEvent, ChangeEvent } from 'react';
import { Poll, parsePoll } from './Poll';
import { isRecord } from './record';

type DetailsProps = {
  name: string,
  onBackClick: () => void,
};

type DetailsState = {
  now: number,
  poll: Poll | undefined,
  voter: string,
  userVotes: Array<string>,
  error: string,
  choice: string,
  voteRecorded: boolean
};

export class PollDetails extends Component<DetailsProps, DetailsState> {

  constructor(props: DetailsProps) {
    super(props);

    this.state = {now: Date.now(), poll: undefined, voter: "", userVotes: [], error: "", choice: "", voteRecorded: false};
  }

  componentDidMount = (): void => {
    this.doRefreshClick(); 
  };

  render = (): JSX.Element => {
    if (this.state.poll === undefined) {
      return <p>Loading polls "{this.props.name}"...</p>
    } else {
      if (this.state.poll.endTime <= this.state.now) {
        return this.renderCompleted(this.state.poll);
      } else {
        return this.renderOngoing(this.state.poll);
      }
    }
  };

  renderCompleted = (poll: Poll): JSX.Element => {
    const min = Math.round((poll.endTime - this.state.now) / 60 / 100) / 10;
    const done = (min > 0) ? "" :
            <span> Closed {min * -1} minutes ago.</span>;

    // Create a map which maps options to num of votes
    const votes: Map<string, number> = new Map();
    for (const val of poll.vote) {
      const num = votes.get(val);
      if (num === undefined) {
        votes.set(val, 1);
      } else {
        votes.set(val, num + 1);
      }
    }
    
    // List out the percentages and options
    const items: JSX.Element[] = [];
    for (const choice of poll.options) {
      const voteCount = votes.get(choice);
      if (voteCount !== undefined) {
        const percentage = Math.floor((voteCount / poll.vote.length) * 100);
        items.push(
          <li>{percentage}% – {choice}</li>
        );
      } else {
        items.push(
          <li>0% – {choice}</li>
        );
      }
    }
    return (
      <div>
        <h2>{poll.name}</h2>
        <p>{done}</p>
        <ul>{items}</ul>
        <button type="button" onClick={this.doBackClick}>Back</button>
        <button type="button" onClick={this.doRefreshClick}>Refresh</button>
      </div>);
  };

  renderOngoing = (poll: Poll): JSX.Element => {
    const min = Math.round((poll.endTime - this.state.now) / 60 / 100) / 10;
    const items: JSX.Element[] = [];
    for (const val of poll.options) {
      items.push(
        <div key={val}>
          <input type="radio" id={val} name="item" value={val} onChange={this.doChoiceChange}/>
          <label htmlFor={val}>{val}</label>
        </div>
      );
    }
    if (this.state.voteRecorded) {
      return (
        <div>
          <h2>{poll.name}</h2>
          <p>Closes in {min} minutes...</p>
          <div>
            <ul>{items}</ul>
          </div>
          <label htmlFor="name">Voter Name:&nbsp;</label>
              <input type="text" id="name" value={this.state.voter} onChange={this.doVoterChange}></input>
          <br></br>
          <button type="button" onClick={this.doBackClick}>Back</button>
          <button type="button" onClick={this.doRefreshClick}>Refresh</button>
          <button type="button" onClick={this.doVoteClick}>Vote</button>
          {this.renderError()}
          <p>Recorded vote of "{this.state.voter}" as "{this.state.choice}"</p>
        </div>);
    } else {
      return (
        <div>
          <h2>{poll.name}</h2>
          <p>Closes in {min} minutes...</p>
          <div>
            <ul>{items}</ul>
          </div>
          <label htmlFor="name">Voter Name:&nbsp;</label>
              <input type="text" id="name" value={this.state.voter} onChange={this.doVoterChange}></input>
          <br></br>
          <button type="button" onClick={this.doBackClick}>Back</button>
          <button type="button" onClick={this.doRefreshClick}>Refresh</button>
          <button type="button" onClick={this.doVoteClick}>Vote</button>
          {this.renderError()}
        </div>);
    }
  };

  renderError = (): JSX.Element => {
    if (this.state.error.length === 0) {
      return <div></div>;
    } else {
      const style = {width: '300px', backgroundColor: 'rgb(246,194,192)',
          border: '1px solid rgb(137,66,61)', borderRadius: '5px', padding: '5px' };
      return (<div style={{marginTop: '15px'}}>
          <span style={style}><b>Error</b>: {this.state.error}</span>
        </div>);
    }
  };

  doRefreshClick = (): void => {
    this.setState({voteRecorded: false});
    const name = this.props.name;
    const url = "/api/get?name=" + encodeURIComponent(name);
    fetch(url)
      .then(this.doGetResp)
      .catch(() => this.doGetError("failed to connect to server"));
  };

  doGetResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doGetJson)
          .catch(() => this.doGetError("200 res is not JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doGetError)
          .catch(() => this.doGetError("400 response is not text"));
    } else {
      this.doGetError(`bad status code from /api/get: ${res.status}`);
    }
  };

  doGetJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /api/get: not a record", data);
      return;
    }

    this.doPollChange(data);
  }

  doPollChange = (data: {poll?: unknown}): void => {
    const poll = parsePoll(data.poll);
    if (poll !== undefined) {
        this.setState({poll: poll, now: Date.now(), error: "", userVotes: poll.vote});
    } else {
      console.error("poll from /api/get did not parse", data.poll)
    }
  };

  doGetError = (msg: string): void => {
    console.error(`Error fetching /api/get: ${msg}`);
  };

  doVoterChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({voter: evt.target.value, error: "", voteRecorded: false});
  };

  doChoiceChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({choice: evt.target.value, error: "", voteRecorded: false, voter: ""});
  }

  doVoteClick = (_: MouseEvent<HTMLButtonElement>): void => {
    if (this.state.poll === undefined)
      throw new Error("impossible");

    // Verify that the user entered all required information.
    if (this.state.voter.trim().length === 0 ||
        this.state.choice.trim().length === 0) {
      this.setState({error: "a required field is missing."});
      return;
    }

    this.setState({voteRecorded: true});
    const args = {name: this.props.name, voterName: this.state.voter, userVote: this.state.choice};
    fetch("/api/vote", {
        method: "POST", body: JSON.stringify(args),
        headers: {"Content-Type": "application/json"} })
      .then(this.doVoteResp)
      .catch(() => this.doVoteError("failed to connect to server"));
  };

  doVoteResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doVoteJson)
          .catch(() => this.doVoteError("200 response is not JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doVoteError)
          .catch(() => this.doVoteError("400 response is not text"));
    } else {
      this.doVoteError(`bad status code from /api/vote: ${res.status}`);
    }
  };

  doVoteJson = (data: unknown): void => {
    if (this.state.poll === undefined)
      throw new Error("impossible");

    if (!isRecord(data)) {
      console.error("bad data from /api/bid: not a record", data);
      return;
    }

    this.doPollChange(data);
  };

  doVoteError = (msg: string): void => {
    console.error(`Error fetching /api/vote: ${msg}`);
  };

  doBackClick = (_: MouseEvent<HTMLButtonElement>): void => {
    this.props.onBackClick();
  };
}