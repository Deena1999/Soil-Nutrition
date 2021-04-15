const express=require('express');

const app=express();
// require('dotenv').config();

app.use(express.urlencoded({extended:true}));

app.use(express.json());

let serviceAccount=require('./util/serviceAccountKey.json');
const adminfb=require('firebase-admin');

adminfb.initializeApp({
    credential:adminfb.credential.cert(serviceAccount),
    databaseURL:'https://soil-nutrient-default-rtdb.firebaseio.com/'
});


const databasefb=adminfb.firestore();

app.post('/post_data',async(req,res,next)=>{
    const data={
        moisture:req.body.moisture,
        temperature:req.body.temperature,
        ph:req.body.ph,
        npkRatio:req.body.npkRatio,
        userId:req.body.userId,
    };
    const expectedResult=databasefb.collection('expectedResult');
    expectedResult.doc(data.userId).get().then((d) => {
        if(d.exists)
        {
            expectedResult.doc(data.userId).update({
                moisture:data.moisture,
                npkRatio:data.npkRatio,
                ph:data.ph,
                temperature:data.temperature,
                userId:data.userId
            })
            .then(() => {
                return res.json({status:"Update Successful"});
            })
            .catch((r) => {
                return res.json({status:"Try later"});
            });
        }
        else
        {
            expectedResult.doc(data.userId).set({
                moisture:data.moisture,
                npkRatio:data.npkRatio,
                ph:data.ph,
                temperature:data.temperature,
                userId:data.userId
            })
            .then(() => {
                return res.json({status:"Insertion Successful"})
            })
            .catch(() => {
                return res.json({status:"Try later"});
            });
        }
        console.log(d.exists);
    });
});

// app.get('/server',async(req,res,next) => {
    
// });

app.listen(3000);
