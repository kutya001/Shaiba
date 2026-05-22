<template>
  <div class="space-y-4 max-w-4xl mx-auto w-full pb-20 animate-fade-in px-4">
    <!-- Status tabs / filters - Permanently displayed and compact -->
    <div class="flex gap-1 overflow-x-auto pb-2 border-b border-slate-100/65 scrollbar-none select-none px-0.5 my-1">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeStatusTab = tab.id"
        class="flex-1 min-w-[60px] h-8.5 px-2 text-[10.5px] font-extrabold rounded-lg transition-all cursor-pointer whitespace-nowrap outline-none border flex items-center justify-center gap-1 shadow-2xs"
        :class="
          activeStatusTab === tab.id
            ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs shadow-indigo-100'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-650'
        "
        :title="tab.label"
      >
        <i :class="tab.icon" class="text-[11px]"></i>
        <span class="text-[10px]">{{ tab.label }}</span>
        <span
          class="text-[8.5px] px-1 py-0.2 rounded-full font-black font-mono leading-none min-w-[14px] text-center"
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
        <!-- Info Column - Clickable for details modal -->
        <div class="flex-1 min-w-0 space-y-1.5 cursor-pointer hover:bg-slate-50/60 p-1.5 rounded-lg transition-colors" @click="selectedApp = app" title="Нажмите, чтобы просмотреть карточку">
          <!-- Top Row: Name, Phone, Car Badge, Car Name -->
          <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span class="font-bold text-slate-800 text-sm.5">
              {{ app['Ваше Имя'] || 'Без имени' }}
            </span>

            <!-- Phone links with prompt normalization on-the-fly -->
            <div v-if="app['Контактный номер телефона']" class="inline-flex items-center gap-1 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-lg select-none scale-95" @click.stop>
              <!-- Call link -->
              <a
                :href="'tel:' + formatPhoneForLink(app['Контактный номер телефона'])"
                class="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5 transition"
                title="Позвонить"
              >
                <i class="bi bi-telephone-fill text-[10px]"></i>
                <span class="hover:underline text-[10px] font-mono leading-none">{{ formatPhoneForLink(app['Контактный номер телефона']) }}</span>
              </a>
              <span class="text-slate-300 font-light text-[10px]">|</span>
              <!-- WhatsApp logo link -->
              <a
                :href="getWhatsAppLink(app['Контактный номер телефона'])"
                target="_blank"
                class="text-emerald-600 hover:text-emerald-700 font-bold flex items-center transition"
                title="Написать в WhatsApp"
              >
                <i class="bi bi-whatsapp text-[11px]"></i>
              </a>
            </div>

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
              <!-- "Запись" - GREEN (bg-emerald-600) -->
              <button
                @click="createRecordFromApp(app)"
                class="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold transition border border-emerald-650 shadow-sm cursor-pointer animate-fade-in"
                title="Оформить запись клиента"
              >
                <i class="bi bi-calendar-plus"></i>
                Запись
              </button>

              <!-- "Отклонить" - RED (bg-rose-600) -->
              <button
                @click="declineApplication(app)"
                class="h-7 px-2 bg-rose-600 hover:bg-rose-705 text-white rounded-lg flex items-center justify-center gap-1 text-[11.5px] font-extrabold transition border border-rose-650 cursor-pointer shadow-sm animate-fade-in"
                title="Отклонить заявку"
              >
                <i class="bi bi-slash-circle"></i>
                Отклонить
              </button>
            </template>

            <!-- Regular Masters view status label on non-editable processed entries -->
            <span
              v-else-if="user && user.Role === 'Master'"
              class="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded select-none uppercase tracking-wider"
            >
              Закрыта
            </span>

            <!-- Delete button ONLY for Superadmin - BLACK (bg-slate-900) -->
            <button
              v-if="user && user.Role === 'Superadmin'"
              @click="deleteApplication(app)"
              class="h-7 px-2.5 bg-slate-900 hover:bg-black text-white rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold transition border border-slate-950 cursor-pointer shadow-sm animate-fade-in"
              title="Удалить заявку"
            >
              <i class="bi bi-trash"></i>
              Удалить
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

    <!-- Beautiful Application Detail Modal -->
    <div
      v-if="selectedApp"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      @click="selectedApp = null"
    >
      <div
        class="bg-white border border-slate-250 w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in"
        @click.stop
      >
        <!-- Modal Sticky Header -->
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-indigo-600 text-[20px]">assignment</span>
            <h3 class="font-black text-sm text-slate-800 uppercase tracking-wide">Карточка заявки</h3>
          </div>
          <button
            @click="selectedApp = null"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Modal Content Scroll Area -->
        <div class="p-5 overflow-y-auto space-y-4 text-xs">
          <!-- Main Client and Contact Info Card -->
          <div class="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3.5 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Имя клиента</span>
                <span class="text-sm font-black text-slate-800">
                  {{ selectedApp['Ваше Имя'] || 'Без имени' }}
                </span>
              </div>
              
              <!-- Contact Buttons normalized on-the-fly -->
              <div v-if="selectedApp['Контактный номер телефона']" class="flex items-center gap-1.5">
                <a
                  :href="'tel:' + formatPhoneForLink(selectedApp['Контактный номер телефона'])"
                  class="h-8.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 transition font-bold"
                  title="Позвонить"
                >
                  <i class="bi bi-telephone-fill"></i>
                  <span>Позвонить</span>
                </a>
                <a
                  :href="getWhatsAppLink(selectedApp['Контактный номер телефона'])"
                  target="_blank"
                  class="h-8.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition font-bold"
                  title="Написать в WhatsApp"
                >
                  <i class="bi bi-whatsapp"></i>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-indigo-100/60 font-medium">
              <div>
                <span class="block text-[9px] font-black text-indigo-400 uppercase tracking-widest">Телефон</span>
                <span class="font-bold text-indigo-950 font-mono">{{ formatPhoneForLink(selectedApp['Контактный номер телефона']) || '—' }}</span>
              </div>
              <div>
                <span class="block text-[9px] font-black text-indigo-400 uppercase tracking-widest">Email</span>
                <span class="font-bold text-indigo-950 break-all select-all">{{ selectedApp['Адрес электронной почты'] || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Vehicle Specs -->
          <div class="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] text-slate-500 font-bold">directions_car</span>
              <h4 class="font-black text-[10px] text-slate-500 uppercase tracking-widest">Автомобиль и госномер</h4>
            </div>

            <div class="grid grid-cols-2 gap-3 font-medium">
              <div>
                <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Марка / Модель</span>
                <span class="font-bold text-slate-800">
                  {{ selectedApp['Марка автомобиля'] || '—' }} {{ selectedApp['Модель автомобиля'] || '' }}
                </span>
              </div>
              <div>
                <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Год выпуска</span>
                <span class="font-bold text-slate-800">
                  {{ selectedApp['Год выпуска автомобиля'] ? selectedApp['Год выпуска автомобиля'] + ' г.' : '—' }}
                </span>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-200/50">
              <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Государственный номер</span>
              <span
                v-if="selectedApp['Государственный номер машины (госномер)']"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 border border-slate-300 bg-white text-xs rounded font-bold tracking-widest uppercase font-mono shadow-2xs text-slate-800"
              >
                <span class="text-[9px] text-slate-400 border-r border-slate-300 pr-1.5 select-none font-bold">KG</span>
                {{ selectedApp['Государственный номер машины (госномер)'] }}
              </span>
              <span v-else class="text-slate-400 italic font-medium">Не указан</span>
            </div>
          </div>

          <!-- Timing and Date Details -->
          <div class="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] text-slate-500 font-bold">calendar_month</span>
              <h4 class="font-black text-[10px] text-slate-500 uppercase tracking-widest">Желаемая дата и время</h4>
            </div>

            <div class="grid grid-cols-2 gap-3 font-medium">
              <div>
                <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Дата</span>
                <span class="font-bold text-slate-850">{{ selectedApp['Предполагаемая дата записи'] || '—' }}</span>
              </div>
              <div>
                <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Время</span>
                <span class="font-bold text-slate-850">{{ selectedApp['Предполагаемое время записи'] || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Requested Services & Message Comments -->
          <div class="bg-white border border-slate-150 rounded-xl p-3.5 space-y-3">
            <div>
              <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <i class="bi bi-tools text-[9px]"></i> Услуги автоэлектрики
              </span>
              <p class="font-semibold text-slate-850 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                {{ selectedApp['Выберите необходимые услуги автоэлектрики (если применимо)'] || 'Услуги не выбраны или не указаны' }}
              </p>
            </div>

            <div>
              <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <i class="bi bi-chat-dots text-[9px]"></i> Комментарий / Проблема
              </span>
              <p class="font-normal text-slate-650 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 italic">
                {{ selectedApp['Краткое описание проблемы или комментарий (по желанию)'] || 'Комментарий отсутствует' }}
              </p>
            </div>
          </div>

          <!-- Status badge details -->
          <div class="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Текущий статус</span>
              <span class="text-[11px] font-bold" :class="isPending(selectedApp) ? 'text-amber-600' : isDone(selectedApp) ? 'text-emerald-600' : 'text-rose-600'">
                {{ isPending(selectedApp) ? 'Ожидает решения (Новый)' : isDone(selectedApp) ? 'Запись создана' : 'Отклонено' }}
              </span>
            </div>
            <div class="text-right">
              <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Дата подачи</span>
              <span class="text-[10px] text-slate-500 italic font-medium">{{ selectedApp['Отметка времени'] ? formatTimestamp(selectedApp['Отметка времени']) : '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Sticky Modal Footer Actions -->
        <div class="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div>
            <!-- If record is already created -->
            <button
              v-if="isDone(selectedApp)"
              @click="openLinkedRecord(selectedApp['IDRecords']); selectedApp = null"
              class="h-9 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition border border-emerald-200 cursor-pointer shadow-sm"
            >
              <i class="bi bi-box-arrow-in-up-right"></i>
              Смотреть запись
            </button>
            
            <template v-else-if="isPending(selectedApp) || (user && user.Role !== 'Master')">
              <button
                @click="createRecordFromApp(selectedApp); selectedApp = null"
                class="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition border border-emerald-650 cursor-pointer shadow-sm animate-fade-in"
              >
                <i class="bi bi-calendar-plus"></i>
                Запись
              </button>
            </template>
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Decline button (Paint in RED) -->
            <button
              v-if="!isDone(selectedApp) && (isPending(selectedApp) || (user && user.Role !== 'Master'))"
              @click="declineApplication(selectedApp); selectedApp = null"
              class="h-9 px-3 bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer shadow-sm"
            >
              <i class="bi bi-slash-circle"></i>
              Отклонить
            </button>

            <!-- Delete button for admin only (Paint in BLACK) -->
            <button
              v-if="user && user.Role === 'Superadmin'"
              @click="deleteApplication(selectedApp); selectedApp = null"
              class="h-9 px-3 bg-slate-900 hover:bg-black text-white border border-slate-950 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer shadow-sm"
              title="Удалить заявку"
            >
              <i class="bi bi-trash"></i>
              Удалить
            </button>
          </div>
        </div>
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
      selectedApp: null,
      tabs: [
        { id: "pending", label: "Новые", icon: "bi bi-envelope" },
        { id: "created", label: "Запись", icon: "bi bi-calendar-check" },
        { id: "declined", label: "Отклонено", icon: "bi bi-slash-circle" },
        { id: "all", label: "Все", icon: "bi bi-grid" },
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
    formatPhoneForLink(phone) {
      if (!phone) return "";
      let cleaned = String(phone).replace(/\D/g, "");
      if (cleaned.startsWith("996")) {
        if (cleaned.length >= 9) {
          cleaned = cleaned.slice(-9);
        }
      } else if (cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1);
      }
      if (cleaned.length > 9) {
        cleaned = cleaned.slice(-9);
      }
      return "+996" + cleaned;
    },
    getWhatsAppLink(phone) {
      if (!phone) return "";
      const normalized = this.formatPhoneForLink(phone);
      return "https://wa.me/" + normalized.replace("+", "");
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
