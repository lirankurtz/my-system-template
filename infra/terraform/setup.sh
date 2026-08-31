#!/bin/bash
set -e

# Terraform Infrastructure Setup Script
# This script initializes GCS state bucket and sets up Terraform

PROJECT_ID="my-system-template"
STATE_BUCKET="my-system-template-tf-state"
REGION="us-central1"

echo "=========================================="
echo "Terraform Setup for $PROJECT_ID"
echo "=========================================="

# 1. Set up Google Cloud authentication
echo ""
echo "Step 1: Setting up Google Cloud authentication..."
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
  export GOOGLE_APPLICATION_CREDENTIALS="../terraform-sa.json"
  echo "Using service account: $GOOGLE_APPLICATION_CREDENTIALS"
fi
echo "✓ GCP auth configured"

# 2. Initialize Terraform
# Note: Using local backend for now (GCS backend will be configured after initial setup)
echo ""
echo "Step 2: Initializing Terraform..."
terraform init
echo "✓ Terraform initialized"

# 3. Plan infrastructure
echo ""
echo "Step 3: Planning infrastructure (creating tfplan)..."
terraform plan -out=tfplan
echo "✓ Plan generated (saved to tfplan)"

# 4. Show plan summary
echo ""
echo "=========================================="
echo "Plan Summary"
echo "=========================================="
terraform show -no-color tfplan

echo ""
echo "Review the plan above. To apply, run:"
echo "  terraform apply tfplan"
echo ""
echo "After applying, outputs will be available via:"
echo "  terraform output -raw database_url"
