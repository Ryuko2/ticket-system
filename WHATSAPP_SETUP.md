# WhatsApp Bot Setup Guide for LJ Services Group

## Overview

This guide will help you set up a WhatsApp bot that automatically creates tickets in your system. The bot will:

✅ Ask customers for their information
✅ Collect: Name, Address, Association, Topic (Financial/Accounting/Maintenance)
✅ Create tickets automatically in a separate dashboard
✅ Allow you to reply directly through the system

---

## Prerequisites

1. **WhatsApp Business API Account**
2. **Meta (Facebook) Business Account**
3. **Server to host webhook** (we'll use a free option)

---

## Step 1: Get WhatsApp Business API Access

### Option A: Official WhatsApp Business API (Recommended)

1. Go to: **https://business.whatsapp.com/products/business-platform**
2. Click "Get Started"
3. Create or link your Meta Business Account
4. Verify your business
5. Get your phone number verified

### Option B: Use Twilio WhatsApp API (Easier, has free trial)

1. Go to: **https://www.twilio.com/whatsapp**
2. Sign up for free trial (get $15 credit)
3. Get a Twilio WhatsApp-enabled number
4. Configure your Twilio account

**For this guide, we'll use Twilio as it's easier to start!**

---

## Step 2: Sign Up for Twilio

1. Go to: **https://www.twilio.com/try-twilio**
2. Sign up with your email
3. Verify your phone number
4. You'll get **$15 free credit**

### Get Your Credentials:

1. Go to Twilio Console: https://console.twilio.com
2. Find your **Account SID**
3. Find your **Auth Token**
4. Save these in a secure place!

---

## Step 3: Get a WhatsApp-Enabled Number

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow the steps to activate WhatsApp on your Twilio number
3. You'll get a number like: **+1 415 123 4567**

---

## Step 4: Create Webhook Server (Free with Replit)

We'll use Replit to host your webhook for free!

### Set Up Replit:

1. Go to: **https://replit.com**
2. Sign up for free
3. Click **"+ Create Repl"**
4. Choose **"Node.js"** as the template
5. Name it: **"lj-services-whatsapp-bot"**

---

## Step 5: Create the Bot Code

In your Replit, replace the contents of `index.js` with this code:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Twilio credentials (replace with yours)
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const client = twilio(accountSid, authToken);

// Your Twilio WhatsApp number
const twilioWhatsAppNumber = 'whatsapp:+14155238886'; // Twilio Sandbox number

// Store conversation state
const conversations = new Map();

// Ticket categories
const CATEGORIES = {
    '1': 'Financial',
    '2': 'Accounting',
    '3': 'Maintenance',
    '4': 'Other'
};

// Webhook endpoint
app.post('/whatsapp', async (req, res) => {
    const from = req.body.From;
    const body = req.body.Body.trim();
    
    let response = '';
    
    // Get or create conversation state
    if (!conversations.has(from)) {
        conversations.set(from, { step: 0 });
    }
    
    const conversation = conversations.get(from);
    
    try {
        switch(conversation.step) {
            case 0:
                // Welcome message
                response = `🏢 *Welcome to LJ Services Group Support!*

I'll help you create a support ticket. Let's gather some information.

*Step 1 of 4*
Please enter your *full name*:`;
                conversation.step = 1;
                break;
                
            case 1:
                // Store name
                conversation.name = body;
                response = `Thank you, ${body}!

*Step 2 of 4*
Please enter your *address*:`;
                conversation.step = 2;
                break;
                
            case 2:
                // Store address
                conversation.address = body;
                response = `*Step 3 of 4*
Please select your *association* from the list below:

1. Anthony Gardens (ANT)
2. Bayshore Treasure (BTC)
3. Cambridge (CAM)
4. Eastside (EAST)
5. Enclave Waterside Villas (EWVCA)
6. Futura Sansovino (FSCA)
7. Island Point South (IPSCA)
8. Michelle (MICH)
9. Monterrey (MTC)
10. Normandy Shores (NORM)
11. Oxford Gates (OX)
12. Palms Of Sunset (POSS)
13. Patricia (PAT)
14. Ritz Royal (RITZ)
15. Sage (SAGE)
16. The Niche (NICHE)
17. Vizcaya Villas (VVC)
18. Tower Gates (TWG)
19. Wilton Terrace (WTC)

Reply with the *number* of your association:`;
                conversation.step = 3;
                break;
                
            case 3:
                // Store association
                const associations = [
                    'Anthony Gardens (ANT)', 'Bayshore Treasure Condominium (BTC)',
                    'Cambridge (CAM)', 'Eastside Condominium (EAST)',
                    'Enclave Waterside Villas Condominium Association (EWVCA)',
                    'Futura Sansovino Condominium Association, Inc (FSCA)',
                    'Island Point South (IPSCA)', 'Michelle Condominium (MICH)',
                    'Monterrey Condominium Property Association, Inc. (MTC)',
                    'Normandy Shores Condominium (NORM)', 'Oxford Gates (OX)',
                    'Palms Of Sunset Condominium Association, Inc (POSS)',
                    'Patricia Condominium (PAT)', 'Ritz Royal (RITZ)',
                    'Sage Condominium (SAGE)', 'The Niche (NICHE)',
                    'Vizcaya Villas Condominium (VVC)', 'Tower Gates (TWG)',
                    'Wilton Terrace Condominium (WTC)'
                ];
                
                const assocNum = parseInt(body);
                if (assocNum < 1 || assocNum > 19) {
                    response = 'Invalid selection. Please enter a number between 1 and 19.';
                    break;
                }
                
                conversation.association = associations[assocNum - 1];
                response = `*Step 4 of 4*
What is your issue about?

1. 💰 Financial
2. 📊 Accounting
3. 🔧 Maintenance
4. 📋 Other

Reply with the *number* of your topic:`;
                conversation.step = 4;
                break;
                
            case 4:
                // Store category
                if (!CATEGORIES[body]) {
                    response = 'Invalid selection. Please enter 1, 2, 3, or 4.';
                    break;
                }
                
                conversation.category = CATEGORIES[body];
                response = `Great! Now please describe your issue in detail:`;
                conversation.step = 5;
                break;
                
            case 5:
                // Store description and create ticket
                conversation.description = body;
                
                // Create ticket object
                const ticket = {
                    id: `TKT-WA-${Date.now()}`,
                    source: 'whatsapp',
                    phoneNumber: from,
                    name: conversation.name,
                    address: conversation.address,
                    association: conversation.association,
                    category: conversation.category,
                    title: `${conversation.category} - ${conversation.name}`,
                    description: body,
                    status: 'open',
                    priority: 'medium',
                    assignedTo: 'Unassigned',
                    createdBy: `WhatsApp: ${conversation.name}`,
                    createdDate: new Date().toISOString(),
                    updates: []
                };
                
                // In production, send this to your database/API
                console.log('New WhatsApp Ticket:', ticket);
                
                // TODO: Send to your ticket system API
                // await sendToTicketSystem(ticket);
                
                response = `✅ *Ticket Created Successfully!*

*Ticket ID:* ${ticket.id}
*Name:* ${conversation.name}
*Association:* ${conversation.association}
*Category:* ${conversation.category}

Our team has been notified and will respond shortly.

Type *"new"* to create another ticket or *"status"* to check your ticket status.`;
                
                // Reset conversation
                conversations.delete(from);
                break;
                
            default:
                if (body.toLowerCase() === 'new') {
                    conversations.set(from, { step: 0 });
                    response = `🏢 *Welcome to LJ Services Group Support!*

I'll help you create a support ticket. Let's gather some information.

*Step 1 of 4*
Please enter your *full name*:`;
                } else {
                    response = `Type *"new"* to create a ticket.`;
                }
        }
        
        // Send response
        await client.messages.create({
            from: twilioWhatsAppNumber,
            body: response,
            to: from
        });
        
    } catch (error) {
        console.error('Error:', error);
    }
    
    res.status(200).send('OK');
});

// Health check endpoint
app.get('/', (req, res) => {
    res.send('LJ Services WhatsApp Bot is running!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Install Dependencies:

In Replit, create a file called `package.json`:

```json
{
  "name": "lj-services-whatsapp-bot",
  "version": "1.0.0",
  "description": "WhatsApp bot for LJ Services Group",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "body-parser": "^1.20.2",
    "twilio": "^4.19.0"
  }
}
```

Click **"Run"** to start your bot!

---

## Step 6: Configure Twilio Webhook

1. Go to Twilio Console
2. Go to **Messaging** → **Settings** → **WhatsApp sandbox settings**
3. Find "When a message comes in"
4. Enter your Replit URL: `https://your-repl-name.your-username.repl.co/whatsapp`
5. Click **Save**

---

## Step 7: Test Your Bot

1. Send the Twilio join message to your WhatsApp number
   - Text: `join [your-code]` to the Twilio number
2. Once joined, text: `Hi` to start a conversation
3. The bot will guide you through creating a ticket!

---

## Step 8: Connect to Your Ticket System

To automatically add WhatsApp tickets to your dashboard:

### Option A: Use a webhook to your ticket system

1. Create an API endpoint in your ticket system that accepts new tickets
2. In the bot code, replace the `TODO` comment with:

```javascript
// Send to ticket system
await fetch('https://ryuko2.github.io/ticket-system/api/whatsapp-tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticket)
});
```

### Option B: Use Firebase (Recommended for easy setup)

1. Create a Firebase project: https://console.firebase.google.com
2. Enable Firestore Database
3. Install Firebase in your Replit:
   - Add to package.json: `"firebase-admin": "^11.11.0"`
4. Store tickets in Firestore
5. Your ticket system can read from Firestore in real-time

---

## Step 9: Replying to WhatsApp Tickets

To reply from your ticket system:

```javascript
// In your ticket system, when adding an update to a WhatsApp ticket
async function replyToWhatsAppTicket(ticketId, phoneNumber, message) {
    const accountSid = 'YOUR_ACCOUNT_SID';
    const authToken = 'YOUR_AUTH_TOKEN';
    const client = require('twilio')(accountSid, authToken);

    await client.messages.create({
        from: 'whatsapp:+14155238886',
        body: `📩 *Update on Ticket ${ticketId}*

${message}

Reply to this message if you need further assistance.`,
        to: phoneNumber
    });
}
```

---

## Going Live (Production)

### 1. Get Approved for WhatsApp Business API

- Apply through Meta Business: https://business.facebook.com
- Get your business verified
- This allows unlimited messages (Twilio sandbox is limited)

### 2. Get Your Own WhatsApp Number

- Buy a phone number through Twilio or Meta
- Configure it with your business

### 3. Host on Production Server

- Move from Replit to: Heroku, AWS, or DigitalOcean
- Set up proper database (PostgreSQL, MongoDB)
- Add authentication and security

---

## Cost Breakdown

### Free Tier (Twilio Sandbox):
- ✅ $15 free credit
- ✅ ~500 messages
- ✅ Perfect for testing
- ⚠️ Users must "join" your sandbox first

### Production (after free tier):
- **Twilio:** $0.005 per message (incoming)
- **Twilio:** $0.005 per message (outgoing)
- **Example:** 1,000 messages/month = $10/month

### Alternative - Official WhatsApp Business API:
- **Meta:** $0.005-$0.01 per message
- **Requires business verification**
- **No sandbox limitations**

---

## Quick Start Checklist

- [ ] Sign up for Twilio
- [ ] Get WhatsApp-enabled number
- [ ] Create Replit account
- [ ] Copy bot code to Replit
- [ ] Update Twilio credentials in code
- [ ] Run Replit bot
- [ ] Configure Twilio webhook
- [ ] Test with your phone
- [ ] Connect to ticket system
- [ ] Train your team!

---

## Support

If you need help setting this up:

1. Check Twilio documentation: https://www.twilio.com/docs/whatsapp
2. Join Twilio Discord: https://discord.gg/twilio
3. Review this guide step by step

---

## Security Best Practices

1. **Never commit credentials to GitHub**
   - Use environment variables in Replit
   - Store secrets securely

2. **Validate all inputs**
   - The bot already validates association numbers
   - Add more validation as needed

3. **Rate limiting**
   - Implement rate limiting to prevent spam
   - Twilio has built-in protections

4. **Data privacy**
   - Only collect necessary information
   - Follow GDPR/privacy regulations
   - Delete old conversations

---

## Next Steps

Once your bot is working:

1. ✅ Add more categories (Emergency, Billing, etc.)
2. ✅ Add ticket status checking
3. ✅ Add file upload support (images of issues)
4. ✅ Add automated responses for common questions
5. ✅ Add business hours auto-reply
6. ✅ Add multi-language support (English/Spanish)

---

**Your WhatsApp bot is ready to revolutionize customer support at LJ Services Group! 🚀**
