# Deployment Guide for LJ Services Ticket System

## Prerequisites

- GitHub account
- Microsoft 365 / Outlook account (for production authentication)
- Azure account (free tier is sufficient)
- Git installed on your computer

## Part 1: Azure AD Setup (15 minutes)

### 1.1 Create App Registration

1. Visit https://portal.azure.com
2. Sign in with your Microsoft account
3. Search for "Azure Active Directory" in the top search bar
4. Click on "App registrations" in the left menu
5. Click "+ New registration"

**Fill in the form:**
- Name: `LJ Services Ticket System`
- Supported account types: Select "Accounts in any organizational directory and personal Microsoft accounts"
- Redirect URI: 
  - Select "Single-page application (SPA)" from dropdown
  - Enter: `http://localhost:8000` (for testing)
  - Click "+ Add URI"
  - Enter: `https://YOUR-GITHUB-USERNAME.github.io/ticket-system/` (for production)

6. Click "Register"
7. **SAVE YOUR CLIENT ID**: On the Overview page, copy the "Application (client) ID"

### 1.2 Configure API Permissions

1. In your app, click "API permissions" in left menu
2. Click "+ Add a permission"
3. Click "Microsoft Graph"
4. Click "Delegated permissions"
5. Search and check these permissions:
   - `User.Read`
   - `Mail.Send`
6. Click "Add permissions"
7. Click "✓ Grant admin consent for [Your Organization]"
   - If you see this button, click it
   - If not, you'll need your IT admin to approve

### 1.3 Save Your Configuration

Create a file called `config.txt` and save:
```
Client ID: [paste your client ID here]
Redirect URI (local): http://localhost:8000
Redirect URI (production): https://YOUR-USERNAME.github.io/ticket-system/
```

## Part 2: Configure the Application (5 minutes)

### 2.1 Update Client ID

1. Open the `ticket-system` folder
2. Open `app.js` in a text editor
3. Find this line (around line 3):
   ```javascript
   clientId: 'YOUR_CLIENT_ID_HERE',
   ```
4. Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID
5. Save the file

### 2.2 Test Locally

1. Open terminal/command prompt
2. Navigate to ticket-system folder:
   ```bash
   cd path/to/ticket-system
   ```
3. Start a local server:
   
   **Option A - Python (if installed):**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Option B - Node.js (if installed):**
   ```bash
   npx serve -p 8000
   ```
   
   **Option C - VS Code:**
   - Install "Live Server" extension
   - Right-click `index.html`
   - Select "Open with Live Server"

4. Open browser to http://localhost:8000
5. Try logging in with your Microsoft account
6. Create a test ticket to verify everything works

## Part 3: Deploy to GitHub (10 minutes)

### 3.1 Create GitHub Repository

1. Go to https://github.com
2. Click the "+" icon in top right
3. Select "New repository"
4. Fill in:
   - Repository name: `ticket-system`
   - Description: "LJ Services Group Ticket Management System"
   - Choose Public or Private
   - Do NOT initialize with README (we already have one)
5. Click "Create repository"

### 3.2 Push Your Code

1. Open terminal in your ticket-system folder
2. Initialize git (if not already done):
   ```bash
   git init
   ```

3. Add all files:
   ```bash
   git add .
   ```

4. Commit:
   ```bash
   git commit -m "Initial commit: LJ Services Ticket System"
   ```

5. Add remote (replace YOUR-USERNAME):
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/ticket-system.git
   ```

6. Push to GitHub:
   ```bash
   git branch -M main
   git push -u origin main
   ```

### 3.3 Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down and click "Pages" in left sidebar
4. Under "Source":
   - Select "Deploy from a branch"
   - Branch: `main`
   - Folder: `/ (root)`
5. Click "Save"
6. Wait 2-3 minutes
7. Refresh the page - you'll see the URL where your site is published
8. Copy this URL (e.g., `https://your-username.github.io/ticket-system/`)

### 3.4 Update Azure AD Redirect URI

1. Go back to Azure Portal
2. Navigate to your App registration
3. Click "Authentication" in left menu
4. Under "Single-page application", you should see your local redirect URI
5. Click "+ Add URI"
6. Paste your GitHub Pages URL
7. Click "Save"

## Part 4: Final Testing (5 minutes)

1. Visit your GitHub Pages URL
2. Click "Sign in with Microsoft"
3. You'll be redirected to Microsoft login
4. Sign in with your Outlook account
5. Grant permissions when asked
6. You should be logged in and see the dashboard

### Test All Features:

- ✅ Create a new ticket
- ✅ Assign it to someone
- ✅ Change status
- ✅ Add an update
- ✅ Filter tickets
- ✅ Search for tickets
- ✅ View statistics

## Part 5: Share with Your Team (2 minutes)

1. Share the GitHub Pages URL with Linda and your team
2. They can bookmark it for easy access
3. Everyone logs in with their own Outlook account
4. Each person will have their own local database (see note below)

## Important Notes

### Data Storage
Currently uses browser localStorage:
- ✅ Simple, no server needed
- ✅ Works immediately
- ⚠️ Each person has their own separate database
- ⚠️ Data is stored locally in their browser

### For Shared Database (Future Upgrade)
To share tickets between all team members, you'll need to add a backend database. Options:

**Easy Options:**
1. **Firebase** (Google, free tier available)
2. **Supabase** (Open source, free tier)
3. **Azure Cosmos DB** (Microsoft, pay-as-you-go)

I can help you add this later when needed!

## Troubleshooting

### "AADSTS50011: Redirect URI mismatch"
- Check that redirect URI in Azure AD exactly matches your deployment URL
- Make sure to include the trailing `/` if needed
- URL is case-sensitive

### "Sign in failed"
- Clear browser cache and cookies
- Try incognito/private mode
- Verify API permissions were granted in Azure AD

### Tickets not saving
- Check browser console (F12) for errors
- Try: `localStorage.clear()` in console and refresh

### Email not sending
- Verify `Mail.Send` permission is granted and consented
- Check that you're logged in with the Outlook account

## Updating the System

When you make changes:

```bash
# Navigate to folder
cd ticket-system

# Add changes
git add .

# Commit
git commit -m "Description of changes"

# Push to GitHub
git push

# Wait 1-2 minutes for GitHub Pages to update
```

## Security Best Practices

1. Never share your Client ID publicly if it has sensitive permissions
2. Use different Client IDs for development and production
3. Regularly review who has access to the Azure AD app
4. Enable multi-factor authentication for all team members
5. Set up Azure AD Conditional Access policies

## Getting Help

If you run into issues:

1. Check the error message in browser console (F12)
2. Review Azure AD app configuration
3. Verify all permissions are granted
4. Try demo mode to isolate authentication issues

## Next Steps

Once everything is working:

1. Customize the associations list
2. Add all team members
3. Adjust colors/branding if needed
4. Create training materials for your team
5. Set up regular backups (export localStorage data)

## Future Enhancements

Consider adding:
- Shared cloud database
- File attachments
- Calendar integration
- Mobile app
- Automated reporting
- Integration with other LJ Services systems

---

**Need help?** Keep this guide handy and refer to the README.md for additional information.
