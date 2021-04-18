const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()
const fileUpload = require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require("mongodb").ObjectId;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.in3ti.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
//Port
const port = process.env.PORT || 8080;
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('admins'))
app.use(fileUpload())

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db("SDSoftwares").collection("services");
  const reviewCollection = client.db("SDSoftwares").collection("review");
  const ordersCollection = client.db("SDSoftwares").collection("orders");
  const adminsCollection = client.db("SDSoftwares").collection("admins");

    app.get('/services', (req, res) => {
        servicesCollection.find()
        .toArray((err, documents) => {
            res.send(documents)
        })
    })

    app.get('/services/:id', (req, res) => {
        servicesCollection.find({_id: ObjectId(req.params.id)})
        .toArray((err, items) => {
          res.send(items)
        })
        
      })

      app.get('/checkOut/services/:id', (req, res) => {
        servicesCollection.find({_id: ObjectId(req.params.id)})
        .toArray((err, items) => {
          res.send(items)
        })
        
      })

    //Services Collections
    app.post('/addService', (req, res) => {
       const newServiceData = req.body;
       servicesCollection.insertOne(newServiceData)
       .then(result => {
           console.log("Inserted Count: ", result.insertedCount)
           res.send(result.insertedCount > 0)
       })
    })

    app.get('/reviews', (req, res) => {
        reviewCollection.find()
        .toArray((err, documents) => {
            res.send(documents)
        })
    })
    // Review Collections
    app.post('/addReview', (req, res) => {
        const newReview = req.body;
        console.log(newReview)
        reviewCollection.insertOne(newReview)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })
    // Add Orders

    app.get('/orders', (req, res) => {
      ordersCollection.find({email: req.query.email})
      .toArray((err, documents) => {
        res.send(documents)
      })
    })

    app.get('/ordersList', (req, res) => {
      ordersCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
    })

    app.post('/addOrder', (req, res) => {
      const order = req.body;
      ordersCollection.insertOne(order)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
    })

   app.get('/admins', (req, res) => {
     adminsCollection.find({})
     .toArray((err, documents) => {
       res.send(documents)
     })
   })

    app.post('/addAdmin', (req, res) => {
      const file = req.files.file;
      const name = req.body.name;
      const email = req.body.email;
      file.mv(`${__dirname}/admins/${file.name}`, error => {
        if(error){
          console.log(error)
          return res.status(500).send({msg: 'image upload faild'})
        }

      })
      adminsCollection.insertOne({fileName: file.name, name, email})
      .then(result => {
        res.send(result.insertedCount > 0)
      })
    })

    app.post('/isAdmin', (req, res) => {
      const email = req.body.email;
      adminsCollection.find({email: email})
      .toArray((err, admins) => {
        res.send(admins.length > 0)
      })
    })
    
});

 


app.get('/', (req, res) => {
    res.send("Working!")
})

app.listen(port)