const DO_GET_OUTPUT = 'index';

function doGet(e) {
  // По старинке (на всякий случай)
  if (e && e.parameter && e.parameter.action) {
    return handleRequest(e.parameter.action, e.parameter);
  }
  return HtmlService.createHtmlOutputFromFile(DO_GET_OUTPUT)
    .setTitle('Автосервис CRM PRO')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    return handleRequest(payload.action, payload);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleRequest(action, payload) {
  try {
    var result = null;
    if (action === 'loginUser') {
      result = loginUser(payload.username, payload.password);
    } else if (action === 'registerUser') {
      result = registerUser(payload.username, payload.password, payload.name, payload.phone);
    } else if (action === 'approveUser') {
      result = approveUser(payload.userId, payload.data);
    } else if (action === 'getUsernames') {
      result = getUsernames();
    } else if (action === 'updateUserProfile') {
      result = updateUserProfile(payload.userId, payload.username, payload.password, payload.name, payload.phone);
    } else if (action === 'getInitData') {
      result = getInitData(payload.role, payload.userId);
    } else if (action === 'addRow') {
      result = addRow(payload.sheetName, payload.obj);
    } else if (action === 'updateRecord') {
      result = updateRecord(payload.obj);
    } else if (action === 'updateRow') {
      result = updateRow(payload.sheetName, payload.obj);
    } else if (action === 'deleteRow') {
      result = deleteRow(payload.sheetName, payload.id, payload.role, payload.userId);
    } else {
      throw new Error("Неизвестное действие: " + action);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, result: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================
// АВТОРИЗАЦИЯ
// ========================

function loginUser(username, password) {
  if (!username || !password) throw new Error("Укажите логин и пароль");
  var users = getTable('Users');
  var user = users.find(function(u) { return String(u.Username) === String(username) && String(u.Password) === String(password); });
  if (!user) throw new Error("Неверный логин или пароль");
  if (user.Status !== 'Approved' && user.Role !== 'Superadmin') {
     throw new Error("Ваша учетная запись ожидает проверки Супер-администратором");
  }
  return { ID: user.ID, Username: user.Username, Role: user.Role, Name: user.Name, Phone: user.Phone };
}

function registerUser(username, password, name, phone) {
  if (!username || !password) throw new Error("Укажите логин и пароль");
  var users = getTable('Users');
  if (users.some(function(u) { return u.Username === username; })) {
    throw new Error("Пользователь уже существует");
  }
  var newUser = {
    ID: Utilities.getUuid(),
    Username: username,
    Password: password,
    Name: name || '',
    Phone: phone || '',
    Role: 'Master',
    Status: 'Pending'
  };
  addRowBase('Users', newUser);
  return { success: true, message: "Заявка отправлена. Ожидайте подтверждения Суперадминистратора." };
}

function approveUser(userId, data) {
  var updates = {Status: 'Approved'};
  if (data) {
     if (data.Role) updates.Role = data.Role;
     if (data.Name !== undefined) updates.Name = data.Name;
     if (data.Phone !== undefined) updates.Phone = data.Phone;
  }
  updateRowBase('Users', userId, updates);
  return getTable('Users');
}

function getUsernames() {
  try {
    var users = getTable('Users');
    return users.map(function(u) {
      return { ID: u.ID, Username: u.Username, Role: u.Role, Status: u.Status, Name: u.Name, Phone: u.Phone };
    });
  } catch(e) {
    return [{ ID: 'u1', Username: 'admin', Role: 'Superadmin', Status: 'Approved' }];
  }
}

function updateUserProfile(userId, newUsername, newPassword, newName, newPhone) {
  if (!userId || !newUsername) throw new Error("Укажите логин");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Users');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var userIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(userId)) {
      userIndex = i;
    }
  }
  if (userIndex === -1) throw new Error("Пользователь не найден");
  
  for (var i = 1; i < data.length; i++) {
    if (i !== userIndex && String(data[i][1]) === String(newUsername)) {
      throw new Error("Это имя пользователя уже занято");
    }
  }
  var usernameCol = headers.indexOf('Username') + 1;
  var passwordCol = headers.indexOf('Password') + 1;
  var nameCol = headers.indexOf('Name') + 1;
  var phoneCol = headers.indexOf('Phone') + 1;
  sheet.getRange(userIndex + 1, usernameCol).setValue(newUsername);
  if (newPassword) sheet.getRange(userIndex + 1, passwordCol).setValue(newPassword);
  if (newName !== undefined && nameCol > 0) sheet.getRange(userIndex + 1, nameCol).setValue(newName);
  if (newPhone !== undefined && phoneCol > 0) sheet.getRange(userIndex + 1, phoneCol).setValue(newPhone);
  return { ID: userId, Username: newUsername, Name: newName || '', Phone: newPhone || '' };
}

// ========================
// ОПТИМИЗАЦИЯ ДАННЫХ (БАТЧИНГ)
// ========================

// Получить все данные приложения разом асинхронно
function getInitData(role, userId) {
  var data = {
    records: getTable('Records'),
    services: getTable('Services'),
    users: getTable('Users'),
    brands: getTable('Brands'),
    models: getTable('Models')
  };
  return data;
}

// ========================
// БАЗОВЫЕ МЕТОДЫ CRUD
// ========================

function getTable(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var result = [];
  for(var i = 1; i < data.length; i++) {
    var obj = {};
    for(var j = 0; j < headers.length; j++) {
       var h = headers[j];
       var val = data[i][j];
       if (h === 'ServicesJSON' && typeof val === 'string' && val.trim().startsWith('[')) {
           try { val = JSON.parse(val); } catch(e) { val = []; }
       }
       obj[h] = val;
    }
    result.push(obj);
  }
  return result;
}

function addRow(sheetName, obj) {
  addRowBase(sheetName, obj);
  return sheetName === 'Records' ? getTable('Records') : getInitData(obj._role || 'Master', obj._userId);
}

function addRowBase(sheetName, obj) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!obj.ID) obj.ID = Utilities.getUuid();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = [];
  for(var i = 0; i < headers.length; i++) {
    var h = headers[i];
    if (h === 'StartTime' && sheetName === 'Records') row.push(new Date().toISOString());
    else if (h === 'EndTime') row.push('');
    else if (h === 'ServicesJSON') row.push(typeof obj[h] === 'string' ? obj[h] : JSON.stringify(obj[h] || []));
    else if (h === 'Phone' && obj[h] && typeof obj[h] === 'string' && obj[h].startsWith('+')) row.push("'" + obj[h]);
    else row.push(obj[h] !== undefined ? obj[h] : '');
  }
  sheet.appendRow(row);
}

