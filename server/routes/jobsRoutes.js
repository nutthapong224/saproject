import express from "express";
import userAuth from "../middleware/authmiddleware.js";
import {
  createJob,
  deleteJobPost,
getJobbyId,
  getJobPosts,
  updateJob,
} from "../conteollers/jobController.js";

const router = express.Router();

//POST JOBS
router.post("/upload-job", userAuth, createJob);

//IPDATE JOB

// Ensure this route matches the parameter name used in the controller
router.put("/update-job/:jobId", userAuth, updateJob);

//GET JOB POST

router.get("/find-jobs", getJobPosts);

router.get("/get-job-detail/:id", getJobbyId);

//DELETE JOB POST

router.delete("/delete-job/:id", userAuth, deleteJobPost);

export default router;
