"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = __importStar(require("assert"));
var httpMocks = __importStar(require("node-mocks-http"));
var routes_1 = require("./routes");
describe('routes', function () {
    it('add', function () {
        // Separate domain for each branch:
        // 1. Missing name
        var req1 = httpMocks.createRequest({ method: 'POST', url: '/api/add', body: {} });
        var res1 = httpMocks.createResponse();
        (0, routes_1.addPoll)(req1, res1);
        assert.strictEqual(res1._getStatusCode(), 400);
        assert.deepStrictEqual(res1._getData(), "missing 'name' parameter: undefined");
        // 2. Missing minutes
        var req2 = httpMocks.createRequest({ method: 'POST', url: '/api/add', body: { name: "poll1" } });
        var res2 = httpMocks.createResponse();
        (0, routes_1.addPoll)(req2, res2);
        assert.strictEqual(res2._getStatusCode(), 400);
        assert.deepStrictEqual(res2._getData(), "'minutes' is not a number: undefined");
        // 3. Minutes is not valid ( < 0 or not an integer)
        var req3 = httpMocks.createRequest({ method: 'POST', url: '/api/add', body: { name: "poll1", minutes: -1 } });
        var res3 = httpMocks.createResponse();
        (0, routes_1.addPoll)(req3, res3);
        assert.strictEqual(res3._getStatusCode(), 400);
        assert.deepStrictEqual(res3._getData(), "'minutes' is not a positive integer: -1");
        var req4 = httpMocks.createRequest({ method: 'POST', url: '/api/add', body: { name: "poll1", minutes: 3.5 } });
        var res4 = httpMocks.createResponse();
        (0, routes_1.addPoll)(req4, res4);
        assert.strictEqual(res4._getStatusCode(), 400);
        assert.deepStrictEqual(res4._getData(), "'minutes' is not a positive integer: 3.5");
        // 4. Options is not valid
        var req5 = httpMocks.createRequest({ method: 'POST', url: '/api/add', body: { name: "poll1", minutes: 1 } });
        var res5 = httpMocks.createResponse();
        (0, routes_1.addPoll)(req5, res5);
        assert.strictEqual(res5._getStatusCode(), 400);
        assert.deepStrictEqual(res5._getData(), "invalid options type: undefined");
        // 5. Correctly added
        var req6 = httpMocks.createRequest({ method: 'POST', url: '/api/add', body: { name: "poll1", minutes: 3, options: [] } });
        var res6 = httpMocks.createResponse();
        (0, routes_1.addPoll)(req6, res6);
        assert.strictEqual(res6._getStatusCode(), 200);
        assert.deepStrictEqual(res6._getData().poll.name, "poll1");
        var endTime1 = res6._getData().poll.endTime;
        assert.ok(Math.abs(endTime1 - Date.now() - 3 * 60 * 1000) < 50);
        assert.deepStrictEqual(res6._getData().poll.options, new Array());
        assert.deepStrictEqual(res6._getData().poll.pollRes, new Map());
        assert.deepStrictEqual(res6._getData().poll.voterName, "");
        assert.deepStrictEqual(res6._getData().poll.vote, []);
        var req7 = httpMocks.createRequest({ method: 'POST', url: '/api/add', body: { name: "poll2", minutes: 10, options: ["choice1", "choice2"] } });
        var res7 = httpMocks.createResponse();
        (0, routes_1.addPoll)(req7, res7);
        assert.strictEqual(res7._getStatusCode(), 200);
        assert.deepStrictEqual(res7._getData().poll.name, "poll2");
        var endTime2 = res7._getData().poll.endTime;
        assert.ok(Math.abs(endTime2 - Date.now() - 10 * 60 * 1000) < 50);
        assert.deepStrictEqual(res7._getData().poll.options, ["choice1", "choice2"]);
        assert.deepStrictEqual(res7._getData().poll.pollRes, new Map());
        assert.deepStrictEqual(res7._getData().poll.voterName, "");
        assert.deepStrictEqual(res7._getData().poll.vote, []);
        var req8 = httpMocks.createRequest({ method: 'POST', url: '/api/add', body: { name: "name1", minutes: 7, options: ["hamburger", "chicken", "pizza"] } });
        var res8 = httpMocks.createResponse();
        (0, routes_1.addPoll)(req8, res8);
        assert.strictEqual(res8._getStatusCode(), 200);
        assert.deepStrictEqual(res8._getData().poll.name, "name1");
        var endTime3 = res8._getData().poll.endTime;
        assert.ok(Math.abs(endTime3 - Date.now() - 7 * 60 * 1000) < 50);
        assert.deepStrictEqual(res8._getData().poll.options, ["hamburger", "chicken", "pizza"]);
        assert.deepStrictEqual(res8._getData().poll.pollRes, new Map());
        assert.deepStrictEqual(res8._getData().poll.voterName, "");
        assert.deepStrictEqual(res8._getData().poll.vote, []);
        // 6. Trying to add a poll with the same name
        var req9 = httpMocks.createRequest({ method: 'POST', url: '/api/add', body: { name: "name1", minutes: 7, options: ["hamburger", "chicken", "pizza"] } });
        var res9 = httpMocks.createResponse();
        (0, routes_1.addPoll)(req9, res9);
        assert.strictEqual(res9._getStatusCode(), 400);
        assert.deepStrictEqual(res9._getData(), "poll for 'name1' already exists");
        (0, routes_1.resetForTesting)();
    });
    it('vote', function () {
        // Adding mock poll for testing voting
        var req = httpMocks.createRequest({ method: 'POST', url: '/api/add', body: { name: "poll1", minutes: 5, options: ["hamburger", "chicken", "pizza"] } });
        var res = httpMocks.createResponse();
        (0, routes_1.addPoll)(req, res);
        assert.strictEqual(res._getStatusCode(), 200);
        assert.deepStrictEqual(res._getData().poll.name, "poll1");
        var endTime = res._getData().poll.endTime;
        assert.ok(Math.abs(endTime - Date.now() - 5 * 60 * 1000) < 50);
        assert.deepStrictEqual(res._getData().poll.options, ["hamburger", "chicken", "pizza"]);
        assert.deepStrictEqual(res._getData().poll.pollRes, new Map());
        assert.deepStrictEqual(res._getData().poll.voterName, "");
        assert.deepStrictEqual(res._getData().poll.vote, []);
        // Separate domain for each branch:
        // 1. Missing name
        var req1 = httpMocks.createRequest({ method: 'GET', url: '/api/vote', body: {} });
        var res1 = httpMocks.createResponse();
        (0, routes_1.voteInPoll)(req1, res1);
        assert.strictEqual(res1._getStatusCode(), 400);
        assert.deepStrictEqual(res1._getData(), "missing 'name' parameter");
        // 2. Poll does not exist
        var req2 = httpMocks.createRequest({ method: 'POST', url: '/api/vote', body: { name: "poll2" } });
        var res2 = httpMocks.createResponse();
        (0, routes_1.voteInPoll)(req2, res2);
        assert.strictEqual(res2._getStatusCode(), 400);
        assert.deepStrictEqual(res2._getData(), "no poll with name: poll2");
        // 3. User vote is not string
        var req3 = httpMocks.createRequest({ method: 'POST', url: '/api/vote', body: { name: "poll1", userVote: undefined } });
        var res3 = httpMocks.createResponse();
        (0, routes_1.voteInPoll)(req3, res3);
        assert.strictEqual(res3._getStatusCode(), 400);
        assert.deepStrictEqual(res3._getData(), "invalid vote type: undefined");
        // 4. Voter name is not a string
        var req4 = httpMocks.createRequest({ method: 'POST', url: '/api/vote', body: { name: "poll1", userVote: "1", voterName: undefined } });
        var res4 = httpMocks.createResponse();
        (0, routes_1.voteInPoll)(req4, res4);
        assert.strictEqual(res4._getStatusCode(), 400);
        assert.deepStrictEqual(res4._getData(), "invalid voter name type: undefined");
        // 5. Voted, first time voting (name does not have previous vote)
        var req5 = httpMocks.createRequest({ method: 'POST', url: '/api/vote', body: { name: "poll1", userVote: "1", voterName: "SAM" } });
        var res5 = httpMocks.createResponse();
        (0, routes_1.voteInPoll)(req5, res5);
        assert.strictEqual(res5._getStatusCode(), 200);
        assert.deepStrictEqual(res5._getData().poll.name, "poll1");
        assert.deepStrictEqual(res5._getData().poll.vote, ["1"]);
        assert.deepStrictEqual(res5._getData().poll.voterName, "SAM");
        assert.deepStrictEqual(res5._getData().poll.pollRes, new Map([["SAM", "1"]]));
        var req6 = httpMocks.createRequest({ method: 'POST', url: '/api/vote', body: { name: "poll1", userVote: "2", voterName: "voter1" } });
        var res6 = httpMocks.createResponse();
        (0, routes_1.voteInPoll)(req6, res6);
        assert.strictEqual(res6._getStatusCode(), 200);
        assert.deepStrictEqual(res6._getData().poll.name, "poll1");
        assert.deepStrictEqual(res6._getData().poll.vote, ["1", "2"]);
        assert.deepStrictEqual(res6._getData().poll.voterName, "voter1");
        assert.deepStrictEqual(res6._getData().poll.pollRes, new Map([["SAM", "1"], ["voter1", "2"]]));
        // 6. Voted, replacing a vote (voter has already voted before)
        var req7 = httpMocks.createRequest({ method: 'POST', url: '/api/vote', body: { name: "poll1", userVote: "replaced", voterName: "voter1" } });
        var res7 = httpMocks.createResponse();
        (0, routes_1.voteInPoll)(req7, res7);
        assert.strictEqual(res7._getStatusCode(), 200);
        assert.deepStrictEqual(res7._getData().poll.name, "poll1");
        assert.deepStrictEqual(res7._getData().poll.vote, ["1", "replaced"]);
        assert.deepStrictEqual(res7._getData().poll.voterName, "voter1");
        assert.deepStrictEqual(res7._getData().poll.pollRes, new Map([["SAM", "1"], ["voter1", "replaced"]]));
        var req8 = httpMocks.createRequest({ method: 'POST', url: '/api/vote', body: { name: "poll1", userVote: "new", voterName: "SAM" } });
        var res8 = httpMocks.createResponse();
        (0, routes_1.voteInPoll)(req8, res8);
        assert.strictEqual(res8._getStatusCode(), 200);
        assert.deepStrictEqual(res8._getData().poll.name, "poll1");
        assert.deepStrictEqual(res8._getData().poll.vote, ["new", "replaced"]);
        assert.deepStrictEqual(res8._getData().poll.voterName, "SAM");
        assert.deepStrictEqual(res8._getData().poll.pollRes, new Map([["SAM", "new"], ["voter1", "replaced"]]));
        // 7. Check if poll has ended
        (0, routes_1.advanceTimeForTesting)(5 * 60 * 1000 + 50);
        var req9 = httpMocks.createRequest({ method: 'POST', url: '/api/vote', body: { name: "poll1", userVote: "3", voterName: "voter2" } });
        var res9 = httpMocks.createResponse();
        (0, routes_1.voteInPoll)(req9, res9);
        assert.strictEqual(res9._getStatusCode(), 400);
        assert.deepStrictEqual(res9._getData(), "poll for \"poll1\" has already ended");
        (0, routes_1.resetForTesting)();
    });
    it('get', function () {
        // Adding mock polls to test getting
        var req1 = httpMocks.createRequest({ method: 'POST', url: '/api/add', body: { name: "poll1", minutes: 3, options: ["1", "2"] } });
        var res1 = httpMocks.createResponse();
        (0, routes_1.addPoll)(req1, res1);
        assert.strictEqual(res1._getStatusCode(), 200);
        assert.deepStrictEqual(res1._getData().poll.name, "poll1");
        var endTime1 = res1._getData().poll.endTime;
        assert.ok(Math.abs(endTime1 - Date.now() - 3 * 60 * 1000) < 50);
        assert.deepStrictEqual(res1._getData().poll.options, ["1", "2"]);
        assert.deepStrictEqual(res1._getData().poll.pollRes, new Map());
        assert.deepStrictEqual(res1._getData().poll.voterName, "");
        assert.deepStrictEqual(res1._getData().poll.vote, []);
        var req2 = httpMocks.createRequest({ method: 'POST', url: '/api/add', body: { name: "poll2", minutes: 5, options: ["a", "b", "c"] } });
        var res2 = httpMocks.createResponse();
        (0, routes_1.addPoll)(req2, res2);
        assert.strictEqual(res2._getStatusCode(), 200);
        assert.deepStrictEqual(res2._getData().poll.name, "poll2");
        var endTime2 = res2._getData().poll.endTime;
        assert.ok(Math.abs(endTime2 - Date.now() - 5 * 60 * 1000) < 50);
        assert.deepStrictEqual(res2._getData().poll.options, ["a", "b", "c"]);
        assert.deepStrictEqual(res2._getData().poll.pollRes, new Map());
        assert.deepStrictEqual(res2._getData().poll.voterName, "");
        assert.deepStrictEqual(res2._getData().poll.vote, []);
        // Separate domain for each branch:
        // 1. Missing name
        var req3 = httpMocks.createRequest({ method: 'GET', url: '/api/get', query: {} });
        var res3 = httpMocks.createResponse();
        (0, routes_1.getPoll)(req3, res3);
        assert.strictEqual(res3._getStatusCode(), 400);
        assert.deepStrictEqual(res3._getData(), "missing or invalid 'name' parameter");
        // 2. Invalid name (poll doesn't exist)
        var req4 = httpMocks.createRequest({ method: 'GET', url: '/api/get', query: { name: "poll3" } });
        var res4 = httpMocks.createResponse();
        (0, routes_1.getPoll)(req4, res4);
        assert.strictEqual(res4._getStatusCode(), 400);
        assert.deepStrictEqual(res4._getData(), "no poll with name: poll3");
        // 3. Poll found
        var req5 = httpMocks.createRequest({ method: 'GET', url: '/api/get', query: { name: "poll1" } });
        var res5 = httpMocks.createResponse();
        (0, routes_1.getPoll)(req5, res5);
        assert.strictEqual(res5._getStatusCode(), 200);
        assert.deepStrictEqual(res5._getData().poll.name, "poll1");
        var endTime3 = res5._getData().poll.endTime;
        assert.ok(Math.abs(endTime3 - Date.now() - 3 * 60 * 1000) < 50);
        assert.deepStrictEqual(res5._getData().poll.options, ["1", "2"]);
        var req6 = httpMocks.createRequest({ method: 'GET', url: '/api/get', query: { name: "poll2" } });
        var res6 = httpMocks.createResponse();
        (0, routes_1.getPoll)(req6, res6);
        assert.strictEqual(res6._getStatusCode(), 200);
        assert.deepStrictEqual(res6._getData().poll.name, "poll2");
        var endTime4 = res6._getData().poll.endTime;
        assert.ok(Math.abs(endTime4 - Date.now() - 5 * 60 * 1000) < 50);
        assert.deepStrictEqual(res6._getData().poll.options, ["a", "b", "c"]);
        (0, routes_1.resetForTesting)();
    });
    it('list', function () {
        // No polls to get
        var req1 = httpMocks.createRequest({ method: 'GET', url: '/api/list', query: {} });
        var res1 = httpMocks.createResponse();
        (0, routes_1.listPoll)(req1, res1);
        assert.strictEqual(res1._getStatusCode(), 200);
        assert.deepStrictEqual(res1._getData(), { polls: [] });
        // Adding mock polls to test listing
        var req2 = httpMocks.createRequest({ method: 'POST', url: '/api/add',
            body: { name: "poll1", minutes: 3, options: ["10", "20", "30"] } });
        var res2 = httpMocks.createResponse();
        (0, routes_1.addPoll)(req2, res2);
        assert.strictEqual(res2._getStatusCode(), 200);
        assert.deepStrictEqual(res2._getData().poll.name, "poll1");
        var endTime1 = res2._getData().poll.endTime;
        assert.ok(Math.abs(endTime1 - Date.now() - 3 * 60 * 1000) < 50);
        assert.deepStrictEqual(res2._getData().poll.options, ["10", "20", "30"]);
        assert.deepStrictEqual(res2._getData().poll.pollRes, new Map());
        assert.deepStrictEqual(res2._getData().poll.voterName, "");
        assert.deepStrictEqual(res2._getData().poll.vote, []);
        var req3 = httpMocks.createRequest({ method: 'POST', url: '/api/add',
            body: { name: "poll2", minutes: 7, options: ["pizza", "burger", "candy"] } });
        var res3 = httpMocks.createResponse();
        (0, routes_1.addPoll)(req3, res3);
        assert.strictEqual(res3._getStatusCode(), 200);
        assert.deepStrictEqual(res3._getData().poll.name, "poll2");
        var endTime2 = res3._getData().poll.endTime;
        assert.ok(Math.abs(endTime2 - Date.now() - 7 * 60 * 1000) < 50);
        assert.deepStrictEqual(res3._getData().poll.options, ["pizza", "burger", "candy"]);
        assert.deepStrictEqual(res3._getData().poll.pollRes, new Map());
        assert.deepStrictEqual(res3._getData().poll.voterName, "");
        assert.deepStrictEqual(res3._getData().poll.vote, []);
        var req4 = httpMocks.createRequest({ method: 'POST', url: '/api/add',
            body: { name: "poll3", minutes: 5, options: ["c1", "c2", "c3"] } });
        var res4 = httpMocks.createResponse();
        (0, routes_1.addPoll)(req4, res4);
        assert.strictEqual(res4._getStatusCode(), 200);
        assert.deepStrictEqual(res4._getData().poll.name, "poll3");
        var endTime3 = res4._getData().poll.endTime;
        assert.ok(Math.abs(endTime3 - Date.now() - 5 * 60 * 1000) < 50);
        assert.deepStrictEqual(res4._getData().poll.options, ["c1", "c2", "c3"]);
        assert.deepStrictEqual(res4._getData().poll.pollRes, new Map());
        assert.deepStrictEqual(res4._getData().poll.voterName, "");
        assert.deepStrictEqual(res4._getData().poll.vote, []);
        // Get list
        var req5 = httpMocks.createRequest({ method: 'GET', url: '/api/list', query: {} });
        var res5 = httpMocks.createResponse();
        (0, routes_1.listPoll)(req5, res5);
        assert.strictEqual(res5._getStatusCode(), 200);
        assert.deepStrictEqual(res5._getData().polls.length, 3);
        assert.deepStrictEqual(res5._getData().polls[0].name, "poll1");
        assert.deepStrictEqual(res5._getData().polls[1].name, "poll3");
        assert.deepStrictEqual(res5._getData().polls[2].name, "poll2");
        // Advance time by 3 mins to finish poll1
        (0, routes_1.advanceTimeForTesting)(3 * 60 * 1000 + 50);
        var req6 = httpMocks.createRequest({ method: 'GET', url: '/api/list', query: {} });
        var res6 = httpMocks.createResponse();
        (0, routes_1.listPoll)(req6, res6);
        assert.strictEqual(res6._getStatusCode(), 200);
        assert.deepStrictEqual(res6._getData().polls.length, 3);
        assert.deepStrictEqual(res6._getData().polls[0].name, "poll3"); // 2 mins left
        assert.deepStrictEqual(res6._getData().polls[1].name, "poll2"); // 4 mins left
        assert.deepStrictEqual(res6._getData().polls[2].name, "poll1"); // finished
        // Advance time by 2 mins to finish poll3
        (0, routes_1.advanceTimeForTesting)(2 * 60 * 1000 + 50);
        var req7 = httpMocks.createRequest({ method: 'GET', url: '/api/list', query: {} });
        var res7 = httpMocks.createResponse();
        (0, routes_1.listPoll)(req7, res7);
        assert.strictEqual(res7._getStatusCode(), 200);
        assert.deepStrictEqual(res7._getData().polls.length, 3);
        assert.deepStrictEqual(res7._getData().polls[0].name, "poll2"); // 2 mins left
        assert.deepStrictEqual(res7._getData().polls[1].name, "poll3"); // finished second
        assert.deepStrictEqual(res7._getData().polls[2].name, "poll1"); // finished first
        // Advance by 10 mins to finish all polls
        (0, routes_1.advanceTimeForTesting)(10 * 60 * 1000 + 50);
        var req8 = httpMocks.createRequest({ method: 'GET', url: '/api/list', query: {} });
        var res8 = httpMocks.createResponse();
        (0, routes_1.listPoll)(req8, res8);
        assert.strictEqual(res8._getStatusCode(), 200);
        assert.deepStrictEqual(res8._getData().polls.length, 3);
        assert.deepStrictEqual(res8._getData().polls[0].name, "poll2");
        assert.deepStrictEqual(res8._getData().polls[1].name, "poll3");
        assert.deepStrictEqual(res8._getData().polls[2].name, "poll1");
        (0, routes_1.resetForTesting)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzX3Rlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcm91dGVzX3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUFpQztBQUNqQyx5REFBNkM7QUFDN0MsbUNBQTBHO0FBRzFHLFFBQVEsQ0FBQyxRQUFRLEVBQUU7SUFFakIsRUFBRSxDQUFDLEtBQUssRUFBRTtRQUVSLG1DQUFtQztRQUNuQyxrQkFBa0I7UUFDbEIsSUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FDaEMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkQsSUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3hDLElBQUEsZ0JBQU8sRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFcEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUscUNBQXFDLENBQUMsQ0FBQztRQUUvRSxxQkFBcUI7UUFDckIsSUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FDaEMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBQyxFQUFFLENBQUMsQ0FBQztRQUNoRSxJQUFNLElBQUksR0FBRyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDeEMsSUFBQSxnQkFBTyxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVwQixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxHQUFHLENBQUMs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