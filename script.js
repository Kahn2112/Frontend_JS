// Script principal para Soluciones Innovadoras
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== NAVEGACIÓN SUAVE =====
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ===== ANIMACIONES AL HACER SCROLL =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observar elementos
    const logos = document.querySelectorAll('.logo-grid img');
    const imagenesInicio = document.querySelectorAll('.imagenes-inicio img');

    logos.forEach(logo => observer.observe(logo));
    imagenesInicio.forEach(img => observer.observe(img));

    // ===== EFECTOS HOVER PARA LOGOS =====
    logos.forEach(logo => {
        logo.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(5deg)';
            this.style.transition = 'all 0.3s ease';
        });

        logo.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });

    // ===== EFECTOS PARA IMÁGENES DE INICIO =====
    imagenesInicio.forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.filter = 'brightness(1.2) contrast(1.1)';
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'all 0.3s ease';
        });

        img.addEventListener('mouseleave', function() {
            this.style.filter = 'brightness(1) contrast(1)';
            this.style.transform = 'scale(1)';
        });
    });

    // ===== NAVEGACIÓN ACTIVA =====
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('.seccion');
        const navLinks = document.querySelectorAll('nav a');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // ===== ANIMACIÓN DEL HEADER =====
    const header = document.querySelector('header');
    if (header) {
        let lastScrollTop = 0;

        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    // ===== CARRITO DE COMPRAS =====
    class CarritoCompras {
        constructor() {
            this.items = JSON.parse(localStorage.getItem('carrito')) || [];
            this.eventListeners = new Map(); // Para rastrear event listeners
            this.init();
        }

        init() {
            this.renderizarCarrito();
            this.actualizarContador();
            this.setupEventListeners();
            this.restaurarControlesProductos();
        }

        // Método para limpiar event listeners específicos
        limpiarEventListeners(producto) {
            const btnAgregar = document.querySelector(`[data-producto="${producto}"]`);
            if (btnAgregar) {
                const controles = btnAgregar.parentElement;
                const btnMas = controles.querySelector('.btn-mas');
                const btnMenos = controles.querySelector('.btn-menos');
                
                // Limpiar listeners específicos de este producto
                if (this.eventListeners.has(producto)) {
                    const listeners = this.eventListeners.get(producto);
                    btnMas.removeEventListener('click', listeners.mas);
                    btnMenos.removeEventListener('click', listeners.menos);
                    this.eventListeners.delete(producto);
                }
            }
        }

        // Método para agregar event listeners específicos
        agregarEventListeners(producto, controles) {
            const btnMas = controles.querySelector('.btn-mas');
            const btnMenos = controles.querySelector('.btn-menos');
            
            // Limpiar listeners anteriores si existen
            this.limpiarEventListeners(producto);
            
            // Crear nuevos listeners
            const handleMas = () => this.cambiarCantidad(producto, 1, controles);
            const handleMenos = () => this.cambiarCantidad(producto, -1, controles);
            
            // Agregar listeners
            btnMas.addEventListener('click', handleMas);
            btnMenos.addEventListener('click', handleMenos);
            
            // Guardar referencia para poder limpiarlos después
            this.eventListeners.set(producto, {
                mas: handleMas,
                menos: handleMenos
            });
        }

        setupEventListeners() {
            // Botones de agregar productos
            document.querySelectorAll('.btn-agregar').forEach(btn => {
                btn.addEventListener('click', (e) => this.agregarProducto(e));
            });

            // Botón flotante del carrito
            const carritoFlotante = document.getElementById('carritoFlotante');
            if (carritoFlotante) {
                carritoFlotante.addEventListener('click', () => {
                    this.abrirCarrito();
                });
            }

            // Botón ir al carrito
            const btnIrCarrito = document.getElementById('btnIrCarrito');
            if (btnIrCarrito) {
                btnIrCarrito.addEventListener('click', () => {
                    this.abrirCarrito();
                });
            }

            // Botón cerrar carrito
            const btnCerrarCarrito = document.getElementById('btnCerrarCarrito');
            if (btnCerrarCarrito) {
                btnCerrarCarrito.addEventListener('click', () => {
                    this.cerrarCarrito();
                });
            }

            // Botón checkout
            const btnCheckout = document.getElementById('btnCheckout');
            if (btnCheckout) {
                btnCheckout.addEventListener('click', () => {
                    this.finalizarCompra();
                });
            }
        }

        agregarProducto(e) {
            const btn = e.target;
            const producto = btn.dataset.producto;
            const precio = parseInt(btn.dataset.precio);
            
            // Buscar si el producto ya existe en el carrito
            const itemExistente = this.items.find(item => item.nombre === producto);
            
            if (itemExistente) {
                itemExistente.cantidad++;
            } else {
                this.items.push({
                    nombre: producto,
                    precio: precio,
                    cantidad: 1
                });
            }

            // Actualizar controles del producto
            this.actualizarControlesProducto(btn, producto);
            
            // Guardar en localStorage
            this.guardarCarrito();
            
            // Actualizar carrito
            this.renderizarCarrito();
            this.actualizarContador();
        }

        actualizarControlesProducto(btn, producto) {
            const controles = btn.parentElement;
            const btnAgregar = controles.querySelector('.btn-agregar');
            const controlesCantidad = controles.querySelector('.controles-cantidad');
            const cantidadSpan = controlesCantidad.querySelector('.cantidad');

            // Ocultar botón agregar y mostrar controles
            btnAgregar.style.display = 'none';
            controlesCantidad.style.display = 'flex';

            // Actualizar cantidad
            const item = this.items.find(item => item.nombre === producto);
            cantidadSpan.textContent = item.cantidad;

            // Agregar event listeners usando el nuevo sistema
            this.agregarEventListeners(producto, controles);
        }

        cambiarCantidad(producto, cambio, controles) {
            const item = this.items.find(item => item.nombre === producto);
            const nuevaCantidad = item.cantidad + cambio;

            if (nuevaCantidad <= 0) {
                // Remover producto del carrito
                this.items = this.items.filter(item => item.nombre !== producto);
                
                // Restaurar controles originales
                const btnAgregar = controles.querySelector('.btn-agregar');
                const controlesCantidad = controles.querySelector('.controles-cantidad');
                
                btnAgregar.style.display = 'block';
                controlesCantidad.style.display = 'none';
            } else {
                item.cantidad = nuevaCantidad;
                controles.querySelector('.cantidad').textContent = nuevaCantidad;
            }

            this.guardarCarrito();
            this.renderizarCarrito();
            this.actualizarContador();
        }

        renderizarCarrito() {
            const contenido = document.getElementById('carritoContenido');
            const total = document.getElementById('carritoTotal');
            const btnCheckout = document.getElementById('btnCheckout');

            if (!contenido || !total || !btnCheckout) return;

            if (this.items.length === 0) {
                contenido.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
                total.textContent = '0';
                btnCheckout.disabled = true;
                return;
            }

            let html = '';
            let totalPrecio = 0;

            this.items.forEach(item => {
                const subtotal = item.precio * item.cantidad;
                totalPrecio += subtotal;

                html += `
                    <div class="item-carrito">
                        <div class="item-info">
                            <div class="item-nombre">${item.nombre}</div>
                            <div class="item-precio">${item.precio} USD x ${item.cantidad}</div>
                        </div>
                        <div class="item-controles">
                            <button class="btn-menos-carrito" data-producto="${item.nombre}">-</button>
                            <span class="cantidad">${item.cantidad}</span>
                            <button class="btn-mas-carrito" data-producto="${item.nombre}">+</button>
                        </div>
                    </div>
                `;
            });

            contenido.innerHTML = html;
            total.textContent = totalPrecio.toLocaleString();
            btnCheckout.disabled = false;

            // Agregar event listeners a los botones del carrito
            contenido.querySelectorAll('.btn-menos-carrito').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const producto = e.target.dataset.producto;
                    this.cambiarCantidadCarrito(producto, -1);
                });
            });

            contenido.querySelectorAll('.btn-mas-carrito').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const producto = e.target.dataset.producto;
                    this.cambiarCantidadCarrito(producto, 1);
                });
            });
        }

        cambiarCantidadCarrito(producto, cambio) {
            const item = this.items.find(item => item.nombre === producto);
            const nuevaCantidad = item.cantidad + cambio;

            if (nuevaCantidad <= 0) {
                this.items = this.items.filter(item => item.nombre !== producto);
                
                // Restaurar controles del producto en la página principal
                const btnAgregar = document.querySelector(`[data-producto="${producto}"]`);
                if (btnAgregar) {
                    const controles = btnAgregar.parentElement;
                    const controlesCantidad = controles.querySelector('.controles-cantidad');
                    
                    btnAgregar.style.display = 'block';
                    controlesCantidad.style.display = 'none';
                }
            } else {
                item.cantidad = nuevaCantidad;
                
                // Actualizar controles del producto en la página principal
                const btnAgregar = document.querySelector(`[data-producto="${producto}"]`);
                if (btnAgregar) {
                    const controles = btnAgregar.parentElement;
                    const controlesCantidad = controles.querySelector('.controles-cantidad');
                    const cantidadSpan = controlesCantidad.querySelector('.cantidad');
                    
                    cantidadSpan.textContent = nuevaCantidad;
                }
            }

            this.guardarCarrito();
            this.renderizarCarrito();
            this.actualizarContador();
        }

        restaurarControlesProductos() {
            // Restaurar controles de productos que ya estaban en el carrito
            this.items.forEach(item => {
                const btnAgregar = document.querySelector(`[data-producto="${item.nombre}"]`);
                if (btnAgregar) {
                    const controles = btnAgregar.parentElement;
                    const controlesCantidad = controles.querySelector('.controles-cantidad');
                    const cantidadSpan = controlesCantidad.querySelector('.cantidad');
                    
                    btnAgregar.style.display = 'none';
                    controlesCantidad.style.display = 'flex';
                    cantidadSpan.textContent = item.cantidad;

                    // Agregar event listeners usando el nuevo sistema
                    this.agregarEventListeners(item.nombre, controles);
                }
            });
        }

        actualizarContador() {
            const contador = document.getElementById('carritoContador');
            const carritoFlotante = document.getElementById('carritoFlotante');
            const botonCarritoContainer = document.getElementById('botonCarritoContainer');
            
            const totalItems = this.items.reduce((total, item) => total + item.cantidad, 0);
            
            // Actualizar contador si existe
            if (contador) {
                contador.textContent = totalItems;
            }
            
            // Mostrar/ocultar contador, botón flotante y botón ir al carrito
            if (totalItems > 0) {
                if (contador) contador.style.display = 'flex';
                if (carritoFlotante) carritoFlotante.style.display = 'flex';
                if (botonCarritoContainer) botonCarritoContainer.style.display = 'flex';
            } else {
                if (contador) contador.style.display = 'none';
                if (carritoFlotante) carritoFlotante.style.display = 'none';
                if (botonCarritoContainer) botonCarritoContainer.style.display = 'none';
            }
        }

        abrirCarrito() {
            const overlay = document.getElementById('carritoOverlay');
            if (overlay) {
                overlay.classList.add('activo');
            }
        }

        cerrarCarrito() {
            const overlay = document.getElementById('carritoOverlay');
            if (overlay) {
                overlay.classList.remove('activo');
            }
        }

        guardarCarrito() {
            localStorage.setItem('carrito', JSON.stringify(this.items));
        }

        finalizarCompra() {
            const total = this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
            alert(`¡Compra finalizada! Total: ${total.toLocaleString()} USD`);
            
            // Limpiar carrito
            this.items = [];
            this.guardarCarrito();
            this.renderizarCarrito();
            this.actualizarContador();
            this.cerrarCarrito();
            
            // Limpiar todos los event listeners
            this.eventListeners.forEach((listeners, producto) => {
                this.limpiarEventListeners(producto);
            });
            
            // Restaurar todos los controles de productos
            document.querySelectorAll('.btn-agregar').forEach(btn => {
                btn.style.display = 'block';
            });
            document.querySelectorAll('.controles-cantidad').forEach(controles => {
                controles.style.display = 'none';
            });
        }
    }

    // ===== FORMULARIO DE CONTACTO =====
    const formulario = document.getElementById('formularioContacto');
    
    if (formulario) {
        formulario.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nombre = document.getElementById('nombre').value.trim();
            const email = document.getElementById('email').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();
            
            // Validaciones
            let esValido = true;
            
            // Validar nombre
            if (nombre.length < 3) {
                mostrarError('nombre', 'El nombre debe tener al menos 3 caracteres');
                esValido = false;
            } else {
                limpiarError('nombre');
            }
            
            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                mostrarError('email', 'Ingrese un email válido');
                esValido = false;
            } else {
                limpiarError('email');
            }
            
            // Validar teléfono
            const telefonoRegex = /^[\d\s\-\+\(\)]{10,}$/;
            if (!telefonoRegex.test(telefono)) {
                mostrarError('telefono', 'Ingrese un teléfono válido');
                esValido = false;
            } else {
                limpiarError('telefono');
            }
            
            if (esValido) {
                // Simular envío
                alert('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.');
                formulario.reset();
            }
        });
    }

    function mostrarError(campo, mensaje) {
        const input = document.getElementById(campo);
        const errorSpan = document.getElementById(`error${campo.charAt(0).toUpperCase() + campo.slice(1)}`);
        
        if (input && errorSpan) {
            input.classList.add('error');
            errorSpan.textContent = mensaje;
        }
    }

    function limpiarError(campo) {
        const input = document.getElementById(campo);
        const errorSpan = document.getElementById(`error${campo.charAt(0).toUpperCase() + campo.slice(1)}`);
        
        if (input && errorSpan) {
            input.classList.remove('error');
            errorSpan.textContent = '';
        }
    }

    // ===== CARGAR RESEÑAS CON FETCH =====
    async function cargarReseñas() {
        // Usar imágenes fijas para los clientes
        const clientes = [
            {
                nombre: "Mary Scottler",
                cargo: "CEO - TechCorp Solutions",
                imagen: "https://randomuser.me/api/portraits/women/44.jpg",
                reseña: "Excelente servicio y profesionalismo. La consultora nos ayudó a implementar soluciones que transformaron nuestro negocio completamente."
            },
            {
                nombre: "Carlos Rodríguez",
                cargo: "Director de IT - InnovateLab",
                imagen: "https://randomuser.me/api/portraits/men/32.jpg",
                reseña: "Increíble experiencia de trabajo. El equipo demostró un conocimiento profundo y entregó resultados excepcionales."
            },
            {
                nombre: "Ana Martínez",
                cargo: "CTO - Sistemas Digitales ISM",
                imagen: "https://randomuser.me/api/portraits/women/68.jpg",
                reseña: "Altamente recomendados. Su enfoque innovador y atención al detalle superó todas nuestras expectativas."
            }
        ];

        // Cargar datos de cada cliente
        clientes.forEach((cliente, index) => {
            const numeroCliente = index + 1;
            
            // Carga de imagen
            const imagenElement = document.getElementById(`cliente${numeroCliente}`);
            if (imagenElement) {
                imagenElement.src = cliente.imagen;
                imagenElement.alt = cliente.nombre;
                
                // Efecto de carga
                imagenElement.style.opacity = '0';
                imagenElement.addEventListener('load', function() {
                    this.style.transition = 'opacity 0.5s ease';
                    this.style.opacity = '1';
                });
            }

            // Cargar nombre
            const nombreElement = document.getElementById(`nombre${numeroCliente}`);
            if (nombreElement) {
                nombreElement.textContent = cliente.nombre;
            }

            // Cargar cargo
            const cargoElement = document.getElementById(`cargo${numeroCliente}`);
            if (cargoElement) {
                cargoElement.textContent = cliente.cargo;
            }

            // Cargar reseña
            const reseñaElement = document.getElementById(`reseña${numeroCliente}`);
            if (reseñaElement) {
                reseñaElement.textContent = cliente.reseña;
            }
        });

        console.log('Reseñas cargadas exitosamente');
    }

    // ===== CARGAR IMAGEN DE CONTACTO =====
    async function cargarImagenContacto() {
        try {
            // Usar una imagen relacionada con envío de email
            const imagenElement = document.getElementById('contactoImagen');
            if (imagenElement) {
                // Imagen de envío de email desde una API de iconos
                imagenElement.src = 'https://cdn-icons-png.flaticon.com/512/552/552489.png';
                imagenElement.alt = 'Envío de email';
                
                // Efecto de carga
                imagenElement.style.opacity = '0';
                imagenElement.addEventListener('load', function() {
                    this.style.transition = 'opacity 0.5s ease';
                    this.style.opacity = '1';
                });
            }

            console.log('Imagen de contacto cargada exitosamente');

        } catch (error) {
            console.error('Error al cargar la imagen de contacto:', error);
            
            // Fallback con imagen estática de email
            const imagenElement = document.getElementById('contactoImagen');
            if (imagenElement) {
                imagenElement.src = 'https://cdn-icons-png.flaticon.com/512/552/552489.png';
                imagenElement.alt = 'Envío de email';
            }
        }
    }

    // Cargar reseñas y imagen de contacto cuando la página esté lista
    cargarReseñas();
    cargarImagenContacto();

    // ===== INICIALIZAR CARRITO =====
    // Pequeño delay para asegurar que el DOM esté completamente listo
    setTimeout(() => {
        const carrito = new CarritoCompras();
        window.carrito = carrito; // Hacer disponible globalmente para debugging
        
        // Verificación inicial
        if (carrito.items.length > 0) {
            carrito.actualizarContador();
        }
    }, 100);

    // ===== SCROLL TO TOP BUTTON =====
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #333;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 20px;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(scrollToTopBtn);

    // Mostrar/ocultar botón según el scroll
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.opacity = '1';
        } else {
            scrollToTopBtn.style.opacity = '0';
        }
    });

    // Funcionalidad del botón
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ===== CONSOLE LOG PERSONALIZADO =====
    console.log('🚀 Soluciones Innovadoras');
    console.log('¡Gracias por visitar nuestra página!');
});

