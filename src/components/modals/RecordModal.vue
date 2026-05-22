<template>
  <div class="modal fade" id="recordModal" ref="modalRef" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-fullscreen-md-down modal-lg modal-dialog-centered modal-dialog-scrollable m-0 md:m-auto">
          <div class="modal-content h-full md:h-auto md:max-h-[92vh] md:rounded-3xl border-0 shadow-2xl overflow-hidden font-sans bg-slate-50 flex flex-col relative">
              
              <!-- Top Nav -->
              <div class="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200/60 py-3 px-4 flex items-center justify-between shadow-sm md:px-5 md:py-3.5">
                  <button type="button" class="text-slate-600 flex w-9 h-9 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 transition-colors md:hidden" data-bs-dismiss="modal">
                      <i class="bi bi-arrow-left text-lg"></i>
                  </button>
                  <h5 class="modal-title font-bold text-slate-800 text-[16px] md:text-lg leading-tight flex-1 flex items-center gap-2.5 md:justify-start justify-center pr-9 md:pr-0 m-0">
                      <div class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 hidden md:flex items-center justify-center"><i class="bi bi-journal-text text-sm"></i></div>
                      {{ recordForm.ID ? (isEditingRecord ? 'Редактировать запись' : 'Просмотр записи') : 'Новая запись' }}
                  </h5>
                  <button type="button" class="btn-close text-slate-400 focus:ring-0 hidden md:block" data-bs-dismiss="modal"></button>
              </div>
              
              <div class="modal-body flex-1 overflow-y-auto p-3.5 md:p-5 bg-slate-50">
                  <template v-if="!isEditingRecord">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
                          <!-- Left column: Main properties -->
                          <div class="space-y-3.5">
                              <!-- Vehicle Card -->
                              <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm relative overflow-hidden">
                                  <div class="absolute right-0 top-0 w-24 h-24 bg-indigo-50/30 rounded-full translate-x-8 -translate-y-8 select-none pointer-events-none md:block hidden"></div>
                                  <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Автомобиль</span>
                                  <div class="flex items-center gap-3">
                                      <div class="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                                          <i class="bi bi-car-front-fill text-lg"></i>
                                      </div>
                                      <div>
                                          <h2 class="text-lg font-black text-slate-800 uppercase tracking-tight m-0 leading-tight">{{ recordForm.CarNumber || 'Без номера' }}</h2>
                                          <p class="text-[11px] font-bold text-slate-500 m-0 mt-0.5">{{ getBrandName(recordForm.BrandID) }} {{ getModelName(recordForm.ModelID) }}</p>
                                      </div>
                                  </div>
                              </div>

                              <!-- Client & Master Info Card -->
                              <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3.5">
                                  <div>
                                      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Клиент</span>
                                      <div class="text-xs font-bold text-slate-800 flex items-center gap-2">
                                          <i class="bi bi-person text-slate-400 text-sm"></i>
                                          {{ recordForm.ClientName || '—' }}
                                      </div>
                                      <a v-if="recordForm.Phone" :href="'tel:' + recordForm.Phone" class="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-indigo-600 hover:underline bg-indigo-50 px-2 py-0.5 rounded-lg transition-colors">
                                          <i class="bi bi-telephone text-[9px]"></i>
                                          {{ recordForm.Phone }}
                                      </a>
                                  </div>
                                  
                                  <div class="pt-3 border-t border-slate-100">
                                      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Сотрудник / Мастер</span>
                                      <div class="text-xs font-bold text-slate-800 flex items-center gap-2">
                                          <i class="bi bi-person-gear text-slate-400 text-sm"></i>
                                          {{ getMasterName(recordForm.MasterID) || 'Не назначен' }}
                                      </div>
                                      <div class="mt-1 text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                          <i class="bi bi-clock text-slate-400 text-[10px]"></i>
                                          {{ recordForm.StartTime_LOCAL ? new Date(recordForm.StartTime_LOCAL).toLocaleString('ru-RU', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'}) : '—' }}
                                      </div>
                                  </div>
                              </div>

                              <!-- Status & Date Tracker -->
                              <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
                                  <div class="flex items-center justify-between">
                                      <div>
                                          <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Текущий статус</span>
                                          <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border inline-block" :class="statusBadgeTw(recordForm.Status)">
                                              {{ recordForm.Status }}
                                          </span>
                                      </div>
                                      <div class="text-right">
                                          <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Дата заезда</span>
                                          <span class="text-xs font-bold text-slate-500">
                                              {{ recordForm.StartTime_LOCAL ? new Date(recordForm.StartTime_LOCAL).toLocaleString('ru-RU', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'}) : 'Недавно' }}
                                          </span>
                                      </div>
                                  </div>

                                  <!-- Display completion date & execution time if status is completed -->
                                  <div v-if="recordForm.Status === 'Выполнен' && recordForm.EndTime" class="pt-3 border-t border-slate-100 flex items-center justify-between">
                                      <div>
                                          <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Дата завершения</span>
                                          <span class="text-xs font-bold text-slate-700">
                                              {{ new Date(recordForm.EndTime).toLocaleString('ru-RU', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'}) }}
                                          </span>
                                      </div>
                                      <div class="text-right">
                                          <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Время выполнения</span>
                                          <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black border border-emerald-100/50 inline-block">
                                              {{ getDuration(recordForm.StartTime, recordForm.EndTime) }}
                                          </span>
                                      </div>
                                  </div>
                              </div>

                              <!-- Payment Status Card -->
                              <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
                                  <div>
                                      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Статус оплаты</span>
                                      <span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border inline-flex items-center gap-1 shadow-sm" 
                                          :class="recordForm.IsPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 'bg-rose-50 text-rose-700 border-rose-200/50'">
                                          <span class="material-symbols-outlined text-[13px] font-black">{{ recordForm.IsPaid ? 'check_circle' : 'cancel' }}</span>
                                          {{ recordForm.IsPaid ? 'Оплачено' : 'Не оплачено' }}
                                      </span>
                                  </div>
                                  <div class="text-right">
                                      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Изменение</span>
                                      <button @click="recordForm.IsPaid = !recordForm.IsPaid; handleSave()" class="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] uppercase rounded-xl border border-slate-200 transition cursor-pointer inline-flex items-center gap-1.5 leading-none select-none">
                                          <span class="material-symbols-outlined text-[14px] font-bold">payments</span>
                                          <span>Оплачено/Нет</span>
                                      </button>
                                  </div>
                              </div>
                          </div>

                          <!-- Right column: Services list, Comments, Actions -->
                          <div class="space-y-3.5">
                              <!-- Services invoice card -->
                              <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
                                  <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Состав работ и услуг</span>
                                  <div class="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                                      <div v-for="sid in recordForm.ServicesJSON" :key="sid" class="flex justify-between items-center bg-slate-50/70 px-2.5 py-2 rounded-xl border border-slate-100">
                                          <span class="text-xs font-bold text-slate-700 truncate pr-2">{{ getServiceName(sid) }}</span>
                                          <span class="text-xs font-black text-slate-800 shrink-0">{{ Number(getServicePrice(sid)).toLocaleString() }} KGS</span>
                                      </div>
                                      <div v-if="!recordForm.ServicesJSON || !recordForm.ServicesJSON.length" class="text-xs text-slate-400 font-semibold italic text-center py-4">Нет услуг в этой записи</div>
                                  </div>
                                  <div class="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                                      <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Итого к оплате:</span>
                                      <span class="text-sm font-black text-indigo-600">{{ Number(recordForm.TotalAmount).toLocaleString() }} <span class="text-[10px] text-slate-400 font-bold">KGS</span></span>
                                  </div>
                              </div>

                              <div v-if="recordForm.AdditionalServices" class="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 mb-3 animate-fade-in" style="margin-top: 1rem;">
                                  <span class="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Дополнительные услуги</span>
                                  <p class="text-xs font-semibold text-indigo-800 m-0 leading-normal">{{ recordForm.AdditionalServices }}</p>
                              </div>

                              <!-- Comments -->
                              <div v-if="recordForm.Comment" class="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100">
                                  <span class="block text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Комментарий</span>
                                  <p class="text-xs font-semibold text-amber-800 m-0 leading-normal">{{ recordForm.Comment }}</p>
                              </div>

                              <!-- Action tools -->
                              <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2.5" v-if="user && (user.Role === 'Superadmin' || user.Role === 'SenMaster' || (recordForm.Status !== 'Выполнен' && recordForm.Status !== 'Отменён'))">
                                  <div class="grid grid-cols-2 gap-2">
                                      <button v-if="recordForm.Status !== 'Выполнен'" @click="quickStatusChangeModal('Выполнен')" class="py-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-xs hover:bg-emerald-100 border border-emerald-200/50 transition cursor-pointer flex items-center justify-center gap-1.5">
                                          <i class="bi bi-check-circle"></i> Выполнен
                                      </button>
                                      <button v-if="recordForm.Status !== 'Отменён'" @click="quickStatusChangeModal('Отменён')" class="py-2 bg-red-50 text-red-600 font-bold rounded-xl text-xs hover:bg-red-100 border border-red-200/50 transition cursor-pointer flex items-center justify-center gap-1.5">
                                          <i class="bi bi-x-circle"></i> Отменить
                                      </button>
                                      <button v-if="recordForm.Status !== 'Открыт'" @click="quickStatusChangeModal('Открыт')" class="py-2 bg-slate-50 text-slate-700 font-bold col-span-2 rounded-xl text-xs hover:bg-slate-100 border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1.5">
                                          <i class="bi bi-arrow-counterclockwise"></i> Вернуть статус Открыт
                                      </button>
                                  </div>
                                  <button @click="isEditingRecord = true" class="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                                      <i class="bi bi-pencil-square"></i> Изменить запись
                                  </button>
                              </div>
                              <div class="p-3 bg-slate-100 rounded-2xl text-center" v-else>
                                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">Действия недоступны (запись закрыта)</p>
                              </div>
                          </div>
                      </div>
                  </template>
                  
                  <template v-else>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
                          <!-- Left Column: Client & Vehicle -->
                          <div class="space-y-3.5">
                              <!-- Client Details Section -->
                              <section class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
                                  <h3 class="text-slate-800 text-[12px] font-bold mb-3 flex items-center gap-2 uppercase tracking-wider select-none">
                                      <i class="bi bi-person text-indigo-600"></i> Клиент
                                  </h3>
                                  <div class="space-y-3">
                                      <div class="flex flex-col">
                                          <label class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider">Имя Фамилия <span class="text-red-500">*</span></label>
                                          <input ref="clientNameInput" v-model="recordForm.ClientName" class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" placeholder="Иван Иванов">
                                      </div>
                                      <div class="flex flex-col">
                                          <label class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider">Телефон <span class="text-red-500">*</span></label>
                                          <input v-model="recordForm.Phone" @input="onPhoneInput" type="tel" class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" placeholder="+996 (700) 123-456">
                                      </div>
                                  </div>
                              </section>

                              <!-- Vehicle Details Section -->
                              <section class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
                                  <h3 class="text-slate-800 text-[12px] font-bold mb-3 flex items-center gap-2 uppercase tracking-wider select-none">
                                      <i class="bi bi-car-front text-indigo-600"></i> Автомобиль
                                  </h3>
                                  <div class="space-y-3">
                                      <div class="flex flex-col space-y-2.5">
                                          <label class="text-slate-500 text-[10px] font-bold mb-0.5 ml-1 uppercase tracking-wider">Госномер <span class="text-red-500">*</span></label>
                                          <div class="flex bg-slate-100 rounded-xl p-1">
                                              <button @click="setCarCountry('KG')" :class="{'bg-white shadow-sm text-indigo-600': recordForm.CarCountry === 'KG', 'text-slate-500 hover:text-slate-700': recordForm.CarCountry !== 'KG'}" class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-none" type="button">Кыргызский</button>
                                              <button @click="setCarCountry('FOREIGN')" :class="{'bg-white shadow-sm text-indigo-600': recordForm.CarCountry !== 'KG', 'text-slate-500 hover:text-slate-700': recordForm.CarCountry === 'KG'}" class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-none" type="button">Иностранный</button>
                                          </div>
                                          
                                          <div v-if="recordForm.CarCountry === 'KG'" class="grid grid-cols-4 gap-2">
                                              <div class="flex flex-col col-span-1">
                                                  <span class="text-[9px] text-slate-400 font-bold mb-1 ml-1 uppercase tracking-wider">Регион</span>
                                                  <input ref="carRegionInput" v-model="recordForm.CarRegion" @input="updateCarNumber" maxlength="2" inputmode="numeric" class="w-full h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none uppercase text-center" placeholder="01">
                                              </div>
                                              <div class="flex flex-col col-span-3">
                                                  <span class="text-[9px] text-slate-400 font-bold mb-1 ml-1 uppercase tracking-wider">Номер автомобиля</span>
                                                  <input ref="carNumberMainInput" v-model="recordForm.CarNumberMain" @input="updateCarNumber" maxlength="7" class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none uppercase tracking-wider text-center" placeholder="123 ABC">
                                              </div>
                                          </div>
                                          <div v-else class="flex flex-col">
                                              <span class="text-[9px] text-slate-400 font-bold mb-1 ml-1 uppercase tracking-wider">Иностранный госномер</span>
                                              <input v-model="recordForm.CarNumber" class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none uppercase tracking-wider text-center" placeholder="A777AA77">
                                          </div>
                                      </div>

                                      <div class="flex flex-col relative">
                                          <label class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider">Марка <span class="text-red-500">*</span></label>
                                          <select v-model="recordForm.BrandID" class="form-select w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" @change="recordForm.ModelID=''; $nextTick(() => { if($refs.modelInput) $refs.modelInput.focus() })">
                                              <option value="">Не выбрано</option>
                                              <option v-for="b in sortedBrands" :key="b.ID" :value="b.ID">{{b.Name}}</option>
                                          </select>
                                      </div>

                                      <div class="flex flex-col relative">
                                          <label class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider">Модель <span class="text-red-500">*</span></label>
                                          <select ref="modelInput" v-model="recordForm.ModelID" @change="onModelSelect" :disabled="!recordForm.BrandID" class="form-select w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition disabled:opacity-50">
                                              <option value="">Не выбрано</option>
                                              <option v-for="m in availableModels" :key="m.ID" :value="m.ID">{{m.Name}}</option>
                                          </select>
                                      </div>
                                  </div>
                              </section>
                          </div>

                          <!-- Right Column: Services & Status -->
                          <div class="space-y-3.5 flex flex-col justify-between">
                              <!-- Services list card -->
                              <section class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col flex-1">
                                  <h3 class="text-slate-800 text-[12px] font-bold mb-3 flex items-center justify-between uppercase tracking-wider select-none">
                                      <span class="flex items-center gap-2">
                                          <i class="bi bi-tools text-indigo-600"></i> Услуги и Работы 
                                          <span v-if="!recordForm.ServicesJSON.length && !recordForm.AdditionalServices" class="text-red-500">*</span>
                                      </span>
                                      <span class="text-[10px] text-slate-400 font-extrabold" v-if="recordForm.ServicesJSON.length">{{ recordForm.ServicesJSON.length }} усл.</span>
                                  </h3>
                                  
                                  <div class="space-y-1 mb-3 max-h-[120px] overflow-y-auto pr-1 flex-1">
                                      <div v-for="sid in recordForm.ServicesJSON" :key="sid" class="flex items-center justify-between px-2 py-1 rounded-lg border border-slate-100 bg-slate-50/50 animate-fade-in">
                                          <span class="text-xs font-bold text-slate-700 truncate pr-2">{{ getServiceName(sid) }}</span>
                                          <div class="flex items-center gap-1.5 shrink-0">
                                              <span class="text-xs font-extrabold text-slate-800">{{ Number(getServicePrice(sid)).toLocaleString() }} KGS</span>
                                              <button type="button" @click="toggleService(sid)" class="text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center w-6 h-6 rounded-full hover:bg-red-50 border-none bg-transparent" title="Удалить">
                                                  <i class="bi bi-trash text-xs"></i>
                                              </button>
                                          </div>
                                      </div>
                                      
                                      <div v-if="recordForm.ServicesJSON.length === 0" class="text-center py-4 bg-slate-50/55 rounded-xl border border-slate-100/70 text-slate-400 text-[11px] font-bold italic">
                                          Список услуг пока пуст
                                      </div>
                                  </div>
                                  
                                  <button type="button" @click="showServiceSelector = true" class="w-full h-8.5 flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-indigo-150 bg-transparent text-indigo-600 font-bold text-xs hover:bg-indigo-50/40 transition-colors cursor-pointer mt-1 select-none">
                                      <i class="bi bi-plus-lg"></i> Выбрать услуги
                                  </button>

                                  <div class="flex flex-col mt-3 border-t border-slate-100 pt-3">
                                      <label class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider">Дополнительные услуги</label>
                                      <textarea ref="additionalServicesInput" v-model="recordForm.AdditionalServices" class="w-full min-h-[50px] px-2.5 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold text-slate-700 resize-y" rows="2" placeholder="Опишите прочие услуги..." @keyup.enter="$refs.commentInput ? $refs.commentInput.focus() : null"></textarea>
                                  </div>
                                  <div class="flex flex-col mt-3">
                                      <label class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider">Комментарий</label>
                                      <textarea ref="commentInput" v-model="recordForm.Comment" class="w-full min-h-[50px] px-2.5 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold text-slate-700 resize-y" rows="2" placeholder="Дополнительная информация или заметки к ремонту..."></textarea>
                                  </div>
                              </section>

                              <!-- Status, Master & Time Section -->
                              <section class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3 shrink-0">
                                  <h3 class="text-slate-800 text-[12px] font-bold mb-1 flex items-center gap-2 uppercase tracking-wider select-none">
                                      <i class="bi bi-person-gear text-indigo-600"></i> Исполнитель и Статус
                                  </h3>
                                  
                                  <div class="grid grid-cols-2 gap-2.5">
                                      <div class="flex flex-col relative col-span-1">
                                          <label class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider">Мастер</label>
                                          <select v-model="recordForm.MasterID" :disabled="user && user.Role === 'Master'" class="form-select w-full h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition disabled:opacity-50">
                                              <option value="">Не назначен</option>
                                              <option v-for="ms in mastersList" :key="ms.ID" :value="ms.ID">{{ms.Name || ms.Username}}</option>
                                          </select>
                                      </div>
                                      
                                      <div class="flex flex-col col-span-1">
                                          <label class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider">Статус</label>
                                          <select v-model="recordForm.Status" class="form-select w-full h-10 rounded-xl border px-2 text-xs font-bold tracking-wide outline-none transition cursor-pointer" :class="statusBgTw(recordForm.Status)">
                                              <option value="Открыт">ОТКРЫТ</option>
                                              <option value="Выполнен">ВЫПОЛНЕН</option>
                                              <option value="Отменён">ОТМЕНЁН</option>
                                          </select>
                                      </div>
                                  </div>
                                  
                                  <div class="grid grid-cols-2 gap-2.5">
                                      <div class="flex flex-col col-span-1">
                                          <label class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider">Время заезда</label>
                                          <input type="datetime-local" class="w-full h-10 rounded-xl border border-slate-200 bg-white px-2 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" v-model="recordForm.StartTime_LOCAL">
                                      </div>
                                      <div class="flex flex-col col-span-1 select-none">
                                          <label class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider">Оплата</label>
                                          <div class="flex gap-1 bg-slate-50 p-1.5 rounded-xl h-10 items-center border border-slate-200">
                                              <button type="button" @click="recordForm.IsPaid = true" 
                                                  class="flex-1 h-full rounded-lg text-[9.5px] font-extrabold uppercase tracking-widest transition-all cursor-pointer border-none flex items-center justify-center gap-0.5 shrink-0"
                                                  :class="recordForm.IsPaid ? 'bg-emerald-600 text-white shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-800'">
                                                  <span class="material-symbols-outlined text-[13px] font-black">check_circle</span> <span>Да</span>
                                              </button>
                                              <button type="button" @click="recordForm.IsPaid = false" 
                                                  class="flex-1 h-full rounded-lg text-[9.5px] font-extrabold uppercase tracking-widest transition-all cursor-pointer border-none flex items-center justify-center gap-0.5 shrink-0"
                                                  :class="!recordForm.IsPaid ? 'bg-rose-600 text-white shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-800'">
                                                  <span class="material-symbols-outlined text-[13px] font-black">cancel</span> <span>Нет</span>
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              </section>
                          </div>
                      </div>
                  </template>
              </div>
              
              <!-- Sticky Bottom Bar -->
              <div v-show="isEditingRecord" class="bg-white border-t border-slate-200 px-4 py-3 md:px-5 shrink-0 flex justify-between items-center gap-3">
                  <div class="flex items-center gap-1.5 px-0.5">
                      <span class="text-slate-500 font-bold text-[10px] uppercase tracking-wider hidden sm:inline">Итого к оплате (KGS):</span>
                      <input type="number" v-model="recordForm.TotalAmount" class="w-24 px-2 py-1 bg-white border border-slate-200 rounded text-lg font-black text-indigo-600 text-right outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  </div>
                  <div class="flex gap-2">
                      <button type="button" class="hidden md:flex h-9.5 px-4 items-center border border-slate-205 text-slate-600 bg-white rounded-xl hover:bg-slate-50 font-bold text-xs transition cursor-pointer" data-bs-dismiss="modal">Отмена</button>
                      <button type="button" @click="handleSave" :disabled="isSaving" class="h-9.5 px-5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer border-none">
                          <span v-if="isSaving" class="spinner-border spinner-border-sm text-white border-2"></span>Сохранить
                      </button>
                  </div>
              </div>

              <!-- Services Bottom Sheet Overlay -->
              <div :class="{'opacity-100 visible': showServiceSelector, 'opacity-0 invisible': !showServiceSelector}" class="absolute inset-0 bg-slate-900/40 z-40 backdrop-blur-sm transition-all duration-300" @click="closeServiceSelector()"></div>
              
              <!-- Services Bottom Sheet -->
              <div :class="{'translate-y-0': showServiceSelector, 'translate-y-full': !showServiceSelector}" class="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transform transition-transform duration-300 ease-out shadow-[0_-8px_30px_rgba(0,0,0,0.12)] h-[75%] max-h-[600px] flex flex-col">
                  <div class="flex justify-center p-3 cursor-grab" @click="closeServiceSelector()">
                      <div class="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                  </div>
                  <div class="px-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                      <h3 class="text-slate-800 font-bold text-[18px] m-0">Справочник услуг</h3>
                      <button type="button" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 border-none" @click="closeServiceSelector()">
                          <i class="bi bi-x-lg"></i>
                      </button>
                  </div>
                  <div class="p-4 border-b border-slate-50 bg-slate-50/50">
                      <div class="relative">
                          <i class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                          <input v-model="serviceSearch" class="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-[14px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400" placeholder="Поиск услуги...">
                      </div>
                  </div>
                  <div class="overflow-y-auto flex-1 p-3 space-y-2 pb-8 bg-slate-50">
                      <button v-for="srv in filteredServices" :key="srv.ID" @click="toggleService(srv.ID)" class="w-full flex items-center justify-between p-4 rounded-xl transition-colors text-left border cursor-pointer" :class="recordForm.ServicesJSON.includes(srv.ID) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:bg-slate-50'">
                          <div class="flex items-center gap-3">
                              <div class="w-5 h-5 rounded border flex items-center justify-center shrink-0" :class="recordForm.ServicesJSON.includes(srv.ID) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'">
                                  <i v-if="recordForm.ServicesJSON.includes(srv.ID)" class="bi bi-check text-sm font-bold"></i>
                              </div>
                              <span class="text-slate-800 font-bold text-[14px]" :class="{'text-indigo-900': recordForm.ServicesJSON.includes(srv.ID)}">{{ srv.Name }}</span>
                          </div>
                          <span class="text-slate-500 font-bold text-[13px] shrink-0">{{ Number(srv.Price).toLocaleString() }} KGS</span>
                      </button>
                      <div v-if="filteredServices.length === 0" class="text-center p-6 text-slate-400 font-medium text-sm">
                          Услуги не найдены
                      </div>
                  </div>
                  <div class="p-4 border-t border-slate-100 bg-white">
                      <button type="button" @click="closeServiceSelector()" class="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold text-[14px] hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 border-none">
                          Готово
                      </button>
                  </div>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
import { useMainStore } from '../../store';
import { formatDate, getDuration, formatPhoneInput } from '../../utils/helpers';

export default {
  data() {
    return {
      recordForm: this.emptyRecord(),
      isEditingRecord: false,
      showServiceSelector: false,
      serviceSearch: '',
      isSaving: false,
      bsModal: null
    };
  },
  computed: {
    store() { return useMainStore(); },
    user() { return this.store.user; },
    mastersList() { return this.store.mastersList; },
    sortedBrands() { return this.store.sortedBrands; },
    availableModels() {
      let bId = this.recordForm.BrandID;
      if (!bId) return [];
      let models = this.store.db.models.filter(m => m && m.BrandID === bId);
      return [...models].sort((x, y) => (x.Name || '').toLowerCase().localeCompare((y.Name || '').toLowerCase()));
    },
    filteredServices() {
      let s = this.store.sortedServices;
      if (!this.serviceSearch) return s;
      let q = this.serviceSearch.toLowerCase();
      return s.filter(x => x && (x.Name || '').toLowerCase().includes(q));
    }
  },
  mounted() {
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      this.bsModal = new bootstrap.Modal(this.$refs.modalRef, { backdrop: 'static' });
    }
  },
  methods: {
    emptyRecord() {
      let now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      let localIso = now.toISOString().slice(0, 16);
      return {
          ID: null, ClientName: '', Phone: '+996 ', CarNumber: '', BrandID: '', ModelID: '', 
          MasterID: '', Status: 'Открыт', ServicesJSON: [], TotalAmount: 0, Comment: '', AdditionalServices: '',
          StartTime_LOCAL: localIso, CarRegion: '', CarCountry: 'KG', CarNumberMain: '', IsPaid: false
      };
    },
    open(record = null) {
      if (record) {
          this.isEditingRecord = false;
          this.recordForm = JSON.parse(JSON.stringify(record));
          this.recordForm.ServicesJSON = this.recordForm.ServicesJSON || [];
          this.recordForm.IsPaid = record.IsPaid === true || String(record.IsPaid).toUpperCase() === 'TRUE';
          if (this.recordForm.StartTime) {
              let d = new Date(this.recordForm.StartTime);
              d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
              this.recordForm.StartTime_LOCAL = d.toISOString().slice(0, 16);
          } else {
              this.recordForm.StartTime_LOCAL = this.emptyRecord().StartTime_LOCAL;
          }
          
          if (this.recordForm.CarNumber) {
              let parts = this.recordForm.CarNumber.split(' ');
              if (parts.length >= 3 && parts[1].toUpperCase() === 'KG') {
                  this.recordForm.CarRegion = parts[0];
                  this.recordForm.CarCountry = parts[1];
                  this.recordForm.CarNumberMain = parts.slice(2).join(' ');
              } else {
                  this.recordForm.CarRegion = '';
                  this.recordForm.CarCountry = 'FOREIGN';
                  this.recordForm.CarNumberMain = '';
              }
          } else {
              this.recordForm.CarRegion = '';
              this.recordForm.CarCountry = 'KG';
              this.recordForm.CarNumberMain = '';
          }
      } else {
          this.isEditingRecord = true;
          this.recordForm = this.emptyRecord();
          if (this.user) {
              this.recordForm.MasterID = this.user.ID;
          }
      }
      if (this.bsModal) this.bsModal.show();
    },
    hide() {
      if (this.bsModal) this.bsModal.hide();
    },
    getBrandName(id) { let b = this.store.db.brands.find(x => x.ID == id); return b ? b.Name : '—'; },
    getModelName(id) { let m = this.store.db.models.find(x => x.ID == id); return m ? m.Name : ''; },
    getMasterName(id) { let m = this.store.db.users.find(x => x.ID == id); return m ? (m.Name || m.Username) : 'Не назначен'; },
    getServiceName(id) { let s = this.store.db.services.find(s => s.ID === id); return s ? s.Name : 'Н/Д'; },
    getServicePrice(id) { let s = this.store.db.services.find(s => s.ID === id); return s ? (s.Price || 0) : 0; },
    getDuration(s, e) { return getDuration(s, e); },
    statusBadgeTw(st) {
      if(st === 'Выполнен') return 'bg-status-completed-bg text-status-completed-text border-status-completed-text/10';
      if(st === 'Отменён') return 'bg-status-canceled-bg text-status-canceled-text border-status-canceled-text/10';
      return 'bg-status-open-bg text-status-open-text border-status-open-text/10';
    },
    statusBgTw(st) {
      if(st === 'Выполнен') return 'bg-status-completed-bg border-status-completed-text/20 text-status-completed-text';
      if(st === 'Отменён') return 'bg-status-canceled-bg border-status-canceled-text/20 text-status-canceled-text';
      return 'bg-status-open-bg border-status-open-text/20 text-status-open-text';
    },
    onPhoneInput() {
      this.recordForm.Phone = formatPhoneInput(this.recordForm.Phone);
    },
    setCarCountry(type) {
      this.recordForm.CarCountry = type;
      this.recordForm.CarRegion = '';
      this.recordForm.CarNumberMain = '';
      this.recordForm.CarNumber = '';
    },
    updateCarNumber(e) {
      if (this.recordForm.CarCountry === 'KG') {
          if (this.recordForm.CarRegion && this.recordForm.CarRegion.length === 2 && e && e.target === this.$refs.carRegionInput) {
              if (this.$refs.carNumberMainInput) this.$refs.carNumberMainInput.focus();
          }
          let parts = [];
          if (this.recordForm.CarRegion) parts.push(this.recordForm.CarRegion.toUpperCase());
          parts.push('KG');
          if (this.recordForm.CarNumberMain) parts.push(this.recordForm.CarNumberMain.toUpperCase());
          this.recordForm.CarNumber = parts.join(' ');
      }
    },
    onModelSelect() {
      if (this.recordForm.ModelID) {
          this.showServiceSelector = true;
      }
    },
    closeServiceSelector() {
      this.showServiceSelector = false;
      this.$nextTick(() => {
          if (this.$refs.additionalServicesInput) {
              this.$refs.additionalServicesInput.focus();
          }
      });
    },
    toggleService(sid) {
      let idx = this.recordForm.ServicesJSON.indexOf(sid);
      if (idx === -1) this.recordForm.ServicesJSON.push(sid);
      else this.recordForm.ServicesJSON.splice(idx, 1);
      this.calcTotal();
    },
    calcTotal() {
      let sum = 0;
      this.recordForm.ServicesJSON.forEach(sid => {
          let srv = this.store.db.services.find(s => s.ID === sid);
          if (srv) sum += Number(srv.Price) || 0;
      });
      this.recordForm.TotalAmount = sum;
    },
    async fillAndSave(payload) {
      const isNew = !payload.ID;
      if (isNew) {
          payload.ID = 'local_' + Date.now();
          this.recordForm.ID = payload.ID;
          this.store.db.records.unshift(payload);
          this.store.dispatchSync('addRow', payload, 'Records');
      } else {
          let idx = this.store.db.records.findIndex(x => x.ID === payload.ID);
          if (idx > -1) this.store.db.records[idx] = payload;
          this.store.dispatchSync('updateRecord', payload);
      }
      this.store.showToast('Запись успешно сохранена');
      this.hide();
    },
    async handleSave() {
      try {
          const f = this.recordForm;
          if (f.ID && !String(f.ID).startsWith('local_') && this.user && this.user.Role === 'Master') {
              let original = this.store.db.records.find(x => x.ID === f.ID);
              if (original && original.Status !== 'Открыт') {
                  throw new Error('Мастер не может изменять закрытые записи со статусом ' + original.Status);
              }
          }
          if (!f.ClientName) throw new Error('Пожалуйста, введите Имя Клиента');
          if (!f.Phone) throw new Error('Пожалуйста, введите Телефон');
          if (!f.CarNumber) throw new Error('Пожалуйста, введите Госномер');
          if (!f.BrandID) throw new Error('Пожалуйста, выберите Марку');
          if (!f.ModelID) throw new Error('Пожалуйста, выберите Модель');
          
          if ((!f.ServicesJSON || f.ServicesJSON.length === 0) && !f.AdditionalServices) {
              throw new Error('Пожалуйста, добавьте хотя бы одну Услугу или заполните "Дополнительные услуги"');
          }

          let payload = JSON.parse(JSON.stringify(this.recordForm));
          if (payload.StartTime_LOCAL) {
              payload.StartTime = new Date(payload.StartTime_LOCAL).toISOString();
          } else if (!payload.ID) {
              payload.StartTime = new Date().toISOString();
          }
          
          let original = payload.ID ? this.store.db.records.find(x => x.ID === payload.ID) : null;
          if (payload.Status === 'Выполнен') {
              if (!payload.EndTime || (original && original.Status !== 'Выполнен')) {
                  payload.EndTime = new Date().toISOString();
              }
          } else {
              payload.EndTime = '';
          }
          this.recordForm.EndTime = payload.EndTime;
          
          this.isSaving = true;
          await this.fillAndSave(payload);
      } catch (e) {
          this.store.showToast(e.message, 'error');
      } finally {
          this.isSaving = false;
      }
    },
    async quickStatusChangeModal(newStatus) {
      this.recordForm.Status = newStatus;
      await this.handleSave();
    }
  }
}
</script>
