document.addEventListener('DOMContentLoaded', () => {
    // Pantalla de carga
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden-loader');
        }, 600);
    });
    if (document.readyState === 'complete') {
        setTimeout(() => loader.classList.add('hidden-loader'), 600);
    }

    // ============================================================
    // MODO CLARO / OSCURO — con transición de barrido circular
    // ============================================================
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const iconLight = themeToggle.querySelector('.theme-icon-light');
        const iconDark = themeToggle.querySelector('.theme-icon-dark');

        function setThemeIcons(isLight) {
            if (iconLight) iconLight.classList.toggle('hidden', !isLight);
            if (iconDark) iconDark.classList.toggle('hidden', isLight);
        }

        function setTheme(isLight) {
            document.body.classList.toggle('light-mode', isLight);
            setThemeIcons(isLight);
            localStorage.setItem('jotafix-theme', isLight ? 'light' : 'dark');
        }

        // Sincroniza el icono con el tema que ya se aplicó al cargar (ver <script> en el <body>)
        setThemeIcons(document.body.classList.contains('light-mode'));

        themeToggle.addEventListener('click', (e) => {
            const isLight = !document.body.classList.contains('light-mode');

            // Navegadores sin soporte de View Transitions: cambio instantáneo
            if (!document.startViewTransition) {
                setTheme(isLight);
                return;
            }

            const x = e.clientX;
            const y = e.clientY;
            const endRadius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            const transition = document.startViewTransition(() => {
                setTheme(isLight);
            });

            transition.ready.then(() => {
                document.documentElement.animate(
                    {
                        clipPath: [
                            `circle(0px at ${x}px ${y}px)`,
                            `circle(${endRadius}px at ${x}px ${y}px)`
                        ]
                    },
                    {
                        duration: 650,
                        easing: 'ease-in-out',
                        pseudoElement: '::view-transition-new(root)'
                    }
                );
            });
        });
    }

    // ============================================================
    // BOTÓN VOLVER ARRIBA
    // ============================================================
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        function updateBackToTop() {
            if (window.scrollY > 300) backToTopBtn.classList.add('visible');
            else backToTopBtn.classList.remove('visible');
        }
        updateBackToTop();
        window.addEventListener('scroll', updateBackToTop);
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // Mobile Menu
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70,
                    behavior: 'smooth'
                });
                mobileMenu.classList.add('hidden');
            }
        });
    });

    // Envío del formulario directamente por WhatsApp
    const form = document.getElementById('contact-form');
    if (form) {
        const WHATSAPP_NUMBER = '34685537310';

        // Texto legible de cada opción del select de servicio
        const servicioLabels = {
            ps4: 'Limpieza PS4',
            ps5: 'Limpieza PS5',
            mando: 'Limpieza Mando',
            perifericos: 'Limpieza de Periféricos',
            portatil: 'Limpieza Portátil',
            pc: 'Limpieza PC Escritorio',
            pasta: 'Cambio de Pasta Térmica',
            componentes: 'Cambio de Componentes',
            montaje: 'Montaje de PC',
            otro: 'Otro'
        };

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = form.nombre.value.trim();
            const telefono = form.telefono.value.trim();
            const servicioValue = form.servicio.value;
            const mensaje = form.mensaje.value.trim();

            let texto = 'Hola Jota Fix, me llamo ' + nombre + '.';
            if (servicioValue) {
                texto += ' Quiero solicitar el servicio de ' + (servicioLabels[servicioValue] || servicioValue) + '.';
            }
            texto += ' ' + mensaje;
            if (telefono) {
                texto += ' Mi teléfono de contacto es ' + telefono + '.';
            }

            const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(texto);
            window.open(url, '_blank', 'noopener,noreferrer');

            form.reset();
        });
    }

    // FAQ Accordion
    document.querySelectorAll('.faq-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const body = btn.nextElementSibling;
            const isOpen = !body.classList.contains('hidden');

            document.querySelectorAll('.faq-body').forEach(b => b.classList.add('hidden'));
            document.querySelectorAll('.faq-btn').forEach(b => b.classList.remove('open'));

            if (!isOpen) {
                body.classList.remove('hidden');
                btn.classList.add('open');
            }
        });
    });

    // ============================================================
    // ANTES / DESPUÉS SLIDER
    // ============================================================
    document.querySelectorAll('[data-slider]').forEach(slider => {
        const beforeEl = slider.querySelector('.ba-before');
        const handleEl = slider.querySelector('.ba-handle');
        let isDragging = false;

        function setPosition(x) {
            const rect = slider.getBoundingClientRect();
            let pct = (x - rect.left) / rect.width;
            pct = Math.min(Math.max(pct, 0.03), 0.97);
            const percent = pct * 100;
            // clip-path recorta SOLO la parte visible de la capa "antes",
            // la imagen interior siempre mantiene su tamaño real (sin deformarse)
            beforeEl.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
            handleEl.style.left = percent + '%';
        }

        // Mouse
        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            setPosition(e.clientX);
            e.preventDefault();
        });
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            setPosition(e.clientX);
        });
        window.addEventListener('mouseup', () => { isDragging = false; });

        // Touch
        slider.addEventListener('touchstart', (e) => {
            isDragging = true;
            setPosition(e.touches[0].clientX);
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            setPosition(e.touches[0].clientX);
        }, { passive: true });
        window.addEventListener('touchend', () => { isDragging = false; });
    });

    // ============================================================
    // MAPA INTERACTIVO CON LEAFLET
    // ============================================================
    if (document.getElementById('map')) {
        const lat = 38.1156;
        const lng = -1.3469;

        const map = L.map('map', {
            center: [lat, lng],
            zoom: 15,
            zoomControl: true,
            scrollWheelZoom: false,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        const purpleIcon = L.divIcon({
            className: '',
            html: `<div style="
                width: 40px; height: 40px;
                background: linear-gradient(135deg, #a855f7, #7e22ce);
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid rgba(255,255,255,0.15);
                box-shadow: 0 4px 20px rgba(168,85,247,0.7);
                display: flex; align-items: center; justify-content: center;
            ">
                <i class="fas fa-tools" style="
                    transform: rotate(45deg);
                    color: white;
                    font-size: 15px;
                    display: flex; align-items: center; justify-content: center;
                    width: 100%; height: 100%;
                    text-align: center; line-height: 34px;
                "></i>
            </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -44]
        });

        const marker = L.marker([lat, lng], { icon: purpleIcon }).addTo(map);

        marker.bindPopup(`
            <div style="min-width: 180px;">
                <p style="font-weight: 700; font-size: 15px; color: #fff; margin: 0 0 4px;">
                    <span style="color: #a855f7;">Jota</span>Fix
                </p>
                <p style="color: #9ca3af; font-size: 13px; margin: 0 0 2px;">
                    <i class="fas fa-map-marker-alt" style="color:#a855f7; margin-right:5px;"></i>
                    Villanueva del Río Segura
                </p>
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">Murcia, España</p>
                <a href="https://www.google.com/maps/dir/?api=1&destination=Villanueva+del+Rio+Segura,Murcia,Spain"
                   target="_blank"
                   style="display:inline-flex; align-items:center; gap:5px; font-size:12px; color:#a855f7; text-decoration:none; font-weight:600;">
                    <i class="fas fa-directions"></i> Cómo llegar
                </a>
            </div>
        `, { maxWidth: 220 }).openPopup();

        L.circle([lat, lng], {
            radius: 8000,
            color: '#a855f7',
            fillColor: '#a855f7',
            fillOpacity: 0.06,
            weight: 1.5,
            dashArray: '6 4',
        }).addTo(map).bindTooltip('Zona de servicio a domicilio', {
            permanent: false,
            direction: 'top',
            className: 'leaflet-tooltip-dark'
        });
    }
});