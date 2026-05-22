<template>
  <div class="space-y-4 max-w-md mx-auto w-full pb-20 animate-fade-in">
    <div class="flex justify-between items-center px-1">
      <h2 class="text-sm font-black text-slate-800 uppercase tracking-wider font-heading flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[16px] text-indigo-500">group</span>
        Штат автосервиса
      </h2>
      <span class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/40">
        {{ db.users ? db.users.length : 0 }} чел.
      </span>
    </div>

    <div class="space-y-2">
      <div
        v-for="u in db.users"
        :key="u.ID"
        class="bg-white border border-slate-150/60 hover:border-indigo-150/80 rounded-xl p-3 shadow-sm hover:shadow transition-all flex items-center justify-between gap-3"
      >
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
          <!-- Compact initials avatar -->
          <div
            class="w-8.5 h-8.5 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 font-extrabold text-[11px] tracking-tight shrink-0 border border-slate-200/50 uppercase select-none"
          >
            {{ u.Name ? u.Name.slice(0, 2) : u.Username.slice(0, 2) }}
          </div>
          <!-- Name and detailed badges -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <h3 class="font-bold text-xs.5 text-slate-800 m-0 truncate">
                {{ u.Name || u.Username }}
              </h3>
              <span
                class="px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider font-mono scale-95"
                :class="u.Role === 'Superadmin'
                  ? 'bg-red-50 text-red-600 border border-red-150/40'
                  : u.Role === 'SenMaster'
                    ? 'bg-amber-50 text-amber-600 border border-amber-150/40'
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-150/40'"
              >
                {{
                  u.Role === "Superadmin"
                    ? "Админ"
                    : u.Role === "SenMaster"
                      ? "Ст.Мастер"
                      : "Мастер"
                }}
              </span>
            </div>
            <!-- Secondary labels -->
            <div class="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-semibold flex-wrap">
              <span class="truncate">@{{ u.Username }}</span>
              <span class="text-slate-300">•</span>
              <a
                v-if="u.Phone"
                :href="'tel:' + u.Phone"
                class="text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-0.5 truncate"
              >
                <span class="material-symbols-outlined text-[11px]">phone</span>
                {{ u.Phone }}
              </a>
              <span v-else class="text-slate-300">нет телефона</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <!-- Status Badge -->
          <span
            class="px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider border font-mono select-none"
            :class="
              u.Status === 'Approved'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-150/30'
                : 'bg-amber-50 text-amber-700 border-amber-150/30'
            "
          >
            {{ u.Status === 'Approved' ? 'Допущен' : 'Ожидает' }}
          </span>

          <!-- Quick Actions -->
          <div class="flex items-center gap-1">
            <button
              v-if="u.Status === 'Pending'"
              @click="$emit('approve-user', u.ID)"
              class="w-7 h-7 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center transition border-none cursor-pointer p-0"
              title="Одобрить доступ"
            >
              <span class="material-symbols-outlined text-[15px] font-bold">done</span>
            </button>
            <button
              @click="$emit('open-user-config', u)"
              class="w-7 h-7 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center transition border-none cursor-pointer p-0"
              title="Настройки"
            >
              <span class="material-symbols-outlined text-[15px] font-bold">settings</span>
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="!db.users || db.users.length === 0"
        class="py-10 text-center text-slate-400 font-medium text-xs"
      >
        Нет сотрудников
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UsersTab',
  props: {
    db: {
      type: Object,
      required: true
    }
  }
}
</script>
