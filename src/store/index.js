import { defineStore } from "pinia";
import { runGS } from "../services/api";

const defaultServices = [
  { ID: "ds_1", Name: "Компьютерная диагностика двигателя", Price: 1000 },
  { ID: "ds_2", Name: "Диагностика осциллографом", Price: 2000 },
  { ID: "ds_3", Name: "Поиск и устранение обрыва проводки", Price: 1500 },
  { ID: "ds_4", Name: "Адаптация дроссельной заслонки", Price: 800 },
  {
    ID: "ds_5",
    Name: "Ремонт генератора (замена щеток/диодного моста)",
    Price: 3500,
  },
  {
    ID: "ds_6",
    Name: "Ремонт стартера (замена бендикса/втягивающего)",
    Price: 3000,
  },
  { ID: "ds_7", Name: "Снятие/установка генератора/стартера", Price: 1500 },
  { ID: "ds_8", Name: "Зарядка и обслуживание АКБ", Price: 500 },
  { ID: "ds_9", Name: "Замена ламп накаливания и ксенона (1 шт)", Price: 300 },
  {
    ID: "ds_10",
    Name: "Установка автосигнализации (с автозапуском)",
    Price: 5000,
  },
  { ID: "ds_11", Name: "Демонтаж старой автосигнализации", Price: 1500 },
  { ID: "ds_12", Name: "Ремонт и программирование брелоков", Price: 1000 },
  { ID: "ds_13", Name: "Ремонт мотора стеклоподъемника", Price: 1200 },
  { ID: "ds_14", Name: "Чистка форсунок ультразвуком", Price: 2500 },
  { ID: "ds_15", Name: "Замена свечей зажигания (4 шт)", Price: 800 },
  { ID: "ds_16", Name: "Прошивка ЭБУ / Чип-тюнинг (Евро-2)", Price: 8000 },
  { ID: "ds_17", Name: "Замена лямбда-зонда (датчика кислорода)", Price: 1000 },
  { ID: "ds_18", Name: "Замена датчика распредвала/коленвала", Price: 1200 },
  { ID: "ds_19", Name: "Восстановление блока SRS / Airbag", Price: 4000 },
  {
    ID: "ds_20",
    Name: "Адаптация и прошивка роботизированной КПП",
    Price: 2000,
  },
  { ID: "ds_21", Name: "Сброс сервисных интервалов и ошибок", Price: 500 },
  { ID: "ds_22", Name: "Ремонт щитка приборов / замена шлейфов", Price: 3000 },
  { ID: "ds_23", Name: "Установка и подключение автомагнитолы", Price: 1500 },
];

const defaultBrands = [
  { ID: "db_1", Name: "Lada (ВАЗ)" },
  { ID: "db_2", Name: "GAZ (ГАЗ)" },
  { ID: "db_3", Name: "UAZ (УАЗ)" },
  { ID: "db_6", Name: "Chevrolet" },
  { ID: "db_7", Name: "Daewoo" },
  { ID: "db_5", Name: "Ravon" },
  { ID: "db_8", Name: "Hyundai" },
  { ID: "db_9", Name: "Kia" },
  { ID: "db_10", Name: "Toyota" },
  { ID: "db_11", Name: "Nissan" },
  { ID: "db_12", Name: "Renault" },
  { ID: "db_13", Name: "Volkswagen" },
  { ID: "db_14", Name: "Skoda" },
  { ID: "db_15", Name: "Chery" },
  { ID: "db_16", Name: "Geely" },
  { ID: "db_17", Name: "Haval" },
];

