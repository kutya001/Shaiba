<template>
  <div class="space-y-4 max-w-4xl mx-auto w-full pb-20 animate-fade-in px-4">
    <!-- Status tabs / filters - Collapsible when isFiltersExpanded is true -->
    <div v-show="isFiltersExpanded" class="flex gap-1.5 overflow-x-auto pb-3.5 border-b border-slate-100/65 scrollbar-none select-none bg-white border border-slate-150 p-3 rounded-2xl shadow-sm animate-fade-in mb-3">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeStatusTab = tab.id"
        class="px-4 py-2.5 text-xs.5 font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap outline-none border flex items-center gap-2 shadow-2xs"
        :class="
          activeStatusTab === tab.id
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-sm shadow-indigo-100'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-650'
        "
        :title="tab.label"
      >
        <i :class="tab.icon" class="text-[13px] font-bold"></i>
        <span
          class="text-[10px] px-2 py-0.5 rounded-full font-black font-mono leading-none flex items-center justify-center min-w-[20px]"
          :class="
            activeStatusTab === tab.id
              ? 'bg-white/20 text-white'
              : tab.id === 'pending'
                ? 'bg-amber-100 text-amber-750'
                : tab.id === 'created'
                  ? 'bg-emerald-100 text-emerald-750'
                  : tab.id === 'declined'
                    ? 'bg-rose-100 text-rose-750'
                    : 'bg-slate-100 text-slate-600'
          "
        >
          {{ getTabCount(tab.id) }}
        </span>
      </button>
    </div>

    <!-- Main List of Applications -->
    <div v-if="filteredApplications.length > 0" class="space-y-2">
      <div
        v-for="app in filteredApplications"
        :key="app['Отметка времени']"
        class="bg-white border hover:border-slate-300 rounded-xl p-3 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs animate-fade-in"
        :class="{
          'border-amber-200 bg-amber-50/5': isPending(app),
          'border-emerald-200 bg-emerald-50/5': isDone(app),
          'border-slate-200 bg-slate-50/5': isDeclined(app)
        }"
      >
        <!-- Info Column -->
        <div class="flex-1 min-w-0 space-y-1.5">
          <!-- Top Row: Name, Phone, Car Badge, Car Name -->
          <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span class="font-bold text-slate-800 text-sm.5">
              {{ app['Ваше Имя'] || 'Без имени' }}
            </span>

            <a
              v-if="app['Контактный номер телефона']"
              :href="'tel:' + app['Контактный номер телефона']"
              class="text-indigo-600 hover:text-indigo-700 font-extrabold flex items-center gap-0.5"
            >
              <i class="bi bi-telephone-fill text-[10px]"></i>
              {{ app['Контактный номер телефона'] }}
            </a>

            <!-- Plate Number -->
            <div
              v-if="app['Государственный номер машины (госномер)']"
              class="inline-flex items-center gap-0.5 px-1.5 py-0.2 border border-slate-300 bg-slate-50 text-[9px] rounded font-bold tracking-wider uppercase font-mono shadow-2xs text-slate-800 select-none scale-95"
            >
              <span class="text-[8px] text-slate-400 border-r border-slate-300 pr-0.5 select-none font-bold">KG</span>
              {{ app['Государственный номер машины (госномер)'] }}
            </div>

            <!-- Car Brand / Model / Year -->
            <span v-if="app['Марка автомобиля'] || app['Модель автомобиля']" class="text-slate-600 font-bold">
              {{ app['Марка автомобиля'] }} {{ app['Модель автомобиля'] }}
              <span v-if="app['Год выпуска автомобиля']" class="text-slate-400 font-normal">({{ app['Год выпуска автомобиля'] }} г.)</span>
            </span>
          </div>

          <!-- Bottom Row Info (Services & Comment & Date) -->
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 font-semibold text-[11px] select-none w-full">
            <!-- Expected Date -->
            <div v-if="app['Предполагаемая дата записи']" class="flex items-center gap-1 bg-slate-100/70 border border-slate-200/50 px-1.5 py-0.5 rounded-lg text-slate-700">
              <i class="bi bi-calendar3 text-[10px] text-indigo-500"></i>
              <span>Дата: <strong class="font-extrabold text-slate-900">{{ app['Предполагаемая дата записи'] }} {{ app['Предполагаемое время записи'] || '—' }}</strong></span>
            </div>

            <!-- Selected Services Summary -->
            <div v-if="app['Выберите необходимые услуги автоэлектрики (если применимо)']" class="flex items-center gap-1 max-w-xs truncate" :title="app['Выберите необходимые услуги автоэлектрики (если применимо)']">
              <i class="bi bi-tools text-[10px] text-slate-400"></i>
              <span class="truncate text-slate-600 font-medium">
                {{ app['Выберите необходимые услуги автоэлектрики (если применимо)'] }}
              </span>
            </div>

            <!-- Comment placeholder / micro icon -->
            <div v-if="app['Краткое описание проблемы или комментарий (по желанию)']" class="flex items-center gap-1.5 text-slate-500 italic max-w-sm truncate" :title="app['Краткое описание проблемы или комментарий (по желанию)']">
              <i class="bi bi-chat-dots text-[10px] text-slate-400"></i>
              <span class="truncate font-normal text-slate-500">
                "{{ app['Краткое описание проблемы или комментарий (по желанию)'] }}"
              </span>
            </div>

            <!-- Created stamp -->
            <div class="flex items-center gap-1 text-[10px] text-slate-400 font-normal ml-auto italic">
              <i class="bi bi-clock"></i>
              <span>{{ app['Отметка времени'] ? formatTimestamp(app['Отметка времени']) : '' }}</span>
            </div>
          </div>
        </div>

        <!-- Action Panel & Status Badges column -->
        <div class="flex items-center gap-2 shrink-0 justify-end flex-wrap sm:flex-nowrap">
          <!-- Status icon-only badge (no text, optimized colors) -->
          <div class="flex items-center justify-center select-none shrink-0" :title="isPending(app) ? 'Открыт' : isDone(app) ? 'Запись создана' : 'Отклонён'">
            <span
              v-if="isPending(app)"
              class="w-6 h-6 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center"
            >
              <i class="bi bi-envelope text-xs font-bold"></i>
            </span>
            <span
              v-else-if="isDone(app)"
              class="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center"
            >
              <i class="bi bi-calendar-check-fill text-xs"></i>
            </span>
            <span
              v-else-if="isDeclined(app)"
              class="w-6 h-6 rounded-full bg-rose-50 text-rose-600 border border-rose-250 flex items-center justify-center animate-fade-in"
            >
              <i class="bi bi-slash-circle-fill text-[11px]"></i>
            </span>
          </div>

          <!-- Action Buttons Control with Role Protections -->
          <div class="flex items-center gap-1 shrink-0">
            <!-- If record is already created (isDone) -->
            <button
              v-if="isDone(app)"
              @click="openLinkedRecord(app['IDRecords'])"
              class="h-7 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold transition border border-emerald-200 cursor-pointer"
              title="Открыть запись"
            >
              <i class="bi bi-box-arrow-in-up-right"></i>
              Открыть
            </button>

            <!-- Editable Actions: Masters ONLY edit "Открытые" entries, while Admins/Superadmins can process declined too -->
            <template v-else-if="isPending(app) || (user && user.Role !== 'Master')">
              <!-- "Запись" - renamed from "Назначить" -->
              <button
                @click="createRecordFromApp(app)"
                class="h-7 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold transition border border-indigo-700 shadow-sm cursor-pointer"
                title="Оформить запись клиента"
              >
                <i class="bi bi-calendar-plus"></i>
                Запись
              </button>

              <button
                @click="declineApplication(app)"
                class="w-7 h-7 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg flex items-center justify-center transition p-0 cursor-pointer"
                title="Отклонить заявку"
              >
                <i class="bi bi-slash-circle"></i>
              </button>
            </template>

            <!-- Regular Masters view status label on non-editable processed entries -->
            <span
              v-else-if="user && user.Role === 'Master'"
              class="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded select-none uppercase tracking-wider"
            >
              Закрыта
            </span>

            <!-- Delete button ONLY for Superadmin -->
            <button
              v-if="user && user.Role === 'Superadmin'"
              @click="deleteApplication(app)"
              class="w-7 h-7 bg-slate-50 hover:bg-rose-100 text-slate-400 hover:text-rose-700 border border-slate-200 hover:border-rose-350 rounded-lg flex items-center justify-center transition p-0 cursor-pointer"
              title="Удалить заявку"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="bg-white border rounded-2xl p-12 text-center text-slate-500 shadow-sm flex flex-col items-center justify-center space-y-3"
    >
      <div class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100">
        <i class="bi bi-inbox-fill text-xl"></i>
      </div>
      <div>
        <h4 class="font-bold text-slate-700 text-xs.5">Заявки не найдены</h4>
        <p class="text-xs text-slate-400 mt-0.5 max-w-xs mx-auto">
          В выбранной категории или по вашему поисковому запросу нет данных.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../store";

