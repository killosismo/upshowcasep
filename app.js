var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var cloudinary = require('cloudinary');
var method_override = require("method-override");
var app_password = "1234567";

cloudinary.config({
	cloud_name: "killo",
	api_key: "824365217814144",
	api_secret: "b_LbTOPS-I1NdspNIWWegTqQlCY"
});

var app = express();

mongoose.connect("mongodb://localhost/upshowcase");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({dest: "./uploads"}));
app.use(method_override("_method"));

//definie schema de productos
var productSchema = {
	title:String,
	description:String,
	imageUrl:String,
	pricing:Number
};

var Product = mongoose.model("Product", productSchema);

app.set("view engine","jade");

app.use(express.static("public"));

app.get("/", function(req,res){
	res.render("index");
});

app.get("/productos",function(req,res){
	Product.find(function(error,documento){
		if(error){ console.log(error);}
		res.render("productos/index",{ products: documento })
	});
});

app.put("/productos/:id",function(req,res){
	if(req.body.password == app_password){
		var data = {
			title: req.body.title,
			description: req.body.description,
			pricing: req.body.pricing
		};

		if(req.files.hasOwnProperty("image_avatar")){

			cloudinary.uploader.upload(req.files.image_avatar.path, 
			function(result) { 
				data.imageUrl = result.url;

				Product.update({"_id": req.params.id},data,function(product){
			res.redirect("/productos");
				});
			}
         );

		
	}else{
		Product.update({"_id": req.params.id},data,function(product){
			res.redirect("/productos");
			});
	}



	}else{
		res.redirect("/");
	}
});

app.get("/productos/edit/:id",function(req,res){
	var id_producto = req.params.id;

	Product.findOne({"_id": id_producto},function(error,producto){
		console.log(producto);
		res.render("productos/edit",{ product: producto });;
	});

});

app.post("/admin",function(req,res){
	if(req.body.password == app_password){
		Product.find(function(error,documento){
		if(error){ console.log(error);}
		res.render("admin/index",{ products: documento })
	});
		}else{
			res.redirect("/");
}
});

app.get("/admin", function(req,res){
	res.render("admin/form")
});

app.post("/productos", function(req,res){
	if(req.body.password == app_password){
		var data = {
			title: req.body.title,
			description: req.body.description,
			imageUrl: "data.png",
			pricing: req.body.pricing
		}

		var product = new Product(data);

		if(req.files.hasOwnProperty("image_avatar")){
			cloudinary.uploader.upload(req.files.image_avatar.path, 
			function(result) { 
				product.imageUrl = result.url;

				product.save(function(err){
					console.log(product);
					res.redirect("/productos");
				});
			}
         );
		}else{product.save(function(err){
					console.log(product);
					res.redirect("/productos");
				});
	}

		
	}else{
		res.render("productos/new");
	}

	
});

app.get("/productos/new", function(req,res){

	res.render("productos/new")
});

app.get("/productos/delete/:id",function(req,res){
	var id= req.params.id;

	Product.findOne({"_id" :id },function(err,producto){
		res.render("productos/delete",{ producto: producto });
	});
});

app.delete("/productos/:id",function(req,res){
	var id = req.params.id;
	if(req.body.password == app_password){
		Product.remove({"_id" :id },function(err){
			if(err){ console.log(err); }
			res.redirect("/productos");
		});
	}else{
		res.redirect("/productos");

}
});




app.listen(8080);