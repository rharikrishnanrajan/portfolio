#!/bin/bash

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="YOUR_AWS_ACCOUNT_ID"
ECR_REPO_NAME="harikrishnan-portfolio"
IMAGE_TAG="latest"

# 1. Authenticate Docker to AWS ECR
echo "Authenticating to AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# 2. Build the Docker image
echo "Building Docker image..."
docker build -t $ECR_REPO_NAME .

# 3. Tag the image
echo "Tagging image for ECR..."
docker tag $ECR_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG

# 4. Push the image to ECR
echo "Pushing image to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG

echo "Deployment to ECR complete!"
echo "Next step: Update your ECS Task Definition and Service to use the new image."
