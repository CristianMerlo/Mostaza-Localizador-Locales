document.addEventListener('DOMContentLoaded', function() {
    // Mostrar año actual en el footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Mostrar estadísticas
    document.getElementById('totalLocales').textContent = localesMostaza.length;
    document.getElementById('totalProvincias').textContent = [...new Set(localesMostaza.map(local => local.provincia))].length;
    
    // Elementos del DOM
    const siglaInput = document.getElementById('siglaInput');
    const searchBtn = document.getElementById('searchBtn');
    const suggestions = document.getElementById('suggestions');
    const resultCard = document.getElementById('resultCard');
    
    // Variables para los elementos de resultado
    const localNombre = document.getElementById('localNombre');
    const localSigla = document.getElementById('localSigla');
    const localProvincia = document.getElementById('localProvincia');
    const localGerenteZona = document.getElementById('localGerenteZona');
    const localGerenteRegion = document.getElementById('localGerenteRegion');
    
    // Función para buscar local por sigla
    // Índice por sigla para búsquedas O(1)
    const siglaIndex = new Map();
    localesMostaza.forEach(local => {
        if (local && local.sigla) siglaIndex.set(local.sigla.toUpperCase(), local);
    });

    function buscarLocalPorSigla(sigla) {
        const key = sigla.toUpperCase();
        const localEncontrado = siglaIndex.get(key);
        if (!localEncontrado) {
            return {
                sigla: sigla,
                local: "No encontrado",
                provincia: "-",
                gerenteZona: "-",
                gerenteRegion: "-"
            };
        }
        return localEncontrado;
    }
    
    // Función para mostrar sugerencias
    let activeSuggestion = -1;

    function mostrarSugerencias(texto) {
        suggestions.innerHTML = '';
        activeSuggestion = -1;

        if (!texto || texto.length < 1) {
            suggestions.style.display = 'none';
            siglaInput.removeAttribute('aria-activedescendant');
            return;
        }

        const textoUpper = texto.toUpperCase();
        const sugerencias = localesMostaza.filter(local => 
            (local.sigla && local.sigla.toUpperCase().includes(textoUpper)) || 
            (local.local && local.local.toUpperCase().includes(textoUpper))
        ).slice(0, 7);

        if (sugerencias.length === 0) {
            const div = document.createElement('div');
            div.className = 'suggestion-item not-found';
            div.setAttribute('role', 'presentation');
            div.textContent = "No se encontraron coincidencias";
            suggestions.appendChild(div);
        } else {
            sugerencias.forEach((sugerencia, idx) => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.id = `suggestion-${idx}`;
                div.setAttribute('role', 'option');
                div.tabIndex = 0; // que sea focusable
                div.textContent = `${sugerencia.sigla} - ${sugerencia.local}`;
                div.addEventListener('click', () => {
                    siglaInput.value = sugerencia.sigla;
                    suggestions.style.display = 'none';
                    activeSuggestion = -1;
                    mostrarResultado(sugerencia);
                });
                // permitir seleccionar con teclado cuando el item tenga foco
                div.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        div.click();
                    }
                });
                suggestions.appendChild(div);
            });
        }

        suggestions.style.display = 'block';
    }

    // Debounce utility
    function debounce(fn, wait) {
        let t;
        return function(...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    const debouncedMostrarSugerencias = debounce(mostrarSugerencias, 200);
    
    // Función para mostrar resultado
    function mostrarResultado(local) {
        localNombre.textContent = local.local;
        localSigla.textContent = local.sigla;
        localProvincia.textContent = local.provincia;
        localGerenteZona.textContent = local.gerenteZona;
        localGerenteRegion.textContent = local.gerenteRegion;
        
        // Añadir clase para la animación
        resultCard.classList.add('visible');
        
        // Mostrar la tarjeta si estaba oculta
        if (resultCard.style.display === 'none') {
            resultCard.style.display = 'block';
        }
        
        // Manejar estilos cuando no se encuentra
        if (local.local === "No encontrado") {
            localNombre.classList.add('not-found');
        } else {
            localNombre.classList.remove('not-found');
        }
    }
    
    // Event listeners
    siglaInput.addEventListener('input', function() {
        debouncedMostrarSugerencias(this.value);
    });
    
    searchBtn.addEventListener('click', function() {
        const sigla = siglaInput.value.trim();
        if (sigla) {
            const local = buscarLocalPorSigla(sigla);
            mostrarResultado(local);
        }
    });
    
    // Soporte de teclado para navegación en las sugerencias
    siglaInput.addEventListener('keydown', function(e) {
        const items = suggestions.querySelectorAll('.suggestion-item:not(.not-found)');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (items.length === 0) return;
            activeSuggestion = Math.min(activeSuggestion + 1, items.length - 1);
            items[activeSuggestion].classList.add('active');
            items[activeSuggestion].focus();
            siglaInput.setAttribute('aria-activedescendant', items[activeSuggestion].id);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (items.length === 0) return;
            activeSuggestion = Math.max(activeSuggestion - 1, 0);
            items.forEach(it => it.classList.remove('active'));
            items[activeSuggestion].classList.add('active');
            items[activeSuggestion].focus();
            siglaInput.setAttribute('aria-activedescendant', items[activeSuggestion].id);
        } else if (e.key === 'Enter') {
            const sigla = siglaInput.value.trim();
            // Si hay una sugerencia activa, elegirla
            if (items.length > 0 && activeSuggestion >= 0) {
                e.preventDefault();
                items[activeSuggestion].click();
                return;
            }
            if (sigla) {
                const local = buscarLocalPorSigla(sigla);
                mostrarResultado(local);
            }
        } else if (e.key === 'Escape') {
            suggestions.style.display = 'none';
            activeSuggestion = -1;
            siglaInput.removeAttribute('aria-activedescendant');
        }
    });
    
    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (e.target !== siglaInput && e.target !== searchBtn && !suggestions.contains(e.target)) {
            suggestions.style.display = 'none';
            activeSuggestion = -1;
        }
    });
});