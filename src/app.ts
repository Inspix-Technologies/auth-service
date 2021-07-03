import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import sequelize from './database/Database';
import User from './UserModel';

const app = express();
sequelize.addModels([User]);
app.use(cors());
app.use(express.json());


export default app;
