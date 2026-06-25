/**
 * SHYMSGANG - E-Commerce Core Script 
 * Логика корзины, фильтрации и интерактивных модальных окон
 */

let cart = [];
let currentSelectedProduct = null;
let selectedSize = '';
let selectedColor = '';

// Элементы UI Каталога
const catalogBtn = document.getElementById('catalogBtn');
const catalogDropdown = document.getElementById('catalogDropdown');
const catalogArrow = document.getElementById('catalogArrow');
const filterButtons = document.querySelectorAll('.filter-btn');
const catalogTitle = document.getElementById('catalogTitle');

// Модальное окно параметров товара
const productOptionsModal = document.getElementById('productOptionsModal');
const closeOptionsModal = document.getElementById('closeOptionsModal');
const modalProductImg = document.getElementById('modalProductImg');
const modalProductName = document.getElementById('modalProductName');
const modalProductPrice = document.getElementById('modalProductPrice');
const sizeOptionsContainer = document.getElementById('sizeOptionsContainer');
const colorOptionsContainer = document.getElementById('colorOptionsContainer');
const confirmAddToCartBtn = document.getElementById('confirmAddToCartBtn');

// Боковая Корзина
const cartSidebarWrapper = document.getElementById('cartSidebarWrapper');
const cartSidebar = document.getElementById('cartSidebar');
const cartSidebarOverlay = document.getElementById('cartSidebarOverlay');
const cartToggleBtn = document.getElementById('cartToggleBtn');
const closeCartSidebar = document.getElementById('closeCartSidebar');
const cartItemsList = document.getElementById('cartItemsList');
const cartCountBadge = document.getElementById('cartCountBadge');
const cartCountTotal = document.getElementById('cartCountTotal');
const cartTotalPrice = document.getElementById('cartTotalPrice');

// Поддержка
const supportBtn = document.getElementById('supportBtn');
const supportModal = document.getElementById('supportModal');
const closeModal = document.getElementById('closeModal');

// Оформление заказа (Checkout)
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutModal = document.getElementById('closeCheckoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutTotalPriceText = document.getElementById('checkoutTotalPriceText');
const cardFields = document.getElementById('cardFields');
const paymentRadioButtons = document.querySelectorAll('input[name="paymentMethod"]');
const cardNumInput = document.getElementById('cardNum');
const cardDateInput = document.getElementById('cardDate');
const cardCVVInput = document.getElementById('cardCVV');

// Авторизация / Регистрация
const authToggleBtn = document.getElementById('authToggleBtn');
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

/* ==========================================================================
   1. АНИМАЦИЯ ПОЯВЛЕНИЯ КОНТЕНТА ПРИ СКРОЛЛЕ (SCROLL REVEAL)
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, { 
        threshold: 0.08, 
        rootMargin: "0px 0px -20px 0px"
    });

    revealElements.forEach(element => revealObserver.observe(element));
}

initScrollReveal();

/* ==========================================================================
   2. УПРАВЛЕНИЕ КАТАЛОГОМ И ФИЛЬТРАМИ
   ========================================================================== */
catalogBtn.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    catalogDropdown.classList.toggle('hidden'); 
    catalogArrow.classList.toggle('rotate-180'); 
});

document.addEventListener('click', () => { 
    catalogDropdown.classList.add('hidden'); 
    catalogArrow.classList.remove('rotate-180'); 
});

filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const filterValue = button.getAttribute('data-filter');
        
        if (filterValue === 'all') catalogTitle.textContent = 'Текущий Дроп';
        if (filterValue === 'clothing') catalogTitle.textContent = 'Одежда';
        if (filterValue === 'accessories') catalogTitle.textContent = 'Аксессуары';
        
        document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
        
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                card.classList.remove('hidden');
                setTimeout(() => card.classList.add('active'), 50);
            } else {
                card.classList.add('hidden');
                card.classList.remove('active');
            }
        });
        catalogDropdown.classList.add('hidden');
        catalogArrow.classList.remove('rotate-180');
    });
});

/* ==========================================================================
   3. ВСПОМОГАТЕЛЬНЫЕ РУТИНЫ ДЛЯ МОДАЛЬНЫХ ОКОН
   ========================================================================== */
function openModal(modalElement) {
    modalElement.style.display = 'flex';
    setTimeout(() => modalElement.classList.add('open'), 10);
}

function closeModalRoutine(modalElement) {
    modalElement.classList.remove('open');
    setTimeout(() => modalElement.style.display = 'none', 300);
}

function updateOptionVisuals(container, activeText) {
    container.querySelectorAll('button').forEach(btn => {
        if (btn.textContent === activeText) {
            btn.className = 'px-4 py-2 border text-xs font-bold uppercase cursor-pointer transition duration-200 bg-white text-black border-white rounded-lg';
        } else {
            btn.className = 'px-4 py-2 border text-xs font-bold uppercase cursor-pointer transition duration-200 border-gray-800 text-gray-400 hover:border-gray-500 rounded-lg';
        }
    });
}

