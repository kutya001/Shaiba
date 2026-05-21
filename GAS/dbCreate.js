function createDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tables = {
    'Users': ['ID', 'Username', 'Password', 'Name', 'Phone', 'Role', 'Status'],
    'Records': ['ID', 'ClientName', 'Phone', 'CarNumber', 'BrandID', 'ModelID', 'MasterID', 'StartTime', 'EndTime', 'Status', 'ServicesJSON', 'TotalAmount', 'Comment'],
    'Services': ['ID', 'Name', 'Price'],
    'Brands': ['ID', 'Name'],
    'Models': ['ID', 'BrandID', 'Name']
  };

  for (var tab in tables) {
    var sheet = ss.getSheetByName(tab);
    if (!sheet) {
      sheet = ss.insertSheet(tab);
      sheet.appendRow(tables[tab]);
      sheet.getRange(1, 1, 1, tables[tab].length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }

  // Создание дефолтного Супер-админа, если пользователей нет
  var usersSheet = ss.getSheetByName('Users');
  if (usersSheet && usersSheet.getLastRow() === 1) {
    usersSheet.appendRow([Utilities.getUuid(), 'admin', 'admin', 'Суперадмин', '', 'Superadmin', 'Approved']);
  }

  // Заполнение справочника Марок и Моделей, если пуст
  var brandsSheet = ss.getSheetByName('Brands');
  if (brandsSheet && brandsSheet.getLastRow() === 1) {
    var b1 = Utilities.getUuid();
    var b2 = Utilities.getUuid();
    var b3 = Utilities.getUuid();
    var b4 = Utilities.getUuid();
    var b5 = Utilities.getUuid();
    brandsSheet.appendRow([b1, 'Toyota']);
    brandsSheet.appendRow([b2, 'Lexus']);
    brandsSheet.appendRow([b3, 'BMW']);
    brandsSheet.appendRow([b4, 'Mercedes-Benz']);
    brandsSheet.appendRow([b5, 'Honda']);

    var modelsSheet = ss.getSheetByName('Models');
    if (modelsSheet && modelsSheet.getLastRow() === 1) {
      modelsSheet.appendRow([Utilities.getUuid(), b1, 'Camry']);
      modelsSheet.appendRow([Utilities.getUuid(), b1, 'Prius']);
      modelsSheet.appendRow([Utilities.getUuid(), b1, 'Land Cruiser']);
      modelsSheet.appendRow([Utilities.getUuid(), b2, 'RX']);
      modelsSheet.appendRow([Utilities.getUuid(), b2, 'LX']);
      modelsSheet.appendRow([Utilities.getUuid(), b3, 'X5']);
      modelsSheet.appendRow([Utilities.getUuid(), b3, '5 Series']);
      modelsSheet.appendRow([Utilities.getUuid(), b4, 'E-Class']);
      modelsSheet.appendRow([Utilities.getUuid(), b4, 'G-Class']);
      modelsSheet.appendRow([Utilities.getUuid(), b5, 'Fit']);
      modelsSheet.appendRow([Utilities.getUuid(), b5, 'CR-V']);
    }
  }

  // Заполнение справочника Услуг, если пуст
  var servicesSheet = ss.getSheetByName('Services');
  if (servicesSheet && servicesSheet.getLastRow() === 1) {
    servicesSheet.appendRow([Utilities.getUuid(), 'Компьютерная диагностика', 1000]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Замена масла в двигателе', 600]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Замена тормозных колодок', 800]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Ремонт ходовой части', 3000]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Развал-схождение', 1200]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Ремонт двигателя', 15000]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Чистка форсунок', 2500]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Замена свечей зажигания', 1500]);
  }
  
  Logger.log("База данных БД успешно создана с отношениями FK, заполненными справочниками и таблицей Users.");
}
