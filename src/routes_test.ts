import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { addPoll, advanceTimeForTesting, resetForTesting, voteInPoll, getPoll, listPoll, comparePolls } from './routes';


describe('routes', function() {

  it('add', function() {

    // Separate domain for each branch:
    // 1. Missing name
    const req1 = httpMocks.createRequest(
        { method: 'POST', url: '/api/add', body: {} });
    const res1 = httpMocks.createResponse();
    addPoll(req1, res1);

    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(), "missing 'name' parameter: undefined");

    // 2. Missing minutes
    const req2 = httpMocks.createRequest(
        { method: 'POST', url: '/api/add', body: {name: "poll1"} });
    const res2 = httpMocks.createResponse();
    addPoll(req2, res2);

    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(), "'minutes' is not a number: undefined");

    // 3. Minutes is not valid ( < 0 or not an integer)
    const req3 = httpMocks.createRequest(
        { method: 'POST', url: '/api/add', body: {name: "poll1", minutes: -1} });
    const res3 = httpMocks.createResponse();
    addPoll(req3, res3);

    assert.strictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(), "'minutes' is not a positive integer: -1");

    const req4 = httpMocks.createRequest(
        { method: 'POST', url: '/api/add', body: {name: "poll1", minutes: 3.5} });
    const res4 = httpMocks.createResponse();
    addPoll(req4, res4);

    assert.strictEqual(res4._getStatusCode(), 400);
    assert.deepStrictEqual(res4._getData(), "'minutes' is not a positive integer: 3.5");

    // 4. Options is not valid
    const req5 = httpMocks.createRequest(
        { method: 'POST', url: '/api/add', body: {name: "poll1", minutes: 1} });
    const res5 = httpMocks.createResponse();
    addPoll(req5, res5);

    assert.strictEqual(res5._getStatusCode(), 400);
    assert.deepStrictEqual(res5._getData(), "invalid options type: undefined");

    // 5. Correctly added
    const req6 = httpMocks.createRequest(
        { method: 'POST', url: '/api/add', body: {name: "poll1", minutes: 3, options: []} });
    const res6 = httpMocks.createResponse();
    addPoll(req6, res6);

    assert.strictEqual(res6._getStatusCode(), 200);
    assert.deepStrictEqual(res6._getData().poll.name, "poll1");
    const endTime1 = res6._getData().poll.endTime;
    assert.ok(Math.abs(endTime1 - Date.now() - 3 * 60 * 1000) < 50);
    assert.deepStrictEqual(res6._getData().poll.options, new Array<String>());
    assert.deepStrictEqual(res6._getData().poll.pollRes, new Map());
    assert.deepStrictEqual(res6._getData().poll.voterName, "");
    assert.deepStrictEqual(res6._getData().poll.vote, []);

    const req7 = httpMocks.createRequest(
      { method: 'POST', url: '/api/add', body: {name: "poll2", minutes: 10, options: ["choice1", "choice2"]} });
    const res7 = httpMocks.createResponse();
    addPoll(req7, res7);

    assert.strictEqual(res7._getStatusCode(), 200);
    assert.deepStrictEqual(res7._getData().poll.name, "poll2");
    const endTime2 = res7._getData().poll.endTime;
    assert.ok(Math.abs(endTime2 - Date.now() - 10 * 60 * 1000) < 50);
    assert.deepStrictEqual(res7._getData().poll.options, ["choice1", "choice2"]);
    assert.deepStrictEqual(res7._getData().poll.pollRes, new Map());
    assert.deepStrictEqual(res7._getData().poll.voterName, "");
    assert.deepStrictEqual(res7._getData().poll.vote, []);
    

    const req8 = httpMocks.createRequest(
      { method: 'POST', url: '/api/add', body: {name: "name1", minutes: 7, options: ["hamburger", "chicken", "pizza"]} });
    const res8 = httpMocks.createResponse();
    addPoll(req8, res8);

    assert.strictEqual(res8._getStatusCode(), 200);
    assert.deepStrictEqual(res8._getData().poll.name, "name1");
    const endTime3 = res8._getData().poll.endTime;
    assert.ok(Math.abs(endTime3 - Date.now() - 7 * 60 * 1000) < 50);
    assert.deepStrictEqual(res8._getData().poll.options, ["hamburger", "chicken", "pizza"]);
    assert.deepStrictEqual(res8._getData().poll.pollRes, new Map());
    assert.deepStrictEqual(res8._getData().poll.voterName, "");
    assert.deepStrictEqual(res8._getData().poll.vote, []);

    // 6. Trying to add a poll with the same name
    const req9 = httpMocks.createRequest(
      { method: 'POST', url: '/api/add', body: {name: "name1", minutes: 7, options: ["hamburger", "chicken", "pizza"]} });
    const res9 = httpMocks.createResponse();
    addPoll(req9, res9);

    assert.strictEqual(res9._getStatusCode(), 400);
    assert.deepStrictEqual(res9._getData(), "poll for 'name1' already exists");

    resetForTesting();

  });

  it('vote', function() {

    // Adding mock poll for testing voting
    const req = httpMocks.createRequest(
      { method: 'POST', url: '/api/add', body: {name: "poll1", minutes: 5, options: ["hamburger", "chicken", "pizza"]} });
    const res = httpMocks.createResponse();
    addPoll(req, res);

    assert.strictEqual(res._getStatusCode(), 200);
    assert.deepStrictEqual(res._getData().poll.name, "poll1");
    const endTime = res._getData().poll.endTime;
    assert.ok(Math.abs(endTime - Date.now() - 5 * 60 * 1000) < 50);
    assert.deepStrictEqual(res._getData().poll.options, ["hamburger", "chicken", "pizza"]);
    assert.deepStrictEqual(res._getData().poll.pollRes, new Map());
    assert.deepStrictEqual(res._getData().poll.voterName, "");
    assert.deepStrictEqual(res._getData().poll.vote, []);

    // Separate domain for each branch:
    // 1. Missing name
    const req1 = httpMocks.createRequest(
        { method: 'GET', url: '/api/vote', body: {} });
    const res1 = httpMocks.createResponse();
    voteInPoll(req1, res1);

    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(), "missing 'name' parameter");

    // 2. Poll does not exist
    const req2 = httpMocks.createRequest(
        { method: 'POST', url: '/api/vote', body: {name: "poll2"} });
    const res2 = httpMocks.createResponse();
    voteInPoll(req2, res2);

    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(), "no poll with name: poll2");

    // 3. User vote is not string
    const req3 = httpMocks.createRequest(
        { method: 'POST', url: '/api/vote', body: {name: "poll1", userVote: undefined} });
    const res3 = httpMocks.createResponse();
    voteInPoll(req3, res3);

    assert.strictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(), "invalid vote type: undefined");

    // 4. Voter name is not a string
    const req4 = httpMocks.createRequest(
        { method: 'POST', url: '/api/vote', body: {name: "poll1", userVote: "1", voterName: undefined} });
    const res4 = httpMocks.createResponse();
    voteInPoll(req4, res4);

    assert.strictEqual(res4._getStatusCode(), 400);
    assert.deepStrictEqual(res4._getData(), "invalid voter name type: undefined");

    // 5. Voted, first time voting (name does not have previous vote)
    const req5 = httpMocks.createRequest(
        { method: 'POST', url: '/api/vote', body: {name: "poll1", userVote: "1", voterName: "SAM"} });
    const res5 = httpMocks.createResponse();
    voteInPoll(req5, res5);

    assert.strictEqual(res5._getStatusCode(), 200);
    assert.deepStrictEqual(res5._getData().poll.name, "poll1");
    assert.deepStrictEqual(res5._getData().poll.vote, ["1"]);
    assert.deepStrictEqual(res5._getData().poll.voterName, "SAM");
    assert.deepStrictEqual(res5._getData().poll.pollRes, new Map([["SAM", "1"]]));

    const req6 = httpMocks.createRequest(
        { method: 'POST', url: '/api/vote', body: {name: "poll1", userVote: "2", voterName: "voter1"} });
    const res6 = httpMocks.createResponse();
    voteInPoll(req6, res6);

    assert.strictEqual(res6._getStatusCode(), 200);
    assert.deepStrictEqual(res6._getData().poll.name, "poll1");
    assert.deepStrictEqual(res6._getData().poll.vote, ["1", "2"]);
    assert.deepStrictEqual(res6._getData().poll.voterName, "voter1");
    assert.deepStrictEqual(res6._getData().poll.pollRes, new Map([["SAM", "1"], ["voter1", "2"]]));

    // 6. Voted, replacing a vote (voter has already voted before)
    const req7 = httpMocks.createRequest(
        { method: 'POST', url: '/api/vote', body: {name: "poll1", userVote: "replaced", voterName: "voter1"} });
    const res7 = httpMocks.createResponse();
    voteInPoll(req7, res7);

    assert.strictEqual(res7._getStatusCode(), 200);
    assert.deepStrictEqual(res7._getData().poll.name, "poll1");
    assert.deepStrictEqual(res7._getData().poll.vote, ["1", "replaced"]);
    assert.deepStrictEqual(res7._getData().poll.voterName, "voter1");
    assert.deepStrictEqual(res7._getData().poll.pollRes, new Map([["SAM", "1"], ["voter1", "replaced"]]));

    const req8 = httpMocks.createRequest(
        { method: 'POST', url: '/api/vote', body: {name: "poll1", userVote: "new", voterName: "SAM"} });
    const res8 = httpMocks.createResponse();
    voteInPoll(req8, res8);

    assert.strictEqual(res8._getStatusCode(), 200);
    assert.deepStrictEqual(res8._getData().poll.name, "poll1");
    assert.deepStrictEqual(res8._getData().poll.vote, ["new", "replaced"]);
    assert.deepStrictEqual(res8._getData().poll.voterName, "SAM");
    assert.deepStrictEqual(res8._getData().poll.pollRes, new Map([["SAM", "new"], ["voter1", "replaced"]]));

    // 7. Check if poll has ended
    advanceTimeForTesting(5 * 60 * 1000 + 50);
    
    const req9 = httpMocks.createRequest(
        { method: 'POST', url: '/api/vote', body: {name: "poll1", userVote: "3", voterName: "voter2"} });
    const res9 = httpMocks.createResponse();
    voteInPoll(req9, res9);

    assert.strictEqual(res9._getStatusCode(), 400);
    assert.deepStrictEqual(res9._getData(), "poll for \"poll1\" has already ended");

    resetForTesting();

  });

  it('get', function() {

    // Adding mock polls to test getting
    const req1 = httpMocks.createRequest(
        { method: 'POST', url: '/api/add', body: {name: "poll1", minutes: 3, options: ["1", "2"]}});
    const res1 = httpMocks.createResponse();
    addPoll(req1, res1);

    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData().poll.name, "poll1");
    const endTime1 = res1._getData().poll.endTime;
    assert.ok(Math.abs(endTime1 - Date.now() - 3 * 60 * 1000) < 50);
    assert.deepStrictEqual(res1._getData().poll.options, ["1", "2"]);
    assert.deepStrictEqual(res1._getData().poll.pollRes, new Map());
    assert.deepStrictEqual(res1._getData().poll.voterName, "");
    assert.deepStrictEqual(res1._getData().poll.vote, []);

    const req2 = httpMocks.createRequest(
        { method: 'POST', url: '/api/add', body: {name: "poll2", minutes: 5, options: ["a", "b", "c"]} });
    const res2 = httpMocks.createResponse();
    addPoll(req2, res2);

    assert.strictEqual(res2._getStatusCode(), 200);
    assert.deepStrictEqual(res2._getData().poll.name, "poll2");
    const endTime2 = res2._getData().poll.endTime;
    assert.ok(Math.abs(endTime2 - Date.now() - 5 * 60 * 1000) < 50);
    assert.deepStrictEqual(res2._getData().poll.options, ["a", "b", "c"]);
    assert.deepStrictEqual(res2._getData().poll.pollRes, new Map());
    assert.deepStrictEqual(res2._getData().poll.voterName, "");
    assert.deepStrictEqual(res2._getData().poll.vote, []);
    
    // Separate domain for each branch:
    // 1. Missing name
    const req3 = httpMocks.createRequest(
        { method: 'GET', url: '/api/get', query: {} });
    const res3 = httpMocks.createResponse();
    getPoll(req3, res3);
    
    assert.strictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(), "missing or invalid 'name' parameter");

    // 2. Invalid name (poll doesn't exist)
    const req4 = httpMocks.createRequest(
        { method: 'GET', url: '/api/get', query: {name: "poll3"} });
    const res4 = httpMocks.createResponse();
    getPoll(req4, res4);
    
    assert.strictEqual(res4._getStatusCode(), 400);
    assert.deepStrictEqual(res4._getData(), "no poll with name: poll3");

    // 3. Poll found
    const req5 = httpMocks.createRequest(
        { method: 'GET', url: '/api/get', query: {name: "poll1"} });
    const res5 = httpMocks.createResponse();
    getPoll(req5, res5);

    assert.strictEqual(res5._getStatusCode(), 200);
    assert.deepStrictEqual(res5._getData().poll.name, "poll1");
    const endTime3 = res5._getData().poll.endTime;
    assert.ok(Math.abs(endTime3 - Date.now() - 3 * 60 * 1000) < 50);
    assert.deepStrictEqual(res5._getData().poll.options, ["1", "2"]);

    const req6 = httpMocks.createRequest(
        { method: 'GET', url: '/api/get', query: {name: "poll2"} });
    const res6 = httpMocks.createResponse();
    getPoll(req6, res6);

    assert.strictEqual(res6._getStatusCode(), 200);
    assert.deepStrictEqual(res6._getData().poll.name, "poll2");
    const endTime4 = res6._getData().poll.endTime;
    assert.ok(Math.abs(endTime4 - Date.now() - 5 * 60 * 1000) < 50);
    assert.deepStrictEqual(res6._getData().poll.options, ["a", "b", "c"]);

    resetForTesting();

  });

  it('list', function() {

    // No polls to get
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/list', query: {}});
    const res1 = httpMocks.createResponse();
    listPoll(req1, res1);

    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(), {polls: []});
    
    // Adding mock polls to test listing
    const req2 = httpMocks.createRequest({method: 'POST', url: '/api/add',
      body: {name: "poll1", minutes: 3, options: ["10", "20", "30"]}});
    const res2 = httpMocks.createResponse();
    addPoll(req2, res2);

    assert.strictEqual(res2._getStatusCode(), 200);
    assert.deepStrictEqual(res2._getData().poll.name, "poll1");
    const endTime1 = res2._getData().poll.endTime;
    assert.ok(Math.abs(endTime1 - Date.now() - 3 * 60 * 1000) < 50);
    assert.deepStrictEqual(res2._getData().poll.options, ["10", "20", "30"]);
    assert.deepStrictEqual(res2._getData().poll.pollRes, new Map());
    assert.deepStrictEqual(res2._getData().poll.voterName, "");
    assert.deepStrictEqual(res2._getData().poll.vote, []);

    
    const req3 = httpMocks.createRequest({method: 'POST', url: '/api/add',
      body: {name: "poll2", minutes: 7, options: ["pizza", "burger", "candy"]}});
    const res3 = httpMocks.createResponse();
    addPoll(req3, res3);

    assert.strictEqual(res3._getStatusCode(), 200);
    assert.deepStrictEqual(res3._getData().poll.name, "poll2");
    const endTime2 = res3._getData().poll.endTime;
    assert.ok(Math.abs(endTime2 - Date.now() - 7 * 60 * 1000) < 50);
    assert.deepStrictEqual(res3._getData().poll.options, ["pizza", "burger", "candy"]);
    assert.deepStrictEqual(res3._getData().poll.pollRes, new Map());
    assert.deepStrictEqual(res3._getData().poll.voterName, "");
    assert.deepStrictEqual(res3._getData().poll.vote, []);

    const req4 = httpMocks.createRequest({method: 'POST', url: '/api/add',
      body: {name: "poll3", minutes: 5, options: ["c1", "c2", "c3"]}});
    const res4 = httpMocks.createResponse();
    addPoll(req4, res4);

    assert.strictEqual(res4._getStatusCode(), 200);
    assert.deepStrictEqual(res4._getData().poll.name, "poll3");
    const endTime3 = res4._getData().poll.endTime;
    assert.ok(Math.abs(endTime3 - Date.now() - 5 * 60 * 1000) < 50);
    assert.deepStrictEqual(res4._getData().poll.options, ["c1", "c2", "c3"]);
    assert.deepStrictEqual(res4._getData().poll.pollRes, new Map());
    assert.deepStrictEqual(res4._getData().poll.voterName, "");
    assert.deepStrictEqual(res4._getData().poll.vote, []);

    // Get list
    const req5 = httpMocks.createRequest({method: 'GET', url: '/api/list', query: {}});
    const res5 = httpMocks.createResponse();
    listPoll(req5, res5);

    assert.strictEqual(res5._getStatusCode(), 200);
    assert.deepStrictEqual(res5._getData().polls.length, 3);
    assert.deepStrictEqual(res5._getData().polls[0].name, "poll1");
    assert.deepStrictEqual(res5._getData().polls[1].name, "poll3");
    assert.deepStrictEqual(res5._getData().polls[2].name, "poll2");
    
    // Advance time by 3 mins to finish poll1
    advanceTimeForTesting(3 * 60 * 1000 + 50);

    const req6 = httpMocks.createRequest({method: 'GET', url: '/api/list', query: {}});
    const res6 = httpMocks.createResponse();
    listPoll(req6, res6);

    assert.strictEqual(res6._getStatusCode(), 200);
    assert.deepStrictEqual(res6._getData().polls.length, 3);
    assert.deepStrictEqual(res6._getData().polls[0].name, "poll3"); // 2 mins left
    assert.deepStrictEqual(res6._getData().polls[1].name, "poll2"); // 4 mins left
    assert.deepStrictEqual(res6._getData().polls[2].name, "poll1"); // finished
    
    // Advance time by 2 mins to finish poll3
    advanceTimeForTesting(2 * 60 * 1000 + 50);
    
    const req7 = httpMocks.createRequest({method: 'GET', url: '/api/list', query: {}});
    const res7 = httpMocks.createResponse();
    listPoll(req7, res7);

    assert.strictEqual(res7._getStatusCode(), 200);
    assert.deepStrictEqual(res7._getData().polls.length, 3);
    assert.deepStrictEqual(res7._getData().polls[0].name, "poll2"); // 2 mins left
    assert.deepStrictEqual(res7._getData().polls[1].name, "poll3"); // finished second
    assert.deepStrictEqual(res7._getData().polls[2].name, "poll1"); // finished first

    // Advance by 10 mins to finish all polls
    advanceTimeForTesting(10 * 60 * 1000 + 50);
    
    const req8 = httpMocks.createRequest({method: 'GET', url: '/api/list', query: {}});
    const res8 = httpMocks.createResponse();
    listPoll(req8, res8);

    assert.strictEqual(res8._getStatusCode(), 200);
    assert.deepStrictEqual(res8._getData().polls.length, 3);
    assert.deepStrictEqual(res8._getData().polls[0].name, "poll2");
    assert.deepStrictEqual(res8._getData().polls[1].name, "poll3");
    assert.deepStrictEqual(res8._getData().polls[2].name, "poll1");

    resetForTesting();

  });

});
