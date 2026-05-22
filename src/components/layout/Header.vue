<template>
  <div>
    <!-- Mobile Top Header -->
    <header
      class="md:hidden mx-4 mt-4 mb-2 h-12 bg-transparent border-0 shadow-none px-0 flex items-center justify-between shrink-0 z-20 select-none"
    >
      <div
        class="flex items-center gap-1.5 bg-white shadow-md border border-slate-200/50 rounded-xl px-2.5 h-10"
        v-if="!localSearchExpanded"
      >
        <div
          class="w-5 h-5 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shrink-0"
        >
          <i
            class="bi text-white text-[9px]"
            :class="
              activeTab === 'dashboard'
                ? 'bi-bar-chart-line-fill'
                : activeTab === 'refs'
                  ? 'bi-journals'
                  : activeTab === 'users'
                    ? 'bi-people-fill'
                    : 'bi-car-front-fill'
            "
          ></i>
        </div>
        <span
          class="font-black text-xs tracking-tight text-slate-800 font-heading"
        >
          {{
            activeTab === "dashboard"
              ? "Аналитика"
              : activeTab === "refs"
                ? "Справочники"
                : activeTab === "users"
                  ? "Персонал"
                  : "AutoService"
          }}
        </span>
      </div>



      <!-- Expanded Mobile Search -->
      <div v-else class="flex-1 mr-2 relative h-10 select-none">
        <input
          :value="searchQuery"
          @input="onSearchInput"
          ref="mobileSearchInput"
          class="w-full h-10 pl-8 pr-8 rounded-xl bg-white text-slate-800 text-xs font-semibold outline-none border border-slate-200/50 shadow-md focus:border-indigo-500/80"
          :placeholder="activeTab === 'refs' ? 'Поиск...' : 'Поиск по госномеру...'"
        />
        <span
          class="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-3"
          >search</span
        >
        <button
          @click="closeSearch"
          class="absolute right-2 top-3 text-slate-400 hover:text-slate-600 flex items-center"
        >
          <span class="material-symbols-outlined text-[15px]">close</span>
        </button>
      </div>

      <div
        class="flex items-center gap-1.5 h-10 bg-white shadow-md border border-slate-200/50 rounded-xl p-1"
      >
        <!-- Search Icon Toggle for Records -->
        <button
          v-if="(activeTab === 'records' || activeTab === 'refs') && !localSearchExpanded"
          @click="openSearch"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-slate-50/50 transition cursor-pointer"
        >
          <span class="material-symbols-outlined text-[18px]">search</span>
        </button>

        <!-- Filter Icon Toggle for Records and Dashboard -->
        <button
          v-if="activeTab === 'records' || activeTab === 'dashboard'"
          @click="$emit('toggle-filters')"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-slate-50/50 transition cursor-pointer"
          :class="
            isFiltersExpanded ? 'bg-indigo-55 text-indigo-600 font-bold' : ''
          "
        >
          <span class="material-symbols-outlined text-[18px]">tune</span>
        </button>

        <!-- Mobile Sync Indicator -->
        <div
          v-if="user"
          class="flex items-center justify-center shrink-0 px-1 select-none"
        >
          <span
            v-if="syncStatus === 'synced'"
            class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
            title="Синхронизировано"
          ></span>
          <span
            v-else-if="syncStatus === 'checking'"
            class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"
            title="Проверка обновлений..."
          ></span>
          <span
            v-else-if="syncStatus === 'updating'"
            class="material-symbols-outlined text-[12px] text-indigo-600 animate-spin"
            title="Синхронизация..."
            >sync</span
          >
          <span
            v-else-if="syncStatus === 'error'"
            class="material-symbols-outlined text-[12px] text-red-500 font-bold"
            title="Ошибка сети"
            >gpp_maybe</span
          >
        </div>
        <button
          v-if="user"
          @click="$emit('open-profile')"
          class="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition shrink-0"
          title="Профиль"
        >
          <span class="font-black text-[9px]">{{
            user.Username ? user.Username.slice(0, 2).toUpperCase() : "?"
          }}</span>
        </button>
      </div>
    </header>

    <!-- Desktop Header -->
    <header
      class="hidden md:flex mx-6 mt-4 mb-2 h-16 bg-transparent border-none shadow-none items-center justify-between shrink-0 z-10 select-none px-0"
    >
      <div
        class="flex items-center gap-4 bg-white shadow-md border border-slate-200/50 rounded-2xl p-2 px-4 h-14"
      >
        <h1
          class="text-sm font-black text-slate-800 tracking-wider uppercase m-0 leading-none select-none font-heading"
          v-if="activeTab === 'records'"
        >
          Журнал
        </h1>
        <h1
          class="text-sm font-black text-slate-800 tracking-wider uppercase m-0 leading-none select-none font-heading"
          v-if="activeTab === 'dashboard'"
        >
          Аналитика
        </h1>
        <h1
          class="text-sm font-black text-slate-800 tracking-wider uppercase m-0 leading-none select-none font-heading"
          v-if="activeTab === 'refs'"
        >
          Справочники
        </h1>
        <h1
          class="text-sm font-black text-slate-800 tracking-wider uppercase m-0 leading-none select-none font-heading"
          v-if="activeTab === 'users'"
        >
          Персонал
        </h1>



        <!-- Search icon & Input in Desktop Header -->
        <div v-if="activeTab === 'records' || activeTab === 'refs'" class="flex items-center gap-1.5">
          <button
            v-if="!localSearchExpanded"
            @click="openSearch"
            class="w-9 h-9 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition cursor-pointer"
            title="Поиск"
          >
            <span class="material-symbols-outlined text-[18px]">search</span>
          </button>
          <div v-else class="relative flex items-center">
            <input
              ref="desktopSearchInput"
              :value="searchQuery"
              @input="onSearchInput"
              class="w-60 h-9.5 pl-9 pr-8 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-150/20 focus:border-indigo-500 text-xs font-semibold text-slate-700 outline-none transition"
              :placeholder="activeTab === 'refs' ? 'Поиск...' : 'Поиск по госномеру...'"
            />
            <span
              class="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-2.5"
              >search</span
            >
            <button
              @click="closeSearch"
              class="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 flex items-center"
            >
              <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>

        <!-- Filters toggle on Desktop Header -->
        <button
          v-if="activeTab === 'records'"
          @click="$emit('toggle-filters')"
          class="h-9.5 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition cursor-pointer block select-none border-none"
          :class="
            isFiltersExpanded
              ? 'bg-indigo-50 text-indigo-600'
              : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          "
        >
          <span class="material-symbols-outlined text-[18px]">tune</span>
          <span>Фильтры</span>
        </button>
      </div>

      <div
        v-if="user"
        class="flex items-center gap-4 bg-white shadow-md border border-slate-200/50 rounded-2xl p-2 px-4 h-14"
      >
        <!-- Desktop Sync Status Badge -->
        <div
          v-if="user"
          class="px-3 h-9.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-2 select-none"
        >
          <template v-if="syncStatus === 'synced'">
            <span class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span class="text-[10px] text-slate-500 font-bold font-mono tracking-tight uppercase">В сети</span>
          </template>
          <template v-else-if="syncStatus === 'checking'">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
            <span class="text-[10px] text-indigo-600 font-bold font-mono tracking-tight uppercase">Проверка...</span>
          </template>
          <template v-else-if="syncStatus === 'updating'">
            <span class="material-symbols-outlined text-sm text-indigo-600 animate-spin">sync</span>
            <span class="text-[10px] text-indigo-600 font-bold font-mono tracking-tight uppercase">Обновление...</span>
          </template>
          <template v-else-if="syncStatus === 'error'">
            <span class="material-symbols-outlined text-sm text-red-500 font-bold animate-pulse">cloud_off</span>
            <span class="text-[10px] text-red-500 font-bold font-mono tracking-tight uppercase">Ошибка сети</span>
          </template>
        </div>

        <select
          v-if="activeTab === 'dashboard'"
          :value="dashboardPeriod"
          @change="onPeriodChange"
          class="form-select w-auto h-9.5 border border-slate-200 rounded-xl text-xs bg-slate-50 font-bold cursor-pointer hover:bg-slate-100 transition-colors outline-none px-2.5"
        >
          <option value="day">За Сегодня</option>
          <option value="week">За Неделю</option>
          <option value="month">За Месяц</option>
          <option value="all">За Всё время</option>
        </select>

        <div class="h-6 w-px bg-slate-200 mx-1"></div>

        <button
          @click="$emit('open-profile')"
          class="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-xl transition cursor-pointer"
        >
          <div class="text-right hidden lg:block select-none">
            <div class="text-xs font-black text-slate-800 leading-tight">
              {{ user.Username }}
            </div>
            <div
              class="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-tight mt-0.5"
            >
              {{
                user.Role === "Superadmin"
                  ? "Супер-админ"
                  : user.Role === "SenMaster"
                    ? "Ст. мастер"
                    : "Мастер"
              }}
            </div>
          </div>
          <div
            class="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 font-extrabold text-xs tracking-tighter"
          >
            {{ user.Username ? user.Username.slice(0, 2).toUpperCase() : "?" }}
          </div>
        </button>
      </div>
    </header>
  </div>
