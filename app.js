let express = require('express');
let app = express();
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
// const mongoURL = "mongodb://localhost:27017";
const mongoURL = "mongodb+srv://test:test123@cluster0.87fy1.mongodb.net/zomato_clone?retryWrites=true&w=majority"
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
dotenv.config();
let port = process.env.PORT || 5314;
var db;

app.use(bodyParser.urlencoded({ extended:true}))
app.use(bodyParser.json());
app.use(cors())

app.get('/',(req,res) =>{
    res.send("Welcome to Express");
})

app.get('/city',(req,res) =>{
    db.collection('city').find().toArray((err,result) =>{
        if (err) throw err;
        res.send(result);
    })
})

app.get('/restuarants',(req,res) =>{
    let cityId = Number(req.query.city_id);
    let mealId = Number(req.query.meal_id);
    let cuisineId = Number(req.query.cuisine_id);
    let query = {};
    if(cityId && mealId && cuisineId){
        query = {city_id: cityId,"MealTypes.mealtype_id": mealId,"Cuisines.cuisine_id": cuisineId}
    }
    else if(cityId && mealId){
        query = {city_id: cityId,"MealTypes.mealtype_id": mealId}
    } else if(cityId && cuisineId){
        query = {city_id: cityId,"Cuisines.cuisine_id": cuisineId}
    } else if(cuisineId && mealId){
        query = {"Cuisines.cuisine_id": cuisineId,"MealTypes.mealtype_id": mealId}
    } 
    else if(cityId){
        query = {city_id: cityId}
    } else if(mealId){
        query = {"MealTypes.mealtype_id": mealId}
    } else if(cuisineId){
        query = {"Cuisines.cuisine_id": cuisineId}
    }
    db.collection('restaurants').find(query).toArray((err,result) =>{
        if(err) throw err;
        res.send(result);
    })
})

app.get('/mealtype',(req,res) =>{
    db.collection('mealtype').find().toArray((err,result) =>{
        if (err) throw err;
        res.send(result);
    })
})

app.get('/cuisine',(req,res) =>{
    db.collection('cuisine').find().toArray((err,result) =>{
        if (err) throw err;
        res.send(result);
    })
})

// Restuarant Details
app.get('/details/:id',(req,res) =>{
    let restId = Number(req.params.id); 
    // let restId = mongo.ObjectId(req.params.id)
    db.collection('restaurants').find({restuarant_id:restId}).toArray((err,result) =>{
        if (err) throw err;
        res.send(result);
    })
})


// Menu w.r.t Restaurants
app.get('/menu/:id',(req,res) =>{
    let restId = Number(req.params.id); 
    // let restId = mongo.ObjectId(req.params.id)
    db.collection('menu').find({restuarant_id:restId}).toArray((err,result) =>{
        if (err) throw err;
        res.send(result);
    })
})

// Filters
app.get('/filter/:mealId',(req,res) =>{
    let sort = {};
    let skip = 0;
    let limit = 10000000000000000000;
    let mealId = Number(req.params.mealId); 
    let cuisineId = Number(req.query.cuisine);
    let lcost = req.query.lcost;
    let hcost = req.query.hcost;
    let query = {};
    if(req.query.skip && req.query.limit){
        skip=Number(req.query.skip);
        limit=Number(req.query.limit);
    }
    if(req.query.sortPrice){
        sort = {cost:req.query.sortPrice};
    } else if(req.query.sortRating){
        sort = {rating:req.query.sortRating};
    } 
    if(cuisineId){
        query = {"Cuisines.cuisine_id": cuisineId,"MealTypes.mealtype_id": mealId};
    } else if(lcost&hcost) {
        query = {$and: [{cost:{$gt:lcost,$lt:hcost}}],"MealTypes.mealtype_id": mealId};
    } else{
        query = {"MealTypes.mealtype_id": mealId};
    }
    db.collection('restaurants').find(query).sort(sort).skip(skip).limit(limit).toArray((err,result) =>{
        if (err) throw err;
        res.send(result);
    })
})


// Place Orders(post)
app.post('/placeOrder',(req,res) =>{
    // console.log(req.body);
    db.collection('orders').insert(req.body,(err,result) =>{
        if (err) throw err;
        res.send(result);
    })
})


// Delete All Orders
app.delete('/orders',(req,res) =>{
    db.collection('orders').remove({},(err,result) =>{
        if (err) throw err;
        res.send('Order Added');
    })
})

// List all Orders
app.get('/orders',(req,res) =>{
    let email = req.query.email;
    let query = {};
    if(email){
        query = { email: email}
    }
    
    db.collection('orders').find(query).toArray((err,result) =>{
        if (err) throw err;
        res.send(result);
    })
})

// Menu items on user Selection
app.post('/menuItem',(req,res) =>{
    db.collection('menu').find({menu_id:{$in:req.body}}).toArray((err,result) =>{
        if (err) throw err;
        res.send(result);
    })
})

// Update Order
app.put('/updateOrder/:id',(req, res) =>{
    let oid = mongo.ObjectId(req.params.id);
    let status = req.query.status?req.query.status:"Pending";
    db.collection('orders').updateOne(
        {_id: oid},
        {$set:{
            "status": status
        }},(err,result) =>{
            if (err) throw err;
            res.send(`Status Updated to ${status}`);
        }
    )
})


MongoClient.connect(mongoURL, (err,client) => {
    if(err) console.log("Error while Connecting");
    db = client.db('zomato_clone');
    app.listen(port,() =>{
        console.log(`Listening to the port no. ${port}`);
    })
})