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

resource "aws_iam_role" "quiz_glue_role" {
  name = "c17-kyle-thundle-glue-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "glue.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "quiz_glue_policy" {
  role       = aws_iam_role.quiz_glue_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole"
}

resource "aws_iam_role_policy" "quiz_glue_s3_access" {
  name = "c17-kyle-thundle-glue-s3-access"
  role = aws_iam_role.quiz_glue_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ],
        Resource = [
          "arn:aws:s3:::${aws_s3_bucket.quiz_bucket.bucket}",
          "arn:aws:s3:::${aws_s3_bucket.quiz_bucket.bucket}/*"
        ]
      }
    ]
  })
}

resource "aws_glue_catalog_database" "quiz_catalog" {
  name = "c17-kyle-thundle-catalog"
}

resource "aws_glue_crawler" "quiz_crawler" {
  database_name = aws_glue_catalog_database.quiz_catalog.name
  name          = "c17-kyle-thundle-crawler"
  role          = aws_iam_role.quiz_glue_role.arn

  s3_target {
    path = "s3://${aws_s3_bucket.quiz_bucket.bucket}"
  }
}

resource "aws_glue_trigger" "quiz_trigger" {
  name     = "c17-kyle-thundle-trigger"
  schedule = "cron(0 0 1 * ? *)"
  type     = "SCHEDULED"

  actions {
    crawler_name = aws_glue_crawler.quiz_crawler.name
  }
}