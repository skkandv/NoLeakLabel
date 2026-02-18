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
    const cartLinks = document.querySelectorAll('.cart-link');
    
    cartLinks.forEach(cartLink => {
        let badge = cartLink.querySelector('.cart-count');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary cart-count';
            cartLink.style.position = 'relative';
            cartLink.appendChild(badge);
        }
        
        if (totalItems > 0) {
            badge.classList.remove('d-none');
            badge.textContent = totalItems;
        } else {
            badge.classList.add('d-none');
        }
    });
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
    showNotification(`✗ ${item ? item.name : 'Товар'} удален из корзины`, 'danger');
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

// Функция для показа уведомления СНИЗУ
function showNotification(message, type = 'success') {
    // Создаем контейнер для уведомлений, если его нет
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        `;
        document.body.appendChild(notificationContainer);
    }
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} alert alert-${type === 'success' ? 'success' : 'danger'} d-flex align-items-center shadow-lg`;
    notification.setAttribute('role', 'alert');
    notification.style.cssText = `
        margin-bottom: 0;
        animation: slideInUp 0.3s ease forwards;
        border-left: 4px solid ${type === 'success' ? '#28a745' : '#dc3545'};
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    notification.innerHTML = `
        <i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-circle-fill'} me-2 fs-5"></i>
        <span class="flex-grow-1">${message}</span>
        <button type="button" class="btn-close btn-sm ms-2" aria-label="Close" onclick="this.parentElement.remove()"></button>
    `;
    
    // Добавляем уведомление в контейнер
    notificationContainer.appendChild(notification);
    
    // Добавляем анимацию появления
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInUp {
            from {
                transform: translateY(100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        @keyframes slideOutDown {
            from {
                transform: translateY(0);
                opacity: 1;
            }
            to {
                transform: translateY(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Автоматическое удаление через 3 секунды
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutDown 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                    
                    // Удаляем контейнер, если он пустой
                    if (notificationContainer.children.length === 0) {
                        notificationContainer.remove();
                    }
                }
            }, 300);
        }
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
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHtml += `
            <div class="cart-item card mb-3 border-0 shadow-sm" data-id="${item.id}" data-aos="fade-up" data-aos-delay="${index * 50}">
                <div class="card-body p-3 p-md-4">
                    <div class="row align-items-center g-3">
                        <!-- Изображение товара -->
                        <div class="col-3 col-md-2">
                            <div class="cart-image-container text-center">
                                <img src="${item.image}" alt="${item.name}" 
                                     class="img-fluid rounded-3 border" 
                                     style="max-width: 80px; max-height: 80px; object-fit: contain;"
                                     onerror="this.src='https://via.placeholder.com/80x80?text=Нет+фото'">
                            </div>
                        </div>
                        
                        <!-- Название товара -->
                        <div class="col-9 col-md-4">
                            <h6 class="fw-bold mb-1 text-truncate" title="${item.name}">${item.name}</h6>
                            <p class="text-secondary small mb-0">${item.price} ₽ / шт</p>
                        </div>
                        
                        <!-- Количество -->
                        <div class="col-6 col-md-3">
                            <div class="d-flex align-items-center justify-content-center justify-content-md-start">
                                <button class="btn btn-outline-secondary btn-sm quantity-btn rounded-circle" 
                                        onclick="updateQuantity('${item.id}', -1)"
                                        style="width: 32px; height: 32px; padding: 0;">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <span class="mx-2 fw-bold quantity-value" style="min-width: 30px; text-align: center;">${item.quantity}</span>
                                <button class="btn btn-outline-secondary btn-sm quantity-btn rounded-circle" 
                                        onclick="updateQuantity('${item.id}', 1)"
                                        style="width: 32px; height: 32px; padding: 0;">
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Цена -->
                        <div class="col-2 col-md-2">
                            <span class="fw-bold text-primary d-block text-center text-md-start">${itemTotal} ₽</span>
                        </div>
                        
                        <!-- Удалить -->
                        <div class="col-1 col-md-1 text-end">
                            <button class="btn btn-link text-danger p-0" onclick="removeFromCart('${item.id}')" title="Удалить">
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
            <div class="card border-0 shadow-sm sticky-top" style="top: 100px;" data-aos="fade-left">
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
                    ${delivery > 0 ? `
                        <div class="alert alert-info py-2 mb-3 small">
                            <i class="bi bi-truck me-2"></i>
                            До бесплатной доставки осталось ${1000 - total} ₽
                        </div>
                    ` : ''}
                    <hr>
                    <div class="d-flex justify-content-between mb-4">
                        <span class="h4 fw-bold">К оплате</span>
                        <span class="h4 fw-bold text-primary">${finalTotal} ₽</span>
                    </div>
                    <button class="btn btn-primary btn-lg w-100 py-3 rounded-pill" onclick="checkout()">
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
    
    // Формируем детали заказа для модального окна
    let orderDetails = '';
    cart.forEach(item => {
        orderDetails += `
            <div class="d-flex justify-content-between small mb-1">
                <span class="text-truncate" style="max-width: 250px;">${item.name}</span>
                <span class="fw-bold">${item.quantity} × ${item.price} ₽ = ${item.price * item.quantity} ₽</span>
            </div>
        `;
    });
    
    // Создаем модальное окно Bootstrap
    const modalHtml = `
        <div class="modal fade" id="orderModal" tabindex="-1" aria-labelledby="orderModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="orderModalLabel">
                            <i class="bi bi-check-circle-fill text-success me-2"></i>
                            Заказ оформлен
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p class="lead mb-4">Спасибо за покупку в ЗвероМире!</p>
                        
                        <!-- Список товаров в заказе -->
                        <div class="order-items mb-3 p-3 bg-light rounded-3">
                            <h6 class="fw-bold mb-3">Ваш заказ:</h6>
                            ${orderDetails}
                        </div>
                        
                        <hr>
                        
                        <div class="d-flex justify-content-between mb-2">
                            <span>Сумма заказа:</span>
                            <span class="fw-bold">${total} ₽</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Доставка:</span>
                            <span class="fw-bold ${delivery === 0 ? 'text-success' : ''}">${delivery === 0 ? 'Бесплатно' : delivery + ' ₽'}</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between">
                            <span class="h5 fw-bold">Итого:</span>
                            <span class="h5 fw-bold text-primary">${finalTotal} ₽</span>
                        </div>
                        <p class="text-secondary small mt-3 mb-0">
                            <i class="bi bi-info-circle me-1"></i>
                            Наш менеджер свяжется с вами для подтверждения заказа.
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            <i class="bi bi-check-lg me-2"></i>OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем модальное окно в DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Показываем модальное окно
    const modalElement = document.getElementById('orderModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Удаляем модальное окно после закрытия
    modalElement.addEventListener('hidden.bs.modal', function() {
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

