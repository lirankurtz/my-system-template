variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "my-system-template"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "myapp"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}
