"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoll = exports.voteInPoll = exports.addPoll = exports.listPoll = exports.advanceTimeForTesting = exports.resetForTesting = void 0;
/** A map that maps the name of the poll to the poll */
var polls = new Map();
/** Clears map for testing */
var resetForTesting = function () {
    polls.clear();
};
exports.resetForTesting = resetForTesting;
/** Testing function to move all end times forward the given amount (of ms). */
var advanceTimeForTesting = function (ms) {
    var e_1, _a;
    try {
        for (var _b = __values(polls.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var auction = _c.value;
            auction.endTime -= ms;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
};
exports.advanceTimeForTesting = advanceTimeForTesting;
/**
 * Sort polls with the ones finishing soonest first, but with all those that
 * are completed after those that are not and in reverse order by end time.
 * @param a poll a
 * @param b poll b
 * @returns the difference of the time the two polls will be completed
 */
var comparePolls = function (a, b) {
    var now = Date.now();
    var endA = now <= a.endTime ? a.endTime : 1e15 - a.endTime;
    var endB = now <= b.endTime ? b.endTime : 1e15 - b.endTime;
    return endA - endB;
};
/**
 * Returns a list of all the polls, sorted so that the ongoing polls come
 * first, with the ones about to end listed first, and the completed ones after,
 * with the ones completed more recently
 * @param _req the request
 * @param res the response
 */
var listPoll = function (_req, res) {
    var vals = Array.from(polls.values());
    vals.sort(comparePolls);
    res.send({ polls: vals });
};
exports.listPoll = listPoll;
/**
 * Adds a poll to the polls map that maps its name to the poll
 * @param req the request
 * @param res the response
 */
var addPoll = function (req, res) {
    // Check if there is a name
    var name = req.body.name;
    if (typeof name !== 'string') {
        res.status(400).send("missing 'name' parameter: ".concat(name));
        return;
    }
    // Check the minutes entered
    var minutes = req.body.minutes;
    if (typeof minutes !== "number") {
        res.status(400).send("'minutes' is not a number: ".concat(minutes));
        return;
    }
    else if (isNaN(minutes) || minutes < 1 || Math.round(minutes) !== minutes) {
        res.status(400).send("'minutes' is not a positive integer: ".concat(minutes));
        return;
    }
    // Check if options is an array
    var options = req.body.options;
    if (!(Array.isArray(options))) {
        res.status(400).send("invalid options type: ".concat(options));
        return;
    }
    // Check if there is a poll with this name
    if (polls.has(name)) {
        res.status(400).send("poll for '".concat(name, "' already exists"));
        return;
    }
    var poll = {
        name: name,
        endTime: Date.now() + minutes * 60 * 1000,
        pollRes: new Map(),
        voterName: "",
        vote: [],
        options: options,
    };
    // Adds poll to the map with given name
    polls.set(poll.name, poll);
    // Send the poll we made
    res.send({ poll: poll });
};
exports.addPoll = addPoll;
/**
 * Allows the user to vote in the poll
 * @param req the request
 * @param res the response
 */
var voteInPoll = function (req, res) {
    // Checks for poll name
    var name = req.body.name;
    if (typeof name !== "string") {
        res.status(400).send("missing 'name' parameter");
        return;
    }
    // Checks if there is a poll with given name
    var poll = polls.get(name);
    if (poll === undefined) {
        res.status(400).send("no poll with name: ".concat(name));
        return;
    }
    // Check if vote is a string
    var userVote = req.body.userVote;
    if (typeof userVote !== "string") {
        res.status(400).send("invalid vote type: ".concat(userVote));
        return;
    }
    // Check if voter name is not a string
    var voterName = req.body.voterName;
    if (typeof voterName !== "string") {
        res.status(400).send("invalid voter name type: ".concat(voterName));
        return;
    }
    // Checks if poll has already ended
    var now = Date.now();
    if (now >= poll.endTime) {
        res.status(400).send("poll for \"".concat(poll.name, "\" has already ended"));
        return;
    }
    // Person has already voted before
    if (poll.pollRes.has(voterName)) {
        var prev = poll.pollRes.get(voterName);
        if (prev !== undefined) {
            // Find index of prev vote and replace it with new vote
            var index = poll.vote.indexOf(prev);
            poll.vote[index] = userVote;
        }
        // New voter
    }
    else {
        poll.vote.push(userVote);
    }
    // Map name of voter to vote
    poll.pollRes.set(voterName, userVote);
    poll.voterName = voterName;
    // Send current poll, the votes, and the voter name
    res.send({ poll: poll, vote: poll.vote, voterName: voterName });
};
exports.voteInPoll = voteInPoll;
/**
 * Retrieves the current state of the given poll
 * @param req the request
 * @param res the response
 */
var getPoll = function (req, res) {
    // Name is invalid
    var name = req.query.name;
    if (typeof name !== "string" || name === undefined) {
        res.status(400).send("missing or invalid 'name' parameter");
        return;
    }
    // Poll cannot be found in map
    var poll = polls.get(name);
    if (poll === undefined) {
        res.status(400).send("no poll with name: ".concat(name));
        return;
    }
    // Send the poll we retrieved from map matching name
    res.send({ poll: poll });
};
exports.getPoll = getPoll;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQWlCQSx1REFBdUQ7QUFDdkQsSUFBTSxLQUFLLEdBQXNCLElBQUksR0FBRyxFQUFFLENBQUM7QUFFM0MsNkJBQTZCO0FBQ3RCLElBQU0sZUFBZSxHQUFHO0lBQzdCLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNoQixDQUFDLENBQUM7QUFGVyxRQUFBLGVBQWUsbUJBRTFCO0FBRUYsK0VBQStFO0FBQ3hFLElBQU0scUJBQXFCLEdBQUcsVUFBQyxFQUFVOzs7UUFDOUMsS0FBc0IsSUFBQSxLQUFBLFNBQUEsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFBLGdCQUFBLDRCQUFFO1lBQWpDLElBQU0sT0FBTyxXQUFBO1lBQ2hCLE9BQU8sQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1NBQ3ZCOzs7Ozs7Ozs7QUFDSCxDQUFDLENBQUM7QUFKVyxRQUFBLHFCQUFxQix5QkFJaEM7QUFFRjs7Ozs7O0dBTUc7QUFDSCxJQUFNLFlBQVksR0FBRyxVQUFDLENBQU8sRUFBRSxDQUFPO0lBQ3BDLElBQU0sR0FBRyxHQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUMvQixJQUFNLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7SUFDN0QsSUFBTSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQzdELE9BQU8sSUFBSSxHQUFHLElBQUksQ0FBQztBQUNyQixDQUFDLENBQUM7QUFFRjs7Ozs7O0dBTUc7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