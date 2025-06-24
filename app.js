import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import catchAllError from './middleware/CatchAllError';
import error from './middleware/error';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//app.use("/", router) attach the router here
app.use(catchAllError); // Middleware to catch all errors (if a route is not defined etc)
app.use(error); // Custom error handling to the used inside controller

export default app;


