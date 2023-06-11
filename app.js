const express = require("express");
const bodyParser = require("body-parser");
const https = require("https"); 
const date = require(__dirname + "/date.js"); //External Module
const app = express();
const mongoose = require('mongoose');
const _ =require('lodash');
//var popup = require('popups');

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

const port = 3000;
const day = date.getDate();

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

app.set('view engine', 'ejs');

const itemsSchema = new mongoose.Schema({
    name : String
})

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name : "Welcome"
})
const item2 = new Item({
    name : "Todo"
})
const item3 = new Item({
    name : "List"
})

const defaultItems = [item1,item2,item3];

app.get('/', (req,res) => {

    Item.find().then(foundItems =>{

          if(foundItems.length===0){
            Item.insertMany(defaultItems).then(err =>{
            if(err)
            {
                console.log(err);
            }
            else{
                console.log("Success");
            }
        });

        res.redirect('/');
          }
          else{
            res.render('list', {listTitle: day, newListItem: foundItems});
          }
        
        })
    });

app.post("/",(req,res)=>{

    //console.log(req.body);

    let itemName = req.body.newItem;
    let listName = req.body.list;

    const item = new Item ({
        name: itemName
    })

    if (req.body.list === day){
    item.save();
    res.redirect("/");
    }
    else{
    List.findOne({name: listName}).then(foundList =>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
    }
});

app.post("/delete",(req,res)=>{

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

    if(listName === day){
    Item.deleteOne({ _id: checkedItemId })
  .then(result => {
   // console.log('Deletion result:', result);
    res.redirect("/");
  })}
  else{
   List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}})
    .then(result => {
     // console.log('Deletion result:', result);
      res.redirect("/"+listName);
  })
  }
  
})


app.get('/about',(req,res) => {
    res.render('about');
});

const listSchema = new mongoose.Schema({
    name : String,
    items: [itemsSchema]
})

const List = mongoose.model("List",listSchema);

app.get("/:customListName",(req,res)=>{
  const customListName = _.capitalize(req.params.customListName);
  // console.log(customListName);

  List.findOne({name : customListName}).then((foundItem) => {
    if(foundItem){
     res.render('list', {listTitle: customListName, newListItem: foundItem.items});
    }
     else{
      //Create New List
      const list = new List({
      name: customListName,
      items: defaultItems
    })
    list.save();
    res.redirect('/'+customListName);
  }
  })
})

app.listen(process.env.PORT || port, () => {
    console.log(`Listening at ${port}`);
});
