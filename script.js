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
    function buscarLocalPorSigla(sigla) {
        const localEncontrado = localesMostaza.find(local => 
            local.sigla.toUpperCase() === sigla.toUpperCase()
        );
        
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
    function mostrarSugerencias(texto) {
        suggestions.innerHTML = '';
        
        if (texto.length < 1) {
            suggestions.style.display = 'none';
            return;
        }
        
        const textoUpper = texto.toUpperCase();
        const sugerencias = localesMostaza.filter(local => 
            local.sigla.toUpperCase().includes(textoUpper) || 
            local.local.toUpperCase().includes(textoUpper)
        ).slice(0, 5);
        
        if (sugerencias.length === 0) {
            const div = document.createElement('div');
            div.className = 'suggestion-item not-found';
            div.textContent = "No se encontraron coincidencias";
            suggestions.appendChild(div);
        } else {
            sugerencias.forEach(sugerencia => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = `${sugerencia.sigla} - ${sugerencia.local}`;
                div.addEventListener('click', () => {
                    siglaInput.value = sugerencia.sigla;
                    suggestions.style.display = 'none';
                    mostrarResultado(sugerencia);
                });
                suggestions.appendChild(div);
            });
        }
        
        suggestions.style.display = 'block';
    }
    
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
        mostrarSugerencias(this.value);
    });
    
    searchBtn.addEventListener('click', function() {
        const sigla = siglaInput.value.trim();
        if (sigla) {
            const local = buscarLocalPorSigla(sigla);
            mostrarResultado(local);
        }
    });
    
    siglaInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const sigla = siglaInput.value.trim();
            if (sigla) {
                const local = buscarLocalPorSigla(sigla);
                mostrarResultado(local);
            }
        }
    });
    
    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (e.target !== siglaInput && e.target !== searchBtn && !suggestions.contains(e.target)) {
            suggestions.style.display = 'none';
        }
    });
});