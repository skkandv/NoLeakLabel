// Корзина: работа с localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Функция для сохранения корзины
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
}

// Функция для обновления счетчика в шапке
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartLink = document.getElementById('cartLink');
    if (cartLink) {
        let badge = cartLink.querySelector('.cart-count');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary cart-count';
            cartLink.appendChild(badge);
        }
        
        if (totalItems > 0) {
            badge.classList.remove('d-none');
            badge.textContent = totalItems;
        } else {
            badge.classList.add('d-none');
        }
    }
}

// Функция для добавления товара
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    showNotification(`✓ ${product.name} добавлен в корзину`, 'success');
}

// Функция для удаления товара
function removeFromCart(productId) {
    const item = cart.find(item => item.id === productId);
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    showNotification(`✗ ${item.name} удален из корзины`, 'danger');
}

// Функция для изменения количества
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
        }
    }
}

// Функция для показа уведомления
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-circle-fill'} me-2"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Функция для отображения корзины на странице cart.html
function updateCartDisplay() {
    const cartContainer = document.getElementById('cart-items');
    const summaryContainer = document.getElementById('cart-summary');
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart text-center py-5">
                <i class="bi bi-cart-x display-1 text-secondary mb-4"></i>
                <h2 class="fw-bold mb-3">Корзина пуста</h2>
                <p class="text-secondary mb-4">Добавьте товары в корзину, чтобы оформить заказ</p>
                <a href="catalog.html" class="btn btn-primary btn-lg px-5 py-3 rounded-pill">
                    <i class="bi bi-arrow-left me-2"></i>Перейти в каталог
                </a>
            </div>
        `;
        if (summaryContainer) summaryContainer.style.display = 'none';
        return;
    }
    
    let cartHtml = '<div class="cart-items-list">';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHtml += `
            <div class="cart-item card mb-3 border-0 shadow-sm" data-id="${item.id}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${item.image}" alt="${item.name}" class="img-fluid rounded-3" style="max-height: 80px; object-fit: contain;">
                        </div>
                        <div class="col-md-4">
                            <h5 class="fw-bold mb-2">${item.name}</h5>
                            <p class="text-secondary mb-0">${item.price} ₽ / шт</p>
                        </div>
                        <div class="col-md-3">
                            <div class="d-flex align-items-center">
                                <button class="btn btn-outline-secondary btn-sm quantity-btn" onclick="updateQuantity('${item.id}', -1)">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <span class="mx-3 fw-bold quantity-value">${item.quantity}</span>
                                <button class="btn btn-outline-secondary btn-sm quantity-btn" onclick="updateQuantity('${item.id}', 1)">
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <span class="fw-bold text-primary h5">${itemTotal} ₽</span>
                        </div>
                        <div class="col-md-1 text-end">
                            <button class="btn btn-link text-danger" onclick="removeFromCart('${item.id}')">
                                <i class="bi bi-trash fs-5"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartHtml += '</div>';
    cartContainer.innerHTML = cartHtml;
    
    if (summaryContainer) {
        summaryContainer.style.display = 'block';
        const delivery = total > 1000 ? 0 : 300;
        const finalTotal = total + delivery;
        
        summaryContainer.innerHTML = `
            <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                    <h3 class="fw-bold mb-4">Итого</h3>
                    <div class="d-flex justify-content-between mb-3">
                        <span class="text-secondary">Товары (${cart.reduce((sum, item) => sum + item.quantity, 0)} шт.)</span>
                        <span class="fw-bold">${total} ₽</span>
                    </div>
                    <div class="d-flex justify-content-between mb-3">
                        <span class="text-secondary">Доставка</span>
                        <span class="fw-bold ${delivery === 0 ? 'text-success' : ''}">${delivery === 0 ? 'Бесплатно' : delivery + ' ₽'}</span>
                    </div>
                    ${delivery > 0 ? '<div class="alert alert-info py-2 mb-3">До бесплатной доставки осталось ' + (1000 - total) + ' ₽</div>' : ''}
                    <hr>
                    <div class="d-flex justify-content-between mb-4">
                        <span class="h4 fw-bold">К оплате</span>
                        <span class="h4 fw-bold text-primary">${finalTotal} ₽</span>
                    </div>
                    <button class="btn btn-primary btn-lg w-100 py-3" onclick="checkout()">
                        <i class="bi bi-check2-circle me-2"></i>Оформить заказ
                    </button>
                </div>
            </div>
        `;
    }
}

// Функция для оформления заказа
function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста', 'danger');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = total > 1000 ? 0 : 300;
    const finalTotal = total + delivery;
    
    // Создаем модальное окно Bootstrap
    const modalHtml = `
        <div class="modal fade" id="orderModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">✅ Заказ оформлен</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="lead mb-4">Спасибо за покупку!</p>
                        <p class="mb-2">Сумма заказа: <span class="fw-bold text-primary">${finalTotal} ₽</span></p>
                        <p class="mb-0">Доставка: <span class="fw-bold ${delivery === 0 ? 'text-success' : ''}">${delivery === 0 ? 'Бесплатно' : delivery + ' ₽'}</span></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем модальное окно в DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Показываем модальное окно
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();
    
    // Удаляем модальное окно после закрытия
    document.getElementById('orderModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
    
    // Очищаем корзину
    cart = [];
    saveCart();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateCartDisplay();
    
    // Добавляем обработчики для кнопок "Добавить в корзину"
    initAddToCartButtons();
});

// Функция для инициализации кнопок добавления
function initAddToCartButtons() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.removeEventListener('click', addToCartHandler);
        btn.addEventListener('click', addToCartHandler);
    });
}

// Обработчик клика по кнопке добавления
function addToCartHandler(e) {
    e.preventDefault();
    const product = {
        id: this.dataset.id,
        name: this.dataset.name,
        price: parseInt(this.dataset.price),
        image: this.dataset.image
    };
    addToCart(product);
    
    // Анимация кнопки
    this.classList.add('btn-success');
    const originalText = this.innerHTML;
    this.innerHTML = '<i class="bi bi-check-lg"></i> Добавлено';
    setTimeout(() => {
        this.classList.remove('btn-success');
        this.innerHTML = originalText;
    }, 1500);
}

// Делаем функции глобальными
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.checkout = checkout;
window.initAddToCartButtons = initAddToCartButtons;
