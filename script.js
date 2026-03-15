// Elementos DOM
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const previewImage = document.getElementById('previewImage');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const larguraCmInput = document.getElementById('larguraCm');
const alturaCmInput = document.getElementById('alturaCm');
const dpiInput = document.getElementById('dpiInput');
const manterProporcaoCheck = document.getElementById('manterProporcao');
const numerarPaginasCheck = document.getElementById('numerarPaginas');
const mostrarRegistroCheck = document.getElementById('mostrarRegistro');
const registroInfo = document.getElementById('registroInfo');
const registroGrid = document.getElementById('registroGrid');
const infoEscala = document.getElementById('infoEscala');
const infoPxLarg = document.getElementById('infoPxLarg');
const infoPxAlt = document.getElementById('infoPxAlt');
const infoDpi = document.getElementById('infoDpi');
const processarBtn = document.getElementById('processarBtn');
const resetBtn = document.getElementById('resetBtn');
const pedacosContainer = document.getElementById('pedacosContainer');

// Variáveis globais
let imagemOriginal = null;
let imagemRedimensionada = null;
let nomeArquivo = '';

// Eventos de upload
dropArea.addEventListener('click', () => fileInput.click());
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = '#3b82f6';
    dropArea.style.background = '#f1f5f9';
});
dropArea.addEventListener('dragleave', () => {
    dropArea.style.borderColor = '#cbd5e1';
    dropArea.style.background = '#f8fafc';
});
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = '#cbd5e1';
    dropArea.style.background = '#f8fafc';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) processarUpload(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) processarUpload(file);
});

