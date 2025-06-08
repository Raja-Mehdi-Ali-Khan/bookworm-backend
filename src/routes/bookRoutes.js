import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js"
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

//create
router.post("/", protectRoute, async(req,res)=>{

    try{
        
        const { title, caption, rating, image} = req.body;

        if(!image || !title || !caption || !rating){
            return res.status(400).json({message: "Please provide all fields"});
        }

        const uploadRes = await cloudinary.uploader.upload(image);
        const imagUrl = uploadRes.secure_url;

        const newBook = new Book({
            title,
            caption,
            rating,
            image:imagUrl,
            user: req.user._id,
        })
        
        await newBook.save();

        res.status(201).json(newBook)

    }catch(error){
        console.log("Error creating book");
        res.status(400).json({message: error.message})
    }

});

router.get("/", protectRoute, async(req,res)=>{
    try{

        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page-1)*limit;

        const books = await Book.find()
        .sort({createdAt: -1}) //latest post first
        .skip(skip)
        .limit(limit)
        .populate("user", "username profileImage");

        const totalBooks = await Book.countDocuments();

        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks/limit),
        });

    }catch(err){
        console.log("Error in get all books route", err);
        res.status(500).json({message: "Internal server Error"});
    }
});

router.get("/user", protectRoute, async(req,res)=>{
    try {
        const books = await Book.find({user: req.user._id}).sort({createdAt: -1});
        res.json(books);
    } catch (error) {
        console.error("Get user books error:", error);
        res.status(500).json({message:"Server error"});
    }
});

//delete
router.delete("/:id", protectRoute, async(req, res)=>{
    try{
        const book = await Book.findById(req.params.id);
        if(!book) return res.status(404).json({message: "book not found"})

        if(book.user.toString() !== req.user._id.toString())
            return res.status(401).json({message: "Unauthorized"});

        //delete image from cloudinary
        if(book.image && book.image.includes("cloudinary")){
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (delError) {
                console.log("Error deleting image from cloudinary", delError);
                res.status(500).json({message:"Internal server error"});
            }
        }

        await book.deleteOne();

        res.json({message: "Book deleted successfully"});

    }catch(error){
        console.log("Error deleting book", error);
        res.status(500).json({message:"Internal server error"});

    }
});



//update




export default router;