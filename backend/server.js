require('dotenv').config();

const express=require('express');
const app=express();
const router=require('./routes');
const dbConnect = require('./database');
const cors=require('cors');

const corsOption={
    origin:['http://localhost:3000'],
}
app.use(cors(corsOption));

const PORT=process.env.PORT || 5500;
dbConnect();
//json middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

app.get('/',(req,res)=>{
    res.send('Hello from express')
}) 

app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`)
});