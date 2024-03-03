# Task Management API Documentation

## Introduction

Welcome to the Task Management API! This API allows you to manage tasks, create new tasks, update their status, and more.

## Authentication

To access the API, you need to include your API key in the request header.

```plaintext
Authorization: Bearer YOUR_API_KEY
Base URL
The base URL for all API endpoints is:

arduino
Copy code
https://api.taskmanager.com/v1
Endpoints
1. List all tasks
Method: GET
URL: /tasks
Description: Get a list of all tasks.
Parameters: None
Request Example:
json
Copy code
GET https://api.taskmanager.com/v1/tasks
Response Example:
json
Copy code
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "Complete API documentation",
      "status": "in_progress"
    },
    {
      "id": 2,
      "title": "Review task priorities",
      "status": "pending"
    }
  ]
}
2. Create a new task
Method: POST
URL: /tasks
Description: Create a new task.
Parameters:
title (string, required): The title of the task.
Request Example:
json
Copy code
POST https://api.taskmanager.com/v1/tasks
{
  "title": "Implement user authentication"
}
Response Example:
json
Copy code
{
  "status": "success",
  "data": {
    "id": 3,
    "title": "Implement user authentication",
    "status": "pending"
  }
}
3. Update task status
Method: PUT
URL: /tasks/{task_id}
Description: Update the status of a specific task.
Parameters:
status (string, required): The new status of the task (pending, in_progress, completed).
Request Example:
json
Copy code
PUT https://api.taskmanager.com/v1/tasks/3
{
  "status": "in_progress"
}
Response Example:
json
Copy code
{
  "status": "success",
  "data": {
    "id": 3,
    "title": "Implement user authentication",
    "status": "in_progress"
  }
}
Error Handling
The API returns standard HTTP status codes. In case of an error, additional information will be provided in the response body.

Rate Limiting
To prevent abuse, the API enforces rate limiting. You are allowed 100 requests per minute.

Status Codes
200 OK: Successful request.
201 Created: Resource successfully created.
204 No Content: Successful request with no response body.
400 Bad Request: Invalid request parameters.
401 Unauthorized: Missing or invalid API key.
404 Not Found: Resource not found.
429 Too Many Requests: Rate limit exceeded.
500 Internal Server Error: Server error.