<template>
  <div
    class="modal fade"
    id="bulkUploadModal"
    ref="modalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div
        class="modal-content rounded-3xl border-0 shadow-2xl font-sans overflow-hidden bg-slate-50"
      >
        <div class="modal-header border-b border-slate-100 px-6 py-5 bg-white">
          <h5 class="modal-title font-bold text-slate-800 m-0">
            Загрузка справочников (Оптом)
          </h5>
          <button
            type="button"
            class="btn-close text-slate-400 focus:ring-0 shrink-0 border-none bg-transparent"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div class="modal-body p-6 space-y-4">
          <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-900 leading-relaxed shadow-sm">
            <p class="font-bold mb-2 uppercase tracking-wide text-indigo-700">Инструкция (СТРУКТУРА JSON):</p>
            <p class="mb-2">Вы можете загрузить Услуги, Марки и Модели одновременно или по отдельности. Используйте следующий формат:</p>
            <pre class="bg-indigo-900 text-indigo-50 p-3 rounded-xl font-mono text-[10px] overflow-x-auto shadow-inner">
{
  "services": [
    { "Name": "Замена масла", "Price": 500 }
  ],
  "brands": [
    { "Name": "Toyota" }
  ],
  "models": [
    { "BrandName": "Toyota", "Name": "Camry" },
    { "BrandName": "BMW", "Name": "X5" }
  ]
}</pre>
            <p class="mt-2 text-[10px] opacity-80 font-medium">Ключи <code class="bg-white/50 px-1 py-0.5 rounded text-indigo-800">services</code>, <code class="bg-white/50 px-1 py-0.5 rounded text-indigo-800">brands</code>, <code class="bg-white/50 px-1 py-0.5 rounded text-indigo-800">models</code> опциональны. Дубликаты (по названию) будут пропущены. Для добавления модели можно указать <code>BrandName</code>.</p>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">JSON данные</label>
            <textarea
              v-model="jsonInput"
              class="w-full h-48 px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-mono text-slate-700 resize-y shadow-sm"
              placeholder='Вставьте ваш JSON сюда...'
            ></textarea>
            <p v-if="errorText" class="mt-1.5 text-xs text-rose-600 font-bold bg-rose-50 px-2 py-1.5 rounded-lg border border-rose-100 flex items-center gap-1.5">
              <i class="bi bi-exclamation-circle-fill"></i> {{ errorText }}
            </p>
            <p v-if="successText" class="mt-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5">
              <i class="bi bi-check-circle-fill"></i> {{ successText }}
            </p>
          </div>
        </div>
        <div class="modal-footer border-t border-slate-100 px-6 py-5 bg-white flex gap-3">
          <button
            type="button"
            class="flex-1 px-4 py-3 border border-slate-205 text-slate-600 rounded-xl bg-white hover:bg-slate-50 font-bold text-sm transition cursor-pointer"
            data-bs-dismiss="modal"
          >
            Отмена
          </button>
          <button
            type="button"
            class="flex-1 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 border-none cursor-pointer"
            @click="processUpload"
            :disabled="isProcessing"
          >
            <span
              v-if="isProcessing"
              class="spinner-border spinner-border-sm text-white border-2"
            ></span>
            <span>Загрузить</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../../store";

