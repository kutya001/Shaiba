export const getGasUrl = () => {
  return (
    localStorage.getItem("GAS_URL") ||
    import.meta.env.VITE_GAS_URL ||
    "https://script.google.com/macros/s/AKfycbwohflNTW3z1cknnf80XAEhmavcITwdt9PYSUEq6EJP-2EmsxHiRBNvcUSGJ_i-cu-4/exec"
  );
};

export const setGasUrl = (url) => {
  if (!url) {
    localStorage.removeItem("GAS_URL");
  } else {
    localStorage.setItem("GAS_URL", url.trim());
  }
};

export const runGS = async (func, ...args) => {
  const payload = { action: func };
  if (func === "loginUser") {
    payload.username = args[0];
    payload.password = args[1];
  } else if (func === "registerUser") {
    payload.username = args[0];
    payload.password = args[1];
    payload.name = args[2];
    payload.phone = args[3];
  } else if (func === "approveUser") {
    payload.userId = args[0];
    payload.data = args[1];
  } else if (func === "getUsernames") {
    // none
  } else if (func === "updateUserProfile") {
    payload.userId = args[0];
    payload.username = args[1];
    payload.password = args[2];
    payload.name = args[3];
    payload.phone = args[4];
  } else if (func === "getInitData") {
    payload.role = args[0];
    payload.userId = args[1];
  } else if (func === "addRow") {
    payload.sheetName = args[0];
    payload.obj = args[1];
  } else if (func === "addRows") {
    payload.sheetName = args[0];
    payload.objects = args[1];
  } else if (func === "bulkImport") {
    payload.data = args[0];
  } else if (func === "updateRecord") {
    payload.obj = args[0];
  } else if (func === "updateRow") {
    payload.sheetName = args[0];
    payload.obj = args[1];
  } else if (func === "deleteRow") {
    payload.sheetName = args[0];
    payload.id = args[1];
    payload.role = args[2];
    payload.userId = args[3];
  }

  const gasUrl = getGasUrl();

  try {
    const response = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });
    
    let text = "";
    try {
      text = await response.text();
    } catch (textErr) {
      throw new Error("Ошибка чтения ответа сервера.");
    }

    let responseData;
    try {
      responseData = JSON.parse(text);
    } catch (e) {
      console.error("GAS returned non-JSON:", text.substring(0, 200));
      throw new Error(`Ошибка сервиса (неверный формат ответа). Пожалуйста, попробуйте еще раз. ${text.includes('<html') ? 'Сервер вернул HTML вместо JSON.' : ''}`);
    }

    if (responseData.success) {
      return responseData.result;
    } else {
      throw new Error(responseData.error);
    }
  } catch (error) {
    console.error("GAS Fetch Error:", error);
    throw error;
  }
};
