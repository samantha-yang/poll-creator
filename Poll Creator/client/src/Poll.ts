import { isRecord } from "./record";

/** Creates a poll that has these componenets */
export type Poll = {
  readonly name: string; // name of poll
  readonly endTime: number; // ms since epoch
  readonly pollRes: Map<string, string> // maps names to votes
  readonly voterName: string; // name of the voter
  readonly vote: Array<string>; // user votes
  readonly options: Array<string>; // options
}

/**
 * Parses unknown data into a Poll. Will log an error and return undefined
 * @param val unknown data to parse into a Poll
 * @returns Poll if val is a valid poll and undefined otherwise
 */
export const parsePoll = (val: unknown): undefined | Poll => {
  if (!isRecord(val)) {
    console.error("not a poll", val)
    return undefined;
  }

  if (typeof val.name !== "string") {
    console.error("not a poll: missing 'name'", val)
    return undefined;
  }

  if (typeof val.endTime !== "number" || val.endTime < 0 || isNaN(val.endTime)) {
    console.error("not a poll: missing or invalid 'endTime'", val)
    return undefined;
  }

  if (typeof val.voterName !== "string") {
    console.error("not a poll: missing 'voterName'", val)
    return undefined;
  }

  if (!(Array.isArray(val.vote))) {
    console.error("not a poll: missing 'vote'", val)
    return undefined;
  }

  if (!(Array.isArray(val.options))) {
    console.error("not a poll: missing 'options'", val)
    return undefined;
  }

  return {
    name: val.name, endTime: val.endTime, pollRes: new Map(), voterName: val.voterName, vote: val.vote, options: val.options
  }
  
}