export default {
  data() {
    return {
      jsonInput: "",
      errorText: "",
      successText: "",
      isProcessing: false,
      bsModal: null,
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    user() {
      return this.store.user;
    },
    db() {
      return this.store.db;
    }
  },
  mounted() {
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      this.bsModal = new bootstrap.Modal(this.$refs.modalRef);
    }
    
    this.$refs.modalRef.addEventListener('hidden.bs.modal', () => {
       this.jsonInput = "";
       this.errorText = "";
       this.successText = "";
    });
  },
  methods: {
    open() {
      this.jsonInput = "";
      this.errorText = "";
      this.successText = "";
      if (this.bsModal) this.bsModal.show();
    },
    hide() {
      if (this.bsModal) this.bsModal.hide();
    },
    generateId() {
      return "local_" + Date.now() + "_" + Math.floor(Math.random()*10000);
    },
    async processUpload() {
      this.errorText = "";
      this.successText = "";
      
      if (!this.jsonInput.trim()) {
         this.errorText = "Вставьте JSON.";
         return;
      }
      
      let data = null;
      try {
        data = JSON.parse(this.jsonInput);
      } catch (e) {
        this.errorText = "Неверный формат JSON.";
        return;
      }
      
      this.isProcessing = true;
      let stats = {
         servicesAdded: 0,
         brandsAdded: 0,
         modelsAdded: 0,
         skipped: 0
      };
      
      try {
         const role = this.user.Role;
         const userId = this.user.ID;

         const brandsToSync = [];
         const modelsToSync = [];
         const servicesToSync = [];

         // Process Brands
         if (data.brands && Array.isArray(data.brands)) {
             for (const item of data.brands) {
                 if (!item.Name) continue;
                 const exists = (this.db.brands || []).find(b => String(b.Name).trim().toLowerCase() === String(item.Name).trim().toLowerCase());
                 if (!exists) {
                     const payload = { ID: this.generateId(), Name: String(item.Name).trim(), _role: role, _userId: userId };
                     if (!this.db.brands) this.db.brands = [];
                     this.db.brands.push(payload);
                     brandsToSync.push(payload);
                     stats.brandsAdded++;
                 } else {
                     stats.skipped++;
                 }
             }
         }

         if (brandsToSync.length > 0) {
             this.store.dispatchSync("addRows", brandsToSync, "Brands");
         }
         
         // Process Models
         if (data.models && Array.isArray(data.models)) {
             for (const item of data.models) {
                 if (!item.Name) continue;
                 let brandId = item.BrandID;
                 
                 if (!brandId && item.BrandName) {
                     let bFind = (this.db.brands || []).find(b => String(b.Name).trim().toLowerCase() === String(item.BrandName).trim().toLowerCase());
                     if (bFind) {
                         brandId = bFind.ID;
                     } else {
                         // Adding missing brand immediately to reference it, but this breaks batching a bit for recursive brands
                         // However, usually brands are already listed or added in brands section.
                         // For simplicity, we'll add brands one by one IF they are missing in the models section
                         const newB = { ID: this.generateId(), Name: String(item.BrandName).trim(), _role: role, _userId: userId };
                         if (!this.db.brands) this.db.brands = [];
                         this.db.brands.push(newB);
                         this.store.dispatchSync("addRow", newB, "Brands");
                         brandId = newB.ID;
                         stats.brandsAdded++;
                     }
                 }
                 
                 if (!brandId) continue;
                 
                 const exists = (this.db.models || []).find(m => 
                     m.BrandID === brandId && String(m.Name).trim().toLowerCase() === String(item.Name).trim().toLowerCase()
                 );
                 if (!exists) {
                     const payload = { ID: this.generateId(), BrandID: brandId, Name: String(item.Name).trim(), _role: role, _userId: userId };
                     if (!this.db.models) this.db.models = [];
                     this.db.models.push(payload);
                     modelsToSync.push(payload);
                     stats.modelsAdded++;
                 } else {
                     stats.skipped++;
                 }
             }
         }

         if (modelsToSync.length > 0) {
             this.store.dispatchSync("addRows", modelsToSync, "Models");
         }
         
         // Process Services
         if (data.services && Array.isArray(data.services)) {
             for (const item of data.services) {
                 if (!item.Name) continue;
                 const exists = (this.db.services || []).find(s => String(s.Name).trim().toLowerCase() === String(item.Name).trim().toLowerCase());
                 if (!exists) {
                     const payload = { ID: this.generateId(), Name: String(item.Name).trim(), Price: Number(item.Price) || 0, _role: role, _userId: userId };
                     if (!this.db.services) this.db.services = [];
                     this.db.services.push(payload);
                     servicesToSync.push(payload);
                     stats.servicesAdded++;
                 } else {
                     stats.skipped++;
                 }
             }
         }

         if (servicesToSync.length > 0) {
             this.store.dispatchSync("addRows", servicesToSync, "Services");
         }
         
         this.successText = `Успешно! Добавлено: Услуг (${stats.servicesAdded}), Марок (${stats.brandsAdded}), Моделей (${stats.modelsAdded}). Пропущено дубликатов: ${stats.skipped}.`;
         this.store.showToast("Справочники обновлены");
         setTimeout(() => {
            this.hide();
         }, 2000);
      } catch (err) {
         this.errorText = "Произошла ошибка при загрузке: " + err.message;
      } finally {
         this.isProcessing = false;
      }
    }
  }
};
</script>
