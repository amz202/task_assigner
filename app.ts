import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import catchAllError from './middleware/CatchAllError';
import error from './middleware/error';
import authRouter from './routes/authRoute';
import taskRouter from './routes/taskRouter';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
const app = express();

app.use(cors({
    origin: "http://192.168.162.168:3000", 
    credentials: true, 
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/task' , taskRouter);


//app.use("/", router) attach the router here
app.use(catchAllError); // Middleware to catch all errors (if a route is not defined etc)
app.use(error); // Custom error handling to the used inside controller


app.listen(5000 , ()=>{
    console.log("server is rnning on port 5000")
})
export default app;


