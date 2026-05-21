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
                <header class="md:hidden w-full h-14 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-10">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <i class="bi bi-car-front-fill text-white text-xs"></i>
                        </div>
                        <span class="font-bold text-base tracking-tight">AutoService CRM</span>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <button v-if="isSyncing" class="p-1.5 text-indigo-600 transition-all font-bold flex items-center gap-1">
                            <span class="material-symbols-outlined animate-spin font-bold">sync</span> <span class="text-[10px] uppercase tracking-wider hidden sm:inline">Синхронизация</span>
                        </button>
                        <button @click="openProfileModal" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition" title="Профиль">
                            <span class="font-bold text-xs">{{ user.Username ? user.Username.slice(0,2).toUpperCase() : '?' }}</span>
                        </button>
                    </div>
                </header>

                <!-- Desktop Header -->
                <header class="hidden md:flex mx-6 mt-4 mb-2 rounded-2xl h-16 bg-white shadow-sm border border-slate-200 px-8 items-center justify-between shrink-0 z-10">
                    <div>
                        <h1 class="text-xl font-bold text-slate-800 tracking-tight" v-if="activeTab==='records'">Журнал Обслуживания</h1>
                        <h1 class="text-xl font-bold text-slate-800 tracking-tight" v-if="activeTab==='dashboard'">Аналитика и Финансы</h1>
                        <h1 class="text-xl font-bold text-slate-800 tracking-tight" v-if="activeTab==='refs'">Управление справочниками</h1>
                        <h1 class="text-xl font-bold text-slate-800 tracking-tight" v-if="activeTab==='users'">Управление персоналом</h1>
                    </div>
                    
                    <div class="flex items-center gap-4">
                        <button v-if="isSyncing" class="p-2 border border-indigo-100 bg-indigo-50 text-indigo-600 rounded-xl transition-all font-bold flex items-center gap-2">
                            <span class="material-symbols-outlined animate-spin font-bold">sync</span> <span class="text-xs uppercase tracking-wider">Синхронизация...</span>
                        </button>
                        
                        <select v-if="activeTab==='dashboard'" v-model="dashboardPeriod" class="form-select w-auto border-slate-200 rounded-xl text-sm bg-slate-50 font-bold cursor-pointer hover:bg-slate-100 transition focus:ring-slate-300 border-none shadow-sm">
                            <option value="day">За Сегодня</option>
                            <option value="week">За Неделю</option>
                            <option value="month">За Месяц</option>
                            <option value="all">За Всё время</option>
                        </select>

                        <div class="h-6 w-px bg-slate-200 mx-1"></div>

                        <button @click="openProfileModal" class="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-xl transition cursor-pointer">
                            <div class="text-right hidden lg:block">
                                <div class="text-xs font-bold text-slate-800 leading-tight">{{ user.Username }}</div>
                                <div class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider leading-tight">{{ user.Role === 'Superadmin' ? 'Супер-админ' : user.Role === 'SenMaster' ? 'Ст. мастер' : 'Мастер' }}</div>
                            </div>
                            <div class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm tracking-tighter">
                                {{ user.Username ? user.Username.slice(0,2).toUpperCase() : '?' }}
                            </div>
                        </button>
                    </div>
                </header>

                <div class="flex-1 px-4 pt-2 pb-4 md:px-8 overflow-y-auto w-full relative z-0">
                    <div v-if="!loading" class="max-w-7xl mx-auto space-y-4 md:space-y-6">
                        
                        <!-- ОШИБКА ДАННЫХ -->
                        <div v-if="initError" class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                            <strong>Ошибка при загрузке данных:</strong> {{ initError }}
                        </div>

                        <!-- ЗАПИСИ (Ремонты) -->
                        <div v-if="activeTab === 'records'" class="max-w-md mx-auto w-full space-y-4 pb-20">
                            <!-- Sticky Header elements for Records -->
                            <div class="sticky top-0 bg-background-light pt-2 pb-3 z-10 transition-shadow duration-200 space-y-3">
                                <!-- Search -->
                                <label class="flex flex-col h-12 w-full mb-0">
                                    <div class="flex w-full flex-1 items-stretch rounded-lg shadow-sm border border-border-subtle bg-surface focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                                        <div class="text-muted flex items-center justify-center pl-4 rounded-l-lg">
                                            <span class="material-symbols-outlined text-[24px]">search</span>
                                        </div>
                                        <input v-model="searchQuery" class="flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 h-full placeholder:text-muted px-4 rounded-r-lg text-[16px] font-medium text-text-main outline-none" placeholder="Поиск по номеру авто...">
                                    </div>
                                </label>
                                
                                <!-- Status Filter -->
                                <div class="grid grid-cols-3 gap-2 w-full pb-1">
                                    <button class="flex h-9 items-center justify-center rounded-lg px-1 shadow-sm font-bold text-[11px] sm:text-[13px] uppercase tracking-wide transition-colors"
                                        :class="recordFilter === 'open' ? 'bg-primary text-white' : 'bg-surface border border-border-subtle text-text-main hover:bg-gray-50'"
                                        @click="recordFilter = 'open'">
                                        ОТКРЫТ
                                    </button>
                                    <button class="flex h-9 items-center justify-center rounded-lg px-1 shadow-sm font-bold text-[11px] sm:text-[13px] uppercase tracking-wide transition-colors"
                                        :class="recordFilter === 'completed' ? 'bg-primary text-white' : 'bg-surface border border-border-subtle text-text-main hover:bg-gray-50'"
                                        @click="recordFilter = 'completed'">
                                        Выполнен
                                    </button>
                                    <button class="flex h-9 items-center justify-center rounded-lg px-1 shadow-sm font-bold text-[11px] sm:text-[13px] uppercase tracking-wide transition-colors"
                                        :class="recordFilter === 'all' ? 'bg-primary text-white' : 'bg-surface border border-border-subtle text-text-main hover:bg-gray-50'"
                                        @click="recordFilter = 'all'">
                                        Все
                                    </button>
                                </div>
                                
                                <!-- Advanced Filters -->
                                <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                                    <select v-model="advFilterMaster" class="h-9 shrink-0 rounded-lg border border-border-subtle bg-surface px-3 text-[13px] font-semibold text-text-main focus:ring-1 focus:ring-primary outline-none">
                                        <option value="">Все мастера</option>
                                        <option v-for="m in mastersList" :key="m.ID" :value="m.ID">{{m.Name || m.Username}}</option>
                                    </select>
                                    <select v-model="advFilterService" class="h-9 shrink-0 rounded-lg border border-border-subtle bg-surface px-3 text-[13px] font-semibold text-text-main focus:ring-1 focus:ring-primary outline-none max-w-[150px]">
                                        <option value="">Все услуги</option>
                                        <option v-for="s in db.services" :key="s.ID" :value="s.ID">{{s.Name}}</option>
                                    </select>
                                    <input type="date" v-model="advFilterDate" class="h-9 shrink-0 rounded-lg border border-border-subtle bg-surface px-3 text-[13px] font-semibold text-text-main focus:ring-1 focus:ring-primary outline-none">
                                </div>
                            </div>

                            <!-- List View -->
                            <div class="space-y-4">
                                <article v-for="r in filteredRecords" :key="r.ID" @click="openRecordModal(r)" 
                                    class="bg-surface rounded-2xl p-4 shadow-soft border border-border-subtle/50 active:scale-[0.98] transition-transform cursor-pointer"
                                    :class="{'opacity-80': r.Status === 'Выполнен', 'opacity-70 grayscale-[20%]': r.Status === 'Отмена'}">
                                    <div class="flex justify-between items-center mb-3">
                                        <h3 class="font-bold text-[18px] text-text-main tracking-tight uppercase font-heading">{{ r.CarNumber }}</h3>
                                        <span class="px-2.5 py-1 rounded-md text-[12px] font-semibold uppercase tracking-wider" :class="statusBadgeTw(r.Status)">
                                            {{ r.Status }}
                                        </span>
                                    </div>
                                    <div class="mb-3 space-y-1">
                                        <p class="text-[16px] font-semibold text-text-main">{{ getBrandName(r.BrandID) }} {{ getModelName(r.ModelID) }}</p>
                                        <div class="flex items-center text-muted gap-1.5">
                                            <span class="material-symbols-outlined text-[16px]">build</span>
                                            <p class="text-[14px] font-medium">Мастер: {{ getMasterName(r.MasterID) }}</p>
                                        </div>
                                    </div>
                                    <div class="h-px bg-border-subtle w-full my-3"></div>
                                    <div class="flex justify-between items-end">
                                        <div class="flex flex-col gap-2">
                                            <div class="flex items-center text-muted gap-1.5">
                                                <span class="material-symbols-outlined text-[16px]">schedule</span>
                                                <p class="text-[13px] font-medium">{{ formatDate(r.StartTime).date }} &bull; {{ formatDate(r.StartTime).time }}</p>
                                            </div>
                                            <div class="flex gap-2 mt-1">
                                                <button v-if="r.Status === 'Открыт'" @click.stop="quickStatusChange(r, 'Выполнен')" class="px-3 py-1 bg-status-completed-bg text-status-completed-text text-[11px] font-bold uppercase tracking-wider rounded-md border border-status-completed-text/20 hover:bg-emerald-100 transition-colors">
                                                    Завершить
                                                </button>
                                                <button v-if="r.Status === 'Выполнен' || r.Status === 'Отмена'" @click.stop="quickStatusChange(r, 'Открыт')" class="px-3 py-1 bg-status-open-bg text-status-open-text text-[11px] font-bold uppercase tracking-wider rounded-md border border-status-open-text/20 hover:bg-amber-100 transition-colors">
                                                    Вернуть в работу
                                                </button>
                                            </div>
                                        </div>
                                        <p class="font-bold text-[18px] text-text-main font-heading">{{ Number(r.TotalAmount || 0).toLocaleString() }} KGS</p>
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

                        <!-- ДАШБОРД -->
                        <!-- АНАЛИТИКА / DASHBOARD -->
                        <div v-if="activeTab === 'dashboard'" class="max-w-md mx-auto w-full space-y-6 fade-transition pb-20">
                            
                            <div class="flex justify-between items-center px-1 relative">
                                <h1 class="text-2xl font-bold tracking-tight text-text-main font-heading">Аналитика</h1>
                                <label class="p-2 -mr-2 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors relative flex items-center justify-center cursor-pointer">
                                    <span class="material-symbols-outlined" :class="dashboardPeriod === 'custom' ? 'text-indigo-600' : 'text-slate-400'">calendar_month</span>
                                    <input type="date" v-model="dashboardCustomDate" @change="dashboardPeriod = 'custom'" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer">
                                </label>
                            </div>

                            <div class="flex gap-2 p-1.5 bg-background border border-border-subtle rounded-[14px]">
                                <button class="flex-1 py-1.5 rounded-[10px] text-[13px] font-bold transition-all shadow-sm"
                                    :class="dashboardPeriod === 'day' ? 'bg-surface text-text-main' : 'bg-transparent text-muted hover:text-text-main'"
                                    @click="dashboardPeriod = 'day'">День</button>
                                <button class="flex-1 py-1.5 rounded-[10px] text-[13px] font-bold transition-all"
                                    :class="dashboardPeriod === 'week' ? 'bg-surface text-text-main shadow-sm' : 'bg-transparent text-muted hover:text-text-main'"
                                    @click="dashboardPeriod = 'week'">Неделя</button>
                                <button class="flex-1 py-1.5 rounded-[10px] text-[13px] font-bold transition-all"
                                    :class="dashboardPeriod === 'month' ? 'bg-surface text-text-main shadow-sm' : 'bg-transparent text-muted hover:text-text-main'"
                                    @click="dashboardPeriod = 'month'">Месяц</button>
                            </div>

                            <!-- Hero Metric Card -->
                            <div class="bg-surface rounded-2xl p-5 shadow-soft border border-border-subtle/50">
                                <div class="flex justify-between items-start mb-2">
                                    <h2 class="text-muted text-sm font-medium">Выручка</h2>
                                    <span class="material-symbols-outlined text-status-completed-text text-sm bg-status-completed-bg rounded-full p-1">trending_up</span>
                                </div>
                                <div class="font-heading text-4xl font-bold tracking-tight text-text-main mb-1">{{ dashStats.sum.toLocaleString() }} KGS</div>
                                <p class="text-xs text-muted">+0% к прошлому периоду</p>
                            </div>
                            
                            <!-- Stat Cards Grid -->
                            <div class="grid grid-cols-2 gap-4">
                                <!-- Orders -->
                                <div class="bg-surface rounded-2xl p-4 shadow-soft border border-border-subtle/50 flex flex-col justify-between">
                                    <div class="flex items-center gap-2 mb-3">
                                        <span class="material-symbols-outlined text-muted text-lg">receipt_long</span>
                                        <h3 class="text-muted text-sm font-medium">Заказов</h3>
                                    </div>
                                    <div class="font-heading text-2xl font-bold text-text-main">{{ dashStats.count }}</div>
                                </div>
                                <!-- Avg check -->
                                <div class="bg-surface rounded-2xl p-4 shadow-soft border border-border-subtle/50 flex flex-col justify-between">
                                    <div class="flex items-center gap-2 mb-3">
                                        <span class="material-symbols-outlined text-muted text-lg">payments</span>
                                        <h3 class="text-muted text-sm font-medium">Средний чек</h3>
                                    </div>
                                    <div class="font-heading text-2xl font-bold text-text-main">{{ dashStats.count ? Math.round(dashStats.sum / dashStats.count).toLocaleString() : 0 }} KGS</div>
                                </div>
                            </div>
                            
                            <!-- Mechanic Leaderboard -->
                            <div class="bg-surface rounded-2xl p-5 shadow-soft border border-border-subtle/50">
                                <h3 class="font-bold text-[16px] mb-4 text-text-main font-heading">Топ мастеров</h3>
                                <div class="space-y-3">
                                    <div v-for="(stat, master, idx) in dashMasterStats" :key="master" class="flex justify-between items-center p-2 rounded-xl" :class="idx === 0 ? 'bg-primary/5' : (idx === 1 ? 'bg-amber-50' : 'bg-slate-50')">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] uppercase shrink-0" 
                                                :class="idx === 0 ? 'bg-primary/10 text-primary' : (idx === 1 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200/50 text-slate-500')">
                                                {{ typeof master === 'string' && master.length > 0 ? master.slice(0, 2) : 'ХЗ' }}
                                            </div>
                                            <span class="font-medium text-[13px] text-text-main">{{ master }}</span>
                                        </div>
                                        <div class="flex flex-col items-end shrink-0">
                                            <span class="font-bold text-[13px] text-text-main">{{ stat.sum.toLocaleString() }} KGS</span>
                                            <span class="font-semibold text-[11px] text-muted">{{ stat.count }} шт.</span>
                                        </div>
                                    </div>
                                    <div v-if="Object.keys(dashMasterStats).length === 0" class="text-center py-4 text-muted text-sm">Нет данных</div>
                                </div>
                            </div>

                            <!-- Services Leaderboard -->
                            <div class="bg-surface rounded-2xl p-5 shadow-soft border border-border-subtle/50">
                                <h3 class="font-bold text-[16px] mb-4 text-text-main font-heading">Топ услуг</h3>
                                <div class="space-y-3">
                                    <div v-for="(stat, service, idx) in dashServiceStats" :key="service" class="flex justify-between items-center p-2 rounded-xl" :class="idx === 0 ? 'bg-primary/5' : 'bg-slate-50'">
                                        <div class="flex items-center gap-3 max-w-[70%]">
                                            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-200/50 text-slate-500">
                                                <span class="material-symbols-outlined text-[16px]">build</span>
                                            </div>
                                            <span class="font-medium text-[13px] text-text-main truncate">{{ service }}</span>
                                        </div>
                                        <div class="flex flex-col items-end shrink-0">
                                            <span class="font-bold text-[13px] text-text-main">{{ stat.sum.toLocaleString() }} KGS</span>
                                            <span class="font-semibold text-[11px] text-muted">{{ stat.count }} шт.</span>
                                        </div>
                                    </div>
                                    <div v-if="Object.keys(dashServiceStats).length === 0" class="text-center py-4 text-muted text-sm">Нет данных</div>
                                </div>
                            </div>

                            <!-- Brands Leaderboard -->
                            <div class="bg-surface rounded-2xl p-5 shadow-soft border border-border-subtle/50">
                                <h3 class="font-bold text-[16px] mb-4 text-text-main font-heading">Популярные Марки</h3>
                                <div class="space-y-3">
                                    <div v-for="(stat, brand, idx) in dashBrandStats" :key="brand" class="flex justify-between items-center p-2 rounded-xl" :class="idx === 0 ? 'bg-primary/5' : 'bg-slate-50'">
                                        <div class="flex items-center gap-3 max-w-[70%]">
                                            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-200/50 text-slate-500">
                                                <span class="material-symbols-outlined text-[16px]">directions_car</span>
                                            </div>
                                            <span class="font-medium text-[13px] text-text-main truncate">{{ brand }}</span>
                                        </div>
                                        <div class="flex flex-col items-end shrink-0">
                                            <span class="font-bold text-[13px] text-text-main">{{ stat.sum.toLocaleString() }} KGS</span>
                                            <span class="font-semibold text-[11px] text-muted">{{ stat.count }} шт.</span>
                                        </div>
                                    </div>
                                    <div v-if="Object.keys(dashBrandStats).length === 0" class="text-center py-4 text-muted text-sm">Нет данных</div>
                                </div>
                            </div>

                        </div>

                        <!-- СПРАВОЧНИКИ -->
                        <div v-if="activeTab === 'refs'" class="space-y-6 max-w-md mx-auto w-full pb-20">
                            
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
                <nav class="md:hidden fixed bottom-4 left-4 right-4 flex gap-2 rounded-2xl shadow-[0_12px_24px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 bg-white/95 backdrop-blur-md px-3 py-2 z-30">
                    <button @click="activeTab='dashboard'" class="flex flex-1 flex-col items-center justify-center gap-1 transition-all bg-transparent border-0 outline-none select-none py-1" :class="activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'">
                        <div class="flex h-8 items-center justify-center">
                            <span class="material-symbols-outlined" :style="activeTab === 'dashboard' ? 'font-variation-settings: \'FILL\' 1;' : ''">monitoring</span>
                        </div>
                        <p class="text-[10px] font-bold leading-none tracking-wide uppercase">Дашборд</p>
                    </button>
                    <button @click="activeTab='records'" class="flex flex-1 flex-col items-center justify-center gap-1 transition-all bg-transparent border-0 outline-none select-none py-1" :class="activeTab === 'records' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'">
                        <div class="flex h-8 items-center justify-center">
                            <span class="material-symbols-outlined" :style="activeTab === 'records' ? 'font-variation-settings: \'FILL\' 1;' : ''">list_alt</span>
                        </div>
                        <p class="text-[10px] font-bold leading-none tracking-wide uppercase">Записи</p>
                    </button>
                    <button v-if="user.Role !== 'Master'" @click="activeTab='refs'; refTab='services'" class="flex flex-1 flex-col items-center justify-center gap-1 transition-all bg-transparent border-0 outline-none select-none py-1" :class="activeTab === 'refs' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'">
                        <div class="flex h-8 items-center justify-center">
                            <span class="material-symbols-outlined" :style="activeTab === 'refs' ? 'font-variation-settings: \'FILL\' 1;' : ''">menu_book</span>
                        </div>
                        <p class="text-[10px] font-bold leading-none tracking-wide uppercase">База</p>
                    </button>
                    <button v-if="user && user.Role === 'Superadmin'" @click="activeTab='users'" class="flex flex-1 flex-col items-center justify-center gap-1 transition-all bg-transparent border-0 outline-none select-none" :class="activeTab === 'users' ? 'text-primary' : 'text-muted'">
                        <div class="flex h-8 items-center justify-center">
                            <span class="material-symbols-outlined" :style="activeTab === 'users' ? 'font-variation-settings: \'FILL\' 1;' : ''">groups</span>
                        </div>
                        <p class="text-[10px] font-bold leading-none tracking-wide uppercase">Штат</p>
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
                    <div class="modal-content md:rounded-3xl border-0 shadow-2xl overflow-hidden font-sans bg-slate-50 relative">
                        
                        <!-- Top Nav -->
                        <div class="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 py-3 px-4 flex items-center justify-between shadow-sm md:px-6 md:py-4">
                            <button type="button" class="text-slate-600 flex w-10 h-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 transition-colors md:hidden" data-bs-dismiss="modal">
                                <i class="bi bi-arrow-left text-xl"></i>
                            </button>
                            <h5 class="modal-title font-bold text-slate-800 text-[18px] md:text-xl leading-tight flex-1 flex items-center gap-3 md:justify-start justify-center pr-10 md:pr-0 m-0">
                                <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hidden md:flex items-center justify-center"><i class="bi bi-journal-text"></i></div>
                                {{ recordForm.ID ? 'Редактировать запись' : 'Новая запись' }}
                            </h5>
                            <button type="button" class="btn-close text-slate-400 focus:ring-0 hidden md:block" data-bs-dismiss="modal"></button>
                        </div>
                        
                        <div class="modal-body p-4 md:p-8 space-y-5 md:space-y-6 pb-40 md:pb-24 bg-slate-50 overflow-y-auto">
                            <template v-if="!isEditingRecord">
                                <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                                    <div class="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 class="text-2xl font-black text-slate-800 uppercase tracking-tight">{{ recordForm.CarNumber || 'Без номера' }}</h2>
                                            <p class="text-base font-bold text-slate-500 mt-1">{{ getBrandName(recordForm.BrandID) }} {{ getModelName(recordForm.ModelID) }}</p>
                                        </div>
                                        <span class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border" :class="statusBadgeTw(recordForm.Status)">
                                            {{ recordForm.Status }}
                                        </span>
                                    </div>
                                    
                                    <div class="grid grid-cols-2 gap-4 mb-6">
                                        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Клиент</span>
                                            <div class="text-sm font-bold text-slate-700">{{ recordForm.ClientName || '—' }}</div>
                                            <a v-if="recordForm.Phone" :href="'tel:' + recordForm.Phone" class="block mt-1 text-xs font-bold text-indigo-600 hover:underline">{{ recordForm.Phone }}</a>
                                        </div>
                                        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Мастер</span>
                                            <div class="text-sm font-bold text-slate-700">{{ getMasterName(recordForm.MasterID) || 'Не назначен' }}</div>
                                            <div class="mt-1 text-xs font-semibold text-slate-500">{{ new Date(recordForm.StartTime_LOCAL).toLocaleString('ru-RU', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'}) }}</div>
                                        </div>
                                    </div>

                                    <div class="mb-6">
                                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Услуги</h4>
                                        <div class="space-y-2">
                                            <div v-for="sid in recordForm.ServicesJSON" :key="sid" class="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
                                                <span class="text-sm font-bold text-slate-700">{{ getServiceName(sid) }}</span>
                                                <span class="text-sm font-black text-slate-800">{{ Number(getServicePrice(sid)).toLocaleString() }}</span>
                                            </div>
                                            <div v-if="!recordForm.ServicesJSON || !recordForm.ServicesJSON.length" class="text-sm text-slate-500 font-medium italic">Нет услуг</div>
                                        </div>
                                        <div class="mt-3 text-right">
                                            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Итого:</span>
                                            <span class="text-lg font-black text-indigo-600">{{ Number(recordForm.TotalAmount).toLocaleString() }} KGS</span>
                                        </div>
                                    </div>

                                    <div v-if="recordForm.Comment" class="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                        <p class="text-sm font-medium text-amber-800 m-0"><strong class="uppercase text-[11px] tracking-wider block mb-1">Комментарий:</strong>{{ recordForm.Comment }}</p>
                                    </div>

                                    <div class="flex flex-col gap-3 pt-4 border-t border-slate-100" v-if="user && (user.Role === 'Superadmin' || user.Role === 'SenMaster' || (recordForm.Status !== 'Выполнен' && recordForm.Status !== 'Отмена'))">
                                        <div class="grid grid-cols-2 gap-3">
                                            <button v-if="recordForm.Status !== 'Выполнен'" @click="quickStatusChangeModal('Выполнен')" class="py-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-sm hover:bg-emerald-100 transition shadow-sm border border-emerald-200">Выполнить</button>
                                            <button v-if="recordForm.Status !== 'Отмена'" @click="quickStatusChangeModal('Отмена')" class="py-2.5 bg-red-50 text-red-600 font-bold rounded-xl text-sm hover:bg-red-100 transition shadow-sm border border-red-200">Отменить</button>
                                            <button v-if="recordForm.Status !== 'Открыт'" @click="quickStatusChangeModal('Открыт')" class="py-2.5 bg-slate-50 text-slate-700 font-bold col-span-2 rounded-xl text-sm hover:bg-slate-100 transition shadow-sm border border-slate-200">Переоткрыть</button>
                                        </div>
                                        <button @click="isEditingRecord = true" class="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition shadow-md mt-2">
                                            <i class="bi bi-pencil-square mr-2"></i>Редактировать запись
                                        </button>
                                    </div>
                                    <div class="pt-4 border-t border-slate-100 text-center" v-else>
                                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Действия недоступны (запись закрыта)</p>
                                    </div>
                                </div>
                            </template>
                            
                            <template v-else>
                                <!-- Status -->
                                <section class="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200">
                                <h3 class="text-slate-800 text-[15px] font-bold mb-3 flex items-center gap-2">
                                    <i class="bi bi-info-circle text-slate-400 text-lg"></i> Статус и Дата
                                </h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <select v-model="recordForm.Status" class="form-select w-full px-4 py-3 border rounded-xl font-bold text-[13px] tracking-wide shadow-sm appearance-none bg-no-repeat bg-white" :class="statusBgTw(recordForm.Status)" style="background-position: right 1rem center;">
                                            <option value="Открыт">ОТКРЫТ</option>
                                            <option value="Выполнен">ВЫПОЛНЕН</option>
                                            <option value="Отмена">ОТМЕНА</option>
                                        </select>
                                    </div>
                                    <div class="relative">
                                        <input type="datetime-local" class="w-full h-[46px] rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none block" v-model="recordForm.StartTime_LOCAL">
                                    </div>
                                </div>
                            </section>

                            <!-- Client Section -->
                            <section class="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200">
                                <h3 class="text-slate-800 text-[15px] font-bold mb-4 flex items-center gap-2">
                                    <i class="bi bi-person text-slate-400 text-lg"></i> Клиент
                                </h3>
                                <div class="space-y-4">
                                    <div class="flex flex-col">
                                        <label class="text-slate-700 text-[12px] font-bold mb-1.5 ml-1 uppercase tracking-wide">Имя Фамилия <span class="text-red-500">*</span></label>
                                        <input ref="clientNameInput" v-model="recordForm.ClientName" class="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" placeholder="Иван Иванов">
                                    </div>
                                    <div class="flex flex-col">
                                        <label class="text-slate-700 text-[12px] font-bold mb-1.5 ml-1 uppercase tracking-wide">Телефон <span class="text-red-500">*</span></label>
                                        <input v-model="recordForm.Phone" @input="formatPhoneInput('recordForm', 'Phone')" type="tel" inputmode="numeric" class="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" placeholder="+996 (___) ___-___">
                                    </div>
                                </div>
                            </section>

                            <!-- Vehicle Section -->
                            <section class="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200">
                                <h3 class="text-slate-800 text-[15px] font-bold mb-4 flex items-center gap-2">
                                    <i class="bi bi-car-front text-slate-400 text-lg"></i> Автомобиль
                                </h3>
                                <div class="space-y-4">
                                    <div class="flex flex-col">
                                        <label class="text-slate-700 text-[12px] font-bold mb-1.5 ml-1 uppercase tracking-wide flex justify-between">
                                            <span>Госномер <span class="text-red-500">*</span></span>
                                        </label>
                                        <div class="flex gap-2 items-center">
                                            <input ref="carRegionInput" v-model="recordForm.CarRegion" @input="updateCarNumber" maxlength="2" inputmode="numeric" class="w-16 h-12 rounded-xl border border-slate-200 bg-white px-2 text-[16px] font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none uppercase text-center" placeholder="01">
                                            <input ref="carCountryInput" v-model="recordForm.CarCountry" @input="updateCarNumber" maxlength="3" class="w-16 h-12 rounded-xl border border-slate-200 bg-white px-2 text-[16px] font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none uppercase text-center" placeholder="KG">
                                            <input ref="carNumberMainInput" v-model="recordForm.CarNumberMain" @input="updateCarNumber" maxlength="7" class="flex-1 h-12 rounded-xl border border-slate-200 bg-white px-3 text-[16px] font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none uppercase tracking-widest text-center" placeholder="123 ABC">
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 gap-4">
                                        <div class="flex flex-col relative">
                                            <label class="text-slate-700 text-[12px] font-bold mb-1.5 ml-1 uppercase tracking-wide">Марка <span class="text-red-500">*</span></label>
                                            <select v-model="recordForm.BrandID" class="form-select w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[14px] font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" @change="recordForm.ModelID=''; $nextTick(() => { if($refs.modelInput) $refs.modelInput.focus() })">
                                                <option value="">Не выбрано</option>
                                                <option v-for="b in db.brands" :key="b.ID" :value="b.ID">{{b.Name}}</option>
                                            </select>
                                        </div>
                                        <div class="flex flex-col relative">
                                            <label class="text-slate-700 text-[12px] font-bold mb-1.5 ml-1 uppercase tracking-wide">Модель <span class="text-red-500">*</span></label>
                                            <select ref="modelInput" v-model="recordForm.ModelID" @change="$nextTick(() => { if($refs.clientNameInput) $refs.clientNameInput.focus() })" :disabled="!recordForm.BrandID" class="form-select w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[14px] font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition disabled:opacity-50">
                                                <option value="">Не выбрано</option>
                                                <option v-for="m in availableModels" :key="m.ID" :value="m.ID">{{m.Name}}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- Services Section -->
                            <section class="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200">
                                <h3 class="text-slate-800 text-[15px] font-bold mb-4 flex items-center gap-2">
                                    <i class="bi bi-tools text-slate-400 text-lg"></i> Услуги и Работы <span class="text-red-500">*</span>
                                </h3>
                                <div class="space-y-3 mb-4">
                                    <!-- Selected Services List -->
                                    <div v-for="sid in recordForm.ServicesJSON" :key="sid" class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                                        <div class="flex-1 min-w-0 pr-4">
                                            <p class="text-slate-800 font-bold text-[14px] leading-tight">{{ getServiceName(sid) }}</p>
                                        </div>
                                        <div class="flex items-center gap-3 shrink-0">
                                            <span class="text-slate-800 font-bold text-[14px] whitespace-nowrap">{{ Number(getServicePrice(sid)).toLocaleString() }} KGS</span>
                                            <button type="button" @click="toggleService(sid)" class="text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-50" title="Удалить">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div v-if="recordForm.ServicesJSON.length === 0" class="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-sm font-semibold">
                                        Услуги не выбраны
                                    </div>
                                </div>
                                <button type="button" @click="showServiceSelector = true" class="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 font-bold text-[14px] hover:bg-indigo-50 transition-colors">
                                    <i class="bi bi-plus-lg text-lg"></i> Добавить услугу
                                </button>
                            </section>

                            <!-- Master Section -->
                            <section class="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200">
                                <h3 class="text-slate-800 text-[15px] font-bold mb-4 flex items-center gap-2">
                                    <i class="bi bi-person-gear text-slate-400 text-lg"></i> Мастер <span class="text-red-500">*</span>
                                </h3>
                                <select v-model="recordForm.MasterID" :disabled="user && user.Role === 'Master'" class="form-select w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed">
                                    <option value="">Не назначен</option>
                                    <option v-for="ms in mastersList" :key="ms.ID" :value="ms.ID">{{ms.Name || ms.Username}} ({{ms.Role === 'SenMaster' ? 'Ст. мастер' : 'Мастер'}})</option>
                                </select>
                            </section>

                            <!-- Comment Section -->
                            <section class="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200">
                                <h3 class="text-slate-800 text-[15px] font-bold mb-3 flex items-center gap-2">
                                    <i class="bi bi-chat-text text-slate-400 text-lg"></i> Комментарий
                               </h3>
                                <textarea v-model="recordForm.Comment" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-[14px] font-medium text-slate-700 resize-none" rows="2" placeholder="Доп. информация по ремонту..."></textarea>
                            </section>
                            </template>
                        </div>
                        
                        <!-- Sticky Bottom Bar -->
                        <div v-show="isEditingRecord" class="fixed md:absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-6 md:pb-4 shadow-[0_-4px_20px_-2px_rgba(15,23,42,0.05)] z-20 flex justify-between items-center gap-4">
                            <div class="flex items-center gap-2 px-1">
                                <span class="text-slate-500 font-bold text-[13px] uppercase tracking-wider hidden sm:inline">Итого:</span>
                                <span class="text-xl font-black text-indigo-600">{{ Number(recordForm.TotalAmount).toLocaleString() }} <span class="text-sm text-slate-400">KGS</span></span>
                            </div>
                            <div class="flex gap-3">
                                <button type="button" class="hidden md:flex h-12 px-5 items-center border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-[14px] transition" data-bs-dismiss="modal">Отмена</button>
                                <button type="button" @click="saveRecord" :disabled="isSaving" class="h-12 px-6 bg-indigo-600 text-white font-bold text-[15px] rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2 shrink-0">
                                    <span v-if="isSaving" class="spinner-border spinner-border-sm"></span>Сохранить
                                </button>
                            </div>
                        </div>

                        <!-- Services Bottom Sheet Overlay -->
                        <div :class="{'opacity-100 visible': showServiceSelector, 'opacity-0 invisible': !showServiceSelector}" class="absolute inset-0 bg-slate-900/40 z-40 backdrop-blur-sm transition-all duration-300" @click="showServiceSelector = false"></div>
                        
                        <!-- Services Bottom Sheet -->
                        <div :class="{'translate-y-0': showServiceSelector, 'translate-y-full': !showServiceSelector}" class="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transform transition-transform duration-300 ease-out shadow-[0_-8px_30px_rgba(0,0,0,0.12)] h-[75%] max-h-[600px] flex flex-col">
                            <div class="flex justify-center p-3 cursor-grab" @click="showServiceSelector = false">
                                <div class="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                            </div>
                            <div class="px-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                                <h3 class="text-slate-800 font-bold text-[18px] m-0">Справочник услуг</h3>
                                <button type="button" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200" @click="showServiceSelector = false">
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
                                <button type="button" @click="showServiceSelector = false" class="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold text-[15px] hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
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
                    recordFilter: 'open',
                    advFilterMaster: '',
                    advFilterService: '',
                    advFilterDate: '',
                    
                    loginUsersList: [],
                    selectedLoginUser: '',
                    
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
                mastersList() {
                    return this.db.users.filter(u => u.Role !== 'Superadmin');
                },
                currentUserMasterID() {
                    return this.user ? this.user.ID : null;
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
                    if (this.recordFilter === 'open') {
                        d = d.filter(r => r.Status === 'Открыт');
                    } else if (this.recordFilter === 'completed') {
                        d = d.filter(r => r.Status === 'Выполнен');
                    } else if (this.recordFilter === 'canceled') {
                        d = d.filter(r => r.Status === 'Отмена');
                    }

                    if (this.advFilterMaster) {
                        d = d.filter(r => String(r.MasterID) === String(this.advFilterMaster));
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
                        
                        if (this.user && this.user.Role === 'Master') {
                            if (r.MasterID !== this.currentUserMasterID) return false;
                        }
                        
                        let d = new Date(r.StartTime);
                        if (this.dashboardPeriod === 'day') return d.toDateString() === now.toDateString();
                        if (this.dashboardPeriod === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                        if (this.dashboardPeriod === 'week') {
                            let dt = new Date(now);
                            dt.setDate(dt.getDate() - (dt.getDay() || 7) + 1); // Monday
                            dt.setHours(0,0,0,0);
                            return d >= dt;
                        }
                        if (this.dashboardPeriod === 'custom' && this.dashboardCustomDate) {
                            let cd = new Date(this.dashboardCustomDate);
                            return d.toDateString() === cd.toDateString();
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

                statusBadgeTw(status) {
                    if(status === 'Выполнен') return 'bg-status-completed-bg text-status-completed-text';
                    if(status === 'Отмена') return 'bg-status-canceled-bg text-status-canceled-text';
                    return 'bg-status-open-bg text-status-open-text';
                },
                statusBgTw(status) {
                    if(status === 'Выполнен') return 'bg-status-completed-bg border-status-completed-text/20 text-status-completed-text';
                    if(status === 'Отмена') return 'bg-status-canceled-bg border-status-canceled-text/20 text-status-canceled-text';
                    return 'bg-status-open-bg border-status-open-text/20 text-status-open-text';
                },
                emptyRecord() {
                    let now = new Date();
                    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                    let localIso = now.toISOString().slice(0, 16);
                    return {
                        ID: null, ClientName: '', Phone: '+996 ', CarNumber: '', BrandID: '', ModelID: '', 
                        MasterID: '', Status: 'Открыт', ServicesJSON: [], TotalAmount: 0, Comment: '',
                        StartTime_LOCAL: localIso
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
                        if (this.recordForm.StartTime) {
                            let d = new Date(this.recordForm.StartTime);
                            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                            this.recordForm.StartTime_LOCAL = d.toISOString().slice(0, 16);
                        } else {
                            this.recordForm.StartTime_LOCAL = this.emptyRecord().StartTime_LOCAL;
                        }
                        
                        if (this.recordForm.CarNumber) {
                            let parts = this.recordForm.CarNumber.split(' ');
                            if (parts.length >= 3 && parts[0].length === 2 && parts[1].length === 2) {
                                this.recordForm.CarRegion = parts[0];
                                this.recordForm.CarCountry = parts[1];
                                this.recordForm.CarNumberMain = parts.slice(2).join(' ');
                            } else {
                                this.recordForm.CarNumberMain = this.recordForm.CarNumber;
                            }
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
                updateCarNumber(e) {
                    if (this.recordForm.CarRegion && this.recordForm.CarRegion.length === 2 && e && e.target === this.$refs.carRegionInput) {
                        this.$refs.carCountryInput.focus();
                    }
                    if (this.recordForm.CarCountry && this.recordForm.CarCountry.length === 2 && e && e.target === this.$refs.carCountryInput) {
                        this.$refs.carNumberMainInput.focus();
                    }
                    
                    let parts = [];
                    if (this.recordForm.CarRegion) parts.push(this.recordForm.CarRegion.toUpperCase());
                    if (this.recordForm.CarCountry) parts.push(this.recordForm.CarCountry.toUpperCase());
                    if (this.recordForm.CarNumberMain) parts.push(this.recordForm.CarNumberMain.toUpperCase());
                    this.recordForm.CarNumber = parts.join(' ');
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
