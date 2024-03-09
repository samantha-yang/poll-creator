import express, { Express } from "express";
import { listPoll, getPoll, addPoll, voteInPoll } from './routes';
import bodyParser from 'body-parser';


// Configure and start the HTTP server.
const port: number = 8088;
const app: Express = express();
app.use(bodyParser.json());
app.get("/api/list", listPoll);
app.get("/api/get", getPoll);
app.post("/api/vote", voteInPoll);
app.post("/api/add", addPoll);
app.listen(port, () => console.log(`Server listening on ${port}`));