// Função para processar upload
function processarUpload(file) {
    nomeArquivo = file.name.split('.')[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            imagemOriginal = img;
            previewImage.src = e.target.result;
            previewImage.classList.remove('hide');
            previewPlaceholder.classList.add('hide');
            
            if (mostrarRegistroCheck.checked) atualizarRegistro();
            calcularPixels();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Atualiza registro da imagem
function atualizarRegistro() {
    if (!imagemOriginal) return;
    
    const largCm = parseFloat(larguraCmInput.value);
    const altCm = parseFloat(alturaCmInput.value);
    const dpi = parseInt(dpiInput.value);
    
    const largPx = Math.round((largCm / 2.54) * dpi);
    const altPx = Math.round((altCm / 2.54) * dpi);
    
    registroGrid.innerHTML = `
        <div class="registro-item"><strong>Original:</strong> ${imagemOriginal.width}×${imagemOriginal.height} px</div>
        <div class="registro-item"><strong>Redimensionada:</strong> ${largPx}×${altPx} px</div>
        <div class="registro-item"><strong>DPI:</strong> ${dpi}</div>
        <div class="registro-item"><strong>Tamanho final:</strong> ${largCm}×${altCm} cm</div>
    `;
    registroInfo.classList.remove('hide');
}

// Calcula pixels baseado em cm e DPI
function calcularPixels() {
    if (!imagemOriginal) return;
    
    const largCm = parseFloat(larguraCmInput.value);
    const altCm = parseFloat(alturaCmInput.value);
    const dpi = parseInt(dpiInput.value);
    
    const largPx = Math.round((largCm / 2.54) * dpi);
    const altPx = Math.round((altCm / 2.54) * dpi);
    
    infoPxLarg.textContent = largPx;
    infoPxAlt.textContent = altPx;
    infoDpi.textContent = dpi;
    infoEscala.classList.remove('hide');
}

// Event listeners para atualização em tempo real
larguraCmInput.addEventListener('input', () => {
    if (imagemOriginal) {
        if (mostrarRegistroCheck.checked) atualizarRegistro();
        calcularPixels();
    }
});

alturaCmInput.addEventListener('input', () => {
    if (imagemOriginal) {
        if (mostrarRegistroCheck.checked) atualizarRegistro();
        calcularPixels();
    }
});

dpiInput.addEventListener('input', () => {
    if (imagemOriginal) {
        if (mostrarRegistroCheck.checked) atualizarRegistro();
        calcularPixels();
    }
});

mostrarRegistroCheck.addEventListener('change', () => {
    if (mostrarRegistroCheck.checked && imagemOriginal) {
        atualizarRegistro();
    } else if (!mostrarRegistroCheck.checked) {
        registroInfo.classList.add('hide');
    }
});

// Função principal para gerar fatias
async function gerarFatias() {
    if (!imagemOriginal) {
        alert('Carregue uma imagem primeiro');
        return;
    }

    const largCm = parseFloat(larguraCmInput.value);
    const altCm = parseFloat(alturaCmInput.value);
    const dpi = parseInt(dpiInput.value);
    
    // Tamanho A4 em pixels
    const a4LargPx = Math.round((21 / 2.54) * dpi);
    const a4AltPx = Math.round((29.7 / 2.54) * dpi);
    
    // Tamanho total em pixels
    const totalLargPx = Math.round((largCm / 2.54) * dpi);
    const totalAltPx = Math.round((altCm / 2.54) * dpi);
    
    // Criar canvas para imagem redimensionada
    const canvas = document.createElement('canvas');
    canvas.width = totalLargPx;
    canvas.height = totalAltPx;
    const ctx = canvas.getContext('2d');
    
    // Desenhar imagem redimensionada mantendo proporção se necessário
    ctx.drawImage(imagemOriginal, 0, 0, totalLargPx, totalAltPx);
    
    // Calcular número de fatias
    const colunas = Math.ceil(totalLargPx / a4LargPx);
    const linhas = Math.ceil(totalAltPx / a4AltPx);
    const totalFatias = colunas * linhas;
    
    // Limpar container
    pedacosContainer.innerHTML = '';
    
    // Gerar cada fatia
    for (let linha = 0; linha < linhas; linha++) {
        for (let coluna = 0; coluna < colunas; coluna++) {
            const x = coluna * a4LargPx;
            const y = linha * a4AltPx;
            const w = Math.min(a4LargPx, totalLargPx - x);
            const h = Math.min(a4AltPx, totalAltPx - y);
            
            // Criar canvas da fatia
            const fatiaCanvas = document.createElement('canvas');
            fatiaCanvas.width = a4LargPx;
            fatiaCanvas.height = a4AltPx;
            const fatiaCtx = fatiaCanvas.getContext('2d');
            
            // Preencher com branco
            fatiaCtx.fillStyle = '#ffffff';
            fatiaCtx.fillRect(0, 0, a4LargPx, a4AltPx);
            
            // Desenhar a parte da imagem
            fatiaCtx.drawImage(canvas, x, y, w, h, 0, 0, w, h);
            
            // Adicionar numeração se necessário
            if (numerarPaginasCheck.checked) {
                const numero = linha * colunas + coluna + 1;
                fatiaCtx.font = `bold ${Math.round(dpi * 0.3)}px Arial`;
                fatiaCtx.fillStyle = '#000000';
                fatiaCtx.shadowColor = '#ffffff';
                fatiaCtx.shadowBlur = 4;
                fatiaCtx.fillText(`Página ${numero}/${totalFatias}`, 20, 50);
                fatiaCtx.shadowBlur = 0;
            }
            
            // Criar card da fatia
            const card = document.createElement('div');
            card.className = 'card-fatia';
            
            const thumb = document.createElement('div');
            thumb.className = 'thumb';
            
            const thumbCanvas = document.createElement('canvas');
            thumbCanvas.width = 210;
            thumbCanvas.height = 297;
            const thumbCtx = thumbCanvas.getContext('2d');
            thumbCtx.drawImage(fatiaCanvas, 0, 0, 210, 297);
            thumb.appendChild(thumbCanvas);
            
            const info = document.createElement('div');
            info.className = 'info-fatia';
            info.innerHTML = `
                <span>${linha+1},${coluna+1}</span>
                <button class="botao-baixar" data-fatia="${linha}-${coluna}">BAIXAR</button>
            `;
            
            card.appendChild(thumb);
            card.appendChild(info);
            pedacosContainer.appendChild(card);
            
            // Adicionar evento de download
            const btn = info.querySelector('.botao-baixar');
            btn.addEventListener('click', () => {
                const link = document.createElement('a');
                link.download = `${nomeArquivo}_fatia_${linha+1}_${coluna+1}.png`;
                link.href = fatiaCanvas.toDataURL('image/png');
                link.click();
            });
        }
    }
}

// Processar botão
processarBtn.addEventListener('click', gerarFatias);

// Reset
resetBtn.addEventListener('click', () => {
    imagemOriginal = null;
    previewImage.classList.add('hide');
    previewPlaceholder.classList.remove('hide');
    previewImage.src = '';
    registroInfo.classList.add('hide');
    infoEscala.classList.add('hide');
    pedacosContainer.innerHTML = '';
    larguraCmInput.value = '42.0';
    alturaCmInput.value = '29.7';
    dpiInput.value = '150';
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Configurações iniciais
});