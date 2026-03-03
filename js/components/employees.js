let key_local_employee = "employeeData";
let currentPage = 1;
let pageSize = 5;
let searchQuery = '';
let _searchTimeout = null;

function initEmployeesData(){
    console.log("Da co su kien danh sach");
    
    //lay du lieu
    var datas = getData();
    //binding
    renderTable(datas);
    // attach Add button -> show form
    const addBtn = document.querySelector('.content__header__addnew__button');
    const cancelBtn = document.getElementById('employeeFormCancel');
    const modalOverlay = document.getElementById('employee_modal_overlay');
    const form = document.getElementById('employeeForm');
    if(addBtn){
        addBtn.addEventListener('click', (e) => { e.preventDefault(); showEmployeeForm(); });
    }
    if(cancelBtn){
        cancelBtn.addEventListener('click', hideEmployeeForm);
    }
    if(modalOverlay){
        modalOverlay.addEventListener('click', hideEmployeeForm);
    }
    if(form){
        form.addEventListener('submit', onEmployeeFormSubmit);
        // clear field error on input change
        Array.from(form.querySelectorAll('input, select')).forEach(inp => {
            inp.addEventListener('input', () => clearFieldError(inp));
        });
    }

    // tim kiem
    const searchInput = document.querySelector('.content__body__header__left__search');
    if(searchInput){
        searchInput.addEventListener('input', (e) => {
            const v = (e.target.value || '').trim();
            
            if(_searchTimeout) clearTimeout(_searchTimeout);
            _searchTimeout = setTimeout(() => {
                searchQuery = v.toLowerCase();
                currentPage = 1;
                const datasAll = getData();
                renderTable(datasAll);
            }, 240);
        });
    }
}

function showEmployeeForm(){
    const modal = document.getElementById('employee_form_modal');
    const form = document.getElementById('employeeForm');
    const title = modal && modal.querySelector('h3');
    if(form){
        delete form.dataset.editIndex;
        // reset form
        Array.from(form.querySelectorAll('.input-error')).forEach(i => i.classList.remove('input-error'));
        Array.from(form.querySelectorAll('.error-text')).forEach(e => e.remove());
    }
    if(title) title.textContent = 'Thêm nhân viên';
    if(modal) modal.classList.remove('hidden');
}

function hideEmployeeForm(){
    const modal = document.getElementById('employee_form_modal');
    if(modal) modal.classList.add('hidden');
    const form = document.getElementById('employeeForm');
    if(form) form.reset();
}

function showFieldError(input, message){
    if(!input) return;
    input.classList.add('input-error');
    let next = input.nextElementSibling;
    if(next && next.classList && next.classList.contains('error-text')){
        next.textContent = message;
        return;
    }
    const span = document.createElement('span');
    span.className = 'error-text';
    span.textContent = message;
    input.parentNode.insertBefore(span, input.nextSibling);
}

function clearFieldError(input){
    if(!input) return;
    input.classList.remove('input-error');
    const next = input.nextElementSibling;
    if(next && next.classList && next.classList.contains('error-text')) next.remove();
}

function onEmployeeFormSubmit(e){
    e.preventDefault();
    const fullNameEl = document.getElementById('input_fullName');
    const phoneEl = document.getElementById('input_phone');
    const dobEl = document.getElementById('input_dob');
    const emailEl = document.getElementById('input_email');
    const genderEl = document.getElementById('input_gender');

    const fullName = (fullNameEl || {}).value || '';
    const phone = (phoneEl || {}).value || '';
    const dob = (dobEl || {}).value || '';
    const email = (emailEl || {}).value || '';
    const gender = (genderEl || {}).value || '';

    // validation
    let firstInvalid = null;
    if(!fullName.trim()){
        showFieldError(fullNameEl, 'Không được để trống');
        firstInvalid = firstInvalid || fullNameEl;
    }
    if(!phone.trim()){
        showFieldError(phoneEl, 'Không được để trống');
        firstInvalid = firstInvalid || phoneEl;
    } else if(!/^[0-9()+\-\s]+$/.test(phone.trim())){
        showFieldError(phoneEl, 'Số điện thoại không hợp lệ');
        firstInvalid = firstInvalid || phoneEl;
    }
    if(!email.trim()){
        showFieldError(emailEl, 'Không được để trống');
        firstInvalid = firstInvalid || emailEl;
    } else if(!/^\S+@\S+\.\S+$/.test(email.trim())){
        showFieldError(emailEl, 'Email không hợp lệ');
        firstInvalid = firstInvalid || emailEl;
    }

    if(firstInvalid){
        firstInvalid.focus();
        return;
    }

    const datas = getData();
    const form = document.getElementById('employeeForm');
    const editIndex = form && form.dataset && form.dataset.editIndex;
    let isEdit = false;
    if(typeof editIndex !== 'undefined' && editIndex !== null){
        const idx = parseInt(editIndex, 10);
        if(!isNaN(idx) && idx >= 0 && idx < datas.length){
            datas[idx] = { fullName: fullName.trim(), phone: phone.trim(), dob: dob, email: email.trim(), gender: gender };
            isEdit = true;
        } else {
            //them ban ghi vao dau danh sach
            datas.unshift({ fullName: fullName.trim(), phone: phone.trim(), dob: dob, email: email.trim(), gender: gender });
        }
    } else {
        datas.unshift({ fullName: fullName.trim(), phone: phone.trim(), dob: dob, email: email.trim(), gender: gender });
    }
    if(!isEdit) currentPage = 1;
    localStorage.setItem(key_local_employee, JSON.stringify(datas));
    renderTable(datas);
    hideEmployeeForm();
    if(isEdit) showToast('Cập nhật thành công'); else showToast('Thêm thành công');
}

