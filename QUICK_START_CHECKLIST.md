# 🚀 Quick Start Checklist

Print this page and check off each step as you complete it!

## ☐ Step 1: Azure AD Setup (15 minutes)

- [ ] Go to https://portal.azure.com
- [ ] Navigate to Azure Active Directory
- [ ] Click "App registrations" → "New registration"
- [ ] Name it "LJ Services Ticket System"
- [ ] Select "Accounts in any organizational directory and personal Microsoft accounts"
- [ ] Add redirect URI: `http://localhost:8000` (for testing)
- [ ] Click "Register"
- [ ] **Copy your Client ID** and save it somewhere safe
- [ ] Go to "API permissions"
- [ ] Add permission: Microsoft Graph → Delegated → User.Read
- [ ] Add permission: Microsoft Graph → Delegated → Mail.Send
- [ ] Click "Grant admin consent"

**Your Client ID:** ________________________________

---

## ☐ Step 2: Test Locally (10 minutes)

- [ ] Download/extract the ticket-system folder
- [ ] Open `app.js` in a text editor
- [ ] Find line 3: `clientId: 'YOUR_CLIENT_ID_HERE'`
- [ ] Replace with your actual Client ID
- [ ] Save the file
- [ ] Open terminal/command prompt
- [ ] Navigate to ticket-system folder
- [ ] Run: `python -m http.server 8000`
- [ ] Open browser to: http://localhost:8000
- [ ] Click "Sign in with Microsoft"
- [ ] Log in with your Outlook account
- [ ] Create a test ticket
- [ ] ✅ Everything works!

---

## ☐ Step 3: GitHub Setup (10 minutes)

- [ ] Go to https://github.com
- [ ] Click "+" → "New repository"
- [ ] Name: `ticket-system`
- [ ] Choose Public or Private
- [ ] Don't initialize with README
- [ ] Click "Create repository"
- [ ] Copy the repository URL

**Your GitHub Repo:** https://github.com/____________/ticket-system

---

## ☐ Step 4: Push to GitHub (5 minutes)

Open terminal in ticket-system folder and run:

```bash
- [ ] git init
- [ ] git add .
- [ ] git commit -m "Initial commit: LJ Services Ticket System"
- [ ] git branch -M main
- [ ] git remote add origin [YOUR_REPO_URL]
- [ ] git push -u origin main
```

---

## ☐ Step 5: Enable GitHub Pages (5 minutes)

- [ ] Go to your repository on GitHub
- [ ] Click "Settings" tab
- [ ] Click "Pages" in left menu
- [ ] Under "Source" select "main" branch
- [ ] Click "Save"
- [ ] Wait 2 minutes, then refresh
- [ ] Copy your GitHub Pages URL

**Your Live URL:** https://____________.github.io/ticket-system/

---

## ☐ Step 6: Update Azure AD (2 minutes)

- [ ] Go back to Azure Portal
- [ ] Open your App registration
- [ ] Click "Authentication"
- [ ] Click "Add URI"
- [ ] Paste your GitHub Pages URL
- [ ] Click "Save"

---

## ☐ Step 7: Final Testing (5 minutes)

- [ ] Visit your GitHub Pages URL
- [ ] Click "Sign in with Microsoft"
- [ ] Log in with Outlook account
- [ ] Create a test ticket
- [ ] Assign it to someone
- [ ] Change the status
- [ ] Add an update
- [ ] Verify statistics update
- [ ] Test search function
- [ ] Test filters
- [ ] ✅ EVERYTHING WORKS!

---

## ☐ Step 8: Share with Team (2 minutes)

- [ ] Send Linda the GitHub Pages URL
- [ ] Share USER_GUIDE.md with team
- [ ] Create first real ticket together
- [ ] Show Linda how to assign work to Kevin

---

## 🎉 Success!

You now have a fully functional ticketing system!

**Live URL:** ________________________________

**Share this URL with:**
- [ ] Linda Johnson (Manager)
- [ ] Kevin (You)
- [ ] Team Member: _______________
- [ ] Team Member: _______________
- [ ] Team Member: _______________

---

## 📋 Optional Customization

Want to customize? Edit these files:

- [ ] **app.js** - Add/remove team members (line 38)
- [ ] **app.js** - Add/remove associations (line 20)
- [ ] **styles.css** - Change colors (line 1-10)

---

## 🆘 If Something Goes Wrong

**Can't log in?**
→ Check Azure AD redirect URI matches your URL exactly

**"AADSTS50011" error?**
→ Redirect URI mismatch, check for trailing slash

**Tickets not saving?**
→ Open browser console (F12), run: `localStorage.clear()`

**Email not working?**
→ Verify Mail.Send permission was granted in Azure AD

**Still stuck?**
→ Try demo mode by clicking "Demo mode: Login without Microsoft account?"

---

## 📞 Next Steps

- [ ] Read PROJECT_SUMMARY.md for overview
- [ ] Read USER_GUIDE.md for how to use
- [ ] Bookmark your live URL
- [ ] Train team members
- [ ] Start creating real tickets!

---

**Total Time to Deploy: ~35 minutes**

**Estimated Time to Master: 1 day of regular use**

**Result: Never lose track of a task again! 🎊**
