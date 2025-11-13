# LJ Services Group - Ticket Management System

A comprehensive ticketing system for managing work assignments across 19 property associations with Microsoft Outlook integration.

## Features

- **Microsoft Authentication**: Secure login using your Outlook/Microsoft 365 account
- **Ticket Management**: Create, assign, track, and close tickets
- **19 Association Support**: Pre-configured for all LJ Services Group associations
- **Email Notifications**: Automatic email updates through Outlook
- **Real-time Updates**: Add comments and updates to tickets
- **Status Tracking**: Monitor open, in-progress, completed, and closed tickets
- **Priority Levels**: Organize work by urgency (Low, Medium, High, Urgent)
- **Search & Filter**: Find tickets by status, association, priority, or keyword
- **Work History**: Complete database of all completed work

## Quick Start (Demo Mode)

The system can run in demo mode without Microsoft authentication:

1. Open `index.html` in your browser
2. Click "Sign in with Microsoft"
3. When prompted, click "Demo mode: Login without Microsoft account?"
4. Start creating tickets!

## Production Setup with Microsoft Authentication

### Step 1: Create Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Fill in the details:
   - **Name**: LJ Services Ticket System
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: 
     - Platform: Single-page application (SPA)
     - URI: `https://YOUR-GITHUB-USERNAME.github.io/ticket-system/`
5. Click "Register"

### Step 2: Configure API Permissions

1. In your app registration, go to "API permissions"
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Select "Delegated permissions"
5. Add these permissions:
   - `User.Read` (to read user profile)
   - `Mail.Send` (to send email notifications)
6. Click "Add permissions"
7. Click "Grant admin consent" (if you're an admin) or have your admin approve

### Step 3: Get Your Client ID

1. In your app registration, go to "Overview"
2. Copy the "Application (client) ID"
3. Open `app.js` in the ticket system
4. Replace `YOUR_CLIENT_ID_HERE` with your actual client ID:

```javascript
const msalConfig = {
    auth: {
        clientId: 'paste-your-client-id-here',
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin
    },
    // ...
};
```

### Step 4: Deploy to GitHub Pages

1. Create a new repository on GitHub:
   - Name it: `ticket-system` (or any name you prefer)
   - Make it Public or Private

2. Push your code to GitHub:

```bash
cd ticket-system
git init
git add .
git commit -m "Initial commit: LJ Services Ticket System"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ticket-system.git
git push -u origin main
```

3. Enable GitHub Pages:
   - Go to your repository on GitHub
   - Click "Settings" > "Pages"
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be available at: `https://YOUR-USERNAME.github.io/ticket-system/`

4. Update Azure AD Redirect URI:
   - Go back to Azure Portal > App registrations
   - Update the Redirect URI to match your GitHub Pages URL
   - Save the changes

## Customization

### Adding/Removing Associations

Edit the `ASSOCIATIONS` array in `app.js`:

```javascript
const ASSOCIATIONS = [
    'Las Olas Beach Club',
    'Plaza 3000 Condominium',
    // Add or remove associations here
].sort();
```

### Adding Team Members

Edit the `TEAM_MEMBERS` array in `app.js`:

```javascript
const TEAM_MEMBERS = [
    'Linda Johnson',
    'Kevin',
    // Add team members here
];
```

### Customizing Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #0078d4;  /* Main blue color */
    --success-color: #107c10;  /* Green for success */
    --danger-color: #d13438;   /* Red for danger */
    /* etc... */
}
```

## Email Integration

The system is configured to send emails via Microsoft Graph API. Email notifications are sent for:

- New ticket creation
- Status changes
- Assignment changes
- Ticket updates

To enable email sending in production:

1. Ensure `Mail.Send` permission is granted in Azure AD
2. The system will automatically request an access token
3. Emails will be sent through the authenticated user's Outlook account

## Data Storage

Currently, the system uses browser localStorage for data storage. This means:

- Data is stored locally in the user's browser
- Each user has their own local database
- Data persists between sessions
- No server required

### Upgrading to Cloud Storage (Future)

For production use with multiple users, consider:

- **Firebase**: Easy setup, real-time sync
- **Azure Cosmos DB**: Enterprise-grade, Microsoft integration
- **Supabase**: Open-source alternative with PostgreSQL
- **MongoDB Atlas**: Document database in the cloud

## Browser Support

- Chrome (recommended)
- Edge (recommended)
- Firefox
- Safari

## Security Notes

- Never commit your Client ID to a public repository if it contains sensitive permissions
- Use environment variables for production deployments
- Enable Azure AD conditional access policies for enhanced security
- Regularly review API permissions

## Troubleshooting

### "Login error" when clicking Sign In

- Check that your Client ID is correct
- Verify Redirect URI matches your deployment URL
- Ensure API permissions are granted

### Emails not sending

- Verify `Mail.Send` permission is granted
- Check that admin consent was provided
- Ensure user is authenticated with Outlook account

### Tickets not loading

- Check browser console for errors
- Clear localStorage and refresh: `localStorage.clear()`
- Try demo mode to verify functionality

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify Azure AD configuration
3. Review GitHub Pages deployment status

## License

Proprietary - LJ Services Group

## Changelog

### Version 1.0.0 (Initial Release)
- Microsoft Outlook authentication
- Full ticket CRUD operations
- 19 pre-configured associations
- Email notifications
- Search and filtering
- Status tracking
- Priority management
