# Parent Information API Documentation

This API endpoint retrieves information about a parent based on their email.

## Request

- **HTTP Method:** `GET`
- **URL:** `<base_url>/parent/info`
  - production dns: https://www.coralacademydemo.com/
  - staging dns:  https://frontend-g03j.onrender.com/

- **Query Parameters:**
  - `email` (string, required): The email address of the parent.


  ``https GET /parent/info?email=parent@example.com``

## Response

The API response will contain information about the parent with the provided email.

Sample Success Response:

```
{
    "email": "test@gmail.com",
    "parentName": "abc",
    "childName": "xyz",
    "childAge": "12",
    "commPref": [
        "WhatsApp"
    ],
    "phoneNumber": "+9188888888",
    "knowabout": "Friends and Family",
    "additionalInfo": ""
}
```
Note: If the provided email does not match any parent records, the API will return an empty object (``{}``).