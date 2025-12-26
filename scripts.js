document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. VARIABLES GLOBALES DEL VISOR (Necesarias para todo)
    // =========================================================
    const entryOverlay = document.getElementById('entry-viewer-overlay');
    const entryContent = document.getElementById('entry-viewer-content');
    const closeEntryBtn = document.getElementById('close-entry-btn');
    const progressBar = document.getElementById('reading-progress-bar');


    // =========================================================
    // 2. ANIMACIÓN ON-SCROLL (Reveal) - VERSIÓN CORREGIDA
    // =========================================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Añadir la clase .visible para activar la animación CSS
                entry.target.classList.add('visible');
                // Dejar de observar para ahorrar recursos
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // AQUI ESTABA EL FALLO: Ahora seleccionamos TODAS las clases de animación
    const revealElements = document.querySelectorAll('.reveal, .reveal-zoom, .reveal-left, .reveal-right');
    revealElements.forEach(el => observer.observe(el));

    // Fallback de seguridad: Si algo falla, mostrar todo a los 2 segundos
    setTimeout(() => {
        revealElements.forEach(el => {
            if (!el.classList.contains('visible')) {
                el.classList.add('visible');
            }
        });
    }, 2000);


    // =========================================================
    // 3. NAVEGACIÓN PRINCIPAL (SPA)
    // =========================================================
    const navLinks = document.querySelectorAll('nav ul li[data-section], .logo[data-section]');
    const sections = document.querySelectorAll('main > section');
    const mainNavLis = document.querySelectorAll('nav ul li[data-section]');

    function navigateTo(sectionId) {
        sections.forEach(sec => sec.classList.remove('active'));
        const targetSection = document.getElementById(sectionId);
        if(targetSection) {
            targetSection.classList.add('active');
        }
        mainNavLis.forEach(li => {
           li.classList.toggle('active-link', li.getAttribute('data-section') === sectionId);
        });
        window.scrollTo(0, 0);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.getAttribute('data-section'));
        });
    });


    // =========================================================
    // 4. NAVEGACIÓN INTERNA (Subsecciones de Contenido)
    // =========================================================
    const subNavLinks = document.querySelectorAll('#contenido nav li[data-subsection]');
    const articles = document.querySelectorAll('#contenido article');

    subNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            const subId = link.getAttribute('data-subsection');
            subNavLinks.forEach(li => li.classList.remove('active-subnav'));
            link.classList.add('active-subnav');
            articles.forEach(art => art.classList.remove('active-content'));
            document.getElementById(subId).classList.add('active-content');
        });
    });

    // Enlaces rápidos desde Inicio
    document.querySelectorAll('.image-link-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const subId = item.getAttribute('data-subsection');
            navigateTo('contenido');
            subNavLinks.forEach(li => li.classList.toggle('active-subnav', li.getAttribute('data-subsection') === subId));
            articles.forEach(art => art.classList.toggle('active-content', art.id === subId));
        });
    });

    const bookLink = document.getElementById('book-link');
    if(bookLink) {
        bookLink.addEventListener('click', (e) => {
           e.preventDefault();
           navigateTo('mi-libro');
        });
    }


    // =========================================================
    // 5. MUSA VIRTUAL & MÁQUINA DE ESCRIBIR
    // =========================================================
    const versos = [
        "En la quietud del verso se esconde el alma.",
        "El tiempo no cura, solo maquilla las heridas.",
        "Somos instantes atrapados en un reloj de arena.",
        "Tu ausencia es el eco que retumba en mi silencio.",
        "Bajo la luna pálida, mis suspiros te buscan.",
        "Escribir es sangrar en tinta lo que el corazón calla.",
        "La melancolía es el perfume de los recuerdos rotos.",
        "En cada lágrima, un océano de palabras no dichas.",
        "El amor es un faro en la tormenta de la existencia.",
        "Mis versos son puentes hacia un abrazo perdido."
    ];

    const musaBtn = document.getElementById('musa-btn');
    const musaContent = document.getElementById('musa-content');

    if (musaBtn && musaContent) {
        musaBtn.addEventListener('click', () => {
            musaContent.style.opacity = 0;
            setTimeout(() => {
                const versoAleatorio = versos[Math.floor(Math.random() * versos.length)];
                musaContent.textContent = `"${versoAleatorio}"`;
                musaContent.style.opacity = 1;
            }, 500);
        });
    }

    // Máquina de escribir
    const titleElement = document.getElementById('typewriter-title');
    const textToType = "Bienvenido a mi espacio creativo";
    let charIndex = 0;

    function typeWriter() {
        if (titleElement && charIndex < textToType.length) {
            titleElement.textContent += textToType.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 100);
        } else if (titleElement) {
            titleElement.style.borderRight = 'none';
        }
    }
    setTimeout(typeWriter, 500);


    // =========================================================
    // 6. CARRUSEL AUTOMÁTICO (Dinámico)
    // =========================================================
    try {
        function updateCarouselWithLatest() {
            const entries = Array.from(document.querySelectorAll('#lista-indice-completo li'));
            if (entries.length === 0) return;

            const parseDate = (dateStr) => {
                if(!dateStr) return new Date(0);
                const parts = dateStr.split('/');
                if(parts.length !== 3) return new Date(0);
                return new Date(parts[2], parts[1] - 1, parts[0]);
            };

            const parsedEntries = entries.map(entry => {
                const dateEl = entry.querySelector('.timeline-date');
                const titleEl = entry.querySelector('.timeline-title a');
                if (!dateEl || !titleEl) return null;

                const dateText = dateEl.textContent.trim();
                const link = titleEl.getAttribute('href');
                const title = titleEl.textContent.trim();
                const type = entry.getAttribute('data-tipo') || 'poesia';
                const customImg = entry.getAttribute('data-img');

                return {
                    dateObj: parseDate(dateText),
                    dateText: dateText,
                    title: title,
                    link: link,
                    type: type,
                    imgSrc: customImg
                };
            }).filter(e => e !== null);

            parsedEntries.sort((a, b) => b.dateObj - a.dateObj);

            const slides = document.querySelectorAll('.carousel-slide');
            slides.forEach((slide, index) => {
                if (parsedEntries[index]) {
                    const entry = parsedEntries[index];
                    const img = slide.querySelector('img');
                    const h3 = slide.querySelector('.carousel-caption h3');
                    const p = slide.querySelector('.carousel-caption p');

                    if (h3) h3.textContent = entry.title;
                    if (p) p.textContent = `Publicado el ${entry.dateText}`;
                    slide.setAttribute('data-url', entry.link);

                    if (entry.imgSrc) {
                        img.src = entry.imgSrc;
                    } else {
                        let defaultSrc = 'src/img/poesia.png';
                        if (entry.type === 'reflexion') defaultSrc = 'src/img/reflexiones.png';
                        if (entry.type === 'musica') defaultSrc = 'src/img/musica.png';
                        img.src = defaultSrc;
                    }
                }
            });
        }
        updateCarouselWithLatest();
    } catch (e) {
        console.error("Error carrusel:", e);
    }

    const slides = document.querySelectorAll('.carousel-slide');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach((slide, i) => slide.classList.toggle('active-slide', i === index));
    }
    function nextSlide() { currentSlide = (currentSlide + 1) % slides.length; showSlide(currentSlide); }
    function prevSlide() { currentSlide = (currentSlide - 1 + slides.length) % slides.length; showSlide(currentSlide); }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
        prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });
    }

    // Click en slide del carrusel para cargar entrada
    slides.forEach(slide => {
        slide.addEventListener('click', () => {
            const url = slide.getAttribute('data-url');
            if(url) loadEntry(url);
        });
    });

    function startInterval() { slideInterval = setInterval(nextSlide, 5000); }
    function resetInterval() { clearInterval(slideInterval); startInterval(); }
    startInterval();


    // =========================================================
    // 7. BUSCADOR, FILTROS Y 'VER MÁS'
    // =========================================================
    try {
        const searchOverlay = document.getElementById('search-overlay');
        const searchIconBtn = document.getElementById('search-icon-btn');
        const closeSearchBtn = document.getElementById('close-search-btn');
        const searchInput = document.getElementById('search-input');
        const tagFilters = document.querySelectorAll('.tag-filter');
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        const timelineEntries = document.querySelectorAll('.timeline-list li:not(.no-results-message)');
        const noResultsMessage = document.querySelector('.no-results-message');
        let activeFilters = { tipo: null, tema: null };

        function openSearch() {
            if(searchOverlay) searchOverlay.classList.add('visible');
            if(searchInput) searchInput.focus();
        }
        function closeSearch() {
            if(searchOverlay) searchOverlay.classList.remove('visible');
        }

        if (searchIconBtn) searchIconBtn.addEventListener('click', openSearch);
        if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);
        if (searchOverlay) searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });

        function filterEntries() {
            const searchText = searchInput.value.toLowerCase();
            let visibleEntries = 0;

            timelineEntries.forEach(entry => {
                const titleEl = entry.querySelector('.timeline-title');
                const title = (titleEl?.textContent || '').toLowerCase();
                const tipo = entry.dataset.tipo || '';
                const temas = (entry.dataset.tema || '').split(' ');

                const textMatch = title.includes(searchText);
                const tipoMatch = !activeFilters.tipo || tipo === activeFilters.tipo;
                const temaMatch = !activeFilters.tema || temas.includes(activeFilters.tema);

                if (textMatch && tipoMatch && temaMatch) {
                    entry.classList.remove('filtered-out');
                    visibleEntries++;
                } else {
                    entry.classList.add('filtered-out');
                }
            });
            if (noResultsMessage) noResultsMessage.classList.toggle('visible', visibleEntries === 0);
        }

        if (searchInput) searchInput.addEventListener('input', filterEntries);

        tagFilters.forEach(tag => {
            tag.addEventListener('click', () => {
                const type = tag.dataset.filterType;
                const value = tag.dataset.filterValue;
                if (tag.classList.contains('active')) {
                    tag.classList.remove('active');
                    activeFilters[type] = null;
                } else {
                    document.querySelectorAll(`.tag-filter[data-filter-type="${type}"]`).forEach(t => t.classList.remove('active'));
                    tag.classList.add('active');
                    activeFilters[type] = value;
                }
                filterEntries();
            });
        });

        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                activeFilters = { tipo: null, tema: null };
                searchInput.value = '';
                tagFilters.forEach(tag => tag.classList.remove('active'));
                filterEntries();
            });
        }
    } catch(e) { console.error("Error buscador:", e); }

    // Botones "Ver más"
    try {
        const showMoreBtns = document.querySelectorAll('.show-more-btn');
        const itemsToShow = 5;
        document.querySelectorAll('.collapsible-list').forEach(list => {
            const items = list.querySelectorAll('li');
            if (items.length <= itemsToShow) {
                const btn = list.parentNode.querySelector('.show-more-btn');
                if (btn) btn.style.display = 'none';
            } else {
                items.forEach((item, index) => {
                    if (index >= itemsToShow) item.classList.add('hidden-item');
                });
            }
        });

        showMoreBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const list = document.getElementById(btn.getAttribute('data-target'));
                if(!list) return;
                list.querySelectorAll('.hidden-item').forEach(item => {
                    item.classList.remove('hidden-item');
                    item.style.opacity = 0; item.style.transform = 'translateY(10px)';
                    setTimeout(() => { item.style.opacity = 1; item.style.transform = 'translateY(0)'; }, 50);
                });
                btn.style.display = 'none';
            });
        });
    } catch(e) { console.error("Error ver más:", e); }


    // =========================================================
    // 8. HERRAMIENTAS: ZEN, LLUVIA, GUESTBOOK
    // =========================================================

    // --- MODO ZEN ---
    const zenBtn = document.getElementById('zen-mode-btn');
    if (zenBtn) {
        zenBtn.addEventListener('click', () => {
            document.body.classList.toggle('zen-active');
        });
    }

    // --- REPRODUCTOR LLUVIA ---
    const rainBtn = document.getElementById('rain-mode-btn');
    const rainAudio = document.getElementById('rain-audio');
    if (rainBtn && rainAudio) {
        rainAudio.volume = 0.3;
        rainBtn.addEventListener('click', () => {
            if (rainAudio.paused) {
                rainAudio.play();
                rainBtn.classList.add('is-playing');
                rainBtn.title = "Pausar lluvia";
            } else {
                rainAudio.pause();
                rainBtn.classList.remove('is-playing');
                rainBtn.title = "Activar sonido de lluvia";
            }
        });
    }

    // --- LIBRO DE VISITAS ---
    const guestForm = document.getElementById('guestbook-form');
    const guestList = document.getElementById('guestbook-messages');
    const guestThanks = document.getElementById('guestbook-thanks');

    if (guestForm) {
        guestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('guest-name');
            const msgInput = document.getElementById('guest-msg');
            if (nameInput.value && msgInput.value) {
                const newEntry = document.createElement('div');
                newEntry.classList.add('guest-message', 'new-entry');
                newEntry.innerHTML = `<p class="message-text">"${msgInput.value}"</p><span class="message-author">— ${nameInput.value}</span>`;
                guestList.insertBefore(newEntry, guestList.firstChild);
                nameInput.value = ''; msgInput.value = '';
                guestThanks.style.display = 'block';
                setTimeout(() => { guestThanks.style.display = 'none'; }, 3000);
            }
        });
    }


    // =========================================================
    // 9. VISOR DE ENTRADAS (Lógica Crítica Renovada)
    // =========================================================

    // Lógica de Barra de Progreso
    if (entryContent && progressBar) {
        entryContent.addEventListener('scroll', () => {
            const scrollTop = entryContent.scrollTop;
            const scrollHeight = entryContent.scrollHeight - entryContent.clientHeight;
            if (scrollHeight > 0) {
                progressBar.style.width = `${(scrollTop / scrollHeight) * 100}%`;
            } else {
                progressBar.style.width = '0%';
            }
        });
    }

    // FUNCIÓN DE CARGA DEFINITIVA (LIMPIA ESTILOS, ARREGLA IMÁGENES, QUITA TEXTO)
    async function loadEntry(url) {
        if (!entryOverlay || !entryContent) return;

        // Mostrar
        entryOverlay.classList.add('visible');
        entryContent.innerHTML = '<div class="loader" style="text-align:center; padding:50px;">Cargando...</div>';

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar archivo');
            const htmlText = await response.text();

            // Parsear
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            // --- A. LIMPIEZA TOTAL ---
            // Borrar estilos, scripts, metas y títulos que traiga el archivo
            doc.querySelectorAll('style, link, script, title, meta').forEach(el => el.remove());
            
            // Borrar atributos de estilo en línea de TODOS los elementos
            doc.querySelectorAll('*').forEach(el => {
                el.removeAttribute('style');
                el.removeAttribute('class');
                el.removeAttribute('width');
                el.removeAttribute('height');
                el.removeAttribute('align');
                el.removeAttribute('color');
                el.removeAttribute('bgcolor');
            });

            // --- B. ARREGLAR IMÁGENES ---
            const entryBaseUrl = new URL(url, window.location.href).href;
            const basePath = entryBaseUrl.substring(0, entryBaseUrl.lastIndexOf('/') + 1);
            
            doc.querySelectorAll('img').forEach(img => {
                const src = img.getAttribute('src');
                if (src && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith('data:')) {
                    img.src = new URL(src, basePath).href;
                }
            });

            // --- C. BORRAR EL TEXTO "OPCIONAL..." ---
            const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            const nodesToRemove = [];
            while(node = walker.nextNode()) {
                if (node.nodeValue.includes("Opcional: una pequeña nota del autor")) {
                    nodesToRemove.push(node.parentElement);
                }
            }
            nodesToRemove.forEach(el => el && el.remove());

            // --- D. PEGAR CONTENIDO ---
            const content = doc.querySelector('main') || doc.body;
            entryContent.innerHTML = content ? content.innerHTML : "Error de contenido";

            // Resetear Scroll y Barra
            entryContent.scrollTop = 0;
            if (progressBar) progressBar.style.width = '0%';

        } catch (e) {
            console.error(e);
            entryContent.innerHTML = '<p style="text-align:center; padding:30px;">Error cargando entrada.<br><small>Asegúrate de usar Live Server (VS Code)</small></p>';
        }
    }

    // Cerrar visor
    if (closeEntryBtn) {
        closeEntryBtn.addEventListener('click', () => {
            entryOverlay.classList.remove('visible');
            entryContent.innerHTML = '';
        });
    }
    // Cerrar al hacer clic fuera
    if (entryOverlay) {
        entryOverlay.addEventListener('click', (e) => {
            if (e.target === entryOverlay) {
                entryOverlay.classList.remove('visible');
                entryContent.innerHTML = '';
            }
        });
    }

// =========================================================
    // 10. INTERCEPTOR DE CLICS GLOBAL (EL PEGAMENTO) - VERSIÓN DEFINITIVA
    // =========================================================
    
    // Detectamos clics en TODA la página para ser más robustos
    document.addEventListener('click', (e) => {
        // Buscamos si el clic fue en un enlace (<a>) o dentro de uno
        const link = e.target.closest('a');

        // Si no es un enlace, no hacemos nada
        if (!link) return;

        // Comprobamos si el enlace está dentro de alguna de tus listas
        // (Buscamos si tiene un "padre" que sea una de tus listas)
        const listaPadre = link.closest('#lista-indice-completo, #lista-poesia, #lista-reflexion, #lista-musica');

        if (listaPadre) {
            const url = link.getAttribute('href');
            
            // Si es un enlace válido y lleva a un archivo .html interno (no a google, twitter, etc.)
            if (url && url.includes('.html') && !url.startsWith('http') && !url.startsWith('#')) {
                e.preventDefault(); // ¡STOP! No cambies de página
                console.log("Abriendo en visor:", url); // Chivato en consola por si acaso
                loadEntry(url);
            }
        }
    });

}); // Fin de DOMContentLoaded
