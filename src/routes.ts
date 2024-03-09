import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;

/** Creates a poll that has these componenets */
type Poll = {
  name: string; // name of poll
  endTime: number; // ms since epoch
  pollRes: Map<string, string> // maps names to votes
  voterName: string; // name of the voter
  vote: Array<string>; // where user votes are stored
  options: Array<string>; // list of options
}

/** A map that maps the name of the poll to the poll */
const polls: Map<string, Poll> = new Map();

/** Clears map for testing */
export const resetForTesting = (): void => {
  polls.clear();
};

/** Testing function to move all end times forward the given amount (of ms). */
export const advanceTimeForTesting = (ms: number): void => {
  for (const auction of polls.values()) {
    auction.endTime -= ms;
  }
};

/**
 * Sort polls with the ones finishing soonest first, but with all those that
 * are completed after those that are not and in reverse order by end time.
 * @param a poll a
 * @param b poll b
 * @returns the difference of the time the two polls will be completed
 */
const comparePolls = (a: Poll, b: Poll): number => {
  const now: number = Date.now();
  const endA = now <= a.endTime ? a.endTime : 1e15 - a.endTime;
  const endB = now <= b.endTime ? b.endTime : 1e15 - b.endTime;
  return endA - endB;
};

/**
 * Returns a list of all the polls, sorted so that the ongoing polls come
 * first, with the ones about to end listed first, and the completed ones after,
 * with the ones completed more recently
 * @param _req the request
 * @param res the response
 */
export const listPoll = (_req: SafeRequest, res: SafeResponse): void => {
  const vals = Array.from(polls.values());
  vals.sort(comparePolls);
  res.send({polls: vals});
};

/**
 * Adds a poll to the polls map that maps its name to the poll
 * @param req the request
 * @param res the response
 */
export const addPoll = (req: SafeRequest, res: SafeResponse): void => {
  
  // Check if there is a name
  const name = req.body.name;
  if (typeof name !== 'string') {
    res.status(400).send(`missing 'name' parameter: ${name}`);
    return;
  }

  // Check the minutes entered
  const minutes = req.body.minutes;
  if (typeof minutes !== "number") {
    res.status(400).send(`'minutes' is not a number: ${minutes}`);
    return;
  } else if (isNaN(minutes) || minutes < 1 || Math.round(minutes) !== minutes) {
    res.status(400).send(`'minutes' is not a positive integer: ${minutes}`);
    return;
  }

  // Check if options is an array
  const options = req.body.options;
  if (!(Array.isArray(options))) {
    res.status(400).send(`invalid options type: ${options}`);
    return;
  }

  // Check if there is a poll with this name
  if (polls.has(name)) {
    res.status(400).send(`poll for '${name}' already exists`);
    return;
  }
  
  const poll: Poll = {
    name: name,
    endTime: Date.now() + minutes * 60 * 1000,
    pollRes: new Map(),
    voterName: "",
    vote: [],
    options: options,
  }

  // Adds poll to the map with given name
  polls.set(poll.name, poll);
  // Send the poll we made
  res.send({poll: poll});
}

/**
 * Allows the user to vote in the poll
 * @param req the request
 * @param res the response
 */
export const voteInPoll = (req: SafeRequest, res: SafeResponse): void => {
  // Checks for poll name
  const name = req.body.name;
  if (typeof name !== "string") {
    res.status(400).send("missing 'name' parameter");
    return;
  }

  // Checks if there is a poll with given name
  const poll = polls.get(name);
  if (poll === undefined) {
    res.status(400).send(`no poll with name: ${name}`);
    return;
  }

  // Check if vote is a string
  const userVote = req.body.userVote;
  if (typeof userVote !== "string") {
    res.status(400).send(`invalid vote type: ${userVote}`);
    return;
  }

  // Check if voter name is not a string
  const voterName = req.body.voterName;
  if (typeof voterName !== "string") {
    res.status(400).send(`invalid voter name type: ${voterName}`);
    return;
  }

  // Checks if poll has already ended
  const now = Date.now();
  if (now >= poll.endTime) {
    res.status(400).send(`poll for "${poll.name}" has already ended`);
    return;
  }
  
  // Person has already voted before
  if (poll.pollRes.has(voterName)) {
    const prev = poll.pollRes.get(voterName);
    if (prev !== undefined) {
      // Find index of prev vote and replace it with new vote
      const index = poll.vote.indexOf(prev);
      poll.vote[index] = userVote;
    }
  // New voter
  } else {
    poll.vote.push(userVote);
  }
  
  // Map name of voter to vote
  poll.pollRes.set(voterName, userVote);
  poll.voterName = voterName;

  // Send current poll, the votes, and the voter name
  res.send({poll: poll, vote: poll.vote, voterName: voterName});
}

/**
 * Retrieves the current state of the given poll
 * @param req the request
 * @param res the response
 */
export const getPoll = (req: SafeRequest, res: SafeResponse): void => {
  
  // Name is invalid
  const name = req.query.name;
  if (typeof name !== "string" || name === undefined) {
    res.status(400).send("missing or invalid 'name' parameter");
    return;
  }

  // Poll cannot be found in map
  const poll = polls.get(name);
  if (poll === undefined) {
    res.status(400).send(`no poll with name: ${name}`);
    return;
  }

  // Send the poll we retrieved from map matching name
  res.send({poll: poll}); 
}
