const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res){
    fs.readdir("./files" , function(err, files){
        if(err){
            return res.send("Error reading the files");
        } else{
            const tasks=[];
            files.forEach(file =>{
                const content = fs.readFileSync(path.join(__dirname,"files", file), "utf-8");
                const json = JSON.parse(content);
                tasks.push({title : json.title, description : json.description, filename : file});
            })
            res.render("index", {tasks : tasks});
        }
    })
})

app.post("/create", function(req, res){
    const {title, description} = req.body;
    const content = JSON.stringify({ title, description });
    const fileName = `task-${Date.now()}.txt`;
    fs.writeFileSync(path.join(__dirname, "files", fileName), content);
    res.redirect("/");
})

app.get("/task/:filename", function(req,res){
    const filename = req.params.filename;
    const filepath = path.join(__dirname, "files", filename);
    fs.readFile(filepath, "utf-8", function(err, data){
        if(err){
            return res.send("Task not found");
        }
        const json = JSON.parse(data);
        res.render("task", { title: json.title, description: json.description });
    });
})

app.post("/done/:filename", function(req, res){
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "files", filename);

    // Delete the task file
    fs.unlink(filePath, (err) => {
        if (err) {
            console.log("Error deleting the file:", err);
            return res.status(500).send("Error deleting the file");
        }
        // Redirect back to the home page after deletion
        res.redirect("/");
    });
});

app.listen(3000);