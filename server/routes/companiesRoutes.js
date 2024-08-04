import express from "express"; 
import rateLimit from "express-rate-limit";
import { getCompanies, getCompanyByID, getCompanyJobListing, getCompanyProfile, register, signIn,updateCompanyProfile } from "../conteollers/companiesConteoller.js";
import userAuth from "../middleware/authmiddleware.js";


const router = express.Router(); 

//in rate limit
const limiter = rateLimit({
  WindowMs: 15 * 60 * 1000, //15 min
  max: 100, //linit 100ip request per window here per 15min
  standardHeaders: true, //Return rate limit in the 'Rate limit' hearder
  legacyHeaders: false, //disible the 'X-RateLinit'
});

//REGISTER
router.post("/register",limiter,register);  
 
//LOGIN 

router.post("/login",limiter,signIn); 

router.post("/get-company-profile",userAuth,getCompanyProfile); 
router.post("/get-company-joblisting",userAuth,getCompanyJobListing);  
router.get("/",getCompanies); 
router.get("/get-company/:id",getCompanyByID); 

//UPDATE DATA 
router.put("/update-company",userAuth,updateCompanyProfile);


export default router;