</template>

<script>
import { useMainStore } from "../../store";

export default {
  props: {
    activeTab: { type: String, required: true },
    searchQuery: { type: String, default: "" },
    isSearchExpanded: { type: Boolean, default: false },
    isFiltersExpanded: { type: Boolean, default: false },
    isSyncing: { type: Boolean, default: false },
    dashboardPeriod: { type: String, default: "all" },
    isAllStatusesActive: { type: Boolean, default: false },
  },
  emits: [
    "update:searchQuery",
    "update:isSearchExpanded",
    "update:isFiltersExpanded",
    "update:dashboardPeriod",
    "toggle-filters",
    "set-all-statuses",
    "open-profile",
  ],
  data() {
    return {
      localSearchExpanded: this.isSearchExpanded,
    };
  },
  watch: {
    isSearchExpanded(v) {
      this.localSearchExpanded = v;
    },
    activeTab() {
      this.closeSearch();
    },
  },
  computed: {
    user() {
      const store = useMainStore();
      return store.user;
    },
    syncStatus() {
      const store = useMainStore();
      return store.syncStatus;
    },
  },
  methods: {
    onSearchInput(e) {
      this.$emit("update:searchQuery", e.target.value);
    },
    onPeriodChange(e) {
      this.$emit("update:dashboardPeriod", e.target.value);
    },
    openSearch() {
      this.localSearchExpanded = true;
      this.$emit("update:isSearchExpanded", true);
      this.$nextTick(() => {
        if (this.$refs.desktopSearchInput)
          this.$refs.desktopSearchInput.focus();
        if (this.$refs.mobileSearchInput) this.$refs.mobileSearchInput.focus();
      });
    },
    closeSearch() {
      this.localSearchExpanded = false;
      this.$emit("update:isSearchExpanded", false);
      this.$emit("update:searchQuery", "");
    },
  },
};
</script>