/* ==========================================================================
   4. ВЫБОР ПАРАМЕТРОВ ТОВАРА И ДОБАВЛЕНИЕ В КОРЗИНУ
   ========================================================================== */
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('open-buy-modal-btn')) {
        const card = e.target.closest('.product-card');
        currentSelectedProduct = {
            id: card.getAttribute('data-id'),
            name: card.getAttribute('data-name'),
            price: parseInt(card.getAttribute('data-price')),
            img: card.getAttribute('data-img'),
            sizes: card.getAttribute('data-sizes').split(','),
            colors: card.getAttribute('data-colors').split(',')
        };

        modalProductImg.src = currentSelectedProduct.img;
        modalProductName.textContent = currentSelectedProduct.name;
        modalProductPrice.textContent = currentSelectedProduct.price.toLocaleString('ru-RU') + ' ₸';

        selectedSize = currentSelectedProduct.sizes[0];
        selectedColor = currentSelectedProduct.colors[0];

        sizeOptionsContainer.innerHTML = '';
        currentSelectedProduct.sizes.forEach(size => {
            const btn = document.createElement('button');
            btn.textContent = size;
            btn.className = `px-4 py-2 border text-xs font-bold uppercase cursor-pointer transition duration-200 rounded-lg ${size === selectedSize ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-400 hover:border-gray-500'}`;
            btn.addEventListener('click', () => { selectedSize = size; updateOptionVisuals(sizeOptionsContainer, size); });
            sizeOptionsContainer.appendChild(btn);
        });

        colorOptionsContainer.innerHTML = '';
        currentSelectedProduct.colors.forEach(color => {
            const btn = document.createElement('button');
            btn.textContent = color;
            btn.className = `px-4 py-2 border text-xs font-bold uppercase cursor-pointer transition duration-200 rounded-lg ${color === selectedColor ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-400 hover:border-gray-500'}`;
            btn.addEventListener('click', () => { selectedColor = color; updateOptionVisuals(colorOptionsContainer, color); });
            colorOptionsContainer.appendChild(btn);
        });

        openModal(productOptionsModal);
    }
});

closeOptionsModal.addEventListener('click', () => closeModalRoutine(productOptionsModal));
productOptionsModal.addEventListener('click', (e) => { if (e.target === productOptionsModal) closeModalRoutine(productOptionsModal); });

confirmAddToCartBtn.addEventListener('click', () => {
    const existingItem = cart.find(item => item.id === currentSelectedProduct.id && item.size === selectedSize && item.color === selectedColor);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ ...currentSelectedProduct, size: selectedSize, color: selectedColor, quantity: 1 });

    closeModalRoutine(productOptionsModal);
    updateCartUI();
    setTimeout(openCart, 200);
});

/* ==========================================================================
   5. УПРАВЛЕНИЕ БОКОВОЙ КОРЗИНОЙ (SIDEBAR)
   ========================================================================== */
function openCart() {
    cartSidebarWrapper.classList.remove('hidden');
    setTimeout(() => {
        cartSidebarOverlay.classList.remove('opacity-0');
        cartSidebarOverlay.classList.add('opacity-100');
        cartSidebar.classList.add('open');
    }, 10);
}

function closeCart() {
    cartSidebarOverlay.classList.remove('opacity-100');
    cartSidebarOverlay.classList.add('opacity-0');
    cartSidebar.classList.remove('open');
    setTimeout(() => cartSidebarWrapper.classList.add('hidden'), 400);
}

