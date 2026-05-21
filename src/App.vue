<template>

        
        <!-- ======================= -->
        <!-- TOAST УВЕДОМЛЕНИЯ -->
        <!-- ======================= -->
        <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
            <div v-for="t in toasts" :key="t.id" class="px-5 py-3.5 rounded-xl shadow-xl text-sm font-bold text-white flex items-center justify-between min-w-[280px]" :class="t.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'">
                <div class="flex items-center gap-3">
                    <i class="bi text-lg" :class="t.type === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'"></i>
                    <span>{{ t.msg }}</span>
                </div>
            </div>
        </div>

        <!-- ======================= -->
        <!-- ЭКРАН АВТОРИЗАЦИИ -->
        <!-- ======================= -->
        <div v-if="!user" class="h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
            <!-- Decorative BG Elements -->
            <div class="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div class="absolute top-40 -left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            
            <div class="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100 z-10 relative">
                <div class="flex items-center gap-3 mb-8 justify-center">
                    <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <i class="bi bi-car-front-fill text-xl"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-slate-800 tracking-tight">AutoService CRM</h2>
                </div>

                <ul class="flex border-b border-slate-100 mb-6">
                    <li class="flex-1 text-center"><button class="pb-3 px-4 font-bold text-sm w-full transition-colors" :class="authMode === 'login' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 border-b-2 border-transparent hover:text-slate-600'" @click="authMode = 'login'">Вход</button></li>
                    <li class="flex-1 text-center"><button class="pb-3 px-4 font-bold text-sm w-full transition-colors" :class="authMode === 'register' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 border-b-2 border-transparent hover:text-slate-600'" @click="authMode = 'register'">Регистрация</button></li>
                </ul>

                <div class="space-y-4">
                    <!-- USERNAME MANUAL INPUT -->
                    <div>
                        <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Имя пользователя / Логин</label>
                        <input v-model="authForm.username" type="text" class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-slate-800 placeholder-slate-400" placeholder="Введите ваш логин">
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Пароль</label>
                        <input v-model="authForm.password" type="password" class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-slate-800 placeholder-slate-400" placeholder="••••••••" @keyup.enter="handleAuth">
                    </div>

                    <template v-if="authMode === 'register'">
                        <div>
                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">ФИО (Полное имя)</label>
                            <input v-model="authForm.name" type="text" class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-slate-800 placeholder-slate-400" placeholder="Иван Иванов">
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Номер телефона</label>
                            <input v-model="authForm.phone" type="tel" @input="formatPhoneInput('authForm', 'phone')" class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-slate-800 placeholder-slate-400" placeholder="+996 XXX XXX XXX">
                        </div>
                    </template>



                    <button @click="handleAuth" :disabled="authLoading" class="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 mt-6 flex justify-center items-center gap-2">
                        <span v-if="authLoading" class="spinner-border spinner-border-sm text-white"></span>
                        <span v-else>{{ authMode === 'login' ? 'Войти в систему' : 'Создать аккаунт' }}</span>
                    </button>
                    
                    <p v-if="authMode === 'register'" class="text-xs text-center text-slate-400 mt-4 leading-relaxed font-medium">После регистрации аккаунт должен быть подтверждён Супер-администратором.</p>
                </div>
            </div>
        </div>

        <!-- ======================= -->
        <!-- ГЛАВНОЕ ПРИЛОЖЕНИЕ -->
        <!-- ======================= -->
        <div v-else class="flex flex-col md:flex-row h-screen w-full bg-slate-50 text-slate-900 overflow-hidden">
            
            <!-- Sidebar Desktop (Hidden on Mobile) -->
            <aside class="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 hidden md:flex z-10 transition-all">
                <div class="p-6 border-b border-slate-100 flex items-center gap-2">
                    <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-indigo-100">
                        <i class="bi bi-car-front-fill text-white text-sm"></i>
                    </div>
                    <span class="font-bold text-lg tracking-tight">AutoService CRM</span>
                </div>
                <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto">
                    <a @click="activeTab='records'" :class="activeTab==='records' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'" class="flex items-center gap-3 px-4 py-2.5 rounded-lg font-bold cursor-pointer transition-colors text-sm">
                        <i class="bi bi-journal-text w-5 h-5 text-lg flex items-center justify-center"></i>
                        Записи
                    </a>
                    <a @click="activeTab='dashboard'" :class="activeTab==='dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'" class="flex items-center gap-3 px-4 py-2.5 rounded-lg font-bold cursor-pointer transition-colors text-sm">
                        <i class="bi bi-pie-chart w-5 h-5 text-lg flex items-center justify-center"></i>
                        Аналитика
                    </a>
                    
                    <template v-if="user.Role !== 'Master'">
                        <div class="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Справочники</div>
                        <a @click="activeTab='refs'; refTab='grid'" :class="activeTab==='refs' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'" class="flex items-center gap-3 px-4 py-2 text-sm rounded-lg font-semibold cursor-pointer transition-colors">
                            <i class="bi bi-tools w-4 h-4 flex items-center justify-center"></i> Справочники
                        </a>
                    </template>
                    
                    <template v-if="user.Role === 'Superadmin'">
                        <div class="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">АДМИНКА</div>
                        <a @click="activeTab='users'" :class="activeTab==='users' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'" class="flex items-center gap-3 px-4 py-2 text-sm rounded-lg font-semibold cursor-pointer transition-colors">
                            <i class="bi bi-people-fill w-4 h-4 flex items-center justify-center"></i> Персонал
                        </a>
                    </template>
                </nav>
                <div class="p-4 bg-slate-50 border-t border-slate-200 mt-auto flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 font-bold tracking-tighter">{{ user.Username ? user.Username.slice(0,2).toUpperCase() : '?' }}</div>
                        <div>
                            <div class="text-sm font-bold text-slate-800">{{ user.Username }}</div>
                            <div class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{{ user.Role }}</div>
                        </div>
                    </div>
                    <button @click="logout" class="text-slate-400 hover:text-red-500 transition px-2" title="Выйти"><i class="bi bi-box-arrow-right text-lg"></i></button>
                </div>
            </aside>

            <!-- Main Workspace -->
            <main class="flex-1 flex flex-col h-full overflow-hidden relative pb-16 md:pb-0">
                <!-- Mobile Top Header -->
                <header class="md:hidden mx-4 mt-4 mb-2 h-12 bg-transparent border-0 shadow-none px-0 flex items-center justify-between shrink-0 z-20 select-none">
                    <div class="flex items-center gap-1.5 bg-white shadow-md border border-slate-200/50 rounded-xl px-2.5 h-10" v-if="!isSearchExpanded">
                        <div class="w-5 h-5 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                            <i class="bi text-white text-[9px]" :class="activeTab === 'dashboard' ? 'bi-bar-chart-line-fill' : activeTab === 'refs' ? 'bi-journals' : activeTab === 'users' ? 'bi-people-fill' : 'bi-car-front-fill'"></i>
                        </div>
                        <span class="font-black text-xs tracking-tight text-slate-800">
                            {{ activeTab === 'dashboard' ? 'Аналитика' : activeTab === 'refs' ? 'Справочники' : activeTab === 'users' ? 'Персонал' : 'AutoService' }}
                        </span>
                    </div>

                    <!-- "Все" button on mobile header -->
                    <button v-if="activeTab === 'records' && !isSearchExpanded" @click="setAllStatuses" 
                        class="h-10 px-3 md:px-3.5 border rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md select-none outline-none focus:outline-none"
                        :class="isAllStatusesActive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'">
                        <i class="bi bi-infinity text-sm font-bold"></i>
                        <span>Все</span>
                    </button>

                    <!-- Expanded Mobile Search -->
                    <div v-else class="flex-1 mr-2 relative h-10 select-none">
                        <input v-model="searchQuery" ref="mobileSearchInput" class="w-full h-10 pl-8 pr-8 rounded-xl bg-white text-slate-800 text-xs font-semibold outline-none border border-slate-200/50 shadow-md focus:border-indigo-500/80" placeholder="Поиск по госномеру...">
                        <span class="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-3">search</span>
                        <button @click="isSearchExpanded = false; searchQuery = ''" class="absolute right-2 top-3 text-slate-400 hover:text-slate-600 flex items-center">
                            <span class="material-symbols-outlined text-[15px]">close</span>
                        </button>
                    </div>
                    
                    <div class="flex items-center gap-1.5 h-10 bg-white shadow-md border border-slate-200/50 rounded-xl p-1">
                        <!-- Search Icon Toggle for Records -->
                        <button v-if="activeTab === 'records' && !isSearchExpanded" @click="isSearchExpanded = true; $nextTick(() => { if($refs.mobileSearchInput) $refs.mobileSearchInput.focus() })" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-slate-50/50 transition cursor-pointer">
                            <span class="material-symbols-outlined text-[18px]">search</span>
                        </button>

                        <!-- Filter Icon Toggle for Records -->
                        <button v-if="activeTab === 'records'" @click="isFiltersExpanded = !isFiltersExpanded" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-slate-50/50 transition cursor-pointer" :class="isFiltersExpanded ? 'bg-indigo-50/50 text-indigo-600 font-bold' : ''">
                            <span class="material-symbols-outlined text-[18px]">tune</span>
                        </button>

                        <button v-if="isSyncing" class="px-1.5 h-8 text-indigo-600 font-bold flex items-center gap-1 bg-indigo-50/60 rounded-lg shrink-0" style="font-size: 9px;">
                            <span class="material-symbols-outlined animate-spin font-bold text-[13px]">sync</span>
                        </button>
                        <button @click="openProfileModal" class="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition shrink-0" title="Профиль">
                            <span class="font-black text-[9px]">{{ user.Username ? user.Username.slice(0,2).toUpperCase() : '?' }}</span>
                        </button>
                    </div>
                </header>

                <!-- Desktop Header -->
                <header class="hidden md:flex mx-6 mt-4 mb-2 h-16 bg-transparent border-none shadow-none items-center justify-between shrink-0 z-10 select-none px-0">
                    <div class="flex items-center gap-4 bg-white shadow-md border border-slate-200/50 rounded-2xl p-2 px-4 h-14">
                        <h1 class="text-sm font-black text-slate-800 tracking-wider uppercase m-0 leading-none select-none" v-if="activeTab==='records'">Журнал</h1>
                        <h1 class="text-sm font-black text-slate-800 tracking-wider uppercase m-0 leading-none select-none" v-if="activeTab==='dashboard'">Аналитика</h1>
                        <h1 class="text-sm font-black text-slate-800 tracking-wider uppercase m-0 leading-none select-none" v-if="activeTab==='refs'">Справочники</h1>
                        <h1 class="text-sm font-black text-slate-800 tracking-wider uppercase m-0 leading-none select-none" v-if="activeTab==='users'">Персонал</h1>

                        <!-- "Все" button in Desktop Header -->
                        <button v-if="activeTab === 'records'" @click="setAllStatuses" 
                            class="h-9.5 px-3 md:px-3.5 border rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm select-none outline-none focus:outline-none"
                            :class="isAllStatusesActive ? 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'">
                            <i class="bi bi-infinity text-xs font-bold"></i>
                            <span>Все</span>
                        </button>

                        <!-- Search icon & Input in Desktop Header -->
                        <div v-if="activeTab === 'records'" class="flex items-center gap-1.5">
                            <button v-if="!isSearchExpanded" @click="isSearchExpanded = true; $nextTick(() => { if($refs.desktopSearchInput) $refs.desktopSearchInput.focus() })" class="w-9 h-9 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition cursor-pointer" title="Поиск записей">
                                <span class="material-symbols-outlined text-[18px]">search</span>
                            </button>
                            <div v-else class="relative flex items-center">
                                <input ref="desktopSearchInput" v-model="searchQuery" class="w-60 h-9.5 pl-9 pr-8 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-150/20 focus:border-indigo-500 text-xs font-semibold text-slate-700 outline-none transition" placeholder="Поиск по госномеру...">
                                <span class="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-2.5">search</span>
                                <button @click="isSearchExpanded = false; searchQuery = ''" class="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 flex items-center">
                                    <span class="material-symbols-outlined text-[16px]">close</span>
                                </button>
                            </div>
                        </div>

                        <!-- Filters toggle on Desktop Header -->
                        <button v-if="activeTab === 'records'" @click="isFiltersExpanded = !isFiltersExpanded" class="h-9.5 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition cursor-pointer block select-none border-none" :class="isFiltersExpanded ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'">
                            <span class="material-symbols-outlined text-[18px]">tune</span>
                            <span>Фильтры</span>
                        </button>
                    </div>
                    
                    <div class="flex items-center gap-4 bg-white shadow-md border border-slate-200/50 rounded-2xl p-2 px-4 h-14">
                        <button v-if="isSyncing" class="px-2.5 h-9.5 border border-indigo-100 bg-indigo-50 text-indigo-600 rounded-xl transition-all font-bold flex items-center gap-1.5 animate-pulse">
                            <span class="material-symbols-outlined animate-spin font-bold text-sm">sync</span> <span class="text-[9px] uppercase tracking-wider">Синхронизация</span>
                        </button>
                        
                        <select v-if="activeTab==='dashboard'" v-model="dashboardPeriod" class="form-select w-auto h-9.5 border border-slate-200 rounded-xl text-xs bg-slate-50 font-bold cursor-pointer hover:bg-slate-100 transition-colors outline-none px-2.5">
                            <option value="day">За Сегодня</option>
                            <option value="week">За Неделю</option>
                            <option value="month">За Месяц</option>
                            <option value="all">За Всё время</option>
                        </select>

                        <div class="h-6 w-px bg-slate-200 mx-1"></div>

                        <button @click="openProfileModal" class="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-xl transition cursor-pointer">
                             <div class="text-right hidden lg:block select-none">
                                 <div class="text-xs font-black text-slate-800 leading-tight">{{ user.Username }}</div>
                                 <div class="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-tight mt-0.5">{{ user.Role === 'Superadmin' ? 'Супер-админ' : user.Role === 'SenMaster' ? 'Ст. мастер' : 'Мастер' }}</div>
                             </div>
                             <div class="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 font-extrabold text-xs tracking-tighter">
                                 {{ user.Username ? user.Username.slice(0,2).toUpperCase() : '?' }}
                             </div>
                        </button>
                    </div>
                </header>

                <div class="flex-1 px-3 pt-1.5 pb-4 md:px-8 overflow-y-auto w-full relative z-0">
                    <div v-if="!loading" class="max-w-7xl mx-auto space-y-4 md:space-y-6">
                        
                        <!-- ОШИБКА ДАННЫХ -->
                        <div v-if="initError" class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                             <strong>Ошибка при загрузке данных:</strong> {{ initError }}
                        </div>

                        <!-- ЗАПИСИ (Ремонты) -->
                        <div v-if="activeTab === 'records'" class="max-w-md mx-auto w-full space-y-4 pb-20">
                            <!-- Sticky Header elements for Records -->
                            <div class="sticky top-0 bg-transparent pt-1.5 pb-2.5 z-10 space-y-2 select-none -mx-3 px-3">
                                <!-- Advanced Filters - Collapsible sliding container -->
                                <div v-if="isFiltersExpanded" class="bg-white border border-slate-200/50 p-4.5 rounded-2xl flex flex-col gap-3.5 transition-all duration-300 shadow-xl">
                                    <div class="flex items-center justify-between">
                                        <span class="text-[10px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1">
                                            <span class="material-symbols-outlined text-[13px] font-bold">tune</span> Фильтры поиска
                                        </span>
                                        <button @click="clearAllFilters" class="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition">Сбросить</button>
                                    </div>
                                    <div class="grid grid-cols-2 xs:grid-cols-3 gap-2">
                                        <div class="flex flex-col">
                                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Мастер</span>
                                            <select v-model="advFilterMaster" class="h-8.5 py-0 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/15 cursor-pointer transition-all">
                                                <option value="">Все мастера</option>
                                                <option v-for="m in mastersList" :key="m.ID" :value="m.ID">{{m.Name || m.Username}}</option>
                                            </select>
                                        </div>
                                        <div class="flex flex-col">
                                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Услуга</span>
                                            <select v-model="advFilterService" class="h-8.5 py-0 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/15 cursor-pointer transition-all">
                                                <option value="">Все услуги</option>
                                                <option v-for="s in db.services" :key="s.ID" :value="s.ID">{{s.Name}}</option>
                                            </select>
                                        </div>
                                        <div class="flex flex-col">
                                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Дата</span>
                                            <input type="date" v-model="advFilterDate" class="h-8.5 py-0 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all w-full">
                                        </div>
                                        <div class="flex flex-col col-span-1">
                                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Марка</span>
                                            <select v-model="advFilterBrand" @change="advFilterModel = ''" class="h-8.5 py-0 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/15 cursor-pointer transition-all">
                                                <option value="">Все марки</option>
                                                <option v-for="b in db.brands" :key="b.ID" :value="b.ID">{{b.Name}}</option>
                                            </select>
                                        </div>
                                        <div class="flex flex-col col-span-1">
                                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Модель</span>
                                            <select v-model="advFilterModel" class="h-8.5 py-0 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/15 cursor-pointer transition-all">
                                                <option value="">Все модели</option>
                                                <option v-for="m in filteredModelsForFilter" :key="m.ID" :value="m.ID">{{m.Name}}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <!-- Status Filter Individual Buttons ("Islands" with shadows) -->
                                <div class="flex gap-2 w-full">
                                    <!-- Открыт -->
                                    <button class="flex-1 min-w-[70px] flex h-9.5 items-center justify-center gap-1 w-full rounded-xl font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer border-none shadow-md hover:shadow-lg focus:outline-none outline-none"
                                        :class="(activeStatuses.length === 1 && activeStatuses.includes('Открыт')) ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:text-slate-800'"
                                        @click="toggleStatus('Открыт')">
                                        <span class="material-symbols-outlined text-[14px]" :class="(activeStatuses.length === 1 && activeStatuses.includes('Открыт')) ? 'text-white' : 'text-indigo-500'">build_circle</span>
                                        <span>Открыт</span>
                                    </button>
                                    
                                    <!-- Выполнен -->
                                    <button class="flex-1 min-w-[70px] flex h-9.5 items-center justify-center gap-1 w-full rounded-xl font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer border-none shadow-md hover:shadow-lg focus:outline-none outline-none"
                                        :class="(activeStatuses.length === 1 && activeStatuses.includes('Выполнен')) ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 hover:text-slate-800'"
                                        @click="toggleStatus('Выполнен')">
                                        <span class="material-symbols-outlined text-[14px]" :class="(activeStatuses.length === 1 && activeStatuses.includes('Выполнен')) ? 'text-white' : 'text-emerald-500'">check_circle</span>
                                        <span>Выполнен</span>
                                    </button>
                                    
                                    <!-- Отменён -->
                                    <button class="flex-1 min-w-[70px] flex h-9.5 items-center justify-center gap-1 w-full rounded-xl font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer border-none shadow-md hover:shadow-lg focus:outline-none outline-none"
                                        :class="(activeStatuses.length === 1 && activeStatuses.includes('Отменён')) ? 'bg-rose-600 text-white' : 'bg-white text-slate-500 hover:text-slate-800'"
                                        @click="toggleStatus('Отменён')">
                                        <span class="material-symbols-outlined text-[14px]" :class="(activeStatuses.length === 1 && activeStatuses.includes('Отменён')) ? 'text-white' : 'text-rose-500'">cancel</span>
                                        <span>Отменён</span>
                                    </button>
                                </div>
                            </div>

                            <!-- List View -->
                            <div class="space-y-3">
                                <article v-for="r in filteredRecords" :key="r.ID" @click="openRecordModal(r)" 
                                    class="bg-surface rounded-2xl p-3 shadow-soft border border-slate-200/50 active:scale-[0.98] transition-all cursor-pointer hover:shadow-md hover:border-slate-300 flex flex-col gap-2"
                                    :class="{'opacity-90': r.Status === 'Выполнен', 'opacity-75 grayscale-[15%]': r.Status === 'Отменён'}">
                                    
                                    <!-- ROW 1: [гос.номер] & [мастер] -->
                                    <div class="grid grid-cols-2 gap-2">
                                        <!-- гос.номер -->
                                        <div class="bg-slate-900 border border-slate-950 text-white rounded-xl h-8 px-2.5 flex items-center gap-1.5 min-w-0 shadow-sm">
                                            <span class="material-symbols-outlined text-[13px] text-amber-400 font-bold leading-none">directions_car</span>
                                            <span class="font-mono font-black text-xs tracking-wider uppercase truncate leading-none text-slate-100">
                                                {{ r.CarNumber }}
                                            </span>
                                        </div>
                                        <!-- мастер -->
                                        <div class="bg-slate-50 border border-slate-200/50 text-slate-700 rounded-xl h-8 px-2.5 flex items-center gap-1.5 min-w-0">
                                            <span class="material-symbols-outlined text-[13px] text-slate-400 leading-none">engineering</span>
                                            <span class="text-xs font-bold text-slate-700 truncate leading-none">
                                                {{ getMasterName(r.MasterID) }}
                                            </span>
                                        </div>
                                    </div>

                                    <!-- ROW 2: [начало] & [Марка - Модель] -->
                                    <div class="grid grid-cols-2 gap-2">
                                        <!-- начало -->
                                        <div class="bg-slate-50 border border-slate-200/50 text-slate-650 rounded-xl h-8 px-2.5 flex items-center gap-1.5 min-w-0">
                                            <span class="material-symbols-outlined text-[13px] text-indigo-500 font-bold leading-none">play_circle</span>
                                            <span class="text-xs font-bold text-slate-650 leading-none truncate">
                                                {{ formatDate(r.StartTime).date }} {{ formatDate(r.StartTime).time }}
                                            </span>
                                        </div>
                                        <!-- Марка - Модель -->
                                        <div class="bg-slate-50 border border-slate-200/50 text-slate-700 rounded-xl h-8 px-2.5 flex items-center gap-1.5 min-w-0">
                                            <span class="material-symbols-outlined text-[13px] text-slate-400 font-bold leading-none">minor_crash</span>
                                            <span class="text-xs font-bold text-slate-800 truncate leading-none">
                                                {{ getBrandName(r.BrandID) }} {{ getModelName(r.ModelID) }}
                                            </span>
                                        </div>
                                    </div>

                                    <!-- ROW 3: [конец] & [время выполнения] -->
                                    <div class="grid grid-cols-2 gap-2">
                                        <!-- конец -->
                                        <div class="bg-slate-50 border border-slate-200/50 text-slate-650 rounded-xl h-8 px-2.5 flex items-center gap-1.5 min-w-0">
                                            <span class="material-symbols-outlined text-[13px] text-emerald-500 font-bold leading-none">stop_circle</span>
                                            <span class="text-xs font-bold text-slate-650 leading-none truncate">
                                                {{ r.EndTime ? (formatDate(r.EndTime).date + ' ' + formatDate(r.EndTime).time) : '—' }}
                                            </span>
                                        </div>
                                        <!-- время выполнения -->
                                        <div class="bg-slate-50 border border-slate-200/50 text-slate-650 rounded-xl h-8 px-2.5 flex items-center gap-1.5 min-w-0">
                                            <span class="material-symbols-outlined text-[13px] text-slate-400 font-bold leading-none">timer</span>
                                            <span class="text-xs font-bold text-slate-650 leading-none truncate">
                                                {{ (r.Status === 'Выполнен' && r.EndTime) ? getDuration(r.StartTime, r.EndTime) : 'В процессе' }}
                                            </span>
                                        </div>
                                    </div>

                                    <!-- ROW 4: [Услуга] & [сумма] -->
                                    <div class="grid grid-cols-12 gap-2 items-stretch">
                                        <!-- Услуга -->
                                        <div class="col-span-8 bg-slate-50 border border-slate-200/50 text-slate-650 rounded-xl h-8 px-2.5 flex items-center gap-1.5 min-w-0">
                                            <span class="material-symbols-outlined text-[13px] text-slate-400 font-bold shrink-0 leading-none">handyman</span>
                                            <span class="text-xs font-bold text-slate-600 truncate leading-none">
                                                {{ getRecordServicesString(r) }}
                                            </span>
                                        </div>
                                        <!-- сумма -->
                                        <div class="col-span-4 bg-slate-50 border border-slate-200/50 rounded-xl h-8 px-2.5 flex items-center justify-center text-center font-bold text-slate-800 min-w-0">
                                            <span class="text-xs font-bold text-slate-900 leading-none font-heading truncate">
                                                {{ Number(r.TotalAmount || 0).toLocaleString() }} KGS
                                            </span>
                                        </div>
                                    </div>

                                    <!-- ROW 5: [статус записи - кнопка] & [статус оплаты - кнопка] -->
                                    <div class="grid grid-cols-2 gap-2 mt-1">
                                        <!-- статус записи - кнопка -->
                                        <button @click.stop="toggleStatusDirectly(r)" 
                                            class="h-9 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-none outline-none focus:outline-none flex items-center justify-center gap-1.5 cursor-pointer shadow-sm select-none"
                                            :class="statusButtonClasses(r.Status)">
                                            <span class="material-symbols-outlined text-[15px] font-black leading-none">{{ statusIcon(r.Status) }}</span>
                                            <span>{{ r.Status }}</span>
                                        </button>

                                        <!-- статус оплаты - кнопка -->
                                        <button @click.stop="quickPaymentToggle(r)" 
                                            class="h-9 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-none outline-none focus:outline-none flex items-center justify-center gap-1.5 cursor-pointer shadow-sm select-none"
                                            :class="(r.IsPaid === true || String(r.IsPaid).toUpperCase() === 'TRUE') ? 'bg-emerald-600 text-white hover:bg-emerald-750' : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'">
                                            <span class="material-symbols-outlined text-[15px] font-black leading-none">{{ (r.IsPaid === true || String(r.IsPaid).toUpperCase() === 'TRUE') ? 'check_circle' : 'cancel' }}</span>
                                            <span>{{ (r.IsPaid === true || String(r.IsPaid).toUpperCase() === 'TRUE') ? 'Оплачен' : 'Не оплачен' }}</span>
                                        </button>
                                    </div>
                                </article>
                                
                                <div v-if="filteredRecords.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
                                    <span class="material-symbols-outlined text-4xl text-border-subtle mb-3">inbox</span>
                                    <p class="text-muted text-sm border-0">Записи не найдены</p>
                                </div>
                            </div>
                            
                            <!-- FAB -->
                            <button @click="openRecordModal()" class="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-fab active:scale-95 transition-transform z-20 md:bottom-12 md:right-12">
                                <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'wght' 600;">add</span>
                            </button>
                        </div>

                        <div v-if="activeTab === 'dashboard'" class="max-w-md mx-auto w-full space-y-4 fade-transition pb-20" id="dashboard-tab-container">
                            
                            <!-- Period Selector & Advanced Filters trigger -->
                            <div class="flex gap-2 items-center">
                                <div class="flex-1 flex gap-1 p-1 bg-slate-100 hover:bg-slate-150 transition-colors border border-slate-200/50 rounded-xl">
                                    <button id="dash-period-day" class="flex-1 py-1 rounded-[8px] text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border-0"
                                        :class="dashboardPeriod === 'day' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-800'"
                                        @click="dashboardPeriod = 'day'">День</button>
                                    <button id="dash-period-week" class="flex-1 py-1 rounded-[8px] text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border-0"
                                        :class="dashboardPeriod === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-800'"
                                        @click="dashboardPeriod = 'week'">Неделя</button>
                                    <button id="dash-period-month" class="flex-1 py-1 rounded-[8px] text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border-0"
                                        :class="dashboardPeriod === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-800'"
                                        @click="dashboardPeriod = 'month'">Месяц</button>
                                    <button id="dash-period-all" class="flex-1 py-1 rounded-[8px] text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border-0"
                                        :class="dashboardPeriod === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-800'"
                                        @click="dashboardPeriod = 'all'">Все</button>
                                </div>
                                <button id="dash-filters-toggle" @click="isDashFiltersExpanded = !isDashFiltersExpanded" 
                                    class="w-10 h-[34px] rounded-xl border flex items-center justify-center transition cursor-pointer shrink-0 shadow-sm relative border-slate-200"
                                    :class="isDashFiltersExpanded ? 'bg-indigo-55 border-indigo-200 text-indigo-600 font-bold' : 'bg-white text-slate-500 hover:bg-slate-50'">
                                    <span class="material-symbols-outlined text-[19px]">tune</span>
                                    <!-- Dot badge if any advanced filter is active -->
                                    <span v-if="dashFilterMaster || dashFilterService || dashFilterDate" class="absolute top-1 right-1 w-2 h-2 bg-indigo-600 border border-white rounded-full"></span>
                                </button>
                            </div>

                            <!-- Sliding Advanced Filters -->
                            <div v-if="isDashFiltersExpanded" class="bg-indigo-50/60 border border-indigo-100/70 p-3 rounded-xl flex flex-col gap-2 transition-all duration-300" id="dash-filters-pane">
                                <div class="flex items-center justify-between">
                                    <span class="text-[9px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5 leading-none">
                                        <span class="material-symbols-outlined text-[12px] font-black">tune</span> Фильтры
                                    </span>
                                    <button id="dash-filters-clear" @click="clearAllDashFilters" class="text-[9px] font-bold text-slate-400 hover:text-indigo-600 transition border-0 bg-transparent cursor-pointer">Сбросить</button>
                                </div>
                                <div class="grid select-none gap-2 text-left" :class="user.Role === 'Master' ? 'grid-cols-2' : 'grid-cols-3'">
                                    <!-- Master filter (hidden or auto prefilled for Masters) -->
                                    <div v-if="user.Role !== 'Master'" class="flex flex-col">
                                        <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 ml-1 text-left">Мастер</span>
                                        <select id="dash-filter-master-select" v-model="dashFilterMaster" class="h-8 py-0 px-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/15 cursor-pointer transition-all">
                                            <option value="">Все мастера</option>
                                            <option v-for="m in mastersList" :key="m.ID" :value="m.ID">{{m.Name || m.Username}}</option>
                                        </select>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 ml-1 text-left">Услуга</span>
                                        <select id="dash-filter-service-select" v-model="dashFilterService" class="h-8 py-0 px-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/15 cursor-pointer transition-all">
                                            <option value="">Все услуги</option>
                                            <option v-for="s in db.services" :key="s.ID" :value="s.ID">{{s.Name}}</option>
                                        </select>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 ml-1 text-left">Дата заезда</span>
                                        <input id="dash-filter-date-input" type="date" v-model="dashFilterDate" class="h-8 py-0 px-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all">
                                    </div>
                                </div>
                            </div>

                            <!-- Combined Hero Stats (Compact) -->
                            <div class="space-y-3">
                                <!-- Revenue Card -->
                                <div class="bg-indigo-600 rounded-2xl p-4 text-white shadow-md border border-indigo-500/10 flex items-center justify-between relative overflow-hidden text-left" id="dash-hero-revenue">
                                    <div class="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.06] text-white pointer-events-none select-none">
                                        <span class="material-symbols-outlined text-[100px]">currency_ruble</span>
                                    </div>
                                    <div class="relative z-10">
                                        <span class="text-indigo-200 text-[9px] font-bold uppercase tracking-wider">Выручка за период</span>
                                        <h2 class="font-heading text-2xl font-black tracking-tight mt-0.5">{{ dashStats.sum.toLocaleString() }} KGS</h2>
                                        <div class="flex items-center gap-1 mt-1 text-[9px] text-indigo-100 font-medium">
                                            <span class="material-symbols-outlined text-[11px]">analytics</span>
                                            <span>Только завершенные заказы</span>
                                        </div>
                                    </div>
                                    <span class="material-symbols-outlined text-white text-[16px] bg-white/20 rounded-xl p-2 shrink-0 relative z-10">trending_up</span>
                                </div>
                                
                                <!-- Compact Stats Grid -->
                                <div class="grid grid-cols-2 gap-3" id="dash-stats-grid">
                                    <!-- Orders -->
                                    <div class="bg-white rounded-2xl p-3 shadow-sm border border-slate-150 flex items-center justify-between text-left" id="dash-stat-orders">
                                        <div>
                                            <span class="text-slate-400 text-[9px] font-bold uppercase tracking-wider block mb-0.5">Выполнено</span>
                                            <div class="font-heading text-xl font-black text-slate-800 leading-tight">{{ dashStats.count }}</div>
                                            <span class="text-[9px] text-slate-500 font-bold uppercase">заказов</span>
                                        </div>
                                        <span class="material-symbols-outlined text-indigo-500 bg-indigo-55/10 rounded-lg p-1.5 text-[16px] shrink-0">check_circle</span>
                                    </div>
                                    <!-- Avg check -->
                                    <div class="bg-white rounded-2xl p-3 shadow-sm border border-slate-150 flex items-center justify-between text-left" id="dash-stat-avg-check">
                                        <div>
                                            <span class="text-slate-400 text-[9px] font-bold uppercase tracking-wider block mb-0.5">Средний чек</span>
                                            <div class="font-heading text-lg font-black text-slate-800 leading-tight">
                                                {{ dashStats.count ? Math.round(dashStats.sum / dashStats.count).toLocaleString() : 0 }}
                                            </div>
                                            <span class="text-[9px] text-slate-500 font-semibold uppercase">KGS</span>
                                        </div>
                                        <span class="material-symbols-outlined text-emerald-500 bg-emerald-55/10 rounded-lg p-1.5 text-[16px] shrink-0">payments</span>
                                    </div>
                                </div>
                            </div>

                            <!-- NEW DYNAMIC INTERACTIVE CHART -->
                            <div class="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm text-left flex flex-col gap-3">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-1.5">
                                        <span class="material-symbols-outlined text-indigo-500 text-[18px]">bar_chart</span>
                                        <h3 class="font-bold text-xs text-slate-800 font-heading">Динамика выручки</h3>
                                    </div>
                                    <!-- Interval buttons -->
                                    <div class="flex gap-0.5 p-0.5 bg-slate-100 rounded-lg border border-slate-200/50">
                                        <button type="button" @click="chartInterval = 'day'" 
                                            class="px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border-none outline-none"
                                            :class="chartInterval === 'day' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800 bg-transparent'">Дни</button>
                                        <button type="button" @click="chartInterval = 'week'" 
                                            class="px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border-none outline-none"
                                            :class="chartInterval === 'week' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800 bg-transparent'">Недели</button>
                                        <button type="button" @click="chartInterval = 'month'" 
                                            class="px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border-none outline-none"
                                            :class="chartInterval === 'month' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800 bg-transparent'">Месяцы</button>
                                        <button type="button" @click="chartInterval = 'year'" 
                                            class="px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border-none outline-none"
                                            :class="chartInterval === 'year' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800 bg-transparent'">Годы</button>
                                    </div>
                                </div>

                                <!-- SVG Bar Chart -->
                                <div class="relative py-1 select-none">
                                    <svg viewBox="0 0 360 140" class="w-full h-auto overflow-visible">
                                        <!-- Definitions for gradients -->
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stop-color="#6366f1" />
                                                <stop offset="100%" stop-color="#4f46e5" />
                                            </linearGradient>
                                            <linearGradient id="hoverGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stop-color="#818cf8" />
                                                <stop offset="100%" stop-color="#6366f1" />
                                            </linearGradient>
                                        </defs>

                                        <!-- Background Horizontal Grid lines -->
                                        <line x1="30" y1="20" x2="350" y2="20" stroke="#f8fafc" stroke-width="1" />
                                        <line x1="30" y1="55" x2="350" y2="55" stroke="#f8fafc" stroke-width="1" />
                                        <line x1="30" y1="90" x2="350" y2="90" stroke="#f8fafc" stroke-width="1" />
                                        <line x1="30" y1="110" x2="350" y2="110" stroke="#cbd5e1" stroke-width="1.5" />

                                        <!-- Bars & Labels -->
                                        <g v-for="(item, idx) in dashboardChartData" :key="idx">
                                            <!-- Draw dynamic bar -->
                                            <rect 
                                                :x="35 + idx * (310 / Math.max(dashboardChartData.length, 1)) + ((310 / Math.max(dashboardChartData.length, 1)) - Math.min(24, Math.floor(180 / Math.max(dashboardChartData.length, 1)))) / 2" 
                                                :y="110 - (Math.max(...dashboardChartData.map(d => d.amount), 1000) > 0 ? (item.amount / Math.max(...dashboardChartData.map(d => d.amount), 1000)) * 85 : 0)" 
                                                :width="Math.min(24, Math.floor(180 / Math.max(dashboardChartData.length, 1)))" 
                                                :height="Math.max(...dashboardChartData.map(d => d.amount), 1000) > 0 ? (item.amount / Math.max(...dashboardChartData.map(d => d.amount), 1000)) * 85 : 0" 
                                                :fill="hoveredBarIndex === idx ? 'url(#hoverGradient)' : 'url(#barGradient)'"
                                                rx="4" 
                                                ry="4"
                                                class="transition-all duration-300 cursor-pointer"
                                                @mouseenter="hoveredBarIndex = idx"
                                                @mouseleave="hoveredBarIndex = null"
                                            />
                                            
                                            <!-- Tick marker context -->
                                            <text 
                                                :x="35 + idx * (310 / Math.max(dashboardChartData.length, 1)) + (310 / Math.max(dashboardChartData.length, 1)) / 2" 
                                                y="126" 
                                                text-anchor="middle" 
                                                class="text-slate-400 font-bold text-[8px] uppercase tracking-wide fill-current font-sans"
                                            >
                                                {{ item.label }}
                                            </text>
                                        </g>

                                        <!-- Y Axis tick values for visualization -->
                                        <text x="5" y="24" class="text-slate-400 font-bold text-[7px] fill-current font-sans">
                                            {{ Math.max(...dashboardChartData.map(d => d.amount), 1000).toLocaleString() }}
                                        </text>
                                        <text x="5" y="65" class="text-slate-400 font-bold text-[7px] fill-current font-sans">
                                            {{ Math.round(Math.max(...dashboardChartData.map(d => d.amount), 1000) / 2).toLocaleString() }}
                                        </text>
                                        <text x="5" y="113" class="text-slate-400 font-bold text-[7px] fill-current font-sans">0</text>
                                    </svg>
                                </div>

                                <!-- Summary bar on hover -->
                                <div class="flex items-center justify-between text-slate-500 text-[10px] font-bold bg-slate-50/70 rounded-xl px-2.5 py-1.5 border border-slate-100">
                                    <span v-if="hoveredBarIndex === null" class="flex items-center gap-1 text-slate-400 font-sans text-[9px]">
                                        <i class="bi bi-info-circle"></i> Наведите на столбец или коснитесь
                                    </span>
                                    <span v-else class="flex items-center justify-between w-full font-sans">
                                        <span class="text-indigo-600 font-black uppercase text-[9px]">{{ dashboardChartData[hoveredBarIndex].label }}:</span>
                                        <span class="flex gap-2 text-slate-600">
                                            <span>Выручка: <strong class="text-slate-800 font-bold text-[11px]">{{ dashboardChartData[hoveredBarIndex].amount.toLocaleString() }} KGS</strong></span>
                                            <span>Заказов: <strong class="text-slate-800 font-bold text-[11px]">{{ dashboardChartData[hoveredBarIndex].count }}</strong></span>
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <!-- Mechanic Leaderboard (Compact) -->
                            <div class="bg-white rounded-2xl p-3.5 border border-slate-150 shadow-sm text-left" id="dash-leader-masters">
                                <div class="flex items-center gap-1.5 mb-3">
                                    <span class="material-symbols-outlined text-indigo-500 text-[18px]">engineering</span>
                                    <h3 class="font-bold text-xs text-slate-800 font-heading">Рейтинг мастеров</h3>
                                </div>
                                <div class="space-y-2">
                                    <div v-for="(stat, master, idx) in dashMasterStats" :key="master" class="flex justify-between items-center p-2 rounded-xl border border-slate-100 transition-all hover:bg-slate-50/50 bg-white" :class="idx === 0 ? 'bg-indigo-50/20 border-indigo-100/50' : ''">
                                        <div class="flex items-center gap-2 max-w-[65%]">
                                            <div class="w-6.5 h-6.5 rounded-lg flex items-center justify-center font-black text-[9px] uppercase shrink-0" 
                                                :class="idx === 0 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'">
                                                {{ typeof master === 'string' && master.length > 0 ? master.slice(0, 2) : 'М' }}
                                            </div>
                                            <span class="font-bold text-xs text-slate-700 truncate">{{ master }}</span>
                                        </div>
                                        <div class="flex flex-col items-end shrink-0">
                                            <span class="font-extrabold text-xs text-slate-800">{{ stat.sum.toLocaleString() }} KGS</span>
                                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{{ stat.count }} зак.</span>
                                        </div>
                                    </div>
                                    <div v-if="Object.keys(dashMasterStats).length === 0" class="text-center py-4 bg-slate-50/50 rounded-xl">
                                        <p class="text-slate-400 text-[10px] font-semibold m-0">Нет данных для отображения</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Services Leaderboard (Compact) -->
                            <div class="bg-white rounded-2xl p-3.5 border border-slate-150 shadow-sm text-left" id="dash-leader-services">
                                <div class="flex items-center gap-1.5 mb-3">
                                    <span class="material-symbols-outlined text-indigo-500 text-[18px]">build</span>
                                    <h3 class="font-bold text-xs text-slate-800 font-heading">Популярные услуги</h3>
                                </div>
                                <div class="space-y-2">
                                    <div v-for="(stat, service, idx) in dashServiceStats" :key="service" class="flex justify-between items-center p-2 rounded-xl border border-slate-100 transition-all hover:bg-slate-50/50 bg-white" :class="idx === 0 ? 'bg-indigo-50/20 border-indigo-100/50' : ''">
                                        <div class="flex items-center gap-2 max-w-[65%]">
                                            <div class="w-6.5 h-6.5 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 shrink-0">
                                                <span class="material-symbols-outlined text-[13px]">build</span>
                                            </div>
                                            <span class="font-bold text-xs text-slate-700 truncate" :title="service">{{ service }}</span>
                                        </div>
                                        <div class="flex flex-col items-end shrink-0">
                                            <span class="font-extrabold text-xs text-slate-800">{{ stat.sum.toLocaleString() }} KGS</span>
                                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{{ stat.count }} раз</span>
                                        </div>
                                    </div>
                                    <div v-if="Object.keys(dashServiceStats).length === 0" class="text-center py-4 bg-slate-50/50 rounded-xl">
                                        <p class="text-slate-400 text-[10px] font-semibold m-0">Нет данных для отображения</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Brands Leaderboard (Compact) -->
                            <div class="bg-white rounded-2xl p-3.5 border border-slate-150 shadow-sm text-left" id="dash-leader-brands">
                                <div class="flex items-center gap-1.5 mb-3">
                                    <span class="material-symbols-outlined text-indigo-500 text-[18px]">directions_car</span>
                                    <h3 class="font-bold text-xs text-slate-800 font-heading">Популярные марки авто</h3>
                                </div>
                                <div class="space-y-2">
                                    <div v-for="(stat, brand, idx) in dashBrandStats" :key="brand" class="flex justify-between items-center p-2 rounded-xl border border-slate-100 transition-all hover:bg-slate-50/50 bg-white" :class="idx === 0 ? 'bg-indigo-50/20 border-indigo-100/50' : ''">
                                        <div class="flex items-center gap-2 max-w-[65%]">
                                            <div class="w-6.5 h-6.5 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 shrink-0">
                                                <span class="material-symbols-outlined text-[13px]">directions_car</span>
                                            </div>
                                            <span class="font-bold text-xs text-slate-700 truncate">{{ brand }}</span>
                                        </div>
                                        <div class="flex flex-col items-end shrink-0">
                                            <span class="font-extrabold text-xs text-slate-800">{{ stat.sum.toLocaleString() }} KGS</span>
                                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{{ stat.count }} авто</span>
                                        </div>
                                    </div>
                                    <div v-if="Object.keys(dashBrandStats).length === 0" class="text-center py-4 bg-slate-50/50 rounded-xl">
                                        <p class="text-slate-400 text-[10px] font-semibold m-0">Нет данных для отображения</p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <!-- СПРАВОЧНИКИ -->
                        <div v-if="activeTab === 'refs' && user.Role !== 'Master'" class="space-y-6 max-w-md mx-auto w-full pb-20">
                            
                            <!-- Grid view -->
                            <div v-if="refTab === 'grid'" class="fade-transition">
                                <h1 class="text-2xl font-bold tracking-tight text-center mb-6 font-heading text-slate-800">Справочники</h1>
                                <div class="grid grid-cols-2 gap-4">
                                    <div v-for="(meta, key) in refMeta" :key="key" @click="refTab = key"
                                        class="bg-surface rounded-2xl p-5 shadow-soft border border-border-subtle/50 cursor-pointer flex flex-col items-center justify-center gap-3 text-center active:scale-95 transition-transform hover:shadow-md">
                                        <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <span class="material-symbols-outlined text-2xl font-medium">{{ meta.icon }}</span>
                                        </div>
                                        <div>
                                            <div class="font-bold text-text-main text-[16px] font-heading">{{ meta.title }}</div>
                                            <div class="text-[11px] text-muted font-medium mt-0.5">{{ db[key] ? db[key].length : 0 }} записей</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-8">
                                    <h2 class="font-bold text-lg mb-3 text-text-main font-heading">Управление данными</h2>
                                    <div class="bg-surface rounded-2xl p-5 shadow-soft border border-border-subtle/50 text-sm text-text-main leading-relaxed">
                                        Справочники позволяют быстро заполнять карточки обслуживания. Добавьте свои услуги, мастеров и марки автомобилей для автоматизации работы сервиса.
                                    </div>
                                </div>
                            </div>
                            
                            <!-- List View -->
                            <div v-else class="fade-transition space-y-4">
                                <div class="flex items-center justify-between mb-2">
                                    <button @click="refTab = 'grid'" class="p-2 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors -ml-2">
                                        <span class="material-symbols-outlined text-text-muted">arrow_back</span>
                                    </button>
                                    <h5 class="m-0 font-bold text-text-main text-lg font-heading">{{ refMeta[refTab].title }}</h5>
                                    <!-- add button for reference -->
                                    <button @click="openRefModal(-1)" class="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                        <span class="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                                
                                <div class="bg-surface border border-border-subtle/50 rounded-2xl shadow-soft flex flex-col overflow-hidden">
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-left border-collapse table-auto">
                                            <thead class="bg-slate-50 border-b border-border-subtle/50">
                                                <tr>
                                                    <th v-for="f in refMeta[refTab].fields" :key="f.k" class="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{{ f.l }}</th>
                                                    <th class="px-4 py-2 w-16"></th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-slate-100">
                                                <tr v-for="item in db[refTab]" :key="item.ID" class="hover:bg-slate-50 group cursor-pointer" @click="openRefModal(item)">
                                                    <td v-for="f in refMeta[refTab].fields" class="px-4 py-2 text-sm font-medium text-slate-800 shrink-0">
                                                        <span v-if="f.t === 'number'">{{ Number(item[f.k]).toLocaleString() }}</span>
                                                        <span v-else-if="f.t === 'selectBrand'">{{ getBrandName(item[f.k]) }}</span>
                                                        <span v-else>{{ item[f.k] }}</span>
                                                    </td>
                                                    <td class="px-4 py-2 text-right shrink-0" @click.stop>
                                                        <button class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" @click="delRow(refMeta[refTab].sheet, item.ID)">
                                                            <i class="bi bi-trash-fill text-sm"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                                <tr v-if="db[refTab] && db[refTab].length === 0">
                                                    <td :colspan="refMeta[refTab].fields.length + 1" class="px-4 py-6 text-center text-slate-400 font-medium text-sm">Нет записей</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- FAB -->
                            <button v-if="refTab !== 'grid'" @click="openRefModal(-1)" class="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-fab hover:bg-indigo-700 active:scale-95 transition-all z-20 md:bottom-12 md:right-12">
                                <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'wght' 600;">add</span>
                            </button>
                        </div>

                        <!-- ПОЛЬЗОВАТЕЛИ (СуперАдмин) -->
                        <div v-if="activeTab === 'users' && user.Role === 'Superadmin'" class="space-y-4">
                            <h2 class="text-xl font-bold tracking-tight text-slate-800 mb-4 px-2">Персонал и Доступ</h2>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <article v-for="u in db.users" :key="u.ID" class="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 hover: shadow-md transition flex flex-col gap-3">
                                    <div class="flex justify-between items-start">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm tracking-tighter shrink-0 border border-slate-200">
                                                {{ u.Name ? u.Name.slice(0,2).toUpperCase() : u.Username.slice(0,2).toUpperCase() }}
                                            </div>
                                            <div>
                                                <h3 class="font-bold text-[15px] text-slate-800 m-0">{{ u.Name || u.Username }}</h3>
                                                <p class="text-xs font-semibold text-slate-500 m-0">@{{ u.Username }}</p>
                                            </div>
                                        </div>
                                        <span class="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border" :class="u.Status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'">{{u.Status}}</span>
                                    </div>
                                    
                                    <div class="grid grid-cols-2 gap-2 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div class="flex flex-col gap-0.5">
                                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Роль</span>
                                            <span class="text-xs font-bold text-slate-700">{{ u.Role === 'Superadmin' ? 'Супер-админ' : u.Role === 'SenMaster' ? 'Ст. мастер' : 'Мастер' }}</span>
                                        </div>
                                        <div class="flex flex-col gap-0.5">
                                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Телефон</span>
                                            <a v-if="u.Phone" :href="'tel:' + u.Phone" class="text-xs font-bold text-indigo-600 hover:underline">{{u.Phone}}</a>
                                            <span v-else class="text-xs font-bold text-slate-400">—</span>
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center gap-2 mt-auto pt-2">
                                        <button v-if="u.Status === 'Pending'" @click="approveUser(u.ID)" class="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-[13px] font-bold hover:bg-emerald-700 transition shadow-sm">Одобрить</button>
                                        <button @click="openUserConfigModal(u)" class="flex-1 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-[13px] font-bold transition">Настроить</button>
                                    </div>
                                </article>
                                <div v-if="!db.users || db.users.length === 0" class="col-span-full py-10 text-center text-slate-500 font-medium">Нет сотрудников</div>
                            </div>
                        </div>

                        <!-- Профиль удален отсюда, перемещен в модальное окно -->

                    </div>
                    
                    <!-- App Preloader -->
                    <div v-else class="flex flex-col justify-center items-center h-full min-h-[50vh]">
                        <div class="spinner-border text-indigo-600 mb-4 border-4" style="width: 3rem; height: 3rem;" role="status"></div>
                        <span class="text-slate-500 font-bold tracking-wider text-sm uppercase">Синхронизация данных...</span>
                    </div>
                </div>

                <!-- Mobile Bottom Navigation Bar -->
                <nav class="md:hidden fixed bottom-4.5 left-4.5 right-4.5 flex gap-1 rounded-2xl shadow-[0_12px_24px_-4px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.03)] border border-slate-200/50 bg-white/70 backdrop-blur-md p-1.5 z-30 select-none">
                    <button @click="activeTab='dashboard'" class="flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 cursor-pointer border-none outline-none" :class="activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600 bg-transparent'">
                        <div class="flex h-6 items-center justify-center">
                            <span class="material-symbols-outlined text-[19px]" :style="activeTab === 'dashboard' ? 'font-variation-settings: \'FILL\' 1;' : ''">monitoring</span>
                        </div>
                        <span class="text-[9px] font-bold tracking-wider uppercase leading-none mt-1">Аналитика</span>
                    </button>
                    <button @click="activeTab='records'" class="flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 cursor-pointer border-none outline-none" :class="activeTab === 'records' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600 bg-transparent'">
                        <div class="flex h-6 items-center justify-center">
                            <span class="material-symbols-outlined text-[19px]" :style="activeTab === 'records' ? 'font-variation-settings: \'FILL\' 1;' : ''">list_alt</span>
                        </div>
                        <span class="text-[9px] font-bold tracking-wider uppercase leading-none mt-1">Записи</span>
                    </button>
                    <button v-if="user.Role !== 'Master'" @click="activeTab='refs'; refTab='services'" class="flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 cursor-pointer border-none outline-none" :class="activeTab === 'refs' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600 bg-transparent'">
                        <div class="flex h-6 items-center justify-center">
                            <span class="material-symbols-outlined text-[19px]" :style="activeTab === 'refs' ? 'font-variation-settings: \'FILL\' 1;' : ''">menu_book</span>
                        </div>
                        <span class="text-[9px] font-bold tracking-wider uppercase leading-none mt-1">База</span>
                    </button>
                    <button v-if="user && user.Role === 'Superadmin'" @click="activeTab='users'" class="flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 cursor-pointer border-none outline-none" :class="activeTab === 'users' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600 bg-transparent'">
                        <div class="flex h-6 items-center justify-center">
                            <span class="material-symbols-outlined text-[19px]" :style="activeTab === 'users' ? 'font-variation-settings: \'FILL\' 1;' : ''">groups</span>
                        </div>
                        <span class="text-[9px] font-bold tracking-wider uppercase leading-none mt-1">Штат</span>
                    </button>
                </nav>
            </main>

            <!-- ======================= -->
            <!-- PROFILE MODAL -->
            <!-- ======================= -->
            <div class="modal fade" id="profileModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modal-md">
                    <div class="modal-content rounded-3xl border-0 shadow-2xl font-sans overflow-hidden">
                        <div class="modal-header border-b border-slate-100 px-6 py-5 bg-white">
                            <h5 class="modal-title font-bold text-slate-800 m-0">Мой профиль</h5>
                            <button type="button" class="btn-close text-slate-400 focus:ring-0" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body bg-slate-50 p-6 space-y-4">
                            <!-- View mode -->
                            <div v-if="!isEditingProfile" class="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm relative">
                                <button @click="isEditingProfile = true" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Редактировать">
                                    <i class="bi bi-pencil-square text-lg"></i>
                                </button>
                                
                                <div class="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-inner">
                                    {{ user.Username ? user.Username.slice(0,2).toUpperCase() : '?' }}
                                </div>
                                <h3 class="font-bold text-xl text-slate-800 mb-1">{{ user.Name || user.Username }}</h3>
                                <p class="text-sm font-semibold text-slate-500 mb-4">@{{ user.Username }}</p>
                                
                                <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg mb-2">
                                    <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">{{ user.Role === 'Superadmin' ? 'Супер-админ' : user.Role === 'SenMaster' ? 'Ст. мастер' : 'Мастер' }}</span>
                                </div>
                                
                                <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-700" v-if="user.Phone">
                                    <i class="bi bi-telephone text-indigo-500"></i>
                                    <span class="text-sm font-bold">{{ user.Phone }}</span>
                                </div>
                                
                                <div class="w-full h-px bg-slate-100 my-4"></div>
                                <button @click="logout" class="flex items-center justify-center gap-2 w-full py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-bold transition">
                                    <i class="bi bi-box-arrow-right"></i> Выйти из аккаунта
                                </button>
                            </div>
                            
                            <!-- Edit mode -->
                            <div v-else class="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative">
                                <button @click="isEditingProfile = false" class="absolute top-3 left-3 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition" title="Отмена">
                                    <span class="material-symbols-outlined text-sm">arrow_back</span>
                                </button>
                                <h4 class="font-bold text-slate-800 m-0 text-center mb-4">Редактирование</h4>
                                
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Роль доступа (не редактируется)</label>
                                    <input :value="user.Role === 'Superadmin' ? 'Супер-админ' : user.Role === 'SenMaster' ? 'Ст. мастер' : 'Мастер'" disabled class="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-sm text-slate-500 cursor-not-allowed">
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">ФИО / Полное имя</label>
                                    <input v-model="profileForm.Name" type="text" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 outline-none focus:border-indigo-500 shadow-sm transition" placeholder="Иван Иванов">
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Номер телефона</label>
                                    <input v-model="profileForm.Phone" type="tel" @input="formatPhoneInput('profileForm', 'Phone')" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 outline-none focus:border-indigo-500 shadow-sm transition" placeholder="+996 XXX XXX XXX">
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Имя пользователя / Логин</label>
                                    <input v-model="profileForm.username" type="text" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 outline-none focus:border-indigo-500 shadow-sm transition">
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Новый пароль</label>
                                    <input v-model="profileForm.password" type="password" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-sm text-slate-800 outline-none focus:border-indigo-500 shadow-sm transition" placeholder="Введите новый пароль для изменения">
                                </div>
                                <button @click="saveUserProfile" :disabled="isSavingProfile" class="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-md mt-6">
                                    <span v-if="isSavingProfile" class="spinner-border spinner-border-sm"></span><span>Сохранить настройки</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ======================= -->
            <!-- RECORD MODAL -->
            <!-- ======================= -->
            <div class="modal fade" id="recordModal" tabindex="-1">
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
                                                    {{ new Date(recordForm.StartTime_LOCAL).toLocaleString('ru-RU', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'}) }}
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
                                                <button @click="recordForm.IsPaid = !recordForm.IsPaid; saveRecord()" class="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] uppercase rounded-xl border border-slate-200 transition cursor-pointer inline-flex items-center gap-1.5 leading-none select-none">
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
                                                    <input ref="clientNameInput" v-model="recordForm.ClientName" class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 placeholder-slate-405 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" placeholder="Иван Иванов">
                                                </div>
                                                <div class="flex flex-col">
                                                    <label class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider">Телефон <span class="text-red-500">*</span></label>
                                                    <input v-model="recordForm.Phone" @input="formatPhoneInput('recordForm', 'Phone')" type="tel" inputmode="numeric" class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 placeholder-slate-405 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" placeholder="+996 (700) 123-456">
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
                                                    <div class="grid grid-cols-2 gap-2">
                                                        <div class="flex flex-col">
                                                            <span class="text-[9px] text-slate-400 font-bold mb-1 ml-1 uppercase tracking-wider">Страна</span>
                                                            <input ref="carCountryInput" v-model="recordForm.CarCountry" @input="onCarCountryInput" maxlength="3" class="w-full h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none uppercase text-center" placeholder="KG">
                                                        </div>
                                                        <div v-if="recordForm.CarCountry && recordForm.CarCountry.toUpperCase() === 'KG'" class="flex flex-col">
                                                            <span class="text-[9px] text-slate-400 font-bold mb-1 ml-1 uppercase tracking-wider">Регион</span>
                                                            <input ref="carRegionInput" v-model="recordForm.CarRegion" @input="updateCarNumber" maxlength="2" inputmode="numeric" class="w-full h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none uppercase text-center" placeholder="01">
                                                        </div>
                                                    </div>
                                                    <div v-if="recordForm.CarCountry && recordForm.CarCountry.toUpperCase() === 'KG'" class="flex flex-col">
                                                        <span class="text-[9px] text-slate-400 font-bold mb-1 ml-1 uppercase tracking-wider">Номер автомобиля</span>
                                                        <input ref="carNumberMainInput" v-model="recordForm.CarNumberMain" @input="updateCarNumber" maxlength="7" class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none uppercase tracking-wider text-center" placeholder="123 ABC">
                                                    </div>
                                                    <div v-else class="flex flex-col">
                                                        <span class="text-[9px] text-slate-400 font-bold mb-1 ml-1 uppercase tracking-wider">Полный иностранный госномер</span>
                                                        <input v-model="recordForm.CarNumber" class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none uppercase tracking-wider text-center" placeholder="A777AA77">
                                                    </div>
                                                </div>

                                                <div class="flex flex-col relative">
                                                    <label class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider">Марка <span class="text-red-500">*</span></label>
                                                    <select v-model="recordForm.BrandID" class="form-select w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" @change="recordForm.ModelID=''; $nextTick(() => { if($refs.modelInput) $refs.modelInput.focus() })">
                                                        <option value="">Не выбрано</option>
                                                        <option v-for="b in db.brands" :key="b.ID" :value="b.ID">{{b.Name}}</option>
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
                                                <span class="flex items-center gap-2"><i class="bi bi-tools text-indigo-600"></i> Услуги и Работы <span class="text-red-500">*</span></span>
                                                <span class="text-[10px] text-slate-400 font-extrabold" v-if="recordForm.ServicesJSON.length">{{ recordForm.ServicesJSON.length }} усл.</span>
                                            </h3>
                                            
                                            <div class="space-y-1 mb-3 max-h-[120px] overflow-y-auto pr-1 flex-1">
                                                <div v-for="sid in recordForm.ServicesJSON" :key="sid" class="flex items-center justify-between px-2 py-1 rounded-lg border border-slate-100 bg-slate-50/50">
                                                    <span class="text-xs font-bold text-slate-700 truncate pr-2">{{ getServiceName(sid) }}</span>
                                                    <div class="flex items-center gap-1.5 shrink-0">
                                                        <span class="text-xs font-extrabold text-slate-800">{{ Number(getServicePrice(sid)).toLocaleString() }} KGS</span>
                                                        <button type="button" @click="toggleService(sid)" class="text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center w-6 h-6 rounded-full hover:bg-red-50" title="Удалить">
                                                            <i class="bi bi-trash text-xs"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div v-if="recordForm.ServicesJSON.length === 0" class="text-center py-4 bg-slate-50/55 rounded-xl border border-slate-100/70 text-slate-400 text-[11px] font-bold italic">
                                                    Список услуг пока пуст
                                                </div>
                                            </div>
                                            
                                            <button type="button" @click="showServiceSelector = true" class="w-full h-8.5 flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-indigo-150 text-indigo-600 font-bold text-xs hover:bg-indigo-50/40 transition-colors cursor-pointer mt-1 select-none">
                                                <i class="bi bi-plus-lg"></i> Выбрать услуги
                                            </button>
                                        </section>

                                        <!-- Status, Master & Time Section -->
                                        <section class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3 shrink-0">
                                            <h3 class="text-slate-800 text-[12px] font-bold mb-1 flex items-center gap-2 uppercase tracking-wider select-none">
                                                <i class="bi bi-person-gear text-indigo-600"></i> Исполнитель и Статус
                                            </h3>
                                            
                                            <div class="grid grid-cols-2 gap-2.5">
                                                <div class="flex flex-col relative col-span-1">
                                                    <label class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider">Мастер <span class="text-red-500">*</span></label>
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
                                                            class="flex-1 h-full rounded-lg text-[9.5px] font-extrabold uppercase tracking-widest transition-all cursor-pointer border-0 flex items-center justify-center gap-0.5 shrink-0"
                                                            :class="recordForm.IsPaid ? 'bg-emerald-600 text-white shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-800'">
                                                            <span class="material-symbols-outlined text-[13px] font-black">check_circle</span> <span>Да</span>
                                                        </button>
                                                        <button type="button" @click="recordForm.IsPaid = false" 
                                                            class="flex-1 h-full rounded-lg text-[9.5px] font-extrabold uppercase tracking-widest transition-all cursor-pointer border-0 flex items-center justify-center gap-0.5 shrink-0"
                                                            :class="!recordForm.IsPaid ? 'bg-rose-600 text-white shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-800'">
                                                            <span class="material-symbols-outlined text-[13px] font-black">cancel</span> <span>Нет</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="flex flex-col">
                                                <label class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider">Комментарий</label>
                                                <textarea ref="commentInput" v-model="recordForm.Comment" class="w-full min-h-[50px] px-2.5 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold text-slate-700 resize-y" rows="2" placeholder="Дополнительная информация или заметки к ремонту..."></textarea>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </template>
                        </div>
                        
                        <!-- Sticky Bottom Bar -->
                        <div v-show="isEditingRecord" class="bg-white border-t border-slate-200 px-4 py-3 md:px-5 shrink-0 flex justify-between items-center gap-3">
                            <div class="flex items-center gap-1.5 px-0.5">
                                <span class="text-slate-500 font-bold text-[10px] uppercase tracking-wider hidden sm:inline">Итого к оплате:</span>
                                <span class="text-lg font-black text-indigo-600">{{ Number(recordForm.TotalAmount).toLocaleString() }} <span class="text-[10px] text-slate-400 font-extrabold">KGS</span></span>
                            </div>
                            <div class="flex gap-2">
                                <button type="button" class="hidden md:flex h-9.5 px-4 items-center border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-xs transition cursor-pointer" data-bs-dismiss="modal">Отмена</button>
                                <button type="button" @click="saveRecord" :disabled="isSaving" class="h-9.5 px-5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer">
                                    <span v-if="isSaving" class="spinner-border spinner-border-sm"></span>Сохранить
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
                                <button type="button" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200" @click="closeServiceSelector()">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <div class="p-4 border-b border-slate-50 bg-slate-50/50">
                                <div class="relative">
                                    <i class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                    <input v-model="serviceSearch" class="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-[14px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400" placeholder="Поиск услуги...">
                                </div>
                            </div>
                            <div class="overflow-y-auto flex-1 p-3 space-y-2 pb-8">
                                <button v-for="srv in filteredServices" :key="srv.ID" @click="toggleService(srv.ID)" class="w-full flex items-center justify-between p-4 rounded-xl transition-colors text-left border" :class="recordForm.ServicesJSON.includes(srv.ID) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:bg-slate-50'">
                                    <div class="flex items-center gap-3">
                                        <div class="w-5 h-5 rounded border flex items-center justify-center" :class="recordForm.ServicesJSON.includes(srv.ID) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'">
                                            <i v-if="recordForm.ServicesJSON.includes(srv.ID)" class="bi bi-check text-sm font-bold"></i>
                                        </div>
                                        <span class="text-slate-800 font-bold text-[14px]" :class="{'text-indigo-900': recordForm.ServicesJSON.includes(srv.ID)}">{{ srv.Name }}</span>
                                    </div>
                                    <span class="text-slate-500 font-bold text-[13px]">{{ Number(srv.Price).toLocaleString() }} KGS</span>
                                </button>
                                <div v-if="filteredServices.length === 0" class="text-center p-6 text-slate-400 font-medium text-sm">
                                    Услуги не найдены
                                </div>
                            </div>
                            <div class="p-4 border-t border-slate-100 bg-white">
                                <button type="button" @click="closeServiceSelector()" class="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold text-[15px] hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                                    Готово
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ======================= -->
            <!-- USER CONFIG MODAL (ADMIN) -->
            <!-- ======================= -->
            <div class="modal fade" id="userConfigModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content rounded-3xl border-0 shadow-2xl font-sans overflow-hidden">
                        <div class="modal-header border-b border-slate-100 px-6 py-5 bg-white">
                            <h5 class="modal-title font-bold text-slate-800 m-0">Настройка доступа</h5>
                            <button type="button" class="btn-close text-slate-400 focus:ring-0" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body bg-slate-50/50 p-6 space-y-4">
                            <div>
                                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Роль пользователя</label>
                                <select v-model="userConfigForm.Role" class="form-select w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500">
                                    <option value="Master">Мастер</option>
                                    <option value="SenMaster">Старший мастер</option>
                                    <option value="Superadmin">Супер-администратор</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">ФИО / Полное имя</label>
                                <input type="text" v-model="userConfigForm.Name" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 shadow-sm focus:border-indigo-500">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Номер телефона</label>
                                <input type="tel" v-model="userConfigForm.Phone" @input="formatPhoneInput('userConfigForm', 'Phone')" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 shadow-sm focus:border-indigo-500">
                            </div>
                        </div>
                        <div class="modal-footer border-t border-slate-100 px-6 py-5 bg-white flex gap-3">
                            <button type="button" class="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-sm transition" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="flex-1 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2" @click="saveUserConfig" :disabled="isSavingUserConfig">
                                <span v-if="isSavingUserConfig" class="spinner-border spinner-border-sm"></span>Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ======================= -->
            <!-- REF MODAL -->
            <!-- ======================= -->
            <div class="modal fade" id="refModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content rounded-3xl border-0 shadow-2xl font-sans overflow-hidden">
                        <div class="modal-header border-b border-slate-100 px-6 py-5 bg-white">
                            <h5 class="modal-title font-bold text-slate-800 m-0">{{ refForm.ID ? 'Редактировать:' : 'Добавить:' }} {{ refMeta[refTab] ? refMeta[refTab].title : '' }}</h5>
                            <button type="button" class="btn-close text-slate-400 focus:ring-0" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body bg-slate-50/50 p-6 space-y-4" v-if="refMeta[refTab]">
                            <div v-for="f in refMeta[refTab].fields" :key="f.k">
                                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{{ f.l }}</label>
                                <select v-if="f.t === 'selectBrand'" v-model="refForm[f.k]" class="form-select w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 shadow-sm">
                                    <option v-for="b in db.brands" :key="b.ID" :value="b.ID">{{b.Name}}</option>
                                </select>
                                <input v-else :type="f.t==='number'?'number':'text'" v-model="refForm[f.k]" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 shadow-sm">
                            </div>
                        </div>
                        <div class="modal-footer border-t border-slate-100 px-6 py-5 bg-white flex gap-3">
                            <button type="button" class="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-sm transition" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="flex-1 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2" @click="saveRef" :disabled="isSaving">
                                <span v-if="isSaving" class="spinner-border spinner-border-sm"></span>
                                <span>{{ refForm.ID ? 'Обновить' : 'Добавить' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>



        </div>


</template>
<script>
        

        
        const GAS_URL = 'https://script.google.com/macros/s/AKfycbwohflNTW3z1cknnf80XAEhmavcITwdt9PYSUEq6EJP-2EmsxHiRBNvcUSGJ_i-cu-4/exec';

        const runGS = async (func, ...args) => {
            const payload = { action: func };
            if (func === 'loginUser') {
               payload.username = args[0];
               payload.password = args[1];
            } else if (func === 'registerUser') {
               payload.username = args[0];
               payload.password = args[1];
               payload.name = args[2];
               payload.phone = args[3];
            } else if (func === 'approveUser') {
               payload.userId = args[0];
               payload.data = args[1];
            } else if (func === 'getUsernames') {
               // none
            } else if (func === 'updateUserProfile') {
               payload.userId = args[0];
               payload.username = args[1];
               payload.password = args[2];
               payload.name = args[3];
               payload.phone = args[4];
            } else if (func === 'getInitData') {
               payload.role = args[0];
               payload.userId = args[1];
            } else if (func === 'addRow') {
               payload.sheetName = args[0];
               payload.obj = args[1];
            } else if (func === 'updateRecord') {
               payload.obj = args[0];
            } else if (func === 'updateRow') {
               payload.sheetName = args[0];
               payload.obj = args[1];
            } else if (func === 'deleteRow') {
               payload.sheetName = args[0];
               payload.id = args[1];
               payload.role = args[2];
               payload.userId = args[3];
            }

            try {
                const response = await fetch(GAS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(payload)
                });
                const responseData = await response.json();
                if (responseData.success) {
                    return responseData.result;
                } else {
                    throw new Error(responseData.error);
                }
            } catch (error) {
                console.error('GAS Fetch Error:', error);
                throw error;
            }
        };
export default {
            data() {
                return {
                    user: null, 
                    authMode: 'login',
                    authForm: { username: '', password: '', name: '', phone: '+996 ' },
                    authLoading: false,
                    initError: null,
                    toasts: [],

                    activeTab: 'records',
                    refTab: 'grid',
                    loading: true,
                    isSaving: false,
                    searchQuery: '',
                    isSearchExpanded: false,
                    isFiltersExpanded: false,
                    activeStatuses: ['Открыт', 'Выполнен', 'Отменён'],
                    advFilterMaster: '',
                    advFilterService: '',
                    advFilterDate: '',
                    advFilterBrand: '',
                    advFilterModel: '',
                    
                    userConfigForm: {ID: '', Role: '', Name: '', Phone: ''},
                    isSavingUserConfig: false,

                    profileForm: {username: '', password: '', Name: '', Phone: ''},
                    isEditingProfile: false,
                    isSavingProfile: false,
                    isSyncing: false,
                    syncQueue: [],

                    db: { records: [], services: [], brands: [], models: [], users: [] },
                    
                    isEditingRecord: false,
                    recordForm: this.emptyRecord(),
                    refForm: {},
                    dashboardPeriod: 'all',
                    dashFilterMaster: '',
                    dashFilterService: '',
                    dashFilterDate: '',
                    isDashFiltersExpanded: false,
                    chartInterval: 'day',
                    hoveredBarIndex: null,
                    
                    showServiceSelector: false,
                    serviceSearch: '',

                    refMeta: {
                        services: { title: 'Услуги', icon: 'build', sheet: 'Services', fields: [{k:'Name', l:'Название'}, {k:'Price', l:'Цена (KGS)', t:'number'}] },
                        brands: { title: 'Марки', icon: 'directions_car', sheet: 'Brands', fields: [{k:'Name', l:'Марка'}] },
                        models: { title: 'Модели', icon: 'list_alt', sheet: 'Models', fields: [{k:'BrandID', l:'Привязка (Марка)', t:'selectBrand'}, {k:'Name', l:'Модель'}] }
                    },
                    bsModals: {}
                }
            },
            computed: {
                isAllStatusesActive() {
                    return this.activeStatuses && this.activeStatuses.length === 3;
                },
                mastersList() {
                    return this.db.users.filter(u => u.Role !== 'Superadmin');
                },
                currentUserMasterID() {
                    return this.user ? this.user.ID : null;
                },
                filteredModelsForFilter() {
                    if (!this.advFilterBrand) return this.db.models;
                    return this.db.models.filter(m => String(m.BrandID) === String(this.advFilterBrand));
                },
                filteredRecords() {
                    let d = [...this.db.records].sort((a, b) => new Date(b.StartTime || 0) - new Date(a.StartTime || 0));
                    
                    if (this.user && this.user.Role === 'Master') {
                        let myMid = this.currentUserMasterID;
                        d = d.filter(r => r.MasterID === myMid);
                    }

                    if(this.searchQuery) {
                       let q = this.searchQuery.toLowerCase();
                       d = d.filter(r => {
                           let s = ((r.CarNumber||'') + ' ' + (r.ClientName||'')).toLowerCase();
                           return s.includes(q);
                       });
                    }
                    if (this.activeStatuses && this.activeStatuses.length > 0) {
                        d = d.filter(r => this.activeStatuses.includes(r.Status));
                    } else {
                        d = [];
                    }

                    if (this.advFilterMaster) {
                        d = d.filter(r => String(r.MasterID) === String(this.advFilterMaster));
                    }
                    if (this.advFilterBrand) {
                        d = d.filter(r => String(r.BrandID) === String(this.advFilterBrand));
                    }
                    if (this.advFilterModel) {
                        d = d.filter(r => String(r.ModelID) === String(this.advFilterModel));
                    }
                    if (this.advFilterService) {
                        d = d.filter(r => {
                            let s = typeof r.ServicesJSON === 'string' ? JSON.parse(r.ServicesJSON || '[]') : (r.ServicesJSON || []);
                            return s.includes(this.advFilterService);
                        });
                    }
                    if (this.advFilterDate) {
                        d = d.filter(r => {
                            if (!r.StartTime) return false;
                            return r.StartTime.startsWith(this.advFilterDate);
                        });
                    }

                    return d;
                },
                filteredServices() {
                    let d = this.db.services || [];
                    if (this.serviceSearch) {
                        let q = this.serviceSearch.toLowerCase();
                        d = d.filter(s => (s.Name || '').toLowerCase().includes(q));
                    }
                    return d;
                },
                availableModels() {
                    if(!this.recordForm.BrandID) return [];
                    return this.db.models.filter(m => String(m.BrandID) === String(this.recordForm.BrandID));
                },
                filteredDashRecords() {
                    if (!this.db || !this.db.records) return [];
                    let now = new Date();
                    return this.db.records.filter(r => {
                        if (r.Status !== 'Выполнен') return false;
                        if (!r.StartTime) return false;
                        
                        // Role restrictions & Master filter
                        if (this.user && this.user.Role === 'Master') {
                            if (r.MasterID !== this.currentUserMasterID) return false;
                        } else if (this.dashFilterMaster) {
                            if (String(r.MasterID) !== String(this.dashFilterMaster)) return false;
                        }

                        // Service filter
                        if (this.dashFilterService) {
                            let s = [];
                            try {
                                s = typeof r.ServicesJSON === 'string' ? JSON.parse(r.ServicesJSON || '[]') : (r.ServicesJSON || []);
                            } catch(e) { s = []; }
                            if (!s.includes(this.dashFilterService)) return false;
                        }
                        
                        // Date filter
                        if (this.dashFilterDate) {
                            if (!r.StartTime.startsWith(this.dashFilterDate)) return false;
                        } else {
                            // Period filtering
                            let d = new Date(r.StartTime);
                            if (this.dashboardPeriod === 'day') {
                                if (d.toDateString() !== now.toDateString()) return false;
                            } else if (this.dashboardPeriod === 'month') {
                                if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
                            } else if (this.dashboardPeriod === 'week') {
                                let dt = new Date(now);
                                dt.setDate(dt.getDate() - (dt.getDay() || 7) + 1); // Monday
                                dt.setHours(0,0,0,0);
                                if (d < dt) return false;
                            } else if (this.dashboardPeriod === 'custom' && this.dashboardCustomDate) {
                                let cd = new Date(this.dashboardCustomDate);
                                if (d.toDateString() !== cd.toDateString()) return false;
                            }
                        }
                        
                        return true;
                    });
                },
                dashStats() {
                    let recs = this.filteredDashRecords;
                    let sum = recs.reduce((acc, val) => acc + (Number(val.TotalAmount) || 0), 0);
                    return { count: recs.length, sum: sum };
                },
                dashMasterStats() {
                    let map = {};
                    this.filteredDashRecords.forEach(r => {
                        let m = this.getMasterName(r.MasterID) || 'Неизвестно';
                        if(!map[m]) map[m] = { count: 0, sum: 0 };
                        map[m].count++;
                        map[m].sum += (Number(r.TotalAmount) || 0);
                    });
                    let sorted = Object.entries(map).sort((a,b) => b[1].sum - a[1].sum).slice(0, 5);
                    return Object.fromEntries(sorted);
                },
                dashBrandStats() {
                    let map = {};
                    this.filteredDashRecords.forEach(r => {
                        let b = this.getBrandName(r.BrandID) || 'Неизвестно';
                        if(!map[b]) map[b] = { count: 0, sum: 0 };
                        map[b].count++;
                        map[b].sum += (Number(r.TotalAmount) || 0);
                    });
                    let sorted = Object.entries(map).sort((a,b) => b[1].count - a[1].count).slice(0, 5);
                    return Object.fromEntries(sorted);
                },
                dashServiceStats() {
                    let map = {};
                    this.filteredDashRecords.forEach(r => {
                        if (r.ServicesJSON) {
                            r.ServicesJSON.forEach(sid => {
                                let sname = this.getServiceName(sid) || 'Услуга удалена';
                                let sprice = this.getServicePrice(sid) || 0;
                                if(!map[sname]) map[sname] = { count: 0, sum: 0 };
                                map[sname].count++;
                                map[sname].sum += Number(sprice);
                            });
                        }
                    });
                    let sorted = Object.entries(map).sort((a,b) => b[1].count - a[1].count).slice(0, 5);
                    return Object.fromEntries(sorted);
                },
                dashboardChartData() {
                    if (!this.db || !this.db.records) return [];
                    let now = new Date();
                    
                    // Filter completed records matching current Master/Service filters
                    let records = this.db.records.filter(r => {
                        if (r.Status !== 'Выполнен') return false;
                        if (!r.StartTime) return false;
                        
                        // Master Filter
                        if (this.user && this.user.Role === 'Master') {
                            if (r.MasterID !== this.currentUserMasterID) return false;
                        } else if (this.dashFilterMaster) {
                            if (String(r.MasterID) !== String(this.dashFilterMaster)) return false;
                        }
                        
                        // Service Filter
                        if (this.dashFilterService) {
                            let s = [];
                            try {
                                s = typeof r.ServicesJSON === 'string' ? JSON.parse(r.ServicesJSON || '[]') : (r.ServicesJSON || []);
                            } catch(e) { s = []; }
                            if (!s.includes(this.dashFilterService)) return false;
                        }
                        
                        return true;
                    });

                    let interval = this.chartInterval || 'day';
                    
                    if (interval === 'day') {
                        // Consecutive 7 days including today
                        let list = [];
                        for (let i = 6; i >= 0; i--) {
                            let d = new Date();
                            d.setDate(now.getDate() - i);
                            let dateStr = d.toDateString();
                            
                            // Sum up TotalAmount for this day
                            let dayAmount = 0;
                            let dayCount = 0;
                            records.forEach(r => {
                                if (new Date(r.StartTime).toDateString() === dateStr) {
                                    dayAmount += (Number(r.TotalAmount) || 0);
                                    dayCount++;
                                }
                            });
                            
                            // Format label as "DD.MM"
                            let dd = String(d.getDate()).padStart(2, '0');
                            let mm = String(d.getMonth() + 1).padStart(2, '0');
                            list.push({
                                label: `${dd}.${mm}`,
                                amount: dayAmount,
                                count: dayCount
                            });
                        }
                        return list;
                        
                    } else if (interval === 'week') {
                        // Last 6 weeks of service
                        let list = [];
                        for (let i = 5; i >= 0; i--) {
                            // Calculate monday of the week
                            let d = new Date();
                            d.setDate(now.getDate() - (now.getDay() || 7) + 1 - (i * 7));
                            d.setHours(0,0,0,0);
                            let startOfWeek = new Date(d);
                            let endOfWeek = new Date(d);
                            endOfWeek.setDate(endOfWeek.getDate() + 6);
                            endOfWeek.setHours(23,59,59,999);
                            
                            let weekAmount = 0;
                            let weekCount = 0;
                            records.forEach(r => {
                                let rt = new Date(r.StartTime);
                                if (rt >= startOfWeek && rt <= endOfWeek) {
                                    weekAmount += (Number(r.TotalAmount) || 0);
                                    weekCount++;
                                }
                            });
                            
                            let startDD = String(startOfWeek.getDate()).padStart(2, '0');
                            let startMM = String(startOfWeek.getMonth() + 1).padStart(2, '0');
                            list.push({
                                label: `${startDD}.${startMM}`,
                                amount: weekAmount,
                                count: weekCount
                            });
                        }
                        return list;
                        
                    } else if (interval === 'month') {
                        // Last 6 months of service
                        let monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
                        let list = [];
                        for (let i = 5; i >= 0; i--) {
                            let d = new Date();
                            d.setMonth(now.getMonth() - i);
                            let mIndex = d.getMonth();
                            let yVal = d.getFullYear();
                            
                            let monthAmount = 0;
                            let monthCount = 0;
                            records.forEach(r => {
                                let rt = new Date(r.StartTime);
                                if (rt.getMonth() === mIndex && rt.getFullYear() === yVal) {
                                    monthAmount += (Number(r.TotalAmount) || 0);
                                    monthCount++;
                                }
                            });
                            
                            list.push({
                                label: `${monthNames[mIndex]}`,
                                amount: monthAmount,
                                count: monthCount
                            });
                        }
                        return list;
                        
                    } else if (interval === 'year') {
                        // Last 3 years of service
                        let list = [];
                        for (let i = 2; i >= 0; i--) {
                            let yVal = now.getFullYear() - i;
                            
                            let yearAmount = 0;
                            let yearCount = 0;
                            records.forEach(r => {
                                let rt = new Date(r.StartTime);
                                if (rt.getFullYear() === yVal) {
                                    yearAmount += (Number(r.TotalAmount) || 0);
                                    yearCount++;
                                }
                            });
                            
                            list.push({
                                label: `${yVal}`,
                                amount: yearAmount,
                                count: yearCount
                            });
                        }
                        return list;
                    }
                    return [];
                }
            },
            mounted() {
                try {
                    let savedUser = localStorage.getItem('currentUser');
                    if (savedUser) {
                        this.user = JSON.parse(savedUser);
                        this.loadInitialData();
                    }
                } catch(e) {
                    console.error('Failed to parse saved user', e);
                    localStorage.removeItem('currentUser');
                }
            },
            methods: {
                showToast(msg, type='success') {
                    let id = Date.now();
                    this.toasts.push({id, msg, type});
                    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 4000);
                },
                onModelSelect() {
                    if (this.recordForm.ModelID) {
                        this.showServiceSelector = true;
                    }
                },
                closeServiceSelector() {
                    this.showServiceSelector = false;
                    this.$nextTick(() => {
                        if (this.$refs.commentInput) {
                            this.$refs.commentInput.focus();
                        }
                    });
                },
                
                async handleAuth() {
                    this.authLoading = true;
                    try {
                        let loginUser = this.authForm.username;
                        
                        if (!loginUser) throw new Error('Пожалуйста, введите логин.');
                        if (!this.authForm.password) throw new Error('Пожалуйста, введите пароль.');

                        if (this.authMode === 'login') {
                            let res = await runGS('loginUser', loginUser, this.authForm.password);
                            this.user = res;
    
                            localStorage.setItem('currentUser', JSON.stringify(res));
                            this.showToast(`Успешный вход. Привет, ${res.Name || res.Username}!`);
                            // АСИНХРОННАЯ ЗАГРУЗКА ДАННЫХ
                            this.loadInitialData(); 
                        } else {
                            if (!this.authForm.name) throw new Error('Пожалуйста, введите ваше полное имя.');
                            if (!this.authForm.phone) throw new Error('Пожалуйста, введите ваш номер телефона.');
                            
                            let res = await runGS('registerUser', loginUser, this.authForm.password, this.authForm.name, this.authForm.phone);
                            this.showToast(res.message);
                            this.authMode = 'login';
                        }
                    } catch(e) {
                         this.showToast(e.message, 'error');
                    } finally {
                        this.authLoading = false;
                    }
                },
                logout() {
                    // Hide any active Bootstrap modals to prevent freezing the page
                    if (this.bsModals) {
                        Object.keys(this.bsModals).forEach(k => {
                            if (this.bsModals[k] && typeof this.bsModals[k].hide === 'function') {
                                try {
                                    this.bsModals[k].hide();
                                } catch (e) {
                                    console.error('Failed to hide modal:', e);
                                }
                            }
                        });
                    }
                    
                    // Explicitly clean up any styling/overlays added by Bootstrap modals
                    try {
                        const backdrops = document.querySelectorAll('.modal-backdrop');
                        backdrops.forEach(el => el.remove());
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';
                    } catch (e) {
                        console.error('Failed to clear modal backdrops:', e);
                    }

                    this.user = null;
                    this.db = { records: [], services: [], brands: [], models: [], users: [] };
                    this.authForm.password = '';
                    localStorage.removeItem('currentUser');
                },
                
                async loadInitialData() {
                    this.loading = true;
                    try {
                        let d = await runGS('getInitData', this.user.Role, this.user.ID);
                        d.records.forEach(r => this.parseServices(r));
                        this.db = d;
                        this.profileForm.username = this.user.Username;
                        this.profileForm.Name = this.user.Name || '';
                        this.profileForm.Phone = this.user.Phone || '+996 ';
                    } catch(e) {
                        this.initError = e.message;
                    } finally {
                        this.loading = false;
                    }
                },

                // HELPERS 
                getBrandName(id) { let b = this.db.brands.find(x => x.ID == id); return b ? b.Name : '—'; },
                getModelName(id) { let m = this.db.models.find(x => x.ID == id); return m ? m.Name : ''; },
                getMasterName(id) { let m = this.db.users.find(x => x.ID == id); return m ? (m.Name || m.Username) : 'Не назначен'; },
                getServiceName(id) { let s = this.db.services.find(x => x.ID == id); return s ? s.Name : 'Н/Д'; },
                getServicePrice(id) { let s = this.db.services.find(x => x.ID == id); return s ? (s.Price || 0) : 0; },

                getDuration(start, end) {
                    if (!start || !end) return '';
                    let s = new Date(start);
                    let e = new Date(end);
                    let diffMs = e - s;
                    if (diffMs < 0) return '0 мин';
                    let diffMins = Math.floor(diffMs / 60000);
                    let hours = Math.floor(diffMins / 60);
                    let mins = diffMins % 60;
                    let days = Math.floor(hours / 24);
                    hours = hours % 24;
                    
                    let parts = [];
                    if (days > 0) parts.push(days + ' дн');
                    if (hours > 0) parts.push(hours + ' ч');
                    if (mins > 0 || parts.length === 0) parts.push(mins + ' мин');
                    return parts.join(' ');
                },
                statusBadgeTw(status) {
                    if(status === 'Выполнен') return 'bg-status-completed-bg text-status-completed-text';
                    if(status === 'Отменён') return 'bg-status-canceled-bg text-status-canceled-text';
                    return 'bg-status-open-bg text-status-open-text';
                },
                statusBgTw(status) {
                    if(status === 'Выполнен') return 'bg-status-completed-bg border-status-completed-text/20 text-status-completed-text';
                    if(status === 'Отменён') return 'bg-status-canceled-bg border-status-canceled-text/20 text-status-canceled-text';
                    return 'bg-status-open-bg border-status-open-text/20 text-status-open-text';
                },
                emptyRecord() {
                    let now = new Date();
                    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                    let localIso = now.toISOString().slice(0, 16);
                    return {
                        ID: null, ClientName: '', Phone: '+996 ', CarNumber: '', BrandID: '', ModelID: '', 
                        MasterID: '', Status: 'Открыт', ServicesJSON: [], TotalAmount: 0, Comment: '',
                        StartTime_LOCAL: localIso, CarRegion: '', CarCountry: 'KG', CarNumberMain: '', IsPaid: false
                    };
                },
                formatDate(isoString) {
                    if (!isoString) return { date: '—', time: '' };
                    try {
                        let d = new Date(isoString);
                        return {
                            date: d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
                            time: d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                        };
                    } catch(e) { return { date: '—', time: ''}; }
                },
                clearAllFilters() {
                    this.advFilterMaster = '';
                    this.advFilterService = '';
                    this.advFilterDate = '';
                    this.advFilterBrand = '';
                    this.advFilterModel = '';
                    this.activeStatuses = ['Открыт', 'Выполнен', 'Отменён'];
                },
                toggleStatus(status) {
                    this.activeStatuses = [status];
                },
                setAllStatuses() {
                    this.activeStatuses = ['Открыт', 'Выполнен', 'Отменён'];
                },
                clearAllDashFilters() {
                    this.dashFilterMaster = '';
                    this.dashFilterService = '';
                    this.dashFilterDate = '';
                    this.dashboardPeriod = 'all';
                    this.dashboardCustomDate = '';
                },
                parseServices(record) {
                    if (record.ServicesJSON) {
                        try {
                           record.ServicesJSON = typeof record.ServicesJSON === 'string' ? JSON.parse(record.ServicesJSON) : record.ServicesJSON;
                        } catch(e) { record.ServicesJSON = []; }
                    } else record.ServicesJSON = [];
                    return record;
                },
                calcTotal() {
                    let sum = 0;
                    this.recordForm.ServicesJSON.forEach(sid => {
                        let srv = this.db.services.find(s => s.ID === sid);
                        if(srv) sum += Number(srv.Price) || 0;
                    });
                    this.recordForm.TotalAmount = sum;
                },
                toggleService(sid) {
                    let idx = this.recordForm.ServicesJSON.indexOf(sid);
                    if (idx === -1) this.recordForm.ServicesJSON.push(sid);
                    else this.recordForm.ServicesJSON.splice(idx, 1);
                    this.calcTotal();
                },

                async dispatchSync(taskName, payload, sheet = null) {
                    this.isSyncing = true;
                    this.syncQueue.push({taskName, payload, sheet});
                    
                    if(this.syncQueue.length === 1) {
                         this.processSyncQueue();
                    }
                },
                async processSyncQueue() {
                    while (this.syncQueue.length > 0) {
                         let task = this.syncQueue[0];
                         try {
                              let newData;
                              if (task.taskName === 'updateRecord') {
                                   newData = await runGS('updateRecord', task.payload);
                              } else if (task.taskName === 'approveUser') {
                                   newData = await runGS('approveUser', task.payload.id, task.payload.data);
                                   this.db.users = newData;
                              } else if (task.taskName === 'addRow') {
                                   newData = await runGS('addRow', task.sheet, task.payload);
                              } else if (task.taskName === 'updateRow') {
                                   newData = await runGS('updateRow', task.sheet, task.payload);
                              } else if (task.taskName === 'deleteRow') {
                                   newData = await runGS('deleteRow', task.sheet, task.payload, this.user.Role, this.user.ID);
                              }
                              if(newData) {
                                  if(Array.isArray(newData)) {
                                      if (task.sheet === 'Records' || task.taskName === 'updateRecord') this.db.records = newData;
                                      else this.db[task.sheet.toLowerCase()] = newData;
                                  } else {
                                      this.db = newData;
                                  }
                                  this.db.records.forEach(r => this.parseServices(r));
                              }
                              this.syncQueue.shift();
                         } catch (e) {
                              console.error('Ошибка синхронизации:', e);
                              this.showToast('Ошибка синхронизации. Будет повторная попытка.', 'error');
                              await new Promise(r => setTimeout(r, 4000));
                         }
                    }
                    this.isSyncing = false;
                },

                async quickStatusChange(record, newStatus) {
                    try {
                        let payload = Object.assign({}, record);
                        payload.Status = newStatus;
                        
                        let idx = this.db.records.findIndex(x => x.ID === record.ID);
                        if(idx > -1) {
                            if (newStatus === 'Выполнен' && record.Status !== 'Выполнен') payload.EndTime = new Date().toISOString();
                            else if (newStatus !== 'Выполнен') payload.EndTime = '';
                            this.db.records[idx] = payload;
                        }
                        
                        this.dispatchSync('updateRecord', payload);
                        this.showToast(`Статус обновлен на "${newStatus}"`);
                    } catch(e) {
                         this.showToast(e.message, 'error');
                    }
                },

                async quickPaymentToggle(record) {
                    try {
                        let payload = Object.assign({}, record);
                        payload.IsPaid = !(record.IsPaid === true || String(record.IsPaid).toUpperCase() === 'TRUE');
                        
                        let idx = this.db.records.findIndex(x => x.ID === record.ID);
                        if(idx > -1) {
                            this.db.records[idx] = payload;
                        }
                        
                        this.dispatchSync('updateRecord', payload);
                        this.showToast(payload.IsPaid ? 'Запись отмечена как "Оплачено"' : 'Запись отмечена как "Не оплачено"');
                    } catch(e) {
                         this.showToast(e.message, 'error');
                    }
                },

                async toggleStatusDirectly(record) {
                    let nextStatus = 'Открыт';
                    if (record.Status === 'Открыт') {
                        nextStatus = 'Выполнен';
                    } else if (record.Status === 'Выполнен') {
                        nextStatus = 'Отменён';
                    } else {
                        nextStatus = 'Открыт';
                    }
                    await this.quickStatusChange(record, nextStatus);
                },

                statusButtonClasses(status) {
                    if (status === 'Выполнен') return 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800';
                    if (status === 'Отменён') return 'bg-rose-100 hover:bg-rose-200 text-rose-800';
                    return 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200';
                },

                statusIcon(status) {
                    if (status === 'Выполнен') return 'check_circle';
                    if (status === 'Отменён') return 'cancel';
                    return 'build_circle';
                },

                getRecordServicesString(record) {
                    if (!record) return '—';
                    let sids = [];
                    if (record.ServicesJSON) {
                        sids = typeof record.ServicesJSON === 'string' ? JSON.parse(record.ServicesJSON || '[]') : record.ServicesJSON;
                    }
                    if (!sids || sids.length === 0) return 'Без услуг';
                    
                    return sids.map(sid => {
                        let found = this.db.services.find(s => s.ID === sid);
                        return found ? found.Name : '';
                    }).filter(Boolean).join(', ');
                },

                formatPhoneInput(objName, fieldName) {
                    let raw = this[objName][fieldName].replace(/\D/g, '');
                    if (raw.startsWith('996')) raw = raw.slice(3);
                    raw = raw.slice(0, 9); // limit to 9 digits after 996
                    let formatted = '+996';
                    if (raw.length > 0) formatted += ' ' + raw.substring(0, 3);
                    if (raw.length > 3) formatted += ' ' + raw.substring(3, 6);
                    if (raw.length > 6) formatted += ' ' + raw.substring(6, 9);
                    this[objName][fieldName] = formatted;
                },
                openProfileModal() {
                    this.isEditingProfile = false;
                    this.profileForm.username = this.user.Username;
                    this.profileForm.Name = this.user.Name || '';
                    this.profileForm.Phone = this.user.Phone || '+996 ';
                    if(!this.bsModals.profile) {
                        this.bsModals.profile = new bootstrap.Modal(document.getElementById('profileModal'));
                    }
                    this.bsModals.profile.show();
                },
                openRecordModal(record = null) {
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
                    if(!this.bsModals.record) {
                        this.bsModals.record = new bootstrap.Modal(document.getElementById('recordModal'), { backdrop: 'static' });
                    }
                    this.bsModals.record.show();
                },
                onCarCountryInput(e) {
                    if (this.recordForm.CarCountry) {
                        this.recordForm.CarCountry = this.recordForm.CarCountry.toUpperCase();
                    }
                    if (this.recordForm.CarCountry === 'KG') {
                        this.recordForm.CarRegion = '';
                        this.recordForm.CarNumberMain = '';
                        this.recordForm.CarNumber = '';
                    } else {
                        this.recordForm.CarRegion = '';
                        this.recordForm.CarNumberMain = '';
                    }
                },
                updateCarNumber(e) {
                    if (this.recordForm.CarCountry && this.recordForm.CarCountry.toUpperCase() === 'KG') {
                        if (this.recordForm.CarRegion && this.recordForm.CarRegion.length === 2 && e && e.target === this.$refs.carRegionInput) {
                            if (this.$refs.carCountryInput) this.$refs.carCountryInput.focus();
                        }
                        if (this.recordForm.CarCountry && this.recordForm.CarCountry.length === 2 && e && e.target === this.$refs.carCountryInput) {
                            if (this.$refs.carNumberMainInput) this.$refs.carNumberMainInput.focus();
                        }
                        
                        let parts = [];
                        if (this.recordForm.CarRegion) parts.push(this.recordForm.CarRegion.toUpperCase());
                        parts.push('KG');
                        if (this.recordForm.CarNumberMain) parts.push(this.recordForm.CarNumberMain.toUpperCase());
                        this.recordForm.CarNumber = parts.join(' ');
                    }
                },
                async saveRecord() {
                    try {
                        let f = this.recordForm;
                        if (!f.ClientName) throw new Error('Пожалуйста, введите Имя Клиента');
                        if (!f.Phone) throw new Error('Пожалуйста, введите Телефон');
                        if (!f.CarNumber) throw new Error('Пожалуйста, введите Госномер');
                        if (!f.BrandID) throw new Error('Пожалуйста, выберите Марку');
                        if (!f.ModelID) throw new Error('Пожалуйста, выберите Модель');
                        if (!f.MasterID) throw new Error('Пожалуйста, назначьте Мастера');
                        if (!f.ServicesJSON || f.ServicesJSON.length === 0) throw new Error('Пожалуйста, добавьте хотя бы одну Услугу');

                        let payload = JSON.parse(JSON.stringify(this.recordForm));
                        if (payload.StartTime_LOCAL) {
                            payload.StartTime = new Date(payload.StartTime_LOCAL).toISOString();
                        } else if (!payload.ID) {
                            payload.StartTime = new Date().toISOString();
                        }
                        
                        let original = payload.ID ? this.db.records.find(x => x.ID === payload.ID) : null;
                        if (payload.Status === 'Выполнен') {
                            if (!payload.EndTime || (original && original.Status !== 'Выполнен')) {
                                payload.EndTime = new Date().toISOString();
                            }
                        } else {
                            payload.EndTime = '';
                        }
                        this.recordForm.EndTime = payload.EndTime;
                        
                        let isNew = !payload.ID;
                        if (isNew) {
                            payload.ID = 'local_' + Date.now();
                            this.recordForm.ID = payload.ID;
                            this.db.records.unshift(payload);
                            this.dispatchSync('addRow', payload, 'Records');
                        } else {
                            let idx = this.db.records.findIndex(x => x.ID === payload.ID);
                            if (idx > -1) this.db.records[idx] = payload;
                            this.dispatchSync('updateRecord', payload);
                        }
                        
                        this.db.records.forEach(r => this.parseServices(r));
                        this.bsModals.record.hide();
                        this.showToast('Запись успешно сохранена');
                    } catch(e) {
                        this.showToast(e.message, 'error');
                    }
                },
                async quickStatusChangeModal(newStatus) {
                    this.recordForm.Status = newStatus;
                    await this.saveRecord();
                },
                
                openRefModal(item = null) {
                    if (item && item !== -1) {
                        this.refForm = Object.assign({}, item);
                    } else {
                        this.refForm = {};
                    }
                    if(!this.bsModals.ref) this.bsModals.ref = new bootstrap.Modal(document.getElementById('refModal'));
                    this.bsModals.ref.show();
                },
                async saveRef() {
                    try {
                        let sheet = this.refMeta[this.refTab].sheet;
                        let payload = Object.assign({_role: this.user.Role, _userId: this.user.ID}, this.refForm);
                        let isNew = !payload.ID;
                        
                        if (isNew) {
                            payload.ID = 'local_' + Date.now();
                            if(!this.db[this.refTab]) this.db[this.refTab] = [];
                            this.db[this.refTab].push(payload);
                            this.dispatchSync('addRow', payload, sheet);
                        } else {
                            let idx = this.db[this.refTab].findIndex(x => x.ID === payload.ID);
                            if(idx > -1) this.db[this.refTab][idx] = payload;
                            this.dispatchSync('updateRow', payload, sheet);
                        }
                        
                        this.db.records.forEach(r => this.parseServices(r));
                        this.bsModals.ref.hide();
                        this.showToast(payload.ID && !isNew ? 'Обновлено в справочнике' : 'Добавлено в справочник');
                    } catch(e) {
                        this.showToast(e.message, 'error');
                    }
                },
                async delRow(sheet, id) {
                    if(confirm("Удалить эту запись без возможности восстановления?")) {
                        try {
                            this.db[this.refTab] = this.db[this.refTab].filter(x => x.ID !== id);
                            this.dispatchSync('deleteRow', id, sheet);
                            this.showToast('Запись удалена');
                        } catch(e) { this.showToast(e.message, 'error'); }
                    }
                },

                async saveUserProfile() {
                    if (!this.profileForm.username) return this.showToast('Укажите имя пользователя', 'error');
                    this.isSavingProfile = true;
                    try {
                        let res = await runGS('updateUserProfile', this.user.ID, this.profileForm.username, this.profileForm.password, this.profileForm.Name, this.profileForm.Phone);
                        this.user.Username = res.Username;
                        this.user.Name = res.Name;
                        this.user.Phone = res.Phone;
                        this.profileForm.password = '';
                        this.showToast('Профиль успешно обновлен!');
                    } catch(e) {
                        this.showToast(e.message, 'error');
                    } finally {
                        this.isSavingProfile = false;
                    }
                },
                
                // СУПЕРАДМИН
                async approveUser(id) {
                    try {
                        let idx = this.db.users.findIndex(x => x.ID === id);
                        if (idx > -1) {
                            this.db.users[idx].Status = 'Approved';
                        }
                        this.dispatchSync('approveUser', { id: id, data: { Status: 'Approved' } }, 'Users');
                        this.showToast('Пользователь подтвержден, синхронизация...');
                    } catch(e) {
                        this.showToast(e.message, 'error');
                    }
                },
                openUserConfigModal(u) {
                    this.userConfigForm = {
                         ID: u.ID,
                         Role: u.Role,
                         Name: u.Name || '',
                         Phone: u.Phone || '+996 '
                    };
                    if(!this.bsModals.userConfig) this.bsModals.userConfig = new bootstrap.Modal(document.getElementById('userConfigModal'));
                    this.bsModals.userConfig.show();
                },
                async saveUserConfig() {
                    this.isSavingUserConfig = true;
                    try {
                        let obj = Object.assign({}, this.userConfigForm);
                        let idx = this.db.users.findIndex(x => x.ID === obj.ID);
                        if (idx > -1) {
                            this.db.users[idx].Role = obj.Role;
                            this.db.users[idx].Name = obj.Name;
                            this.db.users[idx].Phone = obj.Phone;
                        }
                        
                        this.dispatchSync('approveUser', { id: obj.ID, data: { Role: obj.Role, Name: obj.Name, Phone: obj.Phone } }, 'Users');
                        
                        this.bsModals.userConfig.hide();
                        this.showToast('Настройки сохранены, ожидайте синхронизации');
                    } catch(e) {
                        this.showToast(e.message, 'error');
                    } finally {
                        this.isSavingUserConfig = false;
                    }
                }
            }
        }
</script>
