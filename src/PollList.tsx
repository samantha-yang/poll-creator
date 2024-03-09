import React, { Component, MouseEvent } from 'react';
import { Poll, parsePoll } from './Poll';
import { isRecord } from './record';

type PollProps = {
  onNewClick: () => void;
  onPollClick: (name: string) => void;
};

type PollState = {
  now: number;
  polls: Array<Poll>;
}

export class PollList extends Component<PollProps, PollState> {

  constructor(props: PollProps) {
    super(props);
    this.state = {now: Date.now(), polls: []};
  }

  componentDidMount = (): void => {
    this.doRefreshClick();
  }

  componentDidUpdate = (prevProps: PollProps): void => {
    if (prevProps !== this.props) {
      this.setState({now: Date.now()});  // Force a refresh
    }
  };

  render = (): JSX.Element => {
    return (
      <div>
        <h2>Current Polls</h2>
        {this.renderPolls()}
        <button type="button" onClick={this.doRefreshClick}>Refresh</button>
        <button type="button" onClick={this.doNewClick}>New Poll</button>
      </div>);
  };

  renderPolls = (): JSX.Element => {
    if (this.state.polls === undefined) {
      return <p>Currently no polls to list...</p>;
    } else {
      const finishedPolls: JSX.Element[] = [];
      const currentPolls: JSX.Element[] = [];
      for (const poll of this.state.polls) {
        const min = Math.round((poll.endTime - this.state.now) / 60 / 100) / 10;
        const desc = (min < 0) ? "" :
            <span> – {min} minutes remaining</span>;
        const done = (min > 0) ? "" :
            <span> – closed {min * -1} minutes ago</span>;
        if (min <= 0) {
          finishedPolls.push(
            <li key={poll.name}>
              <a href="#" onClick={(evt) => this.doPollClick(evt, poll.name)}>{poll.name}</a>
              {done}
            </li>);
        } else {
          currentPolls.push(
            <li key={poll.name}>
              <a href="#" onClick={(evt) => this.doPollClick(evt, poll.name)}>{poll.name}</a>
              {desc}
            </li>);
        }
      }
      return (<div>
        <h3>Still Open</h3>
        <ul>{currentPolls}</ul>
        <h3>Closed</h3>
        <ul>{finishedPolls}</ul>
      </div>);
    }
  }

  doListResp = (resp: Response): void => {
    if (resp.status === 200) {
      resp.json().then(this.doListJson)
          .catch(() => this.doListError("200 response is not JSON"));
    } else if (resp.status === 400) {
      resp.text().then(this.doListError)
          .catch(() => this.doListError("400 response is not text"));
    } else {
      this.doListError(`bad status code from /api/list: ${resp.status}`);
    }
  };

  doListJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /api/list: not a record", data);
      return;
    }

    if (!Array.isArray(data.polls)) {
      console.error("bad data from /api/list: polls is not an array", data);
      return;
    }

    const polls: Poll[] = [];
    for (const val of data.polls) {
      const poll = parsePoll(val);
      if (poll === undefined)
        return;
      polls.push(poll);
    }
    this.setState({polls: polls, now: Date.now()});  // fix time also
  };

  doListError = (msg: string): void => {
    console.error(`Error fetching /api/list: ${msg}`);
  };

  doRefreshClick = (): void => {
    fetch("/api/list").then(this.doListResp)
        .catch(() => this.doListError("failed to connect to server"));
  };

  doNewClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    this.props.onNewClick();  // tell the parent to show the new auction page
  };

  doPollClick = (evt: MouseEvent<HTMLAnchorElement>, name: string): void => {
    evt.preventDefault();
    this.props.onPollClick(name);
  };

}