<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold tracking-tight text-slate-800 mb-4 px-2">
      Персонал и Доступ
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <article
        v-for="u in db.users"
        :key="u.ID"
        class="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition flex flex-col gap-3"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm tracking-tighter shrink-0 border border-slate-200"
            >
              {{
                u.Name
                  ? u.Name.slice(0, 2).toUpperCase()
                  : u.Username.slice(0, 2).toUpperCase()
              }}
            </div>
            <div>
              <h3 class="font-bold text-[15px] text-slate-800 m-0">
                {{ u.Name || u.Username }}
              </h3>
              <p class="text-xs font-semibold text-slate-500 m-0">
                @{{ u.Username }}
              </p>
            </div>
          </div>
          <span
            class="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border"
            :class="
              u.Status === 'Approved'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            "
            >{{ u.Status }}</span
          >
        </div>

        <div
          class="grid grid-cols-2 gap-2 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100"
        >
          <div class="flex flex-col gap-0.5">
            <span
              class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >Роль</span
            >
            <span class="text-xs font-bold text-slate-700">{{
              u.Role === "Superadmin"
                ? "Супер-админ"
                : u.Role === "SenMaster"
                  ? "Ст. мастер"
                  : "Мастер"
            }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span
              class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >Телефон</span
            >
            <a
              v-if="u.Phone"
              :href="'tel:' + u.Phone"
              class="text-xs font-bold text-indigo-600 hover:underline"
              >{{ u.Phone }}</a
            >
            <span v-else class="text-xs font-bold text-slate-400">—</span>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-auto pt-2">
          <button
            v-if="u.Status === 'Pending'"
            @click="$emit('approve-user', u.ID)"
            class="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-[13px] font-bold hover:bg-emerald-700 transition shadow-sm"
          >
            Одобрить
          </button>
          <button
            @click="$emit('open-user-config', u)"
            class="flex-1 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-[13px] font-bold transition"
          >
            Настроить
          </button>
        </div>
      </article>
      <div
        v-if="!db.users || db.users.length === 0"
        class="col-span-full py-10 text-center text-slate-500 font-medium"
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