export default {
  props: {
    db: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
    searchQuery: {
      type: String,
      default: "",
    },
    isFiltersExpanded: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["open-record"],
  data() {
    return {
      activeStatusTab: "pending",
      tabs: [
        { id: "pending", label: "Открытые (Новые)", icon: "bi bi-envelope" },
        { id: "created", label: "Запись оформлена", icon: "bi bi-calendar-check" },
        { id: "declined", label: "Отклонённые", icon: "bi bi-slash-circle" },
        { id: "all", label: "Все заявки", icon: "bi bi-grid" },
      ],
    };
  },
  setup() {
    const store = useMainStore();
    return { store };
  },
  computed: {
    applications() {
      // Ensure it is always an array
      const rawList = this.db.applications || [];
      if (this.user && this.user.Role === "Master") {
        const myMid = this.store.currentUserMasterID;
        return rawList.filter((app) => {
          const isDone = String(app["Статус Заявки"]).trim() === "Создана запись";
          const recordId = app["IDRecords"];
          if (isDone || recordId) {
            const linkedRec = this.db.records?.find((r) => String(r.ID) === String(recordId));
            if (linkedRec) {
              return String(linkedRec.MasterID) === String(myMid);
            }
            return false;
          }
          return true;
        });
      }
      return rawList;
    },
    filteredApplications() {
      let list = [...this.applications];

      // Filter by active status tab
      if (this.activeStatusTab === "pending") {
        list = list.filter((a) => this.isPending(a));
      } else if (this.activeStatusTab === "created") {
        list = list.filter((a) => this.isDone(a));
      } else if (this.activeStatusTab === "declined") {
        list = list.filter((a) => this.isDeclined(a));
      }

      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        list = list.filter(
          (a) =>
            String(a["Ваше Имя"] || "").toLowerCase().includes(query) ||
            String(a["Контактный номер телефона"] || "").toLowerCase().includes(query) ||
            String(a["Государственный номер машины (госномер)"] || "").toLowerCase().includes(query) ||
            String(a["Марка автомобиля"] || "").toLowerCase().includes(query) ||
            String(a["Модель автомобиля"] || "").toLowerCase().includes(query),
        );
      }

      // Sort by Отметка времени descending (newest first)
      return list.sort((a, b) => {
        const timeA = a["Отметка времени"] ? new Date(a["Отметка времени"]).getTime() : 0;
        const timeB = b["Отметка времени"] ? new Date(b["Отметка времени"]).getTime() : 0;
        return timeB - timeA;
      });
    },
  },
  methods: {
    isPending(item) {
      const s = item["Статус Заявки"];
      return !s || String(s).trim() === "";
    },
    isDone(item) {
      return String(item["Статус Заявки"]).trim() === "Создана запись";
    },
    isDeclined(item) {
      return String(item["Статус Заявки"]).trim() === "Отклонён";
    },
    getTabCount(tabId) {
      if (tabId === "all") return this.applications.length;
      if (tabId === "pending") return this.applications.filter((a) => this.isPending(a)).length;
      if (tabId === "created") return this.applications.filter((a) => this.isDone(a)).length;
      if (tabId === "declined") return this.applications.filter((a) => this.isDeclined(a)).length;
      return 0;
    },
    formatTimestamp(val) {
      if (!val) return "—";
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return val;
        return d.toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        return val;
      }
    },
    createRecordFromApp(app) {
      this.$emit("open-record", null, app);
    },
    async declineApplication(app) {
      const name = app["Ваше Имя"] || "Клиент";
      if (!confirm(`Вы действительно хотите отклонить заявку от "${name}"?`)) {
        return;
      }

      try {
        // Optimistic UI Update first
        const id = app["Отметка времени"];
        const index = this.store.db.applications.findIndex((a) => a["Отметка времени"] === id);
        if (index > -1) {
          this.store.db.applications[index]["Статус Заявки"] = "Отклонён";
        }

        // Notify GAS server
        const payload = {
          ID: id,
          "Статус Заявки": "Отклонён",
        };
        await this.store.dispatchSync("updateRow", payload, "Заявки на Запись");
        this.store.showToast("Статус заявки успешно изменен на 'Отклонён'");
      } catch (e) {
        this.store.showToast("Ошибка при изменении статуса заявки: " + e.message, "error");
      }
    },
    async deleteApplication(app) {
      const name = app["Ваше Имя"] || "Клиент";
      if (!confirm(`Вы действительно хотите БЕЗВОЗВРАТНО удалить заявку от "${name}"?\nЭто действие нельзя отменить.`)) {
        return;
      }

      try {
        const id = app["Отметка времени"];
        // Optimistic UI Update first
        this.store.db.applications = this.store.db.applications.filter((a) => a["Отметка времени"] !== id);

        // Notify GAS server
        await this.store.dispatchSync("deleteRow", id, "Заявки на Запись");
        this.store.showToast("Заявка успешно удалена");
      } catch (e) {
        this.store.showToast("Ошибка при удалении заявки: " + e.message, "error");
      }
    },
    openLinkedRecord(recordId) {
      if (!recordId) return;
      const rec = this.store.db.records.find((r) => r.ID === recordId);
      if (rec) {
        // Delegate to parent of component to trigger opening
        this.$emit("open-record", rec);
      } else {
        this.store.showToast("Запись не найдена в текущей базе данных. Возможно, она была удалена.", "error");
      }
    },
  },
};
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none; /* IE, Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
