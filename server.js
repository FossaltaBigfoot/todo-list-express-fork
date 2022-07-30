const express = require('express') //making it possible to use express within this file
const app = express() //setting a variable and assigning it to the instance of express
const MongoClient = require('mongodb').MongoClient //makes it possible to use methods associated with MongoClient and talk to our DB
const PORT = 2121 //setting a constant to determine the location where our server will be listening
require('dotenv').config() //allows us to look for variables inside of the .env file


let db, //Just declaring the variable called db but not assigning it to anything yet (we are declaring it Globally so we can use it anywhere)
    dbConnectionStr = process.env.DB_STRING, //Declaring a variable and assigning our database connection string to it
    dbName = 'todo' //declaring a variable and assigning the name of the database we will be using

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }) //Creating a connection to MongoDB and passing in our connection string. Also passing in an additional property
    .then(client => { //We are waiting for the connection and proceeding if successful, and passing in all the client information. We are using .then here because MongoClient.connect starts a promise. We use a promise because we only want to run this code if it connects to the database
        console.log(`Connected to ${dbName} Database`) //Log to the console a template literal "connected to todo Database"
        db = client.db(dbName) //Assiging a value to previously declared db variable that contains a db client factory method
    }) //closing our .then
    
//middleware 
app.set('view engine', 'ejs') // Sets ejs as the default render method
app.use(express.static('public')) // Sets the location for our static assets such as CSS, HTML etc.
app.use(express.urlencoded({ extended: true })) // Tells express to decode and encode URLs where the heaeder matches the content. Supports arrays and objects
app.use(express.json()) // Parses JSON content from incoming requests


app.get('/',async (request, response)=>{ // Starts the GET mehtod when the root route is passed in, sets up the req and res parameters
    const todoItems = await db.collection('todos').find().toArray() // Sets a variable and awaits ALL items from the todos collection
    const itemsLeft = await db.collection('todos').countDocuments({completed: false}) // Sets a variable and awaits a count of uncompleted items to display in EJS
    response.render('index.ejs', { items: todoItems, left: itemsLeft }) // Rendering the EJS file and passing through the db items and the count remaining inside of an object

    // This commented out code is just how you could use it using a traditional promise/then instead of using the async/await as displayed above 
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

app.post('/addTodo', (request, response) => { //Starts a POST method when the addTodo route is passed in
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false}) // Inserts a new item into todos collection, gives it a completed value of false by default
    .then(result => { //if insert is succesful, do something
        console.log('Todo Added') // Console log action
        response.redirect('/') // Gets rid of the /addTodo route, and redirects to the home page
    }) // Closing the .then
    .catch(error => console.error(error)) // Catching errors
}) // Ending the POST method

app.put('/markComplete', (request, response) => { //Starts a Put method when the /markComplete route is passed in
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ // Look in the database for one item meatching the name of the item passed in from the main.js file that was clicked on
        $set: { 
            completed: true // Set completed status to true
          }
    },{
        sort: {_id: -1}, // Moves item to the bottom of the list
        upsert: false // Prevents insertion if item does not already exist
    })
    .then(result => { // Starts a then if update was successful 
        console.log('Marked Complete') // Logging successful completion
        response.json('Marked Complete') // Sending a response back to the sender
    }) // Closing the .then
    .catch(error => console.error(error)) // Catching errors

}) // Closing/ending our PUT method

app.put('/markUnComplete', (request, response) => { // Starts a PUT method when the /markUnComplete route is passed in
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ //Look in the database for one item matchin ght ename of the item passed in from the main.js file that was clicked on
        $set: { 
            completed: false // Set completed status to false
          }
    },{
        sort: {_id: -1}, // Moves item to the bottom of the list
        upsert: false // Prevents insertion if item does not already exist
    })
    .then(result => { // Starts a then if update was successful 
        console.log('Marked Complete') // Logging successful completion
        response.json('Marked Complete') // Sending a response back to the sender
    }) // Closing the .then
    .catch(error => console.error(error)) // Catching errors

}) // Closing/ending our PUT method

app.delete('/deleteItem', (request, response) => { // Starts a DELETE method when the delete route is passed in
    db.collection('todos').deleteOne({thing: request.body.itemFromJS}) // Look inside the todos collection for the ONE item that has a mathcing name from our JS file
    .then(result => { // Starts a then if delete was successful
        console.log('Todo Deleted') // Logging successful completion
        response.json('Todo Deleted') // Sending a response back to the sender
    })
    .catch(error => console.error(error)) // Catching errors

}) // Closing/ending our PUT method

app.listen(process.env.PORT || PORT, ()=>{ // Setting up which Port we will be listening on - either in our .env file or the PORT variable we set
    console.log(`Server running on port ${PORT}`) // Console log the running Port
}) // End the listen