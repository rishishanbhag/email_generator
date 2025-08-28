import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import {inngest} from "../inngest/client.js"

export const signup= async(req,res)=>{
    const {email,password,skills=[]}=req.body
    try {
        const hashedPassword= await bcrypt.hash(password,10)
        const user= await User.create({email,password:hashedPassword,skills})

        //toggle inngest
        await inngest.send({
            name:"user/signup",
            data:{
                email:user.email,
            }
        })

        const token= jwt.sign({id:user._id},{role:user.role},process.env.JWT_SECRET)
        res.status(201).json({user,token})

    } catch (error) {
        res.status(500).json({detail:error.message,error:"signup failed"})
    }
}

export const login= async(req,res)=>{
    const {email,password}=req.body
    try {
        const user= await User.findOne({email})
        if(!user) return res.status(404).json({error:"user not found"})

        const isMatch= await bcrypt.compare(password,user.password)
        if(!isMatch) return res.status(401).json({error:"invalid credentials"})

        const token= jwt.sign({id:user._id},{role:user.role},process.env.JWT_SECRET)
        res.status(200).json({user,token})

    } catch (error) {
        res.status(500).json({detail:error.message,error:"signup failed"})
    }
}

export const logout=async (req,res)=>{

    
  //     Gets the Authorization header from the request
  // Splits it by space " " to separate "Bearer" from the actual token
  // Takes the second part [1] which is the JWT token
  // Expected format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  // Result: token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

  try {
    const token = req.headers.authorization.split(" ")[1];  //refer the above
    if (!token) return res.status(401).json({ error: "no token provided" });

  } catch (error) {
    res.status(500).json({ detail: error.message, error: "Unauthorized" });
  }
}

export const updateUser = async (req, res) => {
  const { skills = [], role, email } = req.body;
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ eeor: "Forbidden" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "User not found" });

    await User.updateOne(
      { email },
      { skills: skills.length ? skills : user.skills, role }
    );
    return res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};


export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const users = await User.find().select("-password");
    return res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};

// signup
// event = {
//     data: {
//         email: "user@example.com"
//     }
// }

// inngest toggle flow from onSignup fnc



// logout --
// the jwt is stateless meaning,if someone has the jwt,ha can always be logged in
// unless the cookies are cleared or the token is revoked