const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

mongoose.connect("mongodb+srv://admin-mustafa:personal12345@cluster0.gp03t.mongodb.net/todolistDB" , {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
    name: String
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const Item = mongoose.model("Item" , itemSchema);
const List = mongoose.model("List" , listSchema);

const item1 = new Item({
    name: "Buy Food"
})

const item2 = new Item({
    name: "Cook Food"
})

const item3 = new Item({
    name: "Eat Food"
})

const defaultItems = [item1,item2,item3];


app.set('view engine' , 'ejs');
app.use(bodyParser.urlencoded({extended:true}));


app.use(express.static("public"));

app.get("/" , function(req,res){
    Item.find({},function(err,foundItem){
        if (foundItem.length === 0){
            Item.insertMany(defaultItems,function(err){
                if (!err){
                    console.log("Successfully Added");
                }
            });
            res.redirect("/");
        } else {
            res.render("list" , {listTitle: "Today" , listItems: foundItem});
        }
    });
});

app.post("/" , function(req,res){
    let itemName = req.body.todoItem;
    let listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName} , function(err,foundList){
            if (!err){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            }
        });
    }

});

app.post("/delete", function(req,res){
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
        Item.deleteOne({_id: checkedItemID},function(err){
            if (err){
                console.log(err); 
            } else {
                console.log("Successfully Deleted");
            }
        });
    
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name:listName} , {$pull : {items: {_id:checkedItemID}}}, function(err,foundList){
            if (err){
                console.log(err);
            } else {
                res.redirect("/" + listName);
            }
        });
    }
    
});

app.get("/:topic", function(req,res){
    const customListName = _.capitalize(req.params.topic);

    List.findOne({name: customListName} , function(err,foundList){
        if (!foundList){
            //Create a new list 
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            list.save();
            res.redirect("/" + customListName);
        } else {
            //List already exists
            res.render("list" , {listTitle: foundList.name , listItems: foundList.items})
        }
    });
});

app.listen(3000,function(){
    console.log("Server is running on port 3000");
})