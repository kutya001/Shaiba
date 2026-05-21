        const { createApp } = Vue;

        
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
createApp({
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
                    } else if (this.recordFilter === 'in_progress') {
                        d = d.filter(r => r.Status === 'В работе');
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
                async quickStatusChange(newStatus) {
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
        }).mount('#app');