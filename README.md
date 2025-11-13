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
