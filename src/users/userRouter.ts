import express from 'express';
import { createUser } from './userController';

const useRouter = express.Router();

//routes
// useRouter.post('/register', (req, res)=> {
//     res.json({message:'User Registered'})
// })
useRouter.post('/register', createUser)

export default useRouter;