<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl transition-all duration-500 p-4"
  >
    <!-- Ambient backgrounds -->
    <div
      class="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
    ></div>
    <div
      class="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
    ></div>

    <div
      class="w-full max-w-md bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-2xl z-20 relative flex flex-col items-center text-center transform scale-100 transition-all"
    >
      <!-- Loading state if both title and text are not yet ready -->
      <div v-if="!welcomeTitle && !welcomeText" class="w-full py-16 flex flex-col items-center justify-center space-y-4">
        <div class="spinner-border text-indigo-600 border-4 border-t-indigo-200 rounded-full animate-spin" style="width: 2.5rem; height: 2.5rem;" role="status"></div>
        <p class="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
          Загрузка приветствия...
        </p>
      </div>

      <template v-else>
        <!-- Edit trigger for Master and Superadmin -->
        <button
          v-if="isAllowedToEdit && !isEditing"
          @click="startEdit"
          class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition border-none bg-transparent cursor-pointer"
          title="Редактировать приветствие"
          id="btn-edit-welcome-screen"
        >
          <i class="bi bi-pencil-square text-base"></i>
        </button>

        <!-- Glowing Interactive Keycap/Icon -->
        <div
          v-if="!isEditing"
          class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200/50 mb-5 relative animate-bounce"
        >
          <i class="bi bi-car-front-fill text-2xl"></i>
          <span
            class="absolute inline-flex h-full w-full rounded-2xl bg-indigo-400 opacity-35 animate-ping"
          ></span>
        </div>

        <!-- Editing panel container -->
        <div v-if="isEditing" class="w-full space-y-4 mb-4 select-none text-left animate-fade-in">
          <div class="flex items-center gap-1.5 border-b border-slate-100 pb-2.5 mb-2">
            <i class="bi bi-pencil-fill text-indigo-500"></i>
            <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest leading-none m-0">
              Редактирование приветствия
            </h3>
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Заголовок приветствия
            </label>
            <input
              v-model="editedTitle"
              type="text"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl font-bold text-slate-800 text-xs outline-none transition-all font-sans"
              placeholder="Добро пожаловать!"
            />
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Текст приветствия
            </label>
            <textarea
              v-model="editedText"
              rows="3"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl font-semibold text-slate-705 text-xs outline-none transition-all font-sans resize-none"
              placeholder="Введите текст приветствия..."
            ></textarea>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <button
              @click="cancelEdit"
              class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition border-none cursor-pointer"
            >
              Отмена
            </button>
            <button
              @click="saveWelcomeData"
              class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition border-none shadow-sm shadow-indigo-150 cursor-pointer"
            >
              Сохранить
            </button>
          </div>
        </div>

        <!-- Static display panel -->
        <template v-else>
          <h1
            class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-1.5 font-heading"
          >
            {{ welcomeTitle }}
          </h1>

          <p
            class="text-xs text-indigo-600 font-extrabold uppercase tracking-widest mb-4"
          >
            AutoService CRM
          </p>

          <!-- Divider -->
          <div class="w-12 h-1 bg-indigo-500 rounded-full mb-5"></div>

          <!-- Brief Description -->
          <div
            class="bg-slate-50 border border-slate-100 py-3.5 px-4.5 rounded-2xl text-slate-600 text-sm font-semibold mb-5 min-h-[4.5rem] flex items-center justify-center w-full shadow-inner tracking-normal font-sans"
          >
            {{ welcomeText }}
          </div>
        </template>

        <!-- App version & diagnostics section -->
        <div class="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-400 font-bold mb-5 select-none font-mono">
          <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200/60 font-black">
            v2.5.0-Release
          </span>
          <span class="text-slate-350">•</span>
          <span class="text-slate-500 uppercase tracking-wider">Prod-core</span>
          <template v-if="user">
            <span class="text-slate-350">•</span>
            <span class="text-indigo-600 uppercase tracking-wider font-extrabold">
              {{
                user.Role === "Superadmin"
                  ? "Супер-админ"
                  : user.Role === "SenMaster"
                    ? "Ст. мастер"
                    : "Мастер"
              }}
            </span>
          </template>
        </div>

        <!-- Enter / Get Started Button -->
        <button
          @click="dismiss"
          class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold tracking-wide transition-all duration-300 shadow-md shadow-indigo-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2 outline-none focus:outline-none select-none"
          id="btn-close-welcome-screen"
        >
          <span>Начать работу</span>
          <i class="bi bi-arrow-right font-extrabold"></i>
        </button>
      </template>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../store";

export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close"],
  data() {
    return {
      isEditing: false,
      editedTitle: "",
      editedText: "",
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    user() {
      return this.store.user;
    },
    isAllowedToEdit() {
      // Allow masters, senior masters and supreme admins
      return this.user && (
        this.user.Role === "Superadmin" || 
        this.user.Role === "Master" || 
        this.user.Role === "SenMaster"
      );
    },
    welcomeTitle() {
      const screen = this.store.db.welcomescreens?.find((s) => s.ID === "welcome_main") || this.store.db.welcomescreens?.[0];
      if (screen && screen.Title) return screen.Title;
      return localStorage.getItem("welcome_screen_title") || "";
    },
    welcomeText() {
      const screen = this.store.db.welcomescreens?.find((s) => s.ID === "welcome_main") || this.store.db.welcomescreens?.[0];
      if (screen && screen.Text) return screen.Text;
      return localStorage.getItem("welcome_screen_text") || "";
    },
  },
  watch: {
    show: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.isEditing = false;
        }
      },
    },
    welcomeTitle: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          localStorage.setItem("welcome_screen_title", newVal);
        }
      },
    },
    welcomeText: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          localStorage.setItem("welcome_screen_text", newVal);
        }
      },
    },
  },
  methods: {
    dismiss() {
      this.$emit("close");
    },
    startEdit() {
      this.editedTitle = this.welcomeTitle;
      this.editedText = this.welcomeText;
      this.isEditing = true;
    },
    cancelEdit() {
      this.isEditing = false;
    },
    async saveWelcomeData() {
      const t = this.editedTitle.trim();
      const m = this.editedText.trim();
      if (!t) {
        this.store.showToast("Заголовок не может быть пустым", "error");
        return;
      }
      if (!m) {
        this.store.showToast("Текст приветствия не может быть пустым", "error");
        return;
      }
      
      // Sync to local storage as fallback
      localStorage.setItem("welcome_screen_title", t);
      localStorage.setItem("welcome_screen_text", m);

      try {
        const screen = this.store.db.welcomescreens?.find((s) => s.ID === "welcome_main") || this.store.db.welcomescreens?.[0];
        if (screen) {
          await this.store.dispatchSync(
            "updateRow",
            { ID: screen.ID, Title: t, Text: m, _role: this.user?.Role, _userId: this.user?.ID },
            "WelcomeScreens"
          );
        } else {
          await this.store.dispatchSync(
            "addRow",
            { ID: "welcome_main", Title: t, Text: m, _role: this.user?.Role, _userId: this.user?.ID },
            "WelcomeScreens"
          );
        }
        this.isEditing = false;
        this.store.showToast("Приветствие успешно сохранено на сервере!");
      } catch (err) {
        console.error(err);
        this.isEditing = false;
        this.store.showToast("Сохранено локально, ошибка синхронизации.", "error");
      }
    },
  },
};
</script>
