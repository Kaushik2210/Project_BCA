import { google } from "googleapis";

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);

oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

const createMeetLink=async(date,startTime,endTime,otherEmail)=>{
    console.log("Creating Google Meet link with date:", date, "startTime:", startTime, "endTime:", endTime);
    const calendar=google.calendar({
        version:"v3",
        auth:oAuth2Client
    })

    const event={
        summary:"Appointment with pastor",
        start:{
            dateTime:startTime,
            timeZone:"Asia/Kolkata"
        },
        end:{
            dateTime:endTime,
            timeZone:"Asia/Kolkata"
        },
        attendees:[
            {email:"resurrectionbaptist25@gmail.com"},
            {email:otherEmail}
        ],
        conferenceData:{
            createRequest:{
                requestId:"meet"+Date.now(),
                conferenceSolutionKey:{
                    type:"hangoutsMeet"
                }
            }
        }
    }

    const response=await calendar.events.insert({
        calendarId:"resurrectionbaptist25@gmail.com",
        resource:event,
        conferenceDataVersion:1,
        sendUpdates:"all"
    })

    //logging the entire response for debugging
    //console.log("Event created:", response.data);

    return response.data.hangoutLink;
}

export {createMeetLink};