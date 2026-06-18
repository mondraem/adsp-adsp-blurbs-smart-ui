// ==UserScript==
// @name         ADSP Blurbs Smart UI
// @namespace    https://github.com/mondraem
// @version      1.1.4
// @description  QA Bonus blurbs automation
// @author       Emmanuel Mondragon | mondraem
// @match        https://issues.amazon.com/issues/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/mondraem/adsp-adsp-blurbs-smart-ui/main/adsp-blurbs-smart-ui.user.js
// @updateURL    https://raw.githubusercontent.com/mondraem/adsp-adsp-blurbs-smart-ui/main/adsp-blurbs-smart-ui.user.js
// ==/UserScript==

(function() {
    'use strict';

    // 🔹 My name (Atte)
    let myName = localStorage.getItem("adsp_my_name");
    if (!myName) {
        myName = prompt("Enter your name (Atte):");
        if (myName) localStorage.setItem("adsp_my_name", myName);
    }



    //  Get ticket creator username
    const getTicketUser = () => {
    const elements = document.querySelectorAll('.editable-field-display-text');

    for (let el of elements) {
        const text = el.innerText?.trim();

        if (
            text &&
            text.length < 20 &&
            !text.includes(" ") && // ❗ evita cosas como "Bonus KIA IT"
            !text.includes("QA") &&
            !text.includes("Order") &&
            text === text.toLowerCase() // ❗ usernames suelen ser lowercase
        ) {
            return text;
        }
    }

    return null;
};

    // Get Approved AV budget
    const getApprovedBudget = () => {
        const allElements = document.querySelectorAll('*');

        for (let el of allElements) {
            const text = el.innerText?.trim();

            if (text === "Approved AV budget") {
                let next = el.nextElementSibling;

                while (next) {
                    const value = next.innerText?.trim();

                    // ignorar vacíos y labels
                    if (
                        value &&
                        value !== "Approved AV budget" &&
                        !value.includes("PSC Alias") &&
                        !value.includes("Link")
                    ) {
                        return value;
                    }

                    next = next.nextElementSibling;
                }
            }
        }

        return "Not found";
    };

    // Get Advertiser Name
    const getAdvertiserName = () => {
        const allElements = document.querySelectorAll('*');

        for (let el of allElements) {
            const text = el.innerText?.trim();

            if (text === "Advertiser Name") {
                let next = el.nextElementSibling;

                while (next) {
                    const value = next.innerText?.trim();

                    // ignorar vacíos y labels
                    if (
                        value &&
                        value !== "Advertiser Name" &&
                        !value.includes("Link orders") &&
                        !value.includes("Approved AV budget")
                    ) {
                        return value;
                    }

                    next = next.nextElementSibling;
                }
            }
        }

        return "Not found";
    };

    // Get Bonus Order Type
    const getBonusOrderType = () => {
        const allElements = document.querySelectorAll('*');

        for (let el of allElements) {
            const text = el.innerText?.trim();

            if (text === "Bonus Order Type") {
                let next = el.nextElementSibling;

                while (next) {
                    const value = next.innerText?.trim();

                    if (
                        value &&
                        value !== "Bonus Order Type"
                    ) {
                        return value.split(" - ")[0].trim();
                    }

                    next = next.nextElementSibling;
                }
            }
        }

        return "Not found";
    };



    // Copy blurb
    const copyBlurb = (text) => {
        let ticketUser = getTicketUser();
        let approvedBudget = getApprovedBudget();
        let advertiserName = getAdvertiserName();
        let bonusOrderType = getBonusOrderType();

        let finalText = text;

        finalText = finalText.replace(
            "Hi @",
            ticketUser ? `Hi @${ticketUser}` : "Hi @there"
        );

        finalText = finalText.replace(
            "Approved AV budget:",
            `Approved AV budget: ${approvedBudget}`
        );
        finalText = finalText.replace(
            "Advertiser name on SIM:",
            `Advertiser name on SIM: ${advertiserName}`
        );

        finalText = finalText.replace(
            "AV/MG",
            bonusOrderType
        );


        finalText = finalText.replaceAll("Associate Name", myName);

        navigator.clipboard.writeText(finalText);
    };

    // Create UI
    const createUI = () => {
        if (document.getElementById('adsp-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'adsp-panel';

        panel.style.position = 'absolute';
        panel.style.top = '5px';
        panel.style.right = '300px';
        panel.style.width = '70px';
        panel.style.background = '#ffffff';
        panel.style.border = '1px solid #ccc';
        panel.style.borderRadius = '6px';
        panel.style.boxShadow = '0 1px 2px rgba(0,0,0,0.2)';
        panel.style.padding = '2px 6px';
        panel.style.fontSize = '14px';
        panel.style.zIndex = 9999;
        panel.style.userSelect = 'none';
        panel.style.transition = 'all 0.2s ease';

        panel.innerHTML = `
            <div id="header" style="
                display:flex;
                align-items:center;
                justify-content:center;
                cursor:pointer;
                font-weight:500;
                padding:2px;
            ">
                Blurbs ✨
            </div>
            <div id="content" style="margin-top:6px;"></div>
        `;

        //Insert panel in top blue header
        const topHeader = document.querySelector('#application-header');

        if (topHeader) {
            topHeader.style.position = 'relative';

            panel.style.width = '70px';
            panel.style.background = '#ffffff';
            panel.style.border = '1px solid #ccc';
            panel.style.borderRadius = '6px';
            panel.style.boxShadow = '0 1px 2px rgba(0,0,0,0.2)';
            panel.style.padding = '2px 6px';
            panel.style.fontSize = '14px';
            panel.style.zIndex = 9999;
            panel.style.userSelect = 'none';
            panel.style.transition = 'all 0.2s ease';

            topHeader.appendChild(panel);
        } else {
            document.body.appendChild(panel);
        }
        panel.onmousedown = (e) => e.preventDefault();

        const content = document.getElementById('content');

        // 🔹 Create button
        const createButton = (title, text) => {
        const btn = document.createElement('button');
    
        btn.innerText = title;
        btn.style.width = '100%';
        btn.style.marginBottom = '6px';
        btn.style.padding = '6px';
        btn.style.border = '1px solid #ccc';
        btn.style.borderRadius = '4px';
        btn.style.background = '#fff';
        btn.style.cursor = 'pointer';
    
        btn.onmouseover = () => btn.style.background = '#f2f2f2';
        btn.onmouseout = () => btn.style.background = '#fff';
    
        btn.onclick = () => {
            copyBlurb(text);
    
            const originalText = btn.innerText;
            const originalBg = btn.style.background;
            const originalBorder = btn.style.border;
    
            btn.innerText = 'Blurb copied to clipboard✅';
            btn.style.background = '#dcfce7';
            btn.style.border = '1px solid #22c55e';
    
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = originalBg;
                btn.style.border = originalBorder;
            }, 1500);
        };
    
        content.appendChild(btn);
    };



        // BLURBS
        createButton("General", `Hi @,

Hope you're doing well.

We found the following discrepancies:

Approved AV budget:
Order Settings Budget:

1. Please add the same budget amount as the order to be approved, including cents. Use only exact amounts — do not include percentages, symbols, or letters.
2. When adding more than one order (up to 10 per request), please sum the total budget of each order (located under Order Settings) and enter the total in the "Approved AV Budget" field on the SIM request. Subtotals are not required. Please use the following format: 1,000.00.
3. Please include only order bonus links. We review orders added directly in the "Link Orders" field. Do not include text, only links. The order URL must end in (line-items).
KSO (Kindle Special Offers, Fire Tablet, and Kindle) orders must be marked as bonus before creating line items and submitting them in the SIM request.
4. If this is an Amazon Deal, please select Amazon Deal under "Bonus Order Type".
5. For STV orders, please select either STV_First Time Buyer or STV_Early Start, as applicable.
6. We only accept O&O Supply Sources. If you would like to run 3P supply, please provide an exception reason or remove it from the line item.
7. We also noticed the order is already delivering. Please avoid activating the order before approval to prevent billing issues.

Please reopen the ticket after updating the information.

Thank you,
Associate Name`);

        createButton("Manually Approved QA Bonus", `Hi @
Hope you’re doing well

Confirming the order type is set to bonus. This AV/MG is QA approved. You may now activate the campaign.

Best,
Associate Name`);

        createButton("In-Flight Orders", `Hi @,

Hope you're doing well.

AdOps does not approve in-flight campaigns for QA Bonus orders, as this is not a scalable solution for processes that were not properly followed.

Bonus orders must go through the QA approval process prior to being activated/set live.

Any bonus orders that do not go through the QA approval process before launch may require the advertiser to submit a credit/rebill request, which we aim to avoid as it creates a poor customer experience.

Therefore, we are unable to approve this request because the order is already delivering.

Best,
Associate Name`);


        createButton("Old SIM Ticket Template", `Hi @,

Closing out this request as it appears to be a copy of an old SIM using an outdated QA Bonus template.

A new QA Bonus template was implemented in May 2024. We have noticed that some Sales teams are still copying older SIMs for new requests. Please note that an old SIM should never be reused for a new request.

Starting 14-Oct-2024, QA Bonus requests submitted using the old template will be rejected, and a new request must be created using the correct SIM template.

New SIM Ticket:
https://issues.amazon.com/issues/create?template=21cd902e-7496-4fca-aeab-7224cf119946

Best,
Associate Name`);

         createButton("No line item provided", `Hi @
Hope you're doing well

- Provide the link of the order, it ends as (line-items).

Please don't add the link as a comment, instead correct the order link by editing this SIM and updating the "Link orders" field.

Reopen once you have this information.

Best,
Associate Name`);


         createButton("Twitch Display Line", `Hi @,

Hope you're doing well.

Revision: Starting 1-July-2025, Twitch Display for AV/Makegood/Bonus campaigns is only allowed as an O&O Supply Source for EU5 locales (FR, IT, ES, DE, UK).

All remaining WW locales outside EU5 are not allowed to run Twitch Display for AV/Makegood/Bonus orders due to inventory constraints for paid orders. Any request outside EU5 containing Twitch Display as an O&O Supply Source will be rejected, and no exceptions will be made.

Please remove Twitch from the Supply Sources.

Please reopen the ticket after updating the information.

Best,
Associate Name`);
        
          createButton("Finance approval link missing", `"Hi @
Hope you're doing well

Please provide the finance approval link or any documentation that proves this order is finance approved.
Reopen the ticket once you have this information.

Regards,
Associate Name"
`);

        createButton("IMDb Display Line", `Hi @,

Hope you're doing well.

Starting 04-February-2025, Display line items using IMDb as a Supply Source for DSP SS Bonus campaigns are not allowed across all marketplaces.

Please remove IMDb from the Supply Sources.

Please reopen the ticket after updating the information.

Best,
Associate Name`);


             createButton("Alexa Display and Video Line", `Hi @,

Hope you're doing well.

As per SOP, starting 04-April-2025, Alexa Native Ads are not allowed as an O&O Supply Source for WW (all marketplaces) AV/Makegood/Bonus orders due to inventory constraints for paid orders.

If an advertiser includes Alexa as an O&O Supply Source in a Makegood/Bonus order, the request will be rejected and no exceptions will be made.

Please remove Alexa from the Supply Sources.

Please reopen the ticket after updating the information.

Best,
Associate Name`);


             createButton("Goodreads Display Line", `Hi @,

Hope you're doing well.

Starting 23-October-2025, Goodreads is not allowed as an O&O Supply Source for WW (all marketplaces) AV/Makegood/Bonus orders due to inventory constraints for paid orders.

If an advertiser includes Goodreads as an O&O Supply Source in a Makegood/Bonus order, the request will be rejected and no exceptions will be made.

Please remove Goodreads from the Supply Sources.

Please reopen the ticket after updating the information.

Best,
Associate Name`);



        createButton("Twitch, IMDb, Alexa & Goodreads", `Hi @,

Hope you're doing well.

As per SOP, Display line items using Amazon Owned & Operated inventory including Twitch, Alexa, IMDb, and Goodreads are not allowed for QA Bonus orders across all marketplaces.

Please remove Twitch, IMDb, Alexa, and Goodreads from the Supply Sources.

Please reopen the ticket after updating the information.

Best,
Associate Name`);

        createButton("Budget discrepancy", `Hi @
Hope you're doing well

The total budget between the ticket and the orders is different:

Approved AV budget:
Order settings budget:

Please set the correct amount in the custom field "Approved AV budget"

Reopen the ticket after updating the information.

Best,
 Associate Name`);

       
        createButton("Advertiser Mismatch", `Hi @
Hope you're doing well!

We found the following discrepancies:

- Advertiser name between the ticket and the orders is different:

Advertiser name on SIM:
Advertiser name on Rodeo:

Reopen the ticket after updating the information.

Best,
Associate Name`);

        createButton("Start Date Passed", `Hi @,

Hope you're doing well.

We cannot approve bonus orders with a start date in the past. Bonus orders must be submitted at least 5 business days (Monday–Friday) prior to the start date, and no later than that window.

In this case, the start date has already passed by XX days.

Please provide an updated order with a future start date.

Please reopen the ticket after updating the information.

Best,
Associate Name`);

        createButton("Set Billable Orders to Bonus | Order Already Delivered Impressions", `Hi @,

Hope you're doing well.

Apologies for the inconvenience; however, the AdOps team is not allowed to change the order type from Billable to Bonus once the order has already delivered impressions.

As per Finance guidance, changing the order type mid-month results in partial billing for revenue already ingested while the campaign was marked as Billable. Any change between order types may therefore create billing issues.

As a result, this request will be rejected and no exceptions will be made.

Finance reference ticket:
https://t.corp.amazon.com/V1842121502/communication

We recommend allowing the order to complete delivery and then proceeding with a credit/rebill process. Please reach out to Advertiser Support for further assistance.

Best,
Associate Name`);

        createButton("“All Publishers” Not Allowed", `Hi @,

Hope you're doing well.

As per SOP, selecting “All Publishers” is not allowed for any Bonus / Makegood / AV orders.

Twitch, IMDb, Alexa, and Goodreads are prohibited for Display line items. In addition, Third-Party (3P) supply sources require a valid exception reason.

Please remove these supply sources by selecting “Select Individual Publishers” and update the line items accordingly.

Please reopen the ticket once the information has been corrected.

Best,
Associate Name`);

        createButton("Handover", `Hi @,

As my shift is ending, I am handing over this ticket so the next available associate may continue working on it. The ticket will remain in queue.

Current Status:

What I Have Completed:

What Is Still Pending:

All relevant context, details, and screenshots have been documented in the ticket for continuation.

Thank you, and have a great day.
Associate Name`);


        



        //  Change name
        const nameBtn = document.createElement('button');
        nameBtn.innerText = "Change name ✏️";
        nameBtn.style.width = '100%';
        nameBtn.style.border = '1px solid #ccc';
        nameBtn.style.borderRadius = '4px';
        nameBtn.style.background = '#fff';
        nameBtn.style.marginTop = '6px';

        nameBtn.onclick = () => {
            const newName = prompt("Enter new name:");
            if (newName) {
                localStorage.setItem("adsp_my_name", newName);
                myName = newName;
                alert("Name updated ✅");
            }
        };

        content.appendChild(nameBtn);



        // 🔘 Toggle
       let minimized = true;

        // 🔥 FORZAR estado inicial SIEMPRE minimizado
        panel.style.width = '70px';
        content.style.display = 'none';

        const header = document.getElementById('header');

        header.onclick = () => {
            minimized = !minimized;

            if (minimized) {
                content.style.display = 'none';
                panel.style.width = '70px';
            } else {
                content.style.display = 'block';
                panel.style.width = '280px';
            }
        };
    };



    setInterval(() => {
        createUI();
        controlVisibility();
    }, 1000);

})();
