import jwt from "jsonwebtoken";
import User from "../models/User.js";
import "dotenv/config";

const protectRoute = async(req,res,next)=>{
    try{
        const token = req.header("Authorization").replace("Bearer","");
        if(!token) return res.status(401).json({message:"No authentication token, ACCESS DENIED"});

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user =await User.findById(decoded.userId).select("-password");
        if(!user) return res.status(401).json({message:"Invalid token"});

        req.user = user;
        next();

    }catch(err){
        console.error("Authentication error", err.message);
        res.status(401).json({message: "INVALID TOKEN"});
    }
}

export default protectRoute;