# 🚀 Permanent Fix for "Connection Refused"

This project has been updated to prevent the "localhost refused to connect" error and make startup easier.

## 🛠 1. The Easy Way (One Double-Click)
I have created a file called **`start_edugen.bat`** in the main folder.
*   **To start the app:** Just double-click `start_edugen.bat`. It will start both the Frontend, Backend, and AI features automatically.
*   **Keep it running:** Leave the black window open while you use the site.

## 🛠 2. The Command Way
If you prefer using the terminal, you can now start EVERYTHING with a single command from the main folder:
```bash
npm run dev
```

## 🔐 3. Fix the "Not Secure" / HTTPS Warning
Since the app uses AI features (like camera/voice), it requires HTTPS. 
To fix the warning permanently:
1.  Open **https://localhost:5174** in your browser.
2.  When it says "Your connection is not private", click **Advanced**.
3.  Click **Proceed to localhost (unsafe)**.
4.  The browser will remember this, and you won't have to do it again for this session.

## 🧪 4. Common Problems
*   **Database Error:** Ensure **MongoDB** is running on your computer.
*   **Port Busy:** If it says "Address already in use", close any old terminal windows and try again.

---
*Fixed by Antigravity AI*
