export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * ==============================================================================
 * IRONASH TIMBER CO. - GOOGLE APPS SCRIPT WEB APP
 * ==============================================================================
 * 
 * INSTRUCTIONS TO DEPLOY:
 * 1. Open Google Sheets (create a new blank spreadsheet or open an existing one).
 * 2. In Google Sheets, click "Extensions" > "Apps Script".
 * 3. Delete any existing code in Code.gs, paste this entire file content.
 * 4. Click "Deploy" (top right) > "New deployment".
 * 5. Select type: "Web app".
 * 6. Set "Description": IronAsh Orders Webhook.
 * 7. Set "Execute as": "Me" (your Google account).
 * 8. Set "Who has access": "Anyone" (crucial for receiving checkout POST requests).
 * 9. Click "Deploy" and authorize permissions when prompted.
 * 10. Copy the Web App URL and paste it into the IronAsh Admin Dashboard > Google Sheets tab.
 * ==============================================================================
 */

function setupSheetHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Timestamp",
      "Order ID",
      "Full Name",
      "Phone Number",
      "Customer Email",
      "Delivery Address",
      "Items Summary",
      "Total Price (PKR)",
      "Payment Method",
      "Status"
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#064e3b"); // Deep Himalayan emerald
    headerRange.setFontColor("#fafaf9");
  }
}

function getOrCreateOrdersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Orders");
  if (!sheet) {
    sheet = ss.insertSheet("Orders");
  }
  setupSheetHeaders(sheet);
  return sheet;
}

/**
 * Handle POST request from IronAsh Checkout
 * Appends: Full Name, Phone, Email, Address, Total Price, Items, and Order ID
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = getOrCreateOrdersSheet();
    var data;

    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    var orderId = data.orderId || ("ASH-" + Math.floor(10000 + Math.random() * 90000));
    var timestamp = new Date().toISOString();
    var customerName = data.fullName || data.name || data.customerName || "Anonymous";
    var phone = data.phone || data.phoneNumber || "N/A";
    var customerEmail = data.email || data.customerEmail || "";
    var address = data.deliveryAddress || data.address || "N/A";

    // Resilient price calculation: handles numbers, strings with 'PKR', commas, etc.
    var rawPrice = data.totalPrice !== undefined ? data.totalPrice : (data.price || 0);
    var numericPrice = 0;
    if (typeof rawPrice === "number") {
      numericPrice = isNaN(rawPrice) ? 0 : rawPrice;
    } else if (typeof rawPrice === "string") {
      var cleaned = rawPrice.replace(/[^0-9.]/g, "");
      numericPrice = parseFloat(cleaned) || 0;
    }
    var totalPrice = numericPrice;
    var paymentMethod = data.paymentMethod || "Cash on Delivery";
    var status = data.status || "Pending COD";

    var itemsSummary = "";
    if (Array.isArray(data.items)) {
      itemsSummary = data.items.map(function(item) {
        return (item.title || "Item") + " (x" + (item.quantity || 1) + " @ PKR " + (item.price || 0) + ")";
      }).join("; ");
    } else if (typeof data.items === "string") {
      itemsSummary = data.items;
    } else {
      itemsSummary = "Himalayan Herbal Package";
    }

    var row = [
      timestamp,
      orderId,
      customerName,
      phone,
      customerEmail,
      address,
      itemsSummary,
      totalPrice,
      paymentMethod,
      status
    ];

    sheet.appendRow(row);

    // Automated Email Notifications via Google Apps Script MailApp
    try {
      var adminEmail = data.adminNotificationEmail;
      if (!adminEmail) {
        try { adminEmail = Session.getActiveUser().getEmail(); } catch (e) {}
      }

      if (adminEmail && data.notifyAdmin !== false) {
        var adminSubject = "🚨 New Order Received: " + orderId + " (PKR " + totalPrice.toLocaleString() + ") - " + customerName;
        var adminBody = "New Order " + orderId + " Received!\n\n" +
          "Customer: " + customerName + "\n" +
          "Phone / WhatsApp: " + phone + "\n" +
          "Email: " + (customerEmail || "Not provided") + "\n" +
          "Delivery Address: " + address + "\n\n" +
          "Items:\n" + itemsSummary + "\n\n" +
          "Total: PKR " + totalPrice.toLocaleString() + " (Cash on Delivery)\n" +
          "Date: " + timestamp;
        MailApp.sendEmail(adminEmail, adminSubject, adminBody);
      }

      if (customerEmail && customerEmail.indexOf("@") !== -1 && data.notifyCustomer !== false) {
        var custSubject = "Order Confirmation: " + orderId + " - IronAsh Himalayan Shilajit";
        var custBody = "Salam / Dear " + customerName + ",\n\n" +
          "Thank you for your order with IronAsh Himalayan Shilajit!\n\n" +
          "Order ID: " + orderId + "\n" +
          "Order Items: " + itemsSummary + "\n" +
          "Total Payable at Doorstep: PKR " + totalPrice.toLocaleString() + " (Cash on Delivery)\n" +
          "Delivery Destination: " + address + "\n\n" +
          "Your authentic Karakoram harvest package is being prepared for express dispatch.\n\n" +
          "Warm regards,\n" +
          "IronAsh Himalayan Herbs Support Team";
        MailApp.sendEmail(customerEmail, custSubject, custBody);
      }
    } catch (mailError) {
      Logger.log("Mail notification note: " + mailError);
    }

    var response = {
      status: "success",
      message: "Order successfully recorded in Google Sheets",
      orderId: orderId,
      customerName: customerName,
      totalPrice: totalPrice,
      timestamp: timestamp,
      rowNumber: sheet.getLastRow()
    };

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle GET request from IronAsh Admin Dashboard
 * Returns all recorded orders from Google Sheet for the Orders tab
 */
function doGet(e) {
  try {
    var sheet = getOrCreateOrdersSheet();
    var rows = sheet.getDataRange().getValues();

    if (rows.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", orders: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var headers = rows[0];
    var orders = [];

    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var rawP = row[6];
      var numericP = 0;
      if (typeof rawP === "number") {
        numericP = isNaN(rawP) ? 0 : rawP;
      } else if (typeof rawP === "string") {
        var cleanedP = rawP.replace(/[^0-9.]/g, "");
        numericP = parseFloat(cleanedP) || 0;
      }
      orders.push({
        rowNumber: i + 1,
        timestamp: row[0] || "",
        orderId: row[1] || "",
        customerName: row[2] || "",
        phone: row[3] || "",
        address: row[4] || "",
        itemsSummary: row[5] || "",
        totalPrice: numericP,
        paymentMethod: row[7] || "Cash on Delivery",
        status: row[8] || "Pending"
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        totalOrders: orders.length,
        orders: orders
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString(),
        orders: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