function updateRecord(obj) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Records');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  for(var i = 1; i < data.length; i++) {
    if (data[i][0] === obj.ID) { // ID is col A
      var row = [];
      var oldStatus = data[i][headers.indexOf('Status')];
      for(var j = 0; j < headers.length; j++) {
         var h = headers[j];
         if (h === 'EndTime' && obj.Status === 'Выполнен' && oldStatus !== 'Выполнен') {
             row.push(new Date().toISOString());
         } else if (h === 'EndTime' && obj.Status !== 'Выполнен') {
             row.push('');
         } else if (h === 'ServicesJSON') {
             row.push(typeof obj[h] === 'string' ? obj[h] : JSON.stringify(obj[h] || []));
         } else if (h === 'Phone' && obj[h] && typeof obj[h] === 'string' && obj[h].startsWith('+')) {
             row.push("'" + obj[h]);
         } else {
             row.push(obj[h] !== undefined ? obj[h] : data[i][j]);
         }
      }
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      break;
    }
  }
  return getTable('Records');
}

function updateRow(sheetName, obj) {
  var id = obj.ID;
  var role = obj._role;
  var userId = obj._userId;
  updateRowBase(sheetName, id, obj);
  return getInitData(role || 'Master', userId);
}

function updateRowBase(sheetName, id, updates) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  for(var i = 1; i < data.length; i++) {
    if(data[i][0] === id) {
      for(var key in updates) {
        var colIndex = headers.indexOf(key);
        if(colIndex > -1) {
          if (key === 'ServicesJSON') {
             sheet.getRange(i + 1, colIndex + 1).setValue(typeof updates[key] === 'string' ? updates[key] : JSON.stringify(updates[key] || []));
          } else if (key === 'Phone' && updates[key] && typeof updates[key] === 'string' && updates[key].startsWith('+')) {
             sheet.getRange(i + 1, colIndex + 1).setValue("'" + updates[key]);
          } else {
             sheet.getRange(i + 1, colIndex + 1).setValue(updates[key]);
          }
        }
      }
      break;
    }
  }
}

function deleteRow(sheetName, id, role, userId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  for(var i = 1; i < data.length; i++) {
    if(data[i][0] === id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return sheetName === 'Records' ? getTable('Records') : getInitData(role || 'Master', userId);
}