cartToggleBtn.addEventListener('click', openCart);
closeCartSidebar.addEventListener('click', closeCart);
cartSidebarOverlay.addEventListener('click', closeCart);

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.textContent = totalItems;
    cartCountTotal.textContent = totalItems;

    if (totalItems > 0) {
        cartCountBadge.classList.remove('bg-white', 'text-black');
        cartCountBadge.classList.add('bg-red-500', 'text-white', 'scale-110');
        setTimeout(() => cartCountBadge.classList.remove('scale-110'), 200);
    } else {
        cartCountBadge.className = "absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-black leading-none text-black bg-white rounded-full transition-all duration-300";
    }

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalPrice.textContent = totalPrice.toLocaleString('ru-RU') + ' ₸';

    cartItemsList.innerHTML = '';
    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="h-64 flex flex-col items-center justify-center text-center px-4">
                <div class="w-12 h-12 rounded-full border border-dashed border-gray-800 flex items-center justify-center text-gray-600 mb-4">🛒</div>
                <p class="text-gray-400 text-xs uppercase tracking-widest font-black">Банда пуста</p>
            </div>
        `;
        return;
    }

    cart.forEach((item, index) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'bg-[#111726]/40 border border-gray-900 p-4 flex gap-4 items-center transition hover:border-gray-800 relative rounded-lg';
        itemCard.innerHTML = `
            <div class="w-16 h-20 bg-gray-900 border border-gray-800 overflow-hidden flex-shrink-0 rounded">
                <img src="${item.img}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start gap-2">
                    <h4 class="text-[11px] font-black uppercase text-white tracking-wide truncate">${item.name}</h4>
                    <button class="delete-item-btn text-gray-600 hover:text-red-500 transition text-sm font-bold focus:outline-none cursor-pointer" data-index="${index}">&times;</button>
                </div>
                <p class="text-[9px] text-gray-500 uppercase font-black tracking-wider mt-0.5">SIZE: <span class="text-gray-300">${item.size}</span> | COLOR: <span class="text-gray-300">${item.color}</span></p>
                <div class="flex items-center justify-between mt-3">
                    <div class="flex items-center border border-gray-800 bg-[#0b0f19] rounded">
                        <button class="minus-btn px-2.5 py-1 text-xs text-gray-500 hover:text-white transition focus:outline-none cursor-pointer" data-index="${index}">-</button>
                        <span class="px-2 text-[11px] font-black text-white w-6 text-center">${item.quantity}</span>
                        <button class="plus-btn px-2.5 py-1 text-xs text-gray-500 hover:text-white transition focus:outline-none cursor-pointer" data-index="${index}">+</button>
                    </div>
                    <span class="text-xs font-black text-white tracking-wide">${(item.price * item.quantity).toLocaleString('ru-RU')} ₸</span>
                </div>
            </div>
        `;
        itemCard.querySelector('.plus-btn').addEventListener('click', () => { item.quantity += 1; updateCartUI(); });
        itemCard.querySelector('.minus-btn').addEventListener('click', () => { if (item.quantity > 1) item.quantity -= 1; else cart.splice(index, 1); updateCartUI(); });
        itemCard.querySelector('.delete-item-btn').addEventListener('click', () => { cart.splice(index, 1); updateCartUI(); });
        cartItemsList.appendChild(itemCard);
    });
}

/* ==========================================================================
   6. ОФОРМЛЕНИЕ ЗАКАЗА (CHECKOUT LOGIC)
   ========================================================================= */
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Твоя банда пуста! Добавь вещи в корзину перед оформлением.');
        return;
    }
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotalPriceText.textContent = totalPrice.toLocaleString('ru-RU') + ' ₸';
    toggleCardRequiredFields(true);
    closeCart();
    openModal(checkoutModal);
});

paymentRadioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'card') {
            cardFields.style.display = 'block';
            toggleCardRequiredFields(true);
        } else {
            cardFields.style.display = 'none';
            toggleCardRequiredFields(false);
        }
    });
});

function toggleCardRequiredFields(isRequired) {
    cardNumInput.required = isRequired;
    cardDateInput.required = isRequired;
    cardCVVInput.required = isRequired;
}

closeCheckoutModal.addEventListener('click', () => closeModalRoutine(checkoutModal));
checkoutModal.addEventListener('click', (e) => { if (e.target === checkoutModal) closeModalRoutine(checkoutModal); });

checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fio = document.getElementById('checkoutFIO').value;
    const city = document.getElementById('checkoutCity').value;
    const address = document.getElementById('checkoutAddress').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    alert(`Заказ успешно оформлен!\n\nСпасибо, ${fio}!\nДоставка в г. ${city} по адресу: ${address}.\nСпособ оплаты: ${paymentMethod === 'card' ? 'Онлайн-карта' : 'При получении'}.`);

    cart = [];
    updateCartUI();
    checkoutForm.reset();
    cardFields.style.display = 'block';
    closeModalRoutine(checkoutModal);
});

/* ==========================================================================
   7. ОКНО АВТОРИЗАЦИИ / РЕГИСТРАЦИИ (AUTH SYSTEM)
   ========================================================================== */
authToggleBtn.addEventListener('click', () => openModal(authModal));
closeAuthModal.addEventListener('click', () => closeModalRoutine(authModal));
authModal.addEventListener('click', (e) => { if (e.target === authModal) closeModalRoutine(authModal); });

tabLogin.addEventListener('click', () => {
    tabLogin.className = "py-4 text-white border-b-2 border-red-500 bg-[#111726]/50 focus:outline-none cursor-pointer";
    tabRegister.className = "py-4 text-gray-400 hover:text-white transition focus:outline-none cursor-pointer";
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
});

tabRegister.addEventListener('click', () => {
    tabRegister.className = "py-4 text-white border-b-2 border-red-500 bg-[#111726]/50 focus:outline-none cursor-pointer";
    tabLogin.className = "py-4 text-gray-400 hover:text-white transition focus:outline-none cursor-pointer";
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    alert(`Добро пожаловать в банду! Вы вошли как: ${email}`);
    closeModalRoutine(authModal);
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    alert(`Аккаунт для ${name} успешно создан!`);
    closeModalRoutine(authModal);
});

/* ==========================================================================
   8. ПОДДЕРЖКА (SUPPORT MODAL)
   ========================================================================== */
supportBtn.addEventListener('click', () => openModal(supportModal));
closeModal.addEventListener('click', () => closeModalRoutine(supportModal));
supportModal.addEventListener('click', (e) => { if (e.target === supportModal) closeModalRoutine(supportModal); });