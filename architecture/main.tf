# Configuration for deploying all cloud resources 

terraform {
    required_providers {
        aws = {
        source  = "hashicorp/aws"
        version = "~> 5.0"
        }
    }
}

provider "aws" {
    region = var.AWS_REGION
    access_key = var.AWS_ACCESS_KEY
    secret_key = var.AWS_SECRET_KEY
}

resource "aws_s3_bucket" "quiz_bucket" {
    bucket = "c17-kyle-thundle-bucket"
    force_destroy = true
    tags = {
        Name        = "c17-kyle-thundle-bucket"
        Environment = "Dev"
    }
}