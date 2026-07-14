// ==UserScript==
// @name         ADSP Blurbs Smart UI
// @namespace    https://github.com/mondraem
// @version      1.2.2
// @description  QA Bonus blurbs automation - reads blurbs from a shared Excel file
// @author       Emmanuel Mondragon | mondraem
// @match        https://issues.amazon.com/issues/*
// @grant        GM_xmlhttpRequest
// @connect      amazon-my.sharepoint.com
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
// @downloadURL  https://raw.githubusercontent.com/mondraem/adsp-adsp-blurbs-smart-ui/main/adsp-blurbs-smart-ui.user.js
// @updateURL    https://raw.githubusercontent.com/mondraem/adsp-adsp-blurbs-smart-ui/main/adsp-blurbs-smart-ui.user.js
// ==/UserScript==

(function() {
    'use strict';

    // 🔹 CONFIG: link directo de descarga del Excel
    // Ajusta esta URL si el formato de descarga cambia.
    const BLURBS_XLSX_URL = "https://amazon-my.sharepoint.com/:x:/p/mondraem/IQApD6XvQLp0T40xxtC4gLErAUhAdn8t8Ovt7Swu7NFuTh0?e=16ZZn7&download=1";

    // Cuánto tiempo (ms) se cachea la tabla en esta pestaña antes de volver a pedirla
    const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

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
                !text.includes(" ") &&
                !text.includes("QA") &&
                !text.includes("Order") &&
                text === text.toLowerCase()
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

    // ──────────────────────────────────────────────
    // 🔹 Load blurbs from the Excel file
    // ──────────────────────────────────────────────
    let blurbsCache = null;       // [{tipo, blurb}, ...]
    let blurbsCacheTime = 0;
    let blurbsLoadError = null;

const fetchBlurbsFromExcel = () => {
    const now = Date.now();
    if (blurbsCache && (now - blurbsCacheTime) < CACHE_TTL_MS) return Promise.resolve(blurbsCache);

    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'GET',
            url: BLURBS_XLSX_URL,
            responseType: 'arraybuffer',
            onload: (response) => {
                try {
                    if (response.status < 200 || response.status >= 300) {
                        reject(new Error(`HTTP ${response.status}`)); return;
                    }
                    if ((response.responseHeaders || '').toLowerCase().includes('content-type: text/html')) {
                        reject(new Error('URL devolvio HTML, no el Excel.')); return;
                    }
                    const workbook = XLSX.read(response.response, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
                    const blurbs = rows.slice(1)
                        .filter(r => r[0] && String(r[0]).trim() !== '')
                        .map(r => ({ tipo: String(r[0]).trim(), blurb: String(r[1] ?? '').trim() }))
                        .filter(b => b.blurb !== '');
                    blurbsCache = blurbs;
                    blurbsCacheTime = now;
                    resolve(blurbs);
                } catch (err) { reject(err); }
            },
            onerror: () => reject(new Error('Network error al descargar el Excel.')),
            ontimeout: () => reject(new Error('Timeout.'))
        });
    });
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
        panel.style.maxHeight = '80vh';
        panel.style.overflowY = 'auto';

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

        const topHeader = document.querySelector('#application-header');

        if (topHeader) {
            topHeader.style.position = 'relative';
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
            btn.style.textAlign = 'left';
            btn.style.fontSize = '12px';

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

        const renderBlurbButtons = async () => {
            content.innerHTML = '<div style="font-size:12px;color:#666;padding:4px;">Loading blurbs...</div>';

            try {
                const blurbs = await fetchBlurbsFromExcel();
                content.innerHTML = '';

                if (blurbs.length === 0) {
                    content.innerHTML = '<div style="font-size:12px;color:#b91c1c;padding:4px;">No blurbs found in the Excel file.</div>';
                } else {
                    blurbs.forEach(b => createButton(b.tipo, b.blurb));
                }
            } catch (err) {
                content.innerHTML = `<div style="font-size:11px;color:#b91c1c;padding:4px;">Error loading blurbs: ${err.message}</div>`;
                const retryBtn = document.createElement('button');
                retryBtn.innerText = 'Retry ↻';
                retryBtn.style.width = '100%';
                retryBtn.style.marginTop = '4px';
                retryBtn.style.padding = '6px';
                retryBtn.onclick = () => { blurbsCache = null; renderBlurbButtons(); };
                content.appendChild(retryBtn);
            }

            // 🔹 Change name
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

            // 🔄 Refresh blurbs button
            const refreshBtn = document.createElement('button');
            refreshBtn.innerText = "Refresh blurbs 🔄";
            refreshBtn.style.width = '100%';
            refreshBtn.style.border = '1px solid #ccc';
            refreshBtn.style.borderRadius = '4px';
            refreshBtn.style.background = '#fff';
            refreshBtn.style.marginTop = '6px';
            refreshBtn.onclick = () => { blurbsCache = null; renderBlurbButtons(); };
            content.appendChild(refreshBtn);
        };

        // 🔘 Toggle
        let minimized = true;
        panel.style.width = '70px';

        const header = document.getElementById('header');
        let loaded = false;

        header.onclick = () => {
            minimized = !minimized;

            if (minimized) {
                content.style.display = 'none';
                panel.style.width = '70px';
            } else {
                content.style.display = 'block';
                panel.style.width = '300px';
                if (!loaded) {
                    loaded = true;
                    renderBlurbButtons();
                }
            }
        };

        content.style.display = 'none';
    };

    setInterval(() => {
        createUI();
    }, 1000);
