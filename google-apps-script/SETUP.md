1. Open the spreadsheet:
   https://docs.google.com/spreadsheets/d/1gPuURhgf2P7a12m772raIUOzKKeB0ItdK8mib4yosXw/edit
2. Open Extensions > Apps Script.
3. Replace the script content with google-apps-script/code.gs.
4. Select the `setup` function in the toolbar and click Run. Approve the permissions.
   This creates the "RSVP" and "Wishes" sheets with headers (they are also created
   automatically on the first submission).
5. Click Deploy > New deployment > type: Web app.
   - Execute as: Me
   - Who has access: Anyone
6. Deploy and copy the Web App URL (ends in /exec).
7. In the project root, create a file named .env with:

VITE_GOOGLE_APPS_SCRIPT_URL=YOUR_WEB_APP_URL

8. Restart the Vite dev server (and set the same variable on your hosting provider).

Sheets and columns:
- RSVP:   Timestamp | Name | Phone | Attendance | Guests | Message | Invited As
- Wishes: Timestamp | Name | Message

Notes:
- After editing code.gs, use Deploy > Manage deployments > Edit > New version,
  otherwise the old code keeps running.
- The guestbook reads wishes with GET ?sheet=WISHES.
