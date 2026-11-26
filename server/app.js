import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';



dotenv.config();


const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger for visibility
const port = 5003 || process.env.PORT;

app.listen(port,()=>{
  console.log("backend is running on port "+ port);
  
})