const defaultModels = [
  { ID: "dm_1", BrandID: "db_1", Name: "Granta" },
  { ID: "dm_2", BrandID: "db_1", Name: "Vesta" },
  { ID: "dm_3", BrandID: "db_1", Name: "Priora" },
  { ID: "dm_4", BrandID: "db_1", Name: "Niva (4x4)" },
  { ID: "dm_5", BrandID: "db_1", Name: "Largus" },
  { ID: "dm_6", BrandID: "db_1", Name: "Kalina" },
  { ID: "dm_7", BrandID: "db_2", Name: "Gazelle" },
  { ID: "dm_8", BrandID: "db_2", Name: "Volga" },
  { ID: "dm_11", BrandID: "db_6", Name: "Cobalt" },
  { ID: "dm_12", BrandID: "db_6", Name: "Spark" },
  { ID: "dm_13", BrandID: "db_6", Name: "Nexia 3" },
  { ID: "dm_14", BrandID: "db_6", Name: "Cruze" },
  { ID: "dm_15", BrandID: "db_7", Name: "Nexia" },
  { ID: "dm_16", BrandID: "db_7", Name: "Matiz" },
  { ID: "dm_17", BrandID: "db_8", Name: "Solaris" },
  { ID: "dm_18", BrandID: "db_8", Name: "Creta" },
  { ID: "dm_19", BrandID: "db_8", Name: "Accent" },
  { ID: "dm_20", BrandID: "db_8", Name: "Elantra" },
  { ID: "dm_21", BrandID: "db_8", Name: "Santa Fe" },
  { ID: "dm_22", BrandID: "db_9", Name: "Rio" },
  { ID: "dm_23", BrandID: "db_9", Name: "Sportage" },
  { ID: "dm_24", BrandID: "db_9", Name: "Optima / K5" },
  { ID: "dm_25", BrandID: "db_10", Name: "Camry" },
  { ID: "dm_26", BrandID: "db_10", Name: "Corolla" },
  { ID: "dm_27", BrandID: "db_10", Name: "RAV4" },
  { ID: "dm_28", BrandID: "db_10", Name: "Land Cruiser" },
  { ID: "dm_29", BrandID: "db_13", Name: "Polo" },
  { ID: "dm_30", BrandID: "db_13", Name: "Tiguan" },
  { ID: "dm_31", BrandID: "db_14", Name: "Rapid" },
  { ID: "dm_32", BrandID: "db_14", Name: "Octavia" },
];