function showEmployeeFormForEdit(index){
    const datas = getData();
    if(!datas || !datas[index]) return;
    const item = datas[index];
    const modal = document.getElementById('employee_form_modal');
    const form = document.getElementById('employeeForm');
    const title = modal && modal.querySelector('h3');
    if(form){
        form.dataset.editIndex = index;
        (document.getElementById('input_fullName') || {}).value = item.fullName || '';
        (document.getElementById('input_phone') || {}).value = item.phone || '';
        // convert dd/mm/yyyy to yyyy-mm-dd if needed for input[type=date]
        const dobVal = item.dob || '';
        (document.getElementById('input_dob') || {}).value = formatDobForInput(dobVal);
        (document.getElementById('input_email') || {}).value = item.email || '';
        (document.getElementById('input_gender') || {}).value = item.gender || 'Nam';
    }
    if(title) title.textContent = 'Sửa nhân viên';
    if(modal) modal.classList.remove('hidden');
}

function formatDobForInput(dob){
    // accept dd/mm/yyyy or yyyy-mm-dd; return yyyy-mm-dd for input[type=date]
    if(!dob) return '';
    if(dob.indexOf('/') !== -1){
        // dd/mm/yyyy -> yyyy-mm-dd
        const parts = dob.split('/');
        if(parts.length === 3){
            const [d,m,y] = parts;
            return `${y.padStart(4,'0')}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
        }
    }
    // assume already yyyy-mm-dd or other ISO-like
    return dob;
}

// Toast helper
function showToast(message, timeout = 2800){
    if(!message) return;
    let container = document.querySelector('.toast-container');
    if(!container){
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    // allow animation frame then show
    requestAnimationFrame(() => toast.classList.add('show'));
    // hide after timeout
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => { try{ container.removeChild(toast);}catch(e){} }, 260);
    }, timeout);
}

function getData(){
    let dataLocal = localStorage.getItem(key_local_employee);
    let datas;
    if(dataLocal == null){
        datas = (typeof employeeData !== 'undefined' ? employeeData : []);
        localStorage.setItem(key_local_employee, JSON.stringify(datas));
    } else {
        datas = JSON.parse(dataLocal);
    }
    return datas;
}

function renderTable(datas){
    let tbody = document.getElementById("tbody__employees");

    if(tbody == null){
        return;
    }

    // apply search filter
    let filtered = datas;
    const q = (searchQuery || '').trim().toLowerCase();
    if(q){
        const qDigits = q.replace(/\D/g, '');
        filtered = datas.filter(item => {
            const name = (item.fullName || '').toLowerCase();
            const email = (item.email || '').toLowerCase();
            const phoneNorm = (item.phone || '').toLowerCase();
            if(name.indexOf(q) !== -1) return true;
            if(email.indexOf(q) !== -1) return true;
            if(qDigits.length > 0){
                const pDigits = phoneNorm.replace(/\D/g, '');
                if(pDigits.indexOf(qDigits) !== -1) return true;
            } else {
                if(phoneNorm.indexOf(q) !== -1) return true;
            }
            return false;
        });
    }

    // pagination: calculate slice on filtered data
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if(currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);

    let innerHTML = "";
    for(let i = 0; i < pageItems.length; i++){
        const realIndex = start + i;
        const item = pageItems[i];
        let trHTML = `<tr>
                        <td><input type="checkbox" class="employee-select" data-index="${realIndex}"></td>
                        <td>${item.fullName}</td>
                        <td>${item.phone}</td>
                        <td>${item.dob ? item.dob : ''}</td>
                        <td>${item.email}</td>
                        <td>${item.gender}</td>
                        <td>
                            <button class="btn-edit" data-index="${realIndex}">Sửa</button>
                            <button class="btn-delete" data-index="${realIndex}">Xóa</button>
                        </td>
                        </tr>`;
        innerHTML += trHTML;
    }

    tbody.innerHTML = innerHTML;

    // attach select-all and checkbox syncing
    const selectAll = document.getElementById('select_all_employees');
    const checkboxes = tbody.querySelectorAll('.employee-select');
    if(selectAll){
        // set initial state
        selectAll.checked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
        // when header checkbox changes, toggle all
        selectAll.addEventListener('change', () => {
            checkboxes.forEach(cb => cb.checked = selectAll.checked);
        });
        // when any row checkbox changes, update header checkbox
        checkboxes.forEach(cb => cb.addEventListener('change', () => {
            selectAll.checked = Array.from(checkboxes).length > 0 && Array.from(checkboxes).every(cb => cb.checked);
        }));
    }

    // attach edit button handlers (buttons are recreated each render)
    const editButtons = tbody.querySelectorAll('.btn-edit');
    editButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = parseInt(btn.dataset.index, 10);
            if(!isNaN(idx)) showEmployeeFormForEdit(idx);
        });
    });

    // nut xoa
    const deleteButtons = tbody.querySelectorAll('.btn-delete');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = parseInt(btn.dataset.index, 10);
            if(isNaN(idx)) return;
            // confirm 
            const ok = confirm('Bạn có chắc muốn xóa ứng viên này?');
            if(!ok){ showToast('Hủy xóa'); return; }
            // thuc hien xoa
            const datasAll = getData();
            datasAll.splice(idx, 1);
            localStorage.setItem(key_local_employee, JSON.stringify(datasAll));

            const maxPagesAfter = Math.max(1, Math.ceil(datasAll.length / pageSize));
            if(currentPage > maxPagesAfter) currentPage = maxPagesAfter;
            renderTable(datasAll);
            showToast('Xóa thành công');
        });
    });

    renderPagination(total, currentPage, pageSize);
}
// pagging
function renderPagination(totalItems, page, size){
    const container = document.getElementById('pagination_container');
    if(!container) return;
    const totalPages = Math.max(1, Math.ceil(totalItems / size));
    const startRecord = totalItems === 0 ? 0 : ((page - 1) * size) + 1;
    const endRecord = Math.min(totalItems, page * size);

    
    let html = '';
    html += `<div class="table-left-count">Tổng: <strong>${totalItems}</strong> bản ghi</div>`;
    html += `<div class="pagination-right">`;
    html += `<span class="page-size-label">Số bản ghi/trang</span>`;
    html += `<select id="page_size_select" class="page-size-select">
                <option value="5" ${size==5? 'selected':''}>5</option>
                <option value="10" ${size==10? 'selected':''}>10</option>
                <option value="20" ${size==20? 'selected':''}>20</option>
                <option value="25" ${size==25? 'selected':''}>25</option>
                <option value="50" ${size==50? 'selected':''}>50</option>
              </select>`;
    html += `<span class="range-text">${startRecord} - ${endRecord} bản ghi</span>`;
    html += `<div class="page-nav"><button class="page-btn" data-action="prev" ${page===1? 'disabled': ''}>&lt;</button>`;
    html += `<button class="page-btn" data-action="next" ${page===totalPages? 'disabled': ''}>&gt;</button></div>`;
    html += `</div>`;
    container.innerHTML = html;

    // attach handlers for prev/next
    const prevBtn = container.querySelector('.page-nav .page-btn[data-action="prev"]');
    const nextBtn = container.querySelector('.page-nav .page-btn[data-action="next"]');
    if(prevBtn){
        prevBtn.addEventListener('click', () => {
            if(currentPage <= 1) return;
            currentPage = Math.max(1, currentPage - 1);
            renderTable(getData());
        });
    }
    if(nextBtn){
        nextBtn.addEventListener('click', () => {
            if(currentPage >= totalPages) return;
            currentPage = Math.min(totalPages, currentPage + 1);
            renderTable(getData());
        });
    }

    const select = document.getElementById('page_size_select');
    if(select){
        select.addEventListener('change', () => {
            pageSize = parseInt(select.value, 10) || 5;
            currentPage = 1;
            renderTable(getData());
        });
    }
}

window.initEmployeesData = initEmployeesData;