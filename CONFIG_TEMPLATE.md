# LJ Services Ticket System - Configuration Template

## Azure AD Configuration

After creating your Azure AD App Registration, fill in this information:

**Application (Client) ID:** 
[Paste your Client ID here]

**Redirect URIs:**
- Local Development: http://localhost:8000
- Production: https://[YOUR-GITHUB-USERNAME].github.io/ticket-system/

**API Permissions Required:**
- Microsoft Graph > User.Read (Delegated)
- Microsoft Graph > Mail.Send (Delegated)

## Team Configuration

### Update these arrays in app.js:

**ASSOCIATIONS Array (Current 19 Associations):**
1. Las Olas Beach Club
2. Plaza 3000 Condominium
3. The Continental
4. Oceanview Towers
5. Bayfront Plaza
6. Riverside Condominium
7. Palm Court Association
8. Marina Bay Complex
9. Sunset Gardens
10. Harbor View Residences
11. Tropical Estates
12. Beachside Manor
13. Downtown Square
14. Coral Ridge Towers
15. Atlantic Heights
16. Golden Shores
17. Paradise Point
18. Waterfront Commons
19. Executive Plaza

**TEAM_MEMBERS Array:**
1. Linda Johnson (CEO)
2. Kevin (Property Manager)
3. [Add team member]
4. [Add team member]
5. [Add team member]

## Deployment URLs

**GitHub Repository:**
https://github.com/[YOUR-USERNAME]/ticket-system

**Live Application:**
https://[YOUR-USERNAME].github.io/ticket-system/

## Notes

- Keep this file private (it's in .gitignore)
- Update app.js with your Client ID before deployment
- Share only the live application URL with team members
- Never commit credentials or sensitive tokens

## Quick Reference

**Local Testing:**
```bash
python -m http.server 8000
# Then open http://localhost:8000
```

**Deploy to GitHub:**
```bash
git add .
git commit -m "Update configuration"
git push
```

**Clear Local Data (if needed):**
Open browser console and run:
```javascript
localStorage.clear()
```
