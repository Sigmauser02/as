// Vishnu Auto - Bike Repair & Service Center JavaScript

// Global Variables
let cart = [];
let currentUser = null;
let bookings = [];
let products = [];
let servicePackages = [];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadSampleData();
    setupEventListeners();
    setupAnimations();
    initializeCart();
    checkAuth();
}

// Global data arrays for all pages
let mainProducts = [
    { id: 1, name: 'Engine Oil - Premium', price: 450, category: 'Oil', stock: 50, description: 'High-quality synthetic engine oil for all bike models' },
    { id: 2, name: 'Brake Pads', price: 280, category: 'Brakes', stock: 30, description: 'Durable brake pads for superior stopping power' },
    { id: 3, name: 'Air Filter', price: 150, category: 'Filters', stock: 75, description: 'Clean air filter for better engine performance' },
    { id: 4, name: 'Chain Cleaner', price: 200, category: 'Maintenance', stock: 40, description: 'Professional chain cleaning solution' },
    { id: 5, name: 'Spark Plug', price: 120, category: 'Ignition', stock: 60, description: 'High-performance spark plug for better ignition' },
    { id: 6, name: 'Coolant', price: 180, category: 'Cooling', stock: 35, description: 'Premium coolant for optimal engine temperature' },
    { id: 7, name: 'Professional Washing', price: 200, category: 'Maintenance', stock: 100, description: 'Complete exterior and interior cleaning service' },
    { id: 8, name: 'Polishing & Waxing', price: 350, category: 'Maintenance', stock: 50, description: 'Restore shine and protect paint surface' },
    { id: 9, name: 'Detailing Service', price: 500, category: 'Maintenance', stock: 25, description: 'Deep cleaning and restoration service' }
];

let mainServicePackages = [
    { id: 1, name: 'Basic Service', price: 500, duration: '2 hours', items: ['Oil Change', 'Basic Inspection', 'Chain Adjustment'] },
    { id: 2, name: 'Standard Service', price: 1200, duration: '4 hours', items: ['Oil Change', 'Full Inspection', 'Brake Check', 'Tire Pressure'] },
    { id: 3, name: 'Premium Service', price: 2500, duration: '6 hours', items: ['Complete Service', 'Engine Tuning', 'Washing', 'Polishing'] },
    { id: 4, name: 'Express Service', price: 350, duration: '1 hour', items: ['Quick Check', 'Oil Top-up', 'Basic Cleaning'] }
];

// Load Sample Data
function loadSampleData() {
    // Load products from localStorage or use default
    const savedProducts = localStorage.getItem('vishnuAutoProducts');
    products = savedProducts ? JSON.parse(savedProducts) : mainProducts;

    // Load service packages from localStorage or use default
    const savedServices = localStorage.getItem('vishnuAutoServices');
    servicePackages = savedServices ? JSON.parse(savedServices) : mainServicePackages;
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
}

// Setup Animations
function setupAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observe all service cards and dashboard cards
    const cards = document.querySelectorAll('.service-card, .dashboard-card, .product-card');
    cards.forEach(card => observer.observe(card));
}

// Cart Management
function initializeCart() {
    cart = JSON.parse(localStorage.getItem('vishnuAutoCart')) || [];
    updateCartDisplay();
}

function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }

    saveCart();
    updateCartDisplay();
    showNotification('Product added to cart!', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total');

    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    if (cartItems) {
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const itemElement = createCartItemElement(item);
            cartItems.appendChild(itemElement);
        });
    }

    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `Total: ₹${total}`;
    }
}

function createCartItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
        <div>
            <h4>${item.name}</h4>
            <p>₹${item.price} x ${item.quantity}</p>
        </div>
        <button onclick="removeFromCart(${item.id})" class="btn btn-secondary">Remove</button>
    `;
    return div;
}

function saveCart() {
    localStorage.setItem('vishnuAutoCart', JSON.stringify(cart));
}

// Booking System
function bookService(packageId, customerData) {
    const servicePackage = servicePackages.find(p => p.id === packageId);
    if (!servicePackage) return;

    const booking = {
        id: Date.now(),
        packageId: packageId,
        customerName: customerData.name,
        customerPhone: customerData.phone,
        customerEmail: customerData.email,
        date: customerData.date,
        time: customerData.time,
        status: 'pending',
        totalPrice: servicePackage.price,
        cartItems: [...cart],
        createdAt: new Date().toISOString()
    };

    bookings.push(booking);
    saveBookings();
    
    // Clear cart after booking
    cart = [];
    saveCart();
    updateCartDisplay();

    // Generate bill
    generateBill(booking);
    
    // Send WhatsApp notification
    sendWhatsAppNotification(booking);
    
    showNotification('Service booked successfully!', 'success');
    return booking;
}

function generateBill(booking) {
    const package = servicePackages.find(p => p.id === booking.packageId);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = package.price + cartTotal;

    const billData = {
        bookingId: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        date: booking.date,
        time: booking.time,
        serviceName: package.name,
        servicePrice: package.price,
        items: cart,
        totalAmount: totalAmount,
        createdAt: new Date().toLocaleDateString()
    };

    // Save bill to local storage
    const bills = JSON.parse(localStorage.getItem('vishnuAutoBills')) || [];
    bills.push(billData);
    localStorage.setItem('vishnuAutoBills', JSON.stringify(bills));

    return billData;
}

// WhatsApp Integration
function sendWhatsAppNotification(booking) {
    const package = servicePackages.find(p => p.id === booking.packageId);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = package.price + cartTotal;

    const message = `
