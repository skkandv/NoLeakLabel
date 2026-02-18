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
                        
                        <!-- Название товара (в одну строку) -->
                        <div class="col-9 col-md-4" style="min-width: 0;"> <!-- КРИТИЧЕСКИ ВАЖНО -->
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
    
    // Остальная часть функции без изменений...
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
