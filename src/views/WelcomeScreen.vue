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
      class="w-full max-w-md bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-2xl z-20 relative flex flex-col items-center text-center transform scale-100 transition-all"
    >
      <!-- Glowing Interactive Keycap/Icon -->
      <div
        class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200/50 mb-6 relative animate-bounce"
      >
        <i class="bi bi-car-front-fill text-2xl"></i>
        <span
          class="absolute inline-flex h-full w-full rounded-2xl bg-indigo-400 opacity-35 animate-ping"
        ></span>
      </div>

      <h1
        class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-2 font-heading"
      >
        Добро пожаловать!
      </h1>

      <p
        class="text-xs text-indigo-600 font-extrabold uppercase tracking-widest mb-4"
      >
        AutoService CRM
      </p>

      <!-- Divider -->
      <div class="w-12 h-1 bg-indigo-500 rounded-full mb-6"></div>

      <!-- Brief Description: "Анвар сушняк алыпкел" -->
      <div
        class="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-600 text-sm font-semibold mb-8 h-16 flex items-center justify-center w-full shadow-inner tracking-medium font-sans"
      >
        Анвар сушняк алыпкел
      </div>

      <!-- Enter / Get Started Button -->
      <button
        @click="dismiss"
        class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold tracking-wide transition-all duration-300 shadow-lg shadow-indigo-300 active:scale-95 cursor-pointer flex items-center justify-center gap-2 outline-none focus:outline-none select-none"
      >
        <span>Начать работу</span>
        <i class="bi bi-arrow-right font-extrabold"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close"],
  methods: {
    dismiss() {
      this.$emit("close");
    },
  },
};
</script>
