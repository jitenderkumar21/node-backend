# Save Registration API Documentation

This API endpoint handles the registration and enrollment process for users.

## Request

- **HTTP Method:** `POST`
- **URL:** `<base_url>/save`
  - production dns: https://www.coralacademydemo.com/
  - staging dns:  https://frontend-g03j.onrender.com/

- **Query Parameters:**
  - `timezone` (string, optional): The timezone of the user. Default timezone is PST.

  

``https
  POST /save?timezone=America/New_York
``

Sample Request Body:
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
    "additionalInfo": "",
    "classDetails": [
        {
            "classid": "99",
            "className": "Test ongoing 3",
            "classTag": "Ongoing",
            "timeslots": [
                {
                    "subClassId": "99_3",
                    "timing": "Class 3: 3 March",
                    "isPast": false
                }
            ]
        }
    ],
    "want_another_slot": ""
}
```
## Response
  
The API response will indicate the success of the registration process.

Sample Success Response:

```
{
  "message": "Registration Successful"
}
```

## **Processing Steps**:

- Check if the provided email is in the list of blocked emails. If so, block the registration.

- Update counts for the classes based on the provided class details.

- Send confirmation email and calendar invites to the user.

- Send confirmation email to the admin with user and location details.
- Send confirmation email to the teacher and calendar invite if applicable

- Create and schedule WhatsApp/Email reminders.

- Save the enrollment details and parent information in the database/Sheets.
