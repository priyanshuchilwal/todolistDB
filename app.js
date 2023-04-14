// jshint esversion:5
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const { mongoose } = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb+srv://priyanshu_chilwal:BGqpQkRDXF3PrAp5@primary.mymwgce.mongodb.net/todolistDB?retryWrites=true&w=majority');
}

const itemsSchema = new mongoose.Schema({
    name: {
        type: String
    }
})

const listSchema = new mongoose.Schema({
    name: String,
    listItems: [itemsSchema]
})

const itemsModel = mongoose.model("item", itemsSchema);
const listModel = mongoose.model("list", listSchema);

const item1 = new itemsModel({
    name: "click + to enter item in to do list"
})
const item2 = new itemsModel({
    name: "<< this to remove item from list"
})

const defaultItems = [item1, item2];

const workItems = [];

app.get("/", function (req, res) {

    /*rendering from database*/

    itemsModel.find({})
        .then((items) => {

            if (items.length === 0) {

                itemsModel.insertMany(defaultItems).then(() => {
                    console.log("Items inserted successfully");
                })
                    .catch((err) => {
                        console.log(err);
                    })

                res.redirect("/")
            }

            else {

                const completeDate = date.getdate();
                res.render('list', { listTitle: completeDate, items: items });

            }
        })
        .catch((err) => {
            console.log(err)
        })

})

app.get("/:customListName", (req, res) => {

    const customListName = _.capitalize(req.params.customListName);

    listModel.findOne({ name: customListName })
        .then((foundList) => {
            if (!foundList) {

                const list = new listModel({
                    name: customListName,
                    listItems: defaultItems
                })
                list.save()

                res.redirect("/" + customListName)

            } else {

                res.render("list", { listTitle: foundList.name, items: foundList.listItems })

            }
        })
        .catch((err) => { console.log(err) })


})

app.post("/", (req, res) => {

    const itemName = req.body.newItem
    const listName = req.body.list;
    const item = new itemsModel({
        name: itemName
    })

    if (listName === date.getdate()) {
        item.save()
        res.redirect("/");
    } else {
        listModel.findOne({ name: listName })
            .then((foundList) => {
                foundList.listItems.push(item);
                foundList.save();
                res.redirect("/" + listName)
            })
            .catch(err=>{
                console.log(err); 
            })
    }

})

app.post("/delete", (req, res) => {
    const delItem = req.body.checkbox
    const listName = req.body.listName

    if (listName === date.getdate()) {

        itemsModel.deleteOne({ _id: delItem })

            .catch(err => {
                console.log(err)
            })
        res.redirect("/");

    } else {
        listModel.updateOne({ name: listName }, {
            $pull: { listItems: { _id: delItem } }
        })
            .then((foundList) => {
                res.redirect("/" + listName);
            })
            .catch(err => {
                console.log(err);
            })
    }

})

app.listen('3000', function () {
    console.log("server is running on port 3000!");
})