const fetch = require('node-fetch');
const db = require('../database');

const sendWhatsAppMessage = async (to, message, userId = null) => {
    // 1. Mock/Console Log (Always active for demo)
    console.log(`\n[WHATSAPP ALERT] To: ${to}`);
    console.log(`[MESSAGE]: ${message}\n`);

    // 2. Store in Notifications Table (for UI Demo)
    if (userId) {
        db.run("INSERT INTO notifications (user_id, message) VALUES (?, ?)", [userId, message], (err) => {
            if (err) console.error("Error saving notification:", err.message);
        });
    }

    // 3. Cloud API (Optional - requires env vars)
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (token && phoneId) {
        try {
            const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;
            const body = {
                messaging_product: "whatsapp",
                to: to,
                type: "text",
                text: { body: message }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (!response.ok) {
                console.error("WhatsApp Cloud API Error:", data);
            } else {
                console.log("WhatsApp Cloud API Sent:", data);
            }
        } catch (error) {
            console.error("WhatsApp Send Failed:", error);
        }
    }
};

module.exports = { sendWhatsAppMessage };
