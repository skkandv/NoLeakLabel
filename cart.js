// Корзина: работа с localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Функция для сохранения корзины
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Функция для обновления счетчика в шапке
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartLinks = document.querySelectorAll('a[href="cart.html"]');
    
    cartLinks.forEach(link => {
        let badge = link.querySelector('.cart-count');
        if (totalItems > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-count';
                link.appendChild(badge);
                link.classList.add('cart-badge');
            }
            badge.textContent = totalItems;
        } else {
            if (badge) {
                badge.remove();
                link.classList.remove('cart-badge');
            }
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
    showNotification(`✓ ${product.name} добавлен в корзину`);
}

// Функция для удаления товара
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    displayCart(); // Обновляем отображение корзины
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
            displayCart(); // Обновляем отображение корзины
        }
    }
}

// Функция для показа уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Функция для отображения корзины на странице cart.html
function displayCart() {
    const cartContainer = document.getElementById('cart-items');
    const summaryContainer = document.getElementById('cart-summary');
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <div style="font-size: 64px; margin-bottom: 20px;">🛒</div>
                <h2>Корзина пуста</h2>
                <p>Добавьте товары в корзину, чтобы оформить заказ</p>
                <a href="catalog.html" class="button" style="padding: 12px 30px;">Перейти в каталог</a>
            </div>
        `;
        if (summaryContainer) summaryContainer.style.display = 'none';
        return;
    }
    
    let cartHtml = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHtml += `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.price} руб. / шт</p>
                </div>
                <div class="cart-item-price">${itemTotal} руб.</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">−</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')" title="Удалить">×</button>
            </div>
        `;
    });
    
    cartContainer.innerHTML = cartHtml;
    
    if (summaryContainer) {
        summaryContainer.style.display = 'block';
        const delivery = total > 1000 ? 0 : 300;
        const finalTotal = total + delivery;
        
        summaryContainer.innerHTML = `
            <h3>Итого</h3>
            <div class="summary-row">
                <span>Товары (${cart.reduce((sum, item) => sum + item.quantity, 0)} шт.)</span>
                <span>${total} руб.</span>
            </div>
            <div class="summary-row">
                <span>Доставка</span>
                <span>${delivery === 0 ? 'Бесплатно' : delivery + ' руб.'}</span>
            </div>
            ${delivery > 0 ? '<div class="summary-row" style="color: #4a6fa5;">До бесплатной доставки осталось ' + (1000 - total) + ' руб.</div>' : ''}
            <div class="summary-row total">
                <span>К оплате</span>
                <span>${finalTotal} руб.</span>
            </div>
            <button class="checkout-btn" onclick="checkout()">Оформить заказ</button>
        `;
    }
}

// Функция для оформления заказа
function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = total > 1000 ? 0 : 300;
    const finalTotal = total + delivery;
    
    const orderSummary = cart.map(item => 
        `${item.name} - ${item.quantity} шт. × ${item.price} руб. = ${item.price * item.quantity} руб.`
    ).join('\n');
    
    const message = `Ваш заказ:\n${orderSummary}\n\nДоставка: ${delivery === 0 ? 'Бесплатно' : delivery + ' руб.'}\nИтого: ${finalTotal} руб.\n\nСпасибо за покупку!`;
    
    alert(message);
    
    // Очищаем корзину
    cart = [];
    saveCart();
    displayCart();
    showNotification('✅ Заказ оформлен! Спасибо за покупку');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    displayCart();
    
    // Добавляем обработчики для кнопок "Добавить в корзину"
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const product = {
                id: this.dataset.id,
                name: this.dataset.name,
                price: parseInt(this.dataset.price),
                image: this.dataset.image
            };
            addToCart(product);
        });
    });
});

// Делаем функции глобальными
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.checkout = checkout;