
//hien thi modal voi noi dung
function showModal(message) {
    const modal = document.querySelector('.modal');
    const modalMessage = document.getElementById('modal-message');
    modalMessage.textContent = message;
    modal.style.display = 'block';
}
// Đóng modal khi nhấn vào nút đóng
document.querySelector('.close').onclick = function () {
    const modal = document.querySelector('.modal');
    modal.style.display = 'none';
}


// Hàm chuyển đổi form
function showForm(formId) {
    document.querySelectorAll('.form-section').forEach(form => form.classList.add('hidden'));
    document.getElementById(formId).classList.remove('hidden');
}