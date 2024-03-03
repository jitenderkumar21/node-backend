# Get Full Classes API Documentation

This API endpoint provides information about classes and their sub-classes that have reached their maximum learner capacity.

## Request

- **HTTP Method:** `GET`
- **URL:** `<base_url>/classes`
  - production dns: https://www.coralacademydemo.com/
  - staging dns:  https://frontend-g03j.onrender.com/

  ```https GET /classes```

## Response
- The response indicates which sub-classes for each class have reached their maximum learner capacity.
- An empty array for a class ID signifies that none of its sub-classes have reached the maximum capacity.
  
Sample Success Response:

```
{
  "120": ["120_4", "120_2", "120_3", "120_5"],
  "121": []
}
```