export const useMainStore = defineStore("main", {
  state: () => {
    let savedUser = null;
    try {
      const val = localStorage.getItem("currentUser");
      if (val) savedUser = JSON.parse(val);
    } catch (e) {
      localStorage.removeItem("currentUser");
    }
    return {
      user: savedUser,
      db: { records: [], services: [], brands: [], models: [], users: [] },
      syncQueue: [],
      isSyncing: false,
      toasts: [],
      loading: false,
      initError: null,
    };
  },
  getters: {
    mastersList() {
      return this.db.users.filter((u) => u.Role !== "Superadmin");
    },
    currentUserMasterID() {
      return this.user ? this.user.ID : null;
    },
    sortedBrands() {
      let b = this.db.brands || [];
      const uniqueNames = new Set();
      const bUnique = b.filter(item => {
          const name = String(item.Name || "").toLowerCase().trim();
          if(uniqueNames.has(name)) return false;
          uniqueNames.add(name);
          return true;
      });
      return bUnique.sort((x, y) =>
        String(x.Name || "")
          .toLowerCase()
          .localeCompare(String(y.Name || "").toLowerCase()),
      );
    },
    sortedServices() {
      let s = this.db.services || [];
      const uniqueNames = new Set();
      const sUnique = s.filter(item => {
          const name = String(item.Name || "").toLowerCase().trim();
          if(uniqueNames.has(name)) return false;
          uniqueNames.add(name);
          return true;
      });
      return sUnique.sort((x, y) =>
        String(x.Name || "")
          .toLowerCase()
          .localeCompare(String(y.Name || "").toLowerCase()),
      );
    },
  },
  actions: {
    async login(loginUser, password) {
      let res = await runGS("loginUser", loginUser, password);
      this.user = res;
      localStorage.setItem("currentUser", JSON.stringify(res));
      this.showToast(`Успешный вход. Привет, ${res.Name || res.Username}!`);
      await this.loadInitialData();
    },
    async register(loginUser, password, name, phone) {
      let res = await runGS("registerUser", loginUser, password, name, phone);
      this.showToast(res.message);
    },
    showToast(msg, type = "success") {
      const id = Date.now();
      this.toasts.push({ id, msg, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, 4000);
    },
    async loadInitialData() {
      if (!this.user) return;
      this.loading = true;
      try {
        let d = await runGS("getInitData", this.user.Role, this.user.ID);
        d.records.forEach((r) => {
          if (r.ServicesJSON) {
            try {
              r.ServicesJSON =
                typeof r.ServicesJSON === "string"
                  ? JSON.parse(r.ServicesJSON)
                  : r.ServicesJSON;
            } catch (e) {
              r.ServicesJSON = [];
            }
          } else r.ServicesJSON = [];
        });

        let mergedServices = [
          ...d.services.filter((s) => s && String(s.ID).indexOf("ds_") !== 0),
          ...defaultServices,
        ];
        let sNames = new Set();
        d.services = mergedServices.filter(s => {
            let n = String(s.Name || "").toLowerCase().trim();
            if (sNames.has(n)) return false;
            sNames.add(n);
            return true;
        });

        let mergedBrands = [
          ...d.brands.filter((b) => b && String(b.ID).indexOf("db_") !== 0),
          ...defaultBrands,
        ];
        let bNames = new Set();
        d.brands = mergedBrands.filter(b => {
            let n = String(b.Name || "").toLowerCase().trim();
            if (bNames.has(n)) return false;
            bNames.add(n);
            return true;
        });

        d.models = [
          ...d.models.filter((m) => m && String(m.ID).indexOf("dm_") !== 0),
          ...defaultModels,
        ];

        this.db = d;
      } catch (e) {
        this.initError = e.message;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      this.user = null;
      this.db = {
        records: [],
        services: [],
        brands: [],
        models: [],
        users: [],
      };
      localStorage.removeItem("currentUser");
    },
    async dispatchSync(taskName, payload, sheet = null) {
      this.isSyncing = true;
      this.syncQueue.push({ taskName, payload, sheet });

      if (this.syncQueue.length === 1) {
        this.processSyncQueue();
      }
    },
    async processSyncQueue() {
      while (this.syncQueue.length > 0) {
        let task = this.syncQueue[0];
        try {
          let newData;
          if (task.taskName === "updateRecord") {
            newData = await runGS("updateRecord", task.payload);
          } else if (task.taskName === "approveUser") {
            newData = await runGS(
              "approveUser",
              task.payload.id,
              task.payload.data,
            );
            this.db.users = newData;
          } else if (task.taskName === "addRow") {
            newData = await runGS("addRow", task.sheet, task.payload);
          } else if (task.taskName === "addRows") {
            newData = await runGS("addRows", task.sheet, task.payload);
          } else if (task.taskName === "bulkImport") {
            newData = await runGS("bulkImport", task.payload);
          } else if (task.taskName === "updateRow") {
            newData = await runGS("updateRow", task.sheet, task.payload);
          } else if (task.taskName === "deleteRow") {
            newData = await runGS(
              "deleteRow",
              task.sheet,
              task.payload,
              this.user.Role,
              this.user.ID,
            );
          }

          if (newData) {
            if (Array.isArray(newData)) {
              if (task.sheet === "Records" || task.taskName === "updateRecord") {
                this.db.records = newData;
              } else {
                let key = task.sheet.toLowerCase();
                let merged = newData;
                
                if (key === 'services') {
                  let sNames = new Set();
                  merged = [...newData.filter(s => s && String(s.ID).indexOf("ds_") !== 0), ...defaultServices].filter(s => {
                    let n = String(s.Name || "").toLowerCase().trim();
                    if (sNames.has(n)) return false;
                    sNames.add(n);
                    return true;
                  });
                } else if (key === 'brands') {
                  let bNames = new Set();
                  merged = [...newData.filter(b => b && String(b.ID).indexOf("db_") !== 0), ...defaultBrands].filter(b => {
                    let n = String(b.Name || "").toLowerCase().trim();
                    if (bNames.has(n)) return false;
                    bNames.add(n);
                    return true;
                  });
                } else if (key === 'models') {
                  merged = [...newData.filter(m => m && String(m.ID).indexOf("dm_") !== 0), ...defaultModels];
                }
                this.db[key] = merged;
              }
            } else {
              this.db = newData;
            }
            this.db.records.forEach((r) => {
              if (r.ServicesJSON) {
                try {
                  r.ServicesJSON =
                    typeof r.ServicesJSON === "string"
                      ? JSON.parse(r.ServicesJSON)
                      : r.ServicesJSON;
                } catch (e) {
                  r.ServicesJSON = [];
                }
              } else r.ServicesJSON = [];
            });
          }
          this.syncQueue.shift();
        } catch (e) {
          console.error("Ошибка синхронизации:", e);
          this.showToast(
            "Ошибка синхронизации. Будет повторная попытка.",
            "error",
          );
          await new Promise((r) => setTimeout(r, 4000));
        }
      }
      this.isSyncing = false;
    },
  },
});
