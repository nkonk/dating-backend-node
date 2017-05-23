 var mongoose = require("mongoose");
 mongoose.connect("mongodb://ec2-103-4-9-102.ap-northeast-1.compute.amazonaws.com/SpeedDating");

 var db = mongoose.connection;

 db.on("error", console.error.bind(console, "connection error"));
 db.once("open", function(callback) {
     console.log("Connection succeeded.");
 });

var User = require('./user');
User.findOne(function(err,i){console.log(err +  i)})
/* var UserSchema = new mongoose.Schema({
     name: String
 });

 var User = mongoose.model("User", UserSchema);

 var PostSchema = new mongoose.Schema({
     title: String,
     postedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
     }
 });

 var Post = mongoose.model("Post", PostSchema);

 var alex = new User({
     name: "Alex"
 });

 var joe = new User({
     name: "Joe"
 })

 alex.save();
 joe.save();


 var post = new Post({
    title: "Hello World",
    postedBy: alex._id
})
*/

/*post.save(function(error) {
    if (!error) {
        Post.find({})
            .populate('postedBy')
            // .populate('comments.postedBy')
            .exec(function(error, posts) {
                console.log(JSON.stringify(posts, null, "\t"))
            })
    }
});*/
 /*var Schema = mongoose.Schema;

 var bugSchema = new Schema({
     bugName: String,
     bugColour: String,
     Genus: String
 });

 var Bug = mongoose.model("Bug", bugSchema);

 var Bee = new Bug({
     bugName: "Scruffy",
     bugColour: "Orange",
     Genus: "Bombus"
 });

Bee.save(function(error) {
     console.log("Your bee has been saved!");
 if (error) {
     console.error(error);
  }
 });
 */