// ===== OPTIMIZACIÓN SEO BÁSICA =====
document.addEventListener('DOMContentLoaded', function() {
    // Meta description
    if (!document.querySelector('meta[name="description"]')) {
        const metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        metaDescription.content = 'Consultora de software especializada en soluciones empresariales, desarrollo web, aplicaciones móviles y Business Intelligence. Transformamos tu negocio con tecnología innovadora.';
        document.head.appendChild(metaDescription);
    }

    // Meta keywords
    if (!document.querySelector('meta[name="keywords"]')) {
        const metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        metaKeywords.content = 'consultora software, desarrollo web, aplicaciones móviles, business intelligence, SAP, Oracle, Microsoft Dynamics, Power BI, Tableau';
        document.head.appendChild(metaKeywords);
    }

    // Open Graph tags
    if (!document.querySelector('meta[property="og:title"]')) {
        const ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        ogTitle.content = 'Soluciones Innovadoras - Consultora de Software';
        document.head.appendChild(ogTitle);
    }

    if (!document.querySelector('meta[property="og:description"]')) {
        const ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        ogDescription.content = 'Soluciones tecnológicas a medida para tu empresa. Desarrollo web, móvil y Business Intelligence.';
        document.head.appendChild(ogDescription);
    }

    // Canonical URL
    if (!document.querySelector('link[rel="canonical"]')) {
        const canonical = document.createElement('link');
        canonical.rel = 'canonical';
        canonical.href = window.location.href;
        document.head.appendChild(canonical);
    }
}); 