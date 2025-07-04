import { notify } from './ui.js';
import { getEquipmentData } from './equipment.js';
import { auth } from './firebase.js';

const $ = id => document.getElementById(id);

export function setupOutput() {
    $('genServiceTicketOutputBtn').addEventListener('click', generateServiceTicketOutput);
    $('genQuoteOutputBtn').addEventListener('click', generateQuoteOutput);
    $('printBtn').addEventListener('click', printRecord);
    if ($('paymentPdfBtn')) $('paymentPdfBtn').addEventListener('click', generatePaymentPDF);
    if ($('emailQuoteBtn')) $('emailQuoteBtn').addEventListener('click', () => sendEmail('quote'));
    if ($('emailInvoiceBtn')) $('emailInvoiceBtn').addEventListener('click', () => sendEmail('invoice'));
    if ($('emailDepositBtn')) $('emailDepositBtn').addEventListener('click', () => sendEmail('depositReceipt'));
}

function getBaseFormData() {
    const data = {};
    const baseFieldIds = [
      'billing','jobsite','name','phone','email','availability','request',
      'paymentAccountName', 'billingChanges','depositAmount','remainingBalance','tsNumber','receiptMethod','initials',
      'poType', 'poNumberInput', 'verbalPoInput', 'directions', 'installDate', 'installer', 'warrantyTsNumber', 'callType', 'quotedAmount', 'googleMapsApiKey',
      'wePropose', 'leadTime', 'docId', 'siteSpecs'
    ];
    baseFieldIds.forEach(id => {
        if ($(id)) {
             data[id] = $(id).value;
        }
    });
    return data;
}

export function getOutputData() {
    return getBaseFormData();
}

function generateServiceTicketOutput() {
    const data = getBaseFormData();
    data.equipment = getEquipmentData();
    let outputParts = [];
    
    const outputData = {
        jobsite: (data.jobsite || '').toUpperCase(),
        directions: (data.directions || '').toUpperCase(),
        name: (data.name || '').toUpperCase(),
        phone: (data.phone || '').toUpperCase(),
        email: (data.email || '').toUpperCase(),
        availability: (data.availability || '').toUpperCase(),
        request: (data.request || '').toUpperCase(),
        date: ($('current-date').value || '').toUpperCase().replace(/\//g, '-'),
        initials: (data.initials || '').toUpperCase(),
        callType: data.callType,
        installDate: (data.installDate || '').toUpperCase(),
        installer: (data.installer || '').toUpperCase(),
        poType: data.poType,
        poNumber: (data.poNumberInput || '').toUpperCase(),
        verbalPo: (data.verbalPoInput || '').toUpperCase(),
        warrantyTsNumber: (data.warrantyTsNumber || '').toUpperCase(),
        quotedAmount: (data.quotedAmount || '').toUpperCase()
    };

    if (outputData.jobsite) outputParts.push(outputData.jobsite);
    if (outputData.directions) outputParts.push(outputData.directions);
    const contactInfo = [outputData.name, outputData.phone, outputData.email].filter(Boolean).join(', ');
    if (contactInfo) outputParts.push(contactInfo);
    if (outputData.availability) outputParts.push(outputData.availability);
    
    if (data.equipment && data.equipment.length > 0) {
        if (data.equipment.length === 1) {
            const door = data.equipment[0];
            const doorInfo = [
                door.door || '',
                door.operator ? `OPERATOR: ${door.operator}`: ''
            ].filter(Boolean).join(' ').trim();
            if (doorInfo) outputParts.push(doorInfo.toUpperCase());
        } else {
            const allDoorsInfo = data.equipment.map((door, index) => {
                const doorPart = door.door ? `DOOR ${index + 1}: ${door.door}` : '';
                const operatorPart = door.operator ? `OPERATOR: ${door.operator}` : '';
                return [doorPart, operatorPart].filter(Boolean).join(' ');
            }).filter(Boolean).join(' | ');
            if (allDoorsInfo) outputParts.push(allDoorsInfo.toUpperCase());
        }
    }

    if (outputData.request) outputParts.push(outputData.request);
    outputParts.push(`TAKEN: ${outputData.date} ${outputData.initials}`);
    if (outputData.quotedAmount) outputParts.push(`QUOTED: ${outputData.quotedAmount}`);
    
    let paymentInfo = '';
    switch (outputData.poType) {
        case 'PO Number': if (outputData.poNumber) paymentInfo = `PO #: ${outputData.poNumber}`; break;
        case 'Verbal PO': if (outputData.verbalPo) paymentInfo = `VERBAL PO: ${outputData.verbalPo}`; break;
        case 'CC on File': paymentInfo = 'CC ON FILE'; break;
        case 'COD': paymentInfo = 'COD'; break;
        case 'Warranty':
            let warrantyDetails = [];
            if (outputData.installer) warrantyDetails.push(`INSTALLER: ${outputData.installer}`);
            if (outputData.installDate) warrantyDetails.push(`INSTALL DATE: ${outputData.installDate}`);
            if (outputData.warrantyTsNumber) warrantyDetails.push(`ORIGINAL TS #: ${outputData.warrantyTsNumber}`);
            
            if (warrantyDetails.length > 0) {
                paymentInfo = `WARRANTY (${warrantyDetails.join(', ')})`;
            } else {
                paymentInfo = 'WARRANTY';
            }
            break;
    }
    if (paymentInfo) outputParts.push(paymentInfo);
    outputParts.push('PLEASE CALL EN ROUTE');
    
    const out = outputParts.join('\n');
    const outputEl = $('output');
    outputEl.textContent = out;
    outputEl.style.display = 'block';
    navigator.clipboard.writeText(out).then(() => notify('📋 Service Ticket Output copied to clipboard!'));
}

function generateQuoteOutput() {
    const data = getBaseFormData();
    let outputParts = [];
    const toUpper = (str) => (str || '').toUpperCase();

    if (data.jobsite) outputParts.push(toUpper(data.jobsite));
    if (data.directions) outputParts.push(toUpper(data.directions));

    const contactName = toUpper(data.name);
    const contactPhone = toUpper(data.phone);
    const contactEmail = toUpper(data.email);
    const contactParts = [];
    if (contactName) contactParts.push(contactName);
    if (contactPhone) contactParts.push(contactPhone);
    let contactLine = contactParts.join(' ');
    if (contactEmail) contactLine += `; ${contactEmail}`;
    
    if (contactLine) {
        outputParts.push(contactLine);
    }

    if (data.siteSpecs) {
        outputParts.push(`SITE SPECS: ${toUpper(data.siteSpecs)}`);
    }

    if (data.wePropose) {
        outputParts.push(`WE PROPOSE: ${toUpper(data.wePropose)}`);
    }
    
    outputParts.push("50% DEPOSIT REQUIRED TO PROCEED");

    if (data.leadTime) {
        outputParts.push(`LEAD TIME: ${toUpper(data.leadTime)}`);
    }

    const out = outputParts.join('\n');
    const outputEl = $('output');
    outputEl.textContent = out;
    outputEl.style.display = 'block';
    navigator.clipboard.writeText(out).then(() => notify('📋 Quote Output copied to clipboard!'));
}

function printRecord() {
    const data = getBaseFormData();
    data.equipment = getEquipmentData();
    const customerName = data.name || '';
    const nameInitials = customerName.substring(0, 3).toUpperCase();
    const docId = data.docId || '';
    
    const fieldLabels = {
        'siteSpecs': 'Site Specs',
        'initials': 'CSR Initials', 'billing': 'Billing Address', 'jobsite': 'Jobsite Address', 'name': 'Name', 'phone': 'Phone', 'email': 'Email', 'availability': 'Availability', 'request': 'Work Requested',
        'paymentAccountName': 'Account Name', 'billingChanges': 'Billing Address Changes', 'depositAmount': 'Deposit Amount', 'remainingBalance': 'Remaining Balance', 'tsNumber': 'TS Number', 'receiptMethod': 'Receipt Method', 'directions': 'Directions',
        'installDate': 'Install Date', 'installer': 'Installer', 'callType': 'Call Type', 'warrantyTsNumber': 'Original TS Number',
        'quotedAmount': 'Quoted Amount', 'wePropose': 'We Propose', 'leadTime': 'Lead Time'
    };

    const equipmentLabels = {
        'door': 'Door Info', 'operator': 'Operator Info', 'floorCeiling': 'Floor to Ceiling', 'floorObstruction': 'Floor to Lowest Obstruction', 'construction': 'Construction Type', 'backroom': 'Backroom', 'sideroom': 'Sideroom', 'headroom': 'Headroom', 'power': 'Power', 'color': 'Color', 'jambs': 'Jambs', 'floor': 'Floor', 'doorSize': 'Door Size', 'opening': 'Opening Size', 'corner': 'Corner Type', 'track': 'Track Radius', 'spring': 'Spring Info', 'weatherstop': 'Weatherstop Color'
    }
    
    let printHtml = `
        <style>
            body { font-family: sans-serif; margin: 2rem; }
            .print-main-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 2px solid #333;
                padding-bottom: 1rem;
                margin-bottom: 1.5rem;
            }
            .print-main-header h1 {
                font-size: 1.8rem;
                margin: 0;
                text-align: left;
            }
            .print-header-info {
                text-align: right;
                flex-shrink: 0;
            }
            .file-initials {
                font-size: 48px;
                font-weight: bold;
                color: #cccccc;
                line-height: 1;
            }
            .print-doc-id {
                font-size: 0.8rem;
                color: #999999;
                font-family: monospace;
                margin-top: 0.25rem;
            }
            .section { margin-bottom: 1.5rem; border-bottom: 1px solid #ccc; padding-bottom: 1rem; page-break-inside: avoid; }
            .section:last-of-type { border-bottom: none; }
            .section h2 { font-size: 1.2rem; border-bottom: 2px solid #333; padding-bottom: 0.3rem; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
            .item { margin-bottom: 0.5rem; }
            .item strong { display: block; color: #555; font-size: 0.9rem; }
            .full-width { grid-column: 1 / -1; }
            div { white-space: pre-wrap; word-break: break-word; }
        </style>
        <div class="print-main-header">
            <h1>Job Record</h1>
            <div class="print-header-info">
                <div class="file-initials">${nameInitials}</div>
                <div class="print-doc-id">${docId}</div>
            </div>
        </div>
    `;

    const createSection = (title, fields, sourceData) => {
        let content = '';
        fields.forEach(id => {
            if (sourceData[id]) {
                const isTextArea = ['billing', 'jobsite', 'request', 'door', 'operator', 'spring', 'billingChanges', 'directions', 'wePropose', 'siteSpecs'].includes(id);
                const colClass = isTextArea ? 'full-width' : '';
                content += `<div class="item ${colClass}"><strong>${fieldLabels[id] || id}:</strong> <div>${sourceData[id]}</div></div>`;
            }
        });
        if (content) {
            return `<div class="section"><h2>${title}</h2><div class="grid">${content}</div></div>`;
        }
        return '';
    };
    
    printHtml += createSection('Job & Contact Info', ['callType', 'initials', 'name', 'phone', 'email', 'availability', 'billing', 'jobsite', 'directions'], data);
    printHtml += createSection('Work & Notes', ['request'], data);
    printHtml += createSection('Site Specs', ['siteSpecs'], data);
    printHtml += createSection('Quote Details', ['wePropose', 'leadTime'], data);
    
    if(data.equipment && data.equipment.length > 0) {
        data.equipment.forEach((door, index) => {
            let doorContent = '';
              Object.keys(equipmentLabels).forEach(id => {
                if (door[id]) {
                    const isTextArea = ['door', 'operator', 'spring'].includes(id);
                    const colClass = isTextArea ? 'full-width' : '';
                    doorContent += `<div class="item ${colClass}"><strong>${equipmentLabels[id]}:</strong> <div>${door[id]}</div></div>`;
                }
            });
            if(doorContent) {
                printHtml += `<div class="section"><h2>Equipment: Door ${index + 1}</h2><div class="grid">${doorContent}</div></div>`
            }
        });
    }
    
    printHtml += createSection('Warranty', ['installDate', 'installer', 'warrantyTsNumber'], data);
    printHtml += createSection('Payment Details', ['paymentAccountName', 'depositAmount', 'remainingBalance', 'tsNumber', 'receiptMethod', 'billingChanges', 'quotedAmount'], data);


    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    printFrame.contentDocument.write(printHtml);
    printFrame.contentDocument.close();
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
    
    setTimeout(() => { document.body.removeChild(printFrame); }, 1000);
}

async function generatePaymentPDF() {
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
        notify('❌ PDF generation library is not available.');
        console.error('jsPDF library not found.');
        return;
    }
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: "pt", format: "letter" });
        const grab = id => ($(id)?.value || '').trim();
        
        const ts = (grab('tsNumber') || ('TS' + Date.now())).replace(/\s+/g, '');
        const fullName = grab('paymentAccountName') || grab('name') || 'NO_NAME';
        const nameParts = fullName.trim().split(/\s+/);
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : fullName;
        const custLastName = lastName.toUpperCase();
        const now = new Date();
        const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timePart = now.toTimeString().slice(0,8).replace(/:/g,'');
        const filename = `${custLastName}_${ts}_${datePart}-${timePart}.pdf`;

        const head = [['Field', 'Value']];
        
        const body = [
            ["Account Name", grab("paymentAccountName")],
            ["Email", grab("email")],
            ["Billing Address", grab("billing")],
            ["Account Number", grab("paymentAccountNumber")],
            ["Expiration Date", grab("paymentExpDate")],
            ["Security Code", grab("paymentSecurityCode")],
            ["Deposit Amount", grab("depositAmount")],
            ["Remaining Balance", grab("remainingBalance")],
            ["TS Number", grab("tsNumber")],
            ["Billing Changes", grab("billingChanges")],
            ["Receipt Method", grab("receiptMethod")], 
            ["Quoted Amount", grab("quotedAmount")]
        ].filter(row => row[1] && row[1].trim() !== '');

        doc.setFontSize(18);
        doc.text('Payment Information', 40, 40);

        doc.autoTable({
            startY: 60,
            head: head,
            body: body,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 5,
            },
            headStyles: {
                fillColor: [79, 143, 207]
            }
        });
        
        doc.save(filename);
        notify('📄 PDF is downloading...');

    } catch (error) {
        console.error('PDF Generation failed:', error);
        notify('❌ Could not generate the PDF.');
    }
}

async function sendEmail(emailType) {
    const customerName = $('name').value.trim();
    const customerEmail = $('email').value.trim();
    const tsNumber = $('tsNumber-main').value.trim() || $('tsNumber').value.trim();

    if (!customerEmail) {
        notify("❌ Please enter the customer's email address.");
        return;
    }

    let subject = "";
    let body = "";

    switch(emailType) {
        case 'quote':
            subject = `Your Requested Quote from Hamburg Overhead Door - TS #${tsNumber || 'N/A'}`;
            body = `Dear ${customerName || 'Customer'},\n\nThank you for reaching out to Hamburg Overhead Door. Please find your quote details attached.\n\n...`;
            break;
        case 'invoice':
            subject = `Your Invoice from Hamburg Overhead Door - TS #${tsNumber || 'N/A'}`;
            body = `Dear ${customerName || 'Customer'},\n\nThank you for choosing Hamburg Overhead Door. Your invoice is attached.\n\n...`;
            break;
        case 'depositReceipt':
            subject = `Deposit Receipt and Copy of Work Order - TS #${tsNumber || 'N/A'}`;
            body = `Dear ${customerName || 'Customer'},\n\nWe have received your deposit. A copy of your work order reflecting the deposit is attached.\n\n...`;
            break;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
        notify("❌ You must be signed in to send emails.");
        return;
    }

    try {
        const accessToken = await currentUser.getIdToken(true);
        const emailContent = 
            `To: ${customerEmail}\r\n` +
            `Subject: ${subject}\r\n` +
            `Content-Type: text/plain; charset=utf-8\r\n\r\n` +
            `${body}`;

        const base64EncodedEmail = btoa(emailContent).replace(/\+/g, '-').replace(/\//g, '_');

        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                raw: base64EncodedEmail
            })
        });

        if (response.ok) {
            notify(`✅ ${emailType.charAt(0).toUpperCase() + emailType.slice(1)} sent successfully!`);
        } else {
            const error = await response.json();
            console.error('Gmail API Error:', error);
            notify(`❌ Failed to send email. Check console for details.`);
        }
    } catch (error) {
        console.error("Error sending email:", error);
        notify("❌ An error occurred while trying to send the email.");
    }
}
