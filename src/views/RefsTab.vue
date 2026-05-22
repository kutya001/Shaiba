<template>
  <div class="space-y-6 max-w-md mx-auto w-full pb-20">
            <!-- Grid view -->
            <div v-if="refTab === 'grid'" class="fade-transition">
              <h1
                class="text-2xl font-bold tracking-tight text-center mb-6 font-heading text-slate-800"
              >
                Справочники
              </h1>
              <div class="grid grid-cols-2 gap-4">
                <div
                  v-for="(meta, key) in refMeta"
                  :key="key"
                  @click="refTab = key"
                  class="bg-surface rounded-2xl p-5 shadow-soft border border-border-subtle/50 cursor-pointer flex flex-col items-center justify-center gap-3 text-center active:scale-95 transition-transform hover:shadow-md"
                >
                  <div
                    class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"
                  >
                    <span
                      class="material-symbols-outlined text-2xl font-medium"
                      >{{ meta.icon }}</span
                    >
                  </div>
                  <div>
                    <div
                      class="font-bold text-text-main text-[16px] font-heading"
                    >
                      {{ meta.title }}
                    </div>
                    <div class="text-[11px] text-muted font-medium mt-0.5">
                      {{ db[key] ? db[key].length : 0 }} записей
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-8">
                <h2 class="font-bold text-lg mb-3 text-text-main font-heading">
                  Управление данными
                </h2>
                <div
                  class="bg-surface rounded-2xl p-5 shadow-soft border border-border-subtle/50 text-sm text-text-main leading-relaxed"
                >
                  Справочники позволяют быстро заполнять карточки обслуживания.
                  Добавьте свои услуги, мастеров и марки автомобилей для
                  автоматизации работы сервиса.
                </div>
              </div>
            </div>

            <!-- List View -->
            <div v-else class="fade-transition space-y-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <button
                    @click="refTab = 'grid'"
                    class="p-2 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors -ml-2"
                  >
                    <span class="material-symbols-outlined text-text-muted"
                      >arrow_back</span
                    >
                  </button>
                  <h5 class="m-0 font-bold text-text-main text-lg font-heading">
                    {{ refMeta[refTab].title }}
                  </h5>
                </div>
                <button
                  @click="$emit('open-bulk-modal')"
                  class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg flex items-center gap-1.5 transition-colors border border-indigo-100"
                >
                  <span class="material-symbols-outlined text-[14px]">upload_file</span>
                  Импорт
                </button>
              </div>

              <div
                v-if="refTab !== 'models'"
                class="bg-surface border border-border-subtle/50 rounded-2xl shadow-soft flex flex-col overflow-hidden"
              >
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse table-auto">
                    <thead class="bg-slate-50 border-b border-border-subtle/50">
                      <tr>
                        <th
                          v-for="f in refMeta[refTab].fields"
                          :key="f.k"
                          class="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest"
                        >
                          {{ f.l }}
                        </th>
                        <th class="px-4 py-2 w-16"></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr
                        v-for="item in db[refTab]"
                        :key="item.ID"
                        class="hover:bg-slate-50 group cursor-pointer"
                        @click="$emit('open-ref-modal', refTab, item)"
                      >
                        <td
                          v-for="f in refMeta[refTab].fields"
                          class="px-4 py-2 text-sm font-medium text-slate-800 shrink-0"
                        >
                          <span v-if="f.t === 'number'">{{
                            Number(item[f.k]).toLocaleString()
                          }}</span>
                          <span v-else-if="f.t === 'selectBrand'">{{
                            getBrandName(item[f.k])
                          }}</span>
                          <span v-else>{{ item[f.k] }}</span>
                        </td>
                        <td class="px-4 py-2 text-right shrink-0" @click.stop>
                          <button
                            class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            @click="$emit('del-row', refMeta[refTab].sheet, item.ID, refTab)"
                          >
                            <i class="bi bi-trash-fill text-sm"></i>
                          </button>
                        </td>
                      </tr>
                      <tr v-if="db[refTab] && db[refTab].length === 0">
                        <td
                          :colspan="refMeta[refTab].fields.length + 1"
                          class="px-4 py-6 text-center text-slate-400 font-medium text-sm"
                        >
                          Нет записей
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="group in groupedModels"
                  :key="group.brand.ID"
                  class="border border-slate-200/50 rounded-2xl bg-slate-50/50 overflow-hidden shadow-sm"
                >
                  <div
                    class="bg-slate-100/70 px-4 py-2.5 flex justify-between items-center border-b border-slate-200/50 select-none"
                  >
                    <span
                      class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <i class="bi bi-car-front-fill text-indigo-500"></i>
                      {{ group.brand.Name }}
                    </span>
                    <span
                      class="text-[10px] text-indigo-600 font-bold uppercase bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-150/30"
                      >{{ group.models.length }} мод.</span
                    >
                  </div>
                  <div class="divide-y divide-slate-100 bg-white">
                    <div
                      v-for="m in group.models"
                      :key="m.ID"
                      @click="$emit('open-ref-modal', 'models', m)"
                      class="px-4 py-3 flex justify-between items-center hover:bg-slate-50/60 cursor-pointer transition"
                    >
                      <span
                        class="text-xs font-bold text-slate-805 text-slate-800"
                        >{{ m.Name }}</span
                      >
                      <button
                        class="p-1 px-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50/40 rounded-lg transition"
                        @click.stop="$emit('del-row', refMeta['models'].sheet, m.ID, 'models')"
                      >
                        <i class="bi bi-trash-fill text-sm"></i>
                      </button>
                    </div>
                    <div
                      v-if="group.models.length === 0"
                      class="px-4 py-3.5 text-center text-slate-400 font-semibold text-xs bg-slate-50/20 italic"
                    >
                      Нет моделей
                    </div>
                  </div>
                </div>
                <div
                  v-if="db.models && db.models.length === 0"
                  class="px-4 py-6 text-center text-slate-400 font-medium text-sm"
                >
                  Нет моделей
                </div>
              </div>
            </div>

            <!-- FAB -->
            <button
              v-if="refTab !== 'grid'"
              @click="$emit('open-ref-modal', refTab, -1)"
              class="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-fab hover:bg-indigo-700 active:scale-95 transition-all z-20 md:bottom-12 md:right-12"
            >
              <span
                class="material-symbols-outlined text-[28px]"
                style="font-variation-settings: &quot;wght&quot; 600"
                >add</span
              >
            </button>
  </div>
</template>

<script>
export default {
  name: 'RefsTab',
  props: {
    db: {
      type: Object,
      required: true
    },
    groupedModels: {
      type: Array,
      required: true
    },
    getBrandName: {
        type: Function,
        required: true
    }
  },
  data() {
      return {
          refTab: 'grid',
          refMeta: {
            services: { title: 'Услуги', icon: 'build', sheet: 'Services', fields: [{k:'Name', l:'Название'}, {k:'Price', l:'Цена (KGS)', t:'number'}] },
            brands: { title: 'Марки', icon: 'directions_car', sheet: 'Brands', fields: [{k:'Name', l:'Марка'}] },
            models: { title: 'Модели', icon: 'list_alt', sheet: 'Models', fields: [{k:'BrandID', l:'Привязка (Марка)', t:'selectBrand'}, {k:'Name', l:'Модель'}] }
          }
      }
  },
  emits: ['open-ref-modal', 'del-row', 'open-bulk-modal']
}
</script>
