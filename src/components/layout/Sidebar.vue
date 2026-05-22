<template>
  <aside
    class="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 hidden md:flex z-10 transition-all shadow-sm"
  >
    <div class="p-6 border-b border-slate-100 flex items-center gap-2">
      <div
        class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-indigo-100"
      >
        <i class="bi bi-car-front-fill text-white text-sm"></i>
      </div>
      <span class="font-bold text-lg tracking-tight font-heading"
        >AutoService CRM</span
      >
    </div>
    <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto">
      <a
        @click="setTab('records')"
        :class="
          activeTab === 'records'
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-slate-600 hover:bg-slate-50'
        "
        class="flex items-center gap-3 px-4 py-2.5 rounded-lg font-bold cursor-pointer transition-colors text-sm"
      >
        <i
          class="bi bi-journal-text w-5 h-5 text-lg flex items-center justify-center"
        ></i>
        Записи
      </a>
      <a
        @click="setTab('dashboard')"
        :class="
          activeTab === 'dashboard'
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-slate-600 hover:bg-slate-50'
        "
        class="flex items-center gap-3 px-4 py-2.5 rounded-lg font-bold cursor-pointer transition-colors text-sm"
      >
        <i
          class="bi bi-pie-chart w-5 h-5 text-lg flex items-center justify-center"
        ></i>
        Аналитика
      </a>

      <template v-if="user && user.Role !== 'Master'">
        <div
          class="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"
        >
          Справочники
        </div>
        <a
          @click="setTab('refs', 'grid')"
          :class="
            activeTab === 'refs'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          "
          class="flex items-center gap-3 px-4 py-2 text-sm rounded-lg font-semibold cursor-pointer transition-colors"
        >
          <i class="bi bi-tools w-4 h-4 flex items-center justify-center"></i>
          Справочники
        </a>
      </template>

      <template v-if="user && user.Role === 'Superadmin'">
        <div
          class="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"
        >
          АДМИНКА
        </div>
        <a
          @click="setTab('users')"
          :class="
            activeTab === 'users'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          "
          class="flex items-center gap-3 px-4 py-2 text-sm rounded-lg font-semibold cursor-pointer transition-colors"
        >
          <i
            class="bi bi-people-fill w-4 h-4 flex items-center justify-center"
          ></i>
          Персонал
        </a>
      </template>
    </nav>
    <div
      v-if="user"
      class="p-4 bg-slate-50 border-t border-slate-200 mt-auto flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 font-bold tracking-tighter"
        >
          {{ user.Username ? user.Username.slice(0, 2).toUpperCase() : "?" }}
        </div>
        <div>
          <div class="text-sm font-bold text-slate-800">
            {{ user.Username }}
          </div>
          <div
            class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider"
          >
            {{ user.Role }}
          </div>
        </div>
      </div>
      <button
        @click="triggerLogout"
        class="text-slate-400 hover:text-red-500 transition px-2 cursor-pointer"
        title="Выйти"
      >
        <i class="bi bi-box-arrow-right text-lg"></i>
      </button>
    </div>
  </aside>
</template>

<script>
import { useMainStore } from "../../store";

export default {
  props: {
    activeTab: {
      type: String,
      required: true,
    },
  },
  emits: ["update:activeTab", "update:refTab", "logout"],
  computed: {
    user() {
      const store = useMainStore();
      return store.user;
    },
  },
  methods: {
    setTab(tab, refSubTab = null) {
      this.$emit("update:activeTab", tab);
      if (refSubTab) {
        this.$emit("update:refTab", refSubTab);
      }
    },
    triggerLogout() {
      this.$emit("logout");
    },
  },
};
</script>