🏍️ *Vishnu Auto - Service Booking Confirmation* 🏍️

👤 Customer: ${booking.customerName}
📞 Phone: ${booking.customerPhone}
📅 Date: ${booking.date}
⏰ Time: ${booking.time}
🔧 Service: ${package.name}
💰 Service Price: ₹${package.price}
🛒 Additional Items: ₹${cartTotal}
💳 Total Amount: ₹${totalAmount}

📍 Status: ${booking.status.toUpperCase()}
🔖 Booking ID: #${booking.id}

Thank you for choosing Vishnu Auto! 🙏
    `.trim();

    const whatsappUrl = `https://wa.me/91${booking.customerPhone}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
}

// Authentication
function login(username, password, role) {
    // Simple demo authentication
    if (role === 'admin' && username === 'admin' && password === 'admin123') {
        currentUser = { username, role, permissions: ['read', 'write', 'delete'] };
        localStorage.setItem('vishnuAutoUser', JSON.stringify(currentUser));
        window.location.href = 'admin-dashboard.html';
        return true;
    } else if (role === 'mechanic' && username === 'mechanic' && password === 'mech123') {
        currentUser = { username, role, permissions: ['read'] };
        localStorage.setItem('vishnuAutoUser', JSON.stringify(currentUser));
        window.location.href = 'mechanic-dashboard.html';
        return true;
    }
    return false;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('vishnuAutoUser');
    window.location.href = 'index.html';
}

function checkAuth() {
    const savedUser = localStorage.getItem('vishnuAutoUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
}

// Product Management (Admin only)
function addProduct(productData) {
    if (!hasPermission('write')) return false;
    
    const newProduct = {
        id: Date.now(),
        ...productData,
        createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    saveProducts();
    showNotification('Product added successfully!', 'success');
    return true;
}

function updateProduct(productId, productData) {
    if (!hasPermission('write')) return false;
    
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products[index] = { ...products[index], ...productData };
        saveProducts();
        showNotification('Product updated successfully!', 'success');
        return true;
    }
    return false;
}

function deleteProduct(productId) {
    if (!hasPermission('delete')) return false;
    
    products = products.filter(p => p.id !== productId);
    saveProducts();
    showNotification('Product deleted successfully!', 'success');
    return true;
}

// Booking Management (Admin only)
function updateBookingStatus(bookingId, status) {
    if (!hasPermission('write')) return false;
    
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = status;
        saveBookings();
        showNotification('Booking status updated!', 'success');
        return true;
    }
    return false;
}

// Utility Functions
function hasPermission(permission) {
    return currentUser && currentUser.permissions.includes(permission);
}

function saveProducts() {
    localStorage.setItem('vishnuAutoProducts', JSON.stringify(products));
}

function saveBookings() {
    localStorage.setItem('vishnuAutoBookings', JSON.stringify(bookings));
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `message ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Form Handlers
function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Handle different form types
    if (form.id === 'bookingForm') {
        handleBookingForm(formData);
    } else if (form.id === 'loginForm') {
        handleLoginForm(formData);
    } else if (form.id === 'productForm') {
        handleProductForm(formData);
    }
}

function handleBookingForm(formData) {
    const bookingData = {
        name: formData.get('customerName'),
        phone: formData.get('customerPhone'),
        email: formData.get('customerEmail'),
        date: formData.get('bookingDate'),
        time: formData.get('bookingTime'),
        packageId: parseInt(formData.get('servicePackage'))
    };
    
    bookService(bookingData.packageId, bookingData);
}

function handleLoginForm(formData) {
    const username = formData.get('username');
    const password = formData.get('password');
    const role = formData.get('role');
    
    if (login(username, password, role)) {
        showNotification('Login successful!', 'success');
    } else {
        showNotification('Invalid credentials!', 'error');
    }
}

function handleProductForm(formData) {
    const productData = {
        name: formData.get('productName'),
        price: parseFloat(formData.get('productPrice')),
        category: formData.get('productCategory'),
        stock: parseInt(formData.get('productStock')),
        description: formData.get('productDescription')
    };
    
    addProduct(productData);
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// PDF Generation (Simple implementation)
function generatePDF(billData) {
    // This would typically use a library like jsPDF
    // For demo purposes, we'll create a printable HTML version
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Bill - Vishnu Auto</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .bill-details { margin: 20px 0; }
                    .item { border-bottom: 1px solid #ccc; padding: 10px 0; }
                    .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🏍️ Vishnu Auto</h1>
                    <p>Bike Repair & Service Center</p>
                </div>
                <div class="bill-details">
                    <p><strong>Booking ID:</strong> #${billData.bookingId}</p>
                    <p><strong>Customer:</strong> ${billData.customerName}</p>
                    <p><strong>Phone:</strong> ${billData.customerPhone}</p>
                    <p><strong>Date:</strong> ${billData.date}</p>
                    <p><strong>Time:</strong> ${billData.time}</p>
                </div>
                <div class="items">
                    <div class="item">
                        <strong>${billData.serviceName}</strong> - ₹${billData.servicePrice}
                    </div>
                    ${billData.items.map(item => `
                        <div class="item">
                            ${item.name} x ${item.quantity} - ₹${item.price * item.quantity}
                        </div>
                    `).join('')}
                </div>
                <div class="total">
                    Total Amount: ₹${billData.totalAmount}
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Export functions for global use
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.openModal = openModal;
window.closeModal = closeModal;
window.login = login;
window.logout = logout;
window.updateBookingStatus = updateBookingStatus;
window.generatePDF = generatePDF;