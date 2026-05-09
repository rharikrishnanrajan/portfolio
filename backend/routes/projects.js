const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// GET all projects
router.get('/', async (req, res) => {
    try {
        // const projects = await Project.find().sort({ createdAt: -1 });
        // For now, return mock data since DB might not be connected
        const projects = [
            {
                title: 'Automated Microservices Deployment',
                description: 'Designed and implemented a fully automated CI/CD pipeline for deploying microservices to AWS ECS using GitHub Actions, Docker, and Terraform. Reduced deployment time by 40%.',
                techStack: ['AWS ECS', 'Docker', 'GitHub Actions', 'Terraform']
            },
            {
                title: 'Serverless Data Processing Pipeline',
                description: 'Built a serverless architecture using AWS Lambda, S3, and DynamoDB to process large streams of data in real-time. Handled over 1M requests per day with 99.9% uptime.',
                techStack: ['AWS Lambda', 'DynamoDB', 'Python', 'API Gateway']
            }
        ];
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new project (Admin Only)
router.post('/', async (req, res) => {
    const project = new Project({
        title: req.body.title,
        description: req.body.description,
        techStack: req.body.techStack,
        githubLink: req.body.githubLink,
        imageUrl: req.body.imageUrl
    });

    try {
        const newProject = await project.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
