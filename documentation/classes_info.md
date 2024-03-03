# Get Classes Information API Documentation

## Endpoint: `/info`

This API endpoint lists classes based on the user's timezone.

### Request

- **HTTP Method:** `GET`
- **URL:** `<base_url>/info`
  - production dns: https://www.coralacademydemo.com/
  - staging dns:  https://frontend-g03j.onrender.com/

- **Query Parameters:**
  - `timezone` (string, optional): The timezone of the user.


``https
GET /info?timezone=America/New_York
``

## Response

The API response will contain an array of class information based on the provided user timezone.

Sample Success Response:
```
[
  {
    "id": "101",
    "title": "Intro to Coding",
    "class_details": "Explore coding basics in this hands-on class.",
    "prerequisite": "No prior coding experience needed.",
    "learning_outcomes": "Gain a fundamental understanding of coding concepts.",
    "about_teacher": "Experienced instructor passionate about coding education.",
    "teaching_philosophy": "Make coding fun and accessible for everyone.",
    "teacher_pic": "https://dummyimage.com/150x150.png",
    "age_group": "12-18 years old",
    "duration": "1 Hour",
    "link": "https://dummylink.com",
    "tutor": "John Coder",
    "expand": true,
    "display_timing": "Mondays, 4:00 PM - 5:00 PM (PST)",
    "isMoveToPast": false,
    "timeslots": [
      {"subClassId": "101_1", "timing": "Class 1: 28 February", "isPast": false}
    ],
    "isSlotOpen": ["yes"]
  }
]
```

Note: If timezone is not present, PST is treated as default timezone